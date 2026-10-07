import { useState, useEffect, useCallback } from 'react';
import { checkModelEngineHealth } from '@/services/api/healthService';
import { ApiHealthStatus } from '@/services/api/types';

export function useApiHealth(pollIntervalMs?: number) {
  const [health, setHealth] = useState<ApiHealthStatus | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const check = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await checkModelEngineHealth();
      setHealth(res);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    check();

    if (pollIntervalMs && pollIntervalMs > 0) {
      const interval = setInterval(check, pollIntervalMs);
      return () => clearInterval(interval);
    }
  }, [check, pollIntervalMs]);

  return { health, isLoading, refresh: check };
}
