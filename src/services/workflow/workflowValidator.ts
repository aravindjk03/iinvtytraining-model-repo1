import type {
  WorkflowNodeDescriptor,
  WorkflowConnectionDescriptor,
  WorkflowValidationResult,
  SerializableWorkflow,
} from '@/types/workflow';

/**
 * Validates a safety AI workflow graph according to strict industrial validation rules.
 */
export function validateWorkflow(
  workflow: SerializableWorkflow | { nodes: WorkflowNodeDescriptor[]; connections: WorkflowConnectionDescriptor[] }
): WorkflowValidationResult {
  const nodes = workflow.nodes || [];
  const connections = workflow.connections || [];

  const errors: string[] = [];
  const structuredErrors: Array<{ code: string; message: string }> = [];
  const warnings: string[] = [];
  const disconnectedNodes: string[] = [];
  const invalidConnections: string[] = [];

  // Categorize nodes
  const inputNodes = nodes.filter((n) => n.type === 'input');
  const modelNodes = nodes.filter((n) => n.type === 'model');
  const conditionNodes = nodes.filter((n) => n.type === 'condition');
  const decisionNodes = nodes.filter((n) => n.type === 'decision');
  const actionNodes = nodes.filter((n) => n.type === 'action');

  const hasInput = inputNodes.length > 0;
  const hasModel = modelNodes.length > 0;
  const hasConditionOrDecision = conditionNodes.length > 0 || decisionNodes.length > 0;
  const hasAction = actionNodes.length > 0;

  // Rule 1: Node presence
  if (!hasInput) {
    const msg = 'Missing required Input node (e.g. Camera or Image stream)';
    errors.push(msg);
    structuredErrors.push({ code: 'INPUT_MISSING', message: msg });
  }
  if (!hasModel) {
    const msg = 'Missing required AI Model node (e.g. Object Detection)';
    errors.push(msg);
    structuredErrors.push({ code: 'AI_MODEL_MISSING', message: msg });
  } else {
    // Rule 1b: Every AI Model node must have a modelId selected
    for (const mNode of modelNodes) {
      const cfg = mNode.config as { modelId?: string | null; modelName?: string } | undefined;
      if (!cfg?.modelId) {
        const msg = `AI Model node "${mNode.title || mNode.id}" requires a selected Model from the catalog.`;
        errors.push(msg);
        structuredErrors.push({ code: 'AI_MODEL_NOT_SELECTED', message: msg });
      }
    }
  }
  if (!hasConditionOrDecision) {
    const msg = 'Missing Safety Condition or Decision node (e.g. Helmet Detected?)';
    errors.push(msg);
    structuredErrors.push({ code: 'CONDITION_MISSING', message: msg });
  }
  if (!hasAction) {
    const msg = 'Missing Safety Action node (e.g. Alert or Stop Process)';
    errors.push(msg);
    structuredErrors.push({ code: 'ACTION_MISSING', message: msg });
  }


  // Build graph adjacency map
  const adj = new Map<string, string[]>();
  const reverseAdj = new Map<string, string[]>();
  const nodeMap = new Map<string, WorkflowNodeDescriptor>();

  nodes.forEach((n) => {
    nodeMap.set(n.id, n);
    adj.set(n.id, []);
    reverseAdj.set(n.id, []);
  });

  // Track connected edges per node
  const edgeCount = new Map<string, number>();
  nodes.forEach((n) => edgeCount.set(n.id, 0));

  for (const conn of connections) {
    const srcNode = nodeMap.get(conn.source);
    const tgtNode = nodeMap.get(conn.target);

    if (!srcNode || !tgtNode) {
      invalidConnections.push(`Connection references non-existent node: ${conn.source} -> ${conn.target}`);
      continue;
    }

    // Invalid connection rules
    // Rule: Action cannot be source (Action is input-only)
    if (srcNode.type === 'action') {
      errors.push(`Action node "${srcNode.title || srcNode.id}" cannot have outgoing connections.`);
      invalidConnections.push(conn.id);
    }

    // Rule: Input cannot be target (Input is output-only)
    if (tgtNode.type === 'input') {
      errors.push(`Input node "${tgtNode.title || tgtNode.id}" cannot have incoming connections.`);
      invalidConnections.push(conn.id);
    }

    // Rule: Same node self-connection
    if (conn.source === conn.target) {
      errors.push(`Self-loop detected on node "${srcNode.title || srcNode.id}".`);
      invalidConnections.push(conn.id);
    }

    adj.get(conn.source)?.push(conn.target);
    reverseAdj.get(conn.target)?.push(conn.source);

    edgeCount.set(conn.source, (edgeCount.get(conn.source) || 0) + 1);
    edgeCount.set(conn.target, (edgeCount.get(conn.target) || 0) + 1);
  }

  // Check disconnected critical nodes
  nodes.forEach((node) => {
    const count = edgeCount.get(node.id) || 0;
    if (count === 0) {
      disconnectedNodes.push(node.title || node.id);
      warnings.push(`Node "${node.title || node.id}" is disconnected from the workflow.`);
    }
  });

  // Rule: Connected path from Input to Action
  let hasPathInputToAction = false;
  if (hasInput && hasAction) {
    for (const inputNode of inputNodes) {
      const visited = new Set<string>();
      const queue: string[] = [inputNode.id];
      visited.add(inputNode.id);

      while (queue.length > 0) {
        const curr = queue.shift()!;
        const currNode = nodeMap.get(curr);
        if (currNode && currNode.type === 'action') {
          hasPathInputToAction = true;
          break;
        }

        const neighbors = adj.get(curr) || [];
        for (const next of neighbors) {
          if (!visited.has(next)) {
            visited.add(next);
            queue.push(next);
          }
        }
      }

      if (hasPathInputToAction) break;
    }
  }

  if (hasInput && hasAction && !hasPathInputToAction) {
    errors.push('No connected pipeline path exists from visual Input to a Safety Action.');
  }

  // Check for graph cycles using DFS
  const visited = new Set<string>();
  const recStack = new Set<string>();
  let hasCycle = false;

  function checkCycle(nodeId: string): boolean {
    visited.add(nodeId);
    recStack.add(nodeId);

    const neighbors = adj.get(nodeId) || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        if (checkCycle(neighbor)) return true;
      } else if (recStack.has(neighbor)) {
        return true;
      }
    }

    recStack.delete(nodeId);
    return false;
  }

  for (const node of nodes) {
    if (!visited.has(node.id)) {
      if (checkCycle(node.id)) {
        hasCycle = true;
        break;
      }
    }
  }

  if (hasCycle) {
    errors.push('Workflow contains an invalid cycle loop. Flow must move forward towards an action.');
  }

  const isValid =
    errors.length === 0 &&
    hasInput &&
    hasModel &&
    hasConditionOrDecision &&
    hasAction &&
    hasPathInputToAction;

  return {
    isValid,
    errors,
    structuredErrors,
    warnings,
    hasInput,
    hasModel,
    hasConditionOrDecision,
    hasAction,
    hasPathInputToAction,
    disconnectedNodes,
    invalidConnections,
  };
}

