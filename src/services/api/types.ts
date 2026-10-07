import type { ApiResponse as DomainApiResponse, HealthResponse, ModelInfo } from '@/types/api';
import type {
  TrainingJobStatus,
  TrainingMetrics,
  TrainingJobResponse,
  TrainingJobStatusResponse,
  ModelMetadata,
} from '@/types/training';
import type {
  BoundingBox,
  Detection,
  PredictionResponse,
  Prediction,
} from '@/types/prediction';
import type { SerializableWorkflow } from '@/types/workflow';
import type { DatasetManifest, TrainingHyperparameters, DatasetImageItem } from '@/types/dataset';
import type { Project } from '@/types/project';
import { ApiClientError } from './client';

export type ApiResponse<T = unknown> = DomainApiResponse<T>;

export interface ApiHealthStatus {
  online: boolean;
  message: string;
  timestamp: string;
  version?: string;
  endpoint: string;
}

export interface TrainingRequest {
  project: {
    id: string;
    name: string;
    safetyProblem: string;
  };
  workflow: {
    version: string;
    nodes: unknown[];
    connections: unknown[];
  };
  dataset: {
    version: string;
    datasetId: string;
    classes: unknown[];
  };
  training: {
    model: string;
    task: string;
    imageSize: number;
    epochs: number;
    confidenceThreshold?: number;
  };
}

export interface DispatchTrainingParams {
  project: Project;
  workflow: SerializableWorkflow;
  datasetManifest: DatasetManifest;
  trainingConfig: TrainingHyperparameters;
  images: DatasetImageItem[];
}

export interface PredictionRequest {
  modelId: string;
  image: Blob | File | string;
  workflow: SerializableWorkflow;
  confidenceThreshold?: number;
}

export { ApiClientError as ApiError };
export type {
  HealthResponse,
  ModelInfo,
  TrainingJobStatus,
  TrainingMetrics,
  TrainingJobResponse,
  TrainingJobStatusResponse,
  ModelMetadata,
  BoundingBox,
  Detection,
  PredictionResponse,
  Prediction,
};
