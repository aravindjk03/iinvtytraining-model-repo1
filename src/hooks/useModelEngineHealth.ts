import { useState, useEffect, useCallback, useMemo } from 'react';
import { checkHealth } from '@/services/api';
import type { HealthResponse, EngineConnectionState } from '@/types';

export interface UseModelEngineHealthReturn {
  health: HealthResponse | null;
  isChecking: boolean;
  isOnline: boolean;
  engineState: EngineConnectionState;
  error: string | null;
  recheck: () => Promise<void>;
}

/**
 * Hook to inspect the health and availability of the external Model Engine service.
 * Supports the 5-state EngineConnectionState model: UNKNOWN, CONNECTED, OFFLINE, CONNECTING, ERROR.
 */
export function useModelEngineHealth(): UseModelEngineHealthReturn {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [isOnline, setIsOnline] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hasCheckedOnce, setHasCheckedOnce] = useState<boolean>(false);

  const check = useCallback(async () => {
    setIsChecking(true);
    setError(null);
    try {
      const status = await checkHealth();
      setIsOnline(status.online);
      setHealth({
        status: status.online ? 'ok' : 'offline',
        service: 'ai-safety-model-engine',
        version: status.version || '1.0',
      });
      if (!status.online) {
        setError(status.message);
      }
    } catch (err) {
      setIsOnline(false);
      setError(err instanceof Error ? err.message : 'Connection failed');
    } finally {
      setIsChecking(false);
      setHasCheckedOnce(true);
    }
  }, []);

  useEffect(() => {
    // Initial probe on mount
    void check();
  }, [check]);

  const engineState: EngineConnectionState = useMemo(() => {
    if (isChecking) return 'CONNECTING';
    if (!hasCheckedOnce) return 'UNKNOWN';
    if (isOnline) return 'CONNECTED';
    if (
      error &&
      (error.toLowerCase().includes('error') ||
        error.toLowerCase().includes('degraded') ||
        error.toLowerCase().includes('500') ||
        error.toLowerCase().includes('failed'))
    ) {
      return 'ERROR';
    }
    return 'OFFLINE';
  }, [isChecking, hasCheckedOnce, isOnline, error]);

  return {
    health,
    isChecking,
    isOnline,
    engineState,
    error,
    recheck: check,
  };
}
