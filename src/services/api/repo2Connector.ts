import { apiClient } from './client';
import { checkHealth } from './health';
import { createTrainingJob, getTrainingJob, cancelTrainingJob } from './training';
import { predict, type RunPredictionParams } from './inference';
import type {
  Repo2ModelMetadata,
  Repo2Capabilities,
  EngineStatusResult,
  DatasetValidationParams,
  DatasetValidationResponse,
} from '@/types/api';
import type {
  DispatchTrainingParams,
  TrainingJobResponse,
  TrainingJobStatusResponse,
  PredictionResponse,
} from './types';

/**
 * Standard workshop demo models used ONLY when demo mode is explicitly enabled
 * via VITE_USE_DEMO_ENGINE=true or during test/fixture development.
 * Never masquerades as real engine data.
 */
export const DEMO_WORKSHOP_MODELS: Repo2ModelMetadata[] = [
  {
    modelId: 'ppe-workshop-v1',
    name: 'PPE Detection',
    taskType: 'object_detection',
    status: 'ready',
    trainable: true,
    version: '1.0',
    description: 'Pre-trained workshop model for Hardhat and Safety Vest detection',
    classes: ['helmet', 'vest', 'person'],
    recommendedProfile: 'workshop_cpu',
    isDemo: true,
  },
  {
    modelId: 'fire-smoke-workshop-v1',
    name: 'Fire & Smoke Detection',
    taskType: 'object_detection',
    status: 'ready',
    trainable: true,
    version: '1.0',
    description: 'Industrial flame and smoke hazard detection model',
    classes: ['fire', 'smoke'],
    recommendedProfile: 'workshop_cpu',
    isDemo: true,
  },
  {
    modelId: 'fall-pose-workshop-v1',
    name: 'Fall & Posture Detection',
    taskType: 'pose_detection',
    status: 'ready',
    trainable: false,
    version: '1.0',
    description: 'Ergonomics and fall emergency detection model (pretrained, no custom training)',
    classes: ['standing', 'sitting', 'bending', 'fallen'],
    recommendedProfile: 'workshop_cpu',
    isDemo: true,
  },
  {
    modelId: 'zone-person-workshop-v1',
    name: 'Danger Zone Person Detection',
    taskType: 'person_detection',
    status: 'ready',
    trainable: false,
    version: '1.0',
    description: 'Restricted perimeter worker presence model (pretrained)',
    classes: ['person'],
    recommendedProfile: 'workshop_cpu',
    isDemo: true,
  },
];

/**
 * Repo 2 Model Engine Connector Interface.
 * Central boundary isolating Repo 1 participant experience from Repo 2 AI compute engine.
 */
export interface IRepo2Connector {
  getEngineStatus(): Promise<EngineStatusResult>;
  listModels(taskType?: string): Promise<Repo2ModelMetadata[]>;
  getModel(modelId: string): Promise<Repo2ModelMetadata | null>;
  getCapabilities(): Promise<Repo2Capabilities>;
  validateDataset(params: DatasetValidationParams): Promise<DatasetValidationResponse>;
  startTraining(params: DispatchTrainingParams): Promise<TrainingJobResponse>;
  getTrainingStatus(jobId: string): Promise<TrainingJobStatusResponse>;
  cancelTraining(jobId: string): Promise<void>;
  runInference(params: RunPredictionParams): Promise<PredictionResponse>;
  isDemoMode(): boolean;
  setDemoMode(enabled: boolean): void;
}

/**
 * Repo2Connector implementation.
 * Wraps typed REST communications with Repo 2.
 */
export class Repo2Connector implements IRepo2Connector {
  private demoModeOverride: boolean | null = null;
  private cachedModels: Repo2ModelMetadata[] | null = null;

  public isDemoMode(): boolean {
    if (this.demoModeOverride !== null) {
      return this.demoModeOverride;
    }
    return import.meta.env.VITE_USE_DEMO_ENGINE === 'true';
  }

  public setDemoMode(enabled: boolean): void {
    this.demoModeOverride = enabled;
  }

  /**
   * Queries real health status from Repo 2.
   */
  public async getEngineStatus(): Promise<EngineStatusResult> {
    const health = await checkHealth();
    if (health.online) {
      return {
        status: 'CONNECTED',
        connected: true,
        message: health.message || 'Model Engine operational',
        version: health.version,
        endpoint: health.endpoint,
      };
    }

    return {
      status: 'OFFLINE',
      connected: false,
      message: 'Model Engine is offline. Start Repo 2 service.',
      endpoint: health.endpoint,
    };
  }

  /**
   * Retrieves available models from Repo 2 catalog.
   * If engine is offline:
   * - In demo mode: returns clearly marked demo models.
   * - Otherwise: returns empty array (never fake available models!).
   */
  public async listModels(taskType?: string): Promise<Repo2ModelMetadata[]> {
    try {
      const response = await apiClient.get<{ models?: Repo2ModelMetadata[] }>(
        '/api/v1/models',
        { timeoutMs: 3000 }
      );

      if (response.data?.models && Array.isArray(response.data.models)) {
        this.cachedModels = response.data.models;
        const models = response.data.models;
        if (taskType) {
          return models.filter((m) => m.taskType === taskType);
        }
        return models;
      }
    } catch {
      // Backend unavailable or endpoint not found
    }

    // Check demo mode fallback
    if (this.isDemoMode()) {
      const demoList = DEMO_WORKSHOP_MODELS;
      if (taskType) {
        return demoList.filter((m) => m.taskType === taskType);
      }
      return demoList;
    }

    // Engine is offline and not in demo mode -> return empty array
    return [];
  }

  /**
   * Retrieves metadata for a specific model ID from Repo 2.
   */
  public async getModel(modelId: string): Promise<Repo2ModelMetadata | null> {
    try {
      const response = await apiClient.get<Repo2ModelMetadata>(
        `/api/v1/models/${modelId}`,
        { timeoutMs: 3000 }
      );
      if (response.data) {
        return response.data;
      }
    } catch {
      // ignore
    }

    // Lookup in cached or demo list
    const available = this.cachedModels || (this.isDemoMode() ? DEMO_WORKSHOP_MODELS : []);
    const found = available.find((m) => m.modelId === modelId);
    return found || null;
  }

  /**
   * Queries compute capabilities from Repo 2.
   */
  public async getCapabilities(): Promise<Repo2Capabilities> {
    try {
      const response = await apiClient.get<Repo2Capabilities>(
        '/api/v1/capabilities',
        { timeoutMs: 3000 }
      );
      if (response.data) {
        return response.data;
      }
    } catch {
      // Fallback default capabilities
    }

    return {
      supportedTasks: ['object_detection', 'pose_detection', 'person_detection'],
      trainingProfiles: ['workshop_cpu', 'workshop_gpu'],
      maxBatchSize: 16,
      devices: ['cpu'],
    };
  }

  /**
   * Validates dataset readiness using Repo 2 engine.
   * If engine is offline: reports MODEL ENGINE OFFLINE with state ERROR.
   */
  public async validateDataset(params: DatasetValidationParams): Promise<DatasetValidationResponse> {
    const health = await this.getEngineStatus();
    if (!health.connected && !this.isDemoMode()) {
      return {
        valid: false,
        state: 'ERROR',
        summary: {
          totalImages: params.imagesCount,
          classCount: params.classes.length,
          isBalanced: false,
        },
        issues: [
          'Model Engine is offline. Connect the AI Model Engine before validating or training.',
        ],
        warnings: [],
        message: 'MODEL ENGINE OFFLINE: Connect the AI Model Engine before validating or training.',
      };
    }

    try {
      const response = await apiClient.post<DatasetValidationResponse>(
        '/api/v1/datasets/validate',
        params,
        { timeoutMs: 5000 }
      );
      if (response.data) {
        return response.data;
      }
    } catch {
      // In demo mode or if endpoint is not implemented, perform contract validation
    }

    // Authoritative dataset validation rules for workshop
    const issues: string[] = [];
    const warnings: string[] = [];

    if (params.classes.length < 2) {
      issues.push('At least 2 dataset classes are required for industrial safety training.');
    }

    params.classes.forEach((cls) => {
      if (cls.count === 0) {
        issues.push(`Class "${cls.name}" has 0 images. Every class must contain examples.`);
      } else if (cls.count < 10) {
        issues.push(`Class "${cls.name}" has ${cls.count}/10 images. Minimum workshop threshold is 10.`);
      }
    });

    // Check class balance
    const counts = params.classes.map((c) => c.count).filter((c) => c > 0);
    let isBalanced = true;
    if (counts.length >= 2) {
      const min = Math.min(...counts);
      const max = Math.max(...counts);
      if (max > min * 2.5) {
        isBalanced = false;
        warnings.push('Class imbalance detected. One class has over 2.5x more examples than another.');
      }
    }

    const isValid = issues.length === 0;
    const state = isValid ? (warnings.length > 0 ? 'VALID_WITH_WARNINGS' : 'VALID') : 'INVALID';
    const message = isValid
      ? warnings.length > 0
        ? '✓ Dataset valid with warnings. Consider adding more balanced examples.'
        : '✓ Dataset verified and ready for model training.'
      : 'DATASET NEEDS ATTENTION: Resolve errors before training.';

    return {
      valid: isValid,
      state,
      summary: {
        totalImages: params.imagesCount,
        classCount: params.classes.length,
        isBalanced,
      },
      issues,
      warnings,
      message,
    };
  }

  /**
   * Dispatches training job to Repo 2 with 'workshop_cpu' profile.
   */
  public async startTraining(params: DispatchTrainingParams): Promise<TrainingJobResponse> {
    return createTrainingJob(params);
  }

  /**
   * Queries status of an active training job.
   */
  public async getTrainingStatus(jobId: string): Promise<TrainingJobStatusResponse> {
    return getTrainingJob(jobId);
  }

  /**
   * Cancels a running training job.
   */
  public async cancelTraining(jobId: string): Promise<void> {
    return cancelTrainingJob(jobId);
  }

  /**
   * Dispatches an image inference prediction to Repo 2.
   */
  public async runInference(params: RunPredictionParams): Promise<PredictionResponse> {
    return predict(params);
  }
}

export const repo2Connector = new Repo2Connector();
