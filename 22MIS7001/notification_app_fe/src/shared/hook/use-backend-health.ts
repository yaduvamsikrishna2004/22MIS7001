import { useEffect, useState } from 'react';

import { httpClient } from '../api/http-client';
import { logFrontend } from '../utils/frontend-log';

interface ServiceHealth {
  status: string;
  service: string;
  uptimeSeconds: number;
  timestamp: string;
}

export const useBackendHealth = () => {
  const [health, setHealth] = useState<ServiceHealth | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const response = await httpClient.get<{ data: ServiceHealth }>('/v1/health/status');
        setHealth(response.data.data);
        await logFrontend('info', 'hook', 'health snapshot received in UI');
      } catch {
        await logFrontend('error', 'hook', 'failed to fetch health snapshot');
      } finally {
        setIsLoading(false);
      }
    };

    fetchHealth().catch(() => {
      void logFrontend('error', 'hook', 'health hook execution failed');
    });
  }, []);

  return { health, isLoading };
};
