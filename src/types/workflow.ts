/**
 * Workflow and visual node graph types designed for React Flow integration.
 * Represents the frontend contract for Industrial AI Safety Workflow Building.
 */

export type NodeCategory = 'input' | 'model' | 'condition' | 'decision' | 'action';

export type InputSubtype = 'camera' | 'image' | 'video' | 'sensor';
export type ModelSubtype = 'object_detection' | 'image_classification' | 'pose_detection';
export type ConditionSubtype = 'object_detected' | 'confidence_threshold' | 'zone_entered' | 'count_threshold';
export type DecisionSubtype = 'yes_no' | 'safe' | 'warning' | 'unsafe';
export type ActionSubtype = 'alert' | 'alarm' | 'notify_supervisor' | 'stop_process' | 'log_event';

export type NodeSubtype =
  | InputSubtype
  | ModelSubtype
  | ConditionSubtype
  | DecisionSubtype
  | ActionSubtype;

export interface WorkflowNodePosition {
  x: number;
  y: number;
}

export interface ModelNodeConfig {
  modelId: string | null;
  modelName?: string;
  confidenceThreshold: number;
  classes: string[];
}

export interface ConditionNodeConfig {
  objectClass: string;
  threshold: number;
  operator?: 'equals' | 'greater_than' | 'in_zone';
  zoneName?: string;
  countThreshold?: number;
}

export interface DecisionNodeConfig {
  decisionType: 'safe' | 'warning' | 'unsafe' | 'yes_no';
  notes?: string;
}

export interface ActionNodeConfig {
  actionType: 'alert' | 'alarm' | 'notify_supervisor' | 'stop_process' | 'log_event';
  urgency: 'info' | 'warning' | 'critical';
  notificationChannel?: string;
}

export interface InputNodeConfig {
  sourceType: 'live_stream' | 'file' | 'device';
  resolution?: string;
  frameRate?: number;
}

export type NodeConfig =
  | ModelNodeConfig
  | ConditionNodeConfig
  | DecisionNodeConfig
  | ActionNodeConfig
  | InputNodeConfig
  | Record<string, unknown>;

export interface CustomNodeData {
  category: NodeCategory;
  subtype: NodeSubtype;
  title: string;
  description: string;
  config: NodeConfig;
  statusText?: string;
  onConfigChange?: (newConfig: NodeConfig) => void;
  onDelete?: () => void;
}

export interface WorkflowNodeDescriptor {
  id: string;
  type: NodeCategory;
  subtype: NodeSubtype;
  position: WorkflowNodePosition;
  config: NodeConfig;
  title?: string;
  description?: string;
}

export interface WorkflowConnectionDescriptor {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string | null;
  targetHandle?: string | null;
}

/**
 * Deterministic serializable Workflow JSON contract (Frontend <-> Backend).
 */
export interface SerializableWorkflow {
  version: string;
  projectId: string;
  name?: string;
  nodes: WorkflowNodeDescriptor[];
  connections: WorkflowConnectionDescriptor[];
  metadata: {
    createdAt?: string;
    updatedAt: string;
    description?: string;
    nodeCount?: number;
    connectionCount?: number;
  };
}

export interface WorkflowValidationResult {
  isValid: boolean;
  errors: string[];
  structuredErrors?: Array<{ code: string; message: string }>;
  warnings: string[];
  hasInput: boolean;
  hasModel: boolean;
  hasConditionOrDecision: boolean;
  hasAction: boolean;
  hasPathInputToAction: boolean;
  disconnectedNodes: string[];
  invalidConnections: string[];
}


export interface WorkflowEvaluationResult {
  predictionSummary: string;
  safetyDecision: 'SAFE' | 'WARNING' | 'UNSAFE';
  actionTriggered: string;
  explanation: string;
  executionPath: string[];
  conditionResult: 'YES' | 'NO' | 'N/A';
  detections?: import('./prediction').Detection[];
}

// Backward compatibility with Phase 1 types
export type WorkflowNodeType = NodeCategory;
export interface WorkflowNode<TData = Record<string, unknown>> {
  id: string;
  type: WorkflowNodeType;
  position: WorkflowNodePosition;
  data: TData;
  label: string;
  configured: boolean;
}
export interface WorkflowConnection {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string | null;
  targetHandle?: string | null;
}
export interface Workflow {
  id: string;
  projectId: string;
  name: string;
  nodes: WorkflowNode[];
  connections: WorkflowConnection[];
  isValid: boolean;
  updatedAt: string;
}
