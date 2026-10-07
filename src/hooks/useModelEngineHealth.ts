import { useState, useEffect, useCallback } from 'react';
import { checkHealth } from '@/services/api';
import type { HealthResponse } from '@/types';

export interface UseModelEngineHealthReturn {
  health: HealthResponse | null;
  isChecking: boolean;
  isOnline: boolean;
  error: string | null;
  recheck: () => Promise<void>;
}

/**
 * Hook to inspect the health and availability of the external Model Engine service.
 */
export function useModelEngineHealth(): UseModelEngineHealthReturn {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [isOnline, setIsOnline] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

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
    }
  }, []);

  useEffect(() => {
    // Initial probe on mount
    void check();
  }, [check]);

  return {
    health,
    isChecking,
    isOnline,
    error,
    recheck: check,
  };
}
