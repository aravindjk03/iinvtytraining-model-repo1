import { apiClient, ApiClientError } from './client';
import type {
  ApiResponse,
  HealthResponse,
  ModelInfo,
  TrainingJob,
  TrainingStatus,
  Prediction,
} from '@/types';

/**
 * Service error thrown when calling Model Engine endpoints not yet implemented in Phase 1.
 */
export class NotImplementedError extends ApiClientError {
  constructor(featureName: string) {
    super(
      `${featureName} is not implemented in Phase 1. The Model Engine REST API will be integrated in Phase 2.`,
      501,
      'NOT_IMPLEMENTED'
    );
    this.name = 'NotImplementedError';
  }
}

/**
 * Model Engine Service Interface.
 * Defines the contract that will connect the frontend to the external Model Engine backend.
 */
export interface IModelEngineService {
  checkHealth(): Promise<ApiResponse<HealthResponse>>;
  getModelInfo(): Promise<ApiResponse<ModelInfo>>;
  uploadDataset(datasetPayload: unknown): Promise<ApiResponse<{ datasetId: string }>>;
  startTrainingJob(config: unknown): Promise<ApiResponse<TrainingJob>>;
  getTrainingStatus(jobId: string): Promise<ApiResponse<TrainingStatus>>;
  runInference(inputData: unknown): Promise<ApiResponse<Prediction>>;
}

/**
 * Model Engine Service Implementation.
 * In Phase 1, client calls use the central API client abstraction and report typed unlinked states.
 */
export class ModelEngineService implements IModelEngineService {
  /**
   * Health check probe against the external Model Engine.
   */
  public async checkHealth(): Promise<ApiResponse<HealthResponse>> {
    // If backend is running, calls GET /health; catches failure gracefully
    try {
      return await apiClient.get<HealthResponse>('/health');
    } catch {
      return {
        success: false,
        error: {
          code: 'MODEL_ENGINE_OFFLINE',
          message: 'Unable to connect to the AI Model Engine. Please verify the service is running.',
        },
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Retrieves active model metadata and architecture details.
   */
  public async getModelInfo(): Promise<ApiResponse<ModelInfo>> {
    // Phase 1: Not implemented until external Model Engine repository is connected
    throw new NotImplementedError('Model Information query');
  }

  /**
   * Uploads safety training dataset images and annotations.
   */
  public async uploadDataset(_datasetPayload: unknown): Promise<ApiResponse<{ datasetId: string }>> {
    // Phase 1: Not implemented until external Model Engine repository is connected
    throw new NotImplementedError('Dataset upload');
  }

  /**
   * Initiates a model training job.
   */
  public async startTrainingJob(_config: unknown): Promise<ApiResponse<TrainingJob>> {
    // Phase 1: Not implemented until external Model Engine repository is connected
    throw new NotImplementedError('Training initiation');
  }

  /**
   * Polls or queries the current status of a training job.
   */
  public async getTrainingStatus(_jobId: string): Promise<ApiResponse<TrainingStatus>> {
    // Phase 1: Not implemented until external Model Engine repository is connected
    throw new NotImplementedError('Training status monitoring');
  }

  /**
   * Requests computer vision inference for an input image.
   */
  public async runInference(_inputData: unknown): Promise<ApiResponse<Prediction>> {
    // Phase 1: Not implemented until external Model Engine repository is connected
    throw new NotImplementedError('Model inference');
  }
}

export const modelEngineService = new ModelEngineService();
