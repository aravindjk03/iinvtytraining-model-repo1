import type { SerializableWorkflow, CustomNodeData } from '@/types/workflow';
import type { Node, Edge } from 'reactflow';

export const STARTER_WORKFLOW_ID = 'starter-workflow-v1';

export const STARTER_SERIALIZABLE_WORKFLOW: SerializableWorkflow = {
  version: '1.0',
  projectId: 'proj-helmet-01',
  name: 'STARTER WORKFLOW',
  nodes: [
    {
      id: 'node-camera-01',
      type: 'input',
      subtype: 'camera',
      title: 'Camera Feed',
      description: 'Capture visual input from workshop inspection zone',
      position: { x: 60, y: 160 },
      config: {
        sourceType: 'live_stream',
        resolution: '1080p',
      },
    },
    {
      id: 'node-ai-01',
      type: 'model',
      subtype: 'object_detection',
      title: 'PPE Detection AI',
      description: 'Real-time YOLO object detection model',
      position: { x: 340, y: 160 },
      config: {
        modelId: null,
        confidenceThreshold: 0.5,
        classes: ['helmet', 'vest'],
      },
    },
    {
      id: 'node-condition-01',
      type: 'condition',
      subtype: 'object_detected',
      title: 'Helmet Detected?',
      description: 'Check if protective hardhat is detected in frame',
      position: { x: 630, y: 140 },
      config: {
        objectClass: 'helmet',
        threshold: 0.5,
      },
    },
    {
      id: 'node-decision-safe-01',
      type: 'decision',
      subtype: 'safe',
      title: 'Safe',
      description: 'Worker is fully compliant with PPE protocol',
      position: { x: 920, y: 70 },
      config: {
        decisionType: 'safe',
      },
    },
    {
      id: 'node-decision-unsafe-01',
      type: 'decision',
      subtype: 'unsafe',
      title: 'Unsafe',
      description: 'Non-compliant PPE safety violation detected',
      position: { x: 920, y: 240 },
      config: {
        decisionType: 'unsafe',
      },
    },
    {
      id: 'node-action-alert-01',
      type: 'action',
      subtype: 'alert',
      title: 'Safety Alert',
      description: 'Emit visual warning beacon and notify supervisor',
      position: { x: 1160, y: 240 },
      config: {
        actionType: 'alert',
        urgency: 'critical',
      },
    },
  ],
  connections: [
    {
      id: 'edge-cam-ai',
      source: 'node-camera-01',
      target: 'node-ai-01',
      sourceHandle: 'output',
      targetHandle: 'input',
    },
    {
      id: 'edge-ai-cond',
      source: 'node-ai-01',
      target: 'node-condition-01',
      sourceHandle: 'output',
      targetHandle: 'input',
    },
    {
      id: 'edge-cond-safe',
      source: 'node-condition-01',
      target: 'node-decision-safe-01',
      sourceHandle: 'yes',
      targetHandle: 'input',
    },
    {
      id: 'edge-cond-unsafe',
      source: 'node-condition-01',
      target: 'node-decision-unsafe-01',
      sourceHandle: 'no',
      targetHandle: 'input',
    },
    {
      id: 'edge-unsafe-alert',
      source: 'node-decision-unsafe-01',
      target: 'node-action-alert-01',
      sourceHandle: 'output',
      targetHandle: 'input',
    },
  ],
  metadata: {
    createdAt: '2026-10-08T00:00:00.000Z',
    updatedAt: '2026-10-08T00:00:00.000Z',
    description: 'Standard industrial starter workflow for hardhat safety verification.',
    nodeCount: 6,
    connectionCount: 5,
  },
};

/**
 * Converts a serializable workflow into React Flow Nodes and Edges.
 */
export function workflowToReactFlow(
  workflow: SerializableWorkflow,
  options?: {
    onConfigChange?: (id: string, config: unknown) => void;
    onDeleteNode?: (id: string) => void;
  }
): { nodes: Node<CustomNodeData>[]; edges: Edge[] } {
  const nodes: Node<CustomNodeData>[] = workflow.nodes.map((n) => ({
    id: n.id,
    type: 'custom',
    position: n.position,
    data: {
      category: n.type,
      subtype: n.subtype,
      title: n.title || n.subtype,
      description: n.description || '',
      config: n.config,
      onConfigChange: (newCfg) => options?.onConfigChange?.(n.id, newCfg),
      onDelete: () => options?.onDeleteNode?.(n.id),
    },
  }));

  const edges: Edge[] = workflow.connections.map((c) => {
    const isYes = c.sourceHandle === 'yes';
    const isNo = c.sourceHandle === 'no';
    let label = '';
    let strokeColor = '#0F513E';

    if (isYes) {
      label = 'YES';
      strokeColor = '#059669'; // Green
    } else if (isNo) {
      label = 'NO';
      strokeColor = '#dc2626'; // Red
    }

    return {
      id: c.id,
      source: c.source,
      target: c.target,
      sourceHandle: c.sourceHandle,
      targetHandle: c.targetHandle,
      label: label || undefined,
      animated: true,
      style: { stroke: strokeColor, strokeWidth: 2 },
      labelStyle: { fill: strokeColor, fontWeight: 700, fontSize: 11 },
      labelBgStyle: { fill: '#ffffff', fillOpacity: 0.9, rx: 4, ry: 4 },
    };
  });

  return { nodes, edges };
}

/**
 * Converts React Flow nodes and edges back to serializable JSON contract.
 */
export function reactFlowToWorkflow(
  nodes: Node<CustomNodeData>[],
  edges: Edge[],
  projectId: string = 'proj-helmet-01',
  name: string = 'Custom Safety Workflow'
): SerializableWorkflow {
  return {
    version: '1.0',
    projectId,
    name,
    nodes: nodes.map((n) => ({
      id: n.id,
      type: n.data.category,
      subtype: n.data.subtype,
      title: n.data.title,
      description: n.data.description,
      position: { x: Math.round(n.position.x), y: Math.round(n.position.y) },
      config: n.data.config,
    })),
    connections: edges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      sourceHandle: e.sourceHandle || null,
      targetHandle: e.targetHandle || null,
    })),
    metadata: {
      updatedAt: new Date().toISOString(),
      nodeCount: nodes.length,
      connectionCount: edges.length,
    },
  };
}
