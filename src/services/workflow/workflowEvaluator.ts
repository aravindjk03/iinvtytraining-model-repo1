import type {
  SerializableWorkflow,
  WorkflowEvaluationResult,
  ConditionNodeConfig,
  ModelNodeConfig,
} from '@/types/workflow';
import type { Detection } from '@/types/prediction';

/**
 * Deterministically evaluates a safety workflow given inference detections.
 * Directly bridges Model Predictions to Industrial Safety Decisions & Actions.
 */
export function evaluateWorkflow(
  workflow: SerializableWorkflow,
  detections: Detection[]
): WorkflowEvaluationResult {
  const nodes = workflow.nodes || [];
  const connections = workflow.connections || [];

  if (nodes.length === 0) {
    return {
      predictionSummary: 'No workflow defined.',
      safetyDecision: 'WARNING',
      actionTriggered: 'No Action (Empty Workflow)',
      explanation: 'Cannot evaluate an empty workflow graph.',
      executionPath: [],
      conditionResult: 'N/A',
    };
  }

  const executionPath: string[] = [];

  // 1. Locate Input node
  const inputNode = nodes.find((n) => n.type === 'input') || nodes[0];
  executionPath.push(inputNode.title || inputNode.id);

  // 2. Locate AI Model node
  const modelNode = nodes.find((n) => n.type === 'model');
  let modelConfidenceThreshold = 0.5;
  if (modelNode) {
    executionPath.push(modelNode.title || modelNode.id);
    const modelConfig = modelNode.config as ModelNodeConfig;
    if (typeof modelConfig?.confidenceThreshold === 'number') {
      modelConfidenceThreshold = modelConfig.confidenceThreshold;
    }
  }

  // 3. Summarize raw detections
  let topDetection: Detection | null = null;
  if (detections.length > 0) {
    topDetection = [...detections].sort((a, b) => b.confidence - a.confidence)[0];
  }

  const predictionSummary = topDetection
    ? `${topDetection.className.toUpperCase()} detected (${Math.round(topDetection.confidence * 100)}% confidence)`
    : 'No objects detected in frame';

  // 4. Locate Condition node
  const conditionNode = nodes.find((n) => n.type === 'condition');
  let conditionResult: 'YES' | 'NO' | 'N/A' = 'N/A';
  let targetClass = 'helmet';
  let conditionThreshold = modelConfidenceThreshold;

  if (conditionNode) {
    executionPath.push(conditionNode.title || conditionNode.id);
    const condConfig = conditionNode.config as ConditionNodeConfig;
    if (condConfig?.objectClass) {
      targetClass = condConfig.objectClass.toLowerCase().trim();
    }
    if (typeof condConfig?.threshold === 'number') {
      conditionThreshold = condConfig.threshold;
    }

    // Evaluate matching detection
    const matchingDetection = detections.find((d) => {
      const clsName = d.className.toLowerCase().trim();

      // If detection represents negative condition (no_helmet, without_helmet)
      const isNegated =
        clsName.startsWith('no_') ||
        clsName.startsWith('no ') ||
        clsName.startsWith('without_') ||
        clsName.startsWith('without ');

      const isTargetNegated =
        targetClass.startsWith('no_') ||
        targetClass.startsWith('no ') ||
        targetClass.startsWith('without_');

      if (isNegated !== isTargetNegated) {
        return false;
      }

      const matchesClass =
        clsName === targetClass ||
        clsName.replace(/^(no[_\s]|without[_\s])/, '') === targetClass.replace(/^(no[_\s]|without[_\s])/, '') ||
        (targetClass.includes('helmet') && (clsName === 'helmet' || clsName.includes('hardhat')));

      return matchesClass && d.confidence >= conditionThreshold;
    });

    if (matchingDetection) {
      conditionResult = 'YES';
    } else {
      conditionResult = 'NO';
    }
  } else {
    // If no explicit condition node, evaluate default presence
    conditionResult = detections.length > 0 ? 'YES' : 'NO';
  }

  // 5. Follow condition branching edges
  // Expected sourceHandle: 'output-yes' vs 'output-no', or label-based, or default
  let nextNodeId: string | null = null;
  if (conditionNode) {
    const desiredHandle = conditionResult === 'YES' ? 'yes' : 'no';

    const branchConn = connections.find((c) => {
      if (c.source !== conditionNode.id) return false;
      const h = (c.sourceHandle || '').toLowerCase();
      return h.includes(desiredHandle) || h === desiredHandle;
    });

    if (branchConn) {
      nextNodeId = branchConn.target;
    } else {
      // Fallback: any connection from condition node
      const anyConn = connections.find((c) => c.source === conditionNode.id);
      if (anyConn) nextNodeId = anyConn.target;
    }
  }

  // 6. Trace to Decision or Action node
  let safetyDecision: 'SAFE' | 'WARNING' | 'UNSAFE' = 'SAFE';
  let actionTriggered = 'None';
  let explanation = '';

  const decisionNode = nextNodeId ? nodes.find((n) => n.id === nextNodeId) : null;
  if (decisionNode) {
    executionPath.push(decisionNode.title || decisionNode.id);

    if (decisionNode.type === 'decision') {
      const sub = decisionNode.subtype.toLowerCase();
      if (sub === 'safe') safetyDecision = 'SAFE';
      else if (sub === 'unsafe') safetyDecision = 'UNSAFE';
      else if (sub === 'warning') safetyDecision = 'WARNING';
      else {
        safetyDecision = conditionResult === 'YES' ? 'SAFE' : 'UNSAFE';
      }

      // Trace from Decision to Action
      const toActionConn = connections.find((c) => c.source === decisionNode.id);
      if (toActionConn) {
        const actNode = nodes.find((n) => n.id === toActionConn.target);
        if (actNode) {
          executionPath.push(actNode.title || actNode.id);
          actionTriggered = actNode.title || actNode.subtype.replace(/_/g, ' ').toUpperCase();
        }
      }
    } else if (decisionNode.type === 'action') {
      safetyDecision = conditionResult === 'YES' ? 'SAFE' : 'UNSAFE';
      actionTriggered = decisionNode.title || decisionNode.subtype.replace(/_/g, ' ').toUpperCase();
    }
  } else {
    // Default fallback based on condition
    if (conditionResult === 'YES') {
      safetyDecision = 'SAFE';
      actionTriggered = 'No Alert Required';
    } else {
      safetyDecision = 'UNSAFE';
      const actionNode = nodes.find((n) => n.type === 'action');
      actionTriggered = actionNode ? actionNode.title || 'Visual Alert' : 'Safety Alert Triggered';
    }
  }

  // Final explanation builder
  if (conditionResult === 'YES') {
    explanation = `Target condition "${targetClass}" confirmed with confidence >= ${(conditionThreshold * 100).toFixed(0)}%. Workflow evaluated branch YES → ${safetyDecision}. Action: ${actionTriggered}.`;
  } else {
    explanation = `Target condition "${targetClass}" not satisfied (threshold ${(conditionThreshold * 100).toFixed(0)}%). Workflow evaluated branch NO → ${safetyDecision}. Action: ${actionTriggered}.`;
  }

  return {
    predictionSummary,
    safetyDecision,
    actionTriggered,
    explanation,
    executionPath,
    conditionResult,
    detections,
  };
}
