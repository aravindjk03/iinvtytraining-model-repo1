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
