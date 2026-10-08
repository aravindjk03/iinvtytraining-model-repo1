/**
 * API abstraction types for communication with external Model Engine.
 */

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
  timestamp: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface HealthResponse {
  status: string; // 'ok' | 'healthy' | 'HEALTHY' | 'degraded' | 'unhealthy'
  service?: string;
  version?: string;
  uptimeSeconds?: number;
  gpuAvailable?: boolean;
  device?: string;
  is_demo_mode?: boolean;
}

export interface ModelInfo {
  id?: string;
  name?: string;
  model_name?: string;
  model_version?: string;
  framework?: string;
  architecture?: string;
  status?: 'ready' | 'not_loaded' | 'training';
  classes?: string[];
  lastTrainedAt?: string;
}

/**
 * Metadata definition for models available from Repo 2 Model Engine.
 */
export interface Repo2ModelMetadata {
  modelId: string;
  name: string;
  taskType: 'object_detection' | 'image_classification' | 'pose_detection' | 'person_detection';
  status: 'ready' | 'training' | 'error';
  trainable: boolean;
  version?: string;
  description?: string;
  classes?: string[];
  recommendedProfile?: string;
  isDemo?: boolean;
}

/**
 * Compute capabilities exposed by Repo 2.
 */
export interface Repo2Capabilities {
  supportedTasks: string[];
  trainingProfiles: string[];
  maxBatchSize: number;
  devices: string[];
}

/**
 * Engine connection status outcome.
 */
export interface EngineStatusResult {
  status: 'CONNECTED' | 'OFFLINE' | 'CONNECTING' | 'ERROR' | 'UNKNOWN';
  connected: boolean;
  message: string;
  version?: string;
  endpoint?: string;
}

/**
 * Dataset validation state machine.
 */
export type DatasetValidationState =
  | 'NOT_CHECKED'
  | 'CHECKING'
  | 'VALID'
  | 'VALID_WITH_WARNINGS'
  | 'INVALID'
  | 'ERROR';

/**
 * Dataset validation outcome from Repo 2.
 */
export interface DatasetValidationResponse {
  valid: boolean;
  state: DatasetValidationState;
  summary: {
    totalImages: number;
    classCount: number;
    annotationCount?: number;
    isBalanced: boolean;
  };
  issues: string[];
  warnings: string[];
  message: string;
}

/**
 * Parameters for Repo 2 dataset validation.
 */
export interface DatasetValidationParams {
  projectId: string;
  datasetId: string;
  taskType?: string;
  classes: Array<{ id: string; name: string; count: number }>;
  imagesCount: number;
  hasAnnotations?: boolean;
}

