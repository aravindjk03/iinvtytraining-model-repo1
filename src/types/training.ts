/**
 * Training job and execution status types for Phase 4 Model Engine communication.
 */

export type TrainingJobStatus =
  | 'queued'
  | 'preparing'
  | 'training'
  | 'validating'
  | 'completed'
  | 'failed'
  | 'cancelled';

export interface TrainingMetrics {
  precision?: number;
  recall?: number;
  map50?: number;
  map50_95?: number;
  loss?: number;
}

export interface TrainingJobResponse {
  jobId: string;
  status: TrainingJobStatus;
  message?: string;
}

export interface TrainingJobStatusResponse {
  jobId: string;
  status: TrainingJobStatus;
  progress?: number; // 0 - 100
  epoch?: number;
  totalEpochs?: number;
  modelId?: string;
  metrics?: TrainingMetrics;
  error?: string;
  startedAt?: string;
  completedAt?: string;
}

export interface ModelMetadata {
  modelId: string;
  jobId?: string;
  modelName: string;
  trainedAt: string;
  epochs: number;
  metrics?: TrainingMetrics;
}

// Backward compatibility types
export type TrainingStatusState =
  | 'idle'
  | TrainingJobStatus;

export interface TrainingHyperparametersOld {
  epochs?: number;
  batchSize?: number;
  learningRate?: number;
  imageSize?: number;
}

export interface TrainingConfig {
  datasetId: string;
  modelArchitecture: string;
  hyperparameters: Record<string, unknown>;
}

export interface TrainingStatus {
  state: TrainingStatusState;
  currentEpoch?: number;
  totalEpochs?: number;
  message?: string;
  startedAt?: string;
  completedAt?: string;
  metrics?: TrainingMetrics;
}

export interface TrainingJob {
  id: string;
  projectId: string;
  config: TrainingConfig;
  status: TrainingStatus;
  createdAt: string;
  updatedAt: string;
}
