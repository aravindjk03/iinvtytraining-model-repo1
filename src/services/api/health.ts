import { apiClient } from './client';
import type { HealthResponse } from '@/types/api';
import type { ApiHealthStatus } from './types';

/**
 * Checks connectivity with the external Model Engine REST API.
 * Probes GET /api/v1/health with graceful fallback to GET /health.
 */
export async function checkHealth(): Promise<ApiHealthStatus> {
  const primaryEndpoint = '/api/v1/health';
  const fallbackEndpoint = '/health';

  try {
    let response = await apiClient.get<HealthResponse>(
      primaryEndpoint,
      { timeoutMs: 3000 }
    ).catch(() => null);

    let activeEndpoint = primaryEndpoint;

    if (!response || !response.success) {
      // Try fallback endpoint
      response = await apiClient.get<HealthResponse>(
        fallbackEndpoint,
        { timeoutMs: 3000 }
      );
      activeEndpoint = fallbackEndpoint;
    }

    const info = response.data;
    const isOk =
      response.success &&
      Boolean(
        info?.status?.toLowerCase() === 'ok' ||
        info?.status?.toLowerCase() === 'healthy'
      );

    return {
      online: isOk,
      message: info?.status || (isOk ? 'Model Engine operational' : 'Model Engine reporting degraded status'),
      version: info?.version || '1.0',
      timestamp: new Date().toISOString(),
      endpoint: `${apiClient.getBaseUrl()}${activeEndpoint}`,
    };
  } catch (err: unknown) {
    const message =
      err instanceof Error
        ? err.message
        : 'Unable to connect to the AI Model Engine. Please verify the service is running.';
    return {
      online: false,
      message,
      timestamp: new Date().toISOString(),
      endpoint: `${apiClient.getBaseUrl()}${primaryEndpoint}`,
    };
  }
}

/**
 * Backward compatibility alias.
 */
export const checkModelEngineHealth = checkHealth;
