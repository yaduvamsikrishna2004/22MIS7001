import { useEffect, useState } from 'react';

import { fetchServiceHealth, type ServiceHealth } from '../api/health-api';
import { logFrontend } from '../telemetry/frontend-log';

export const useBackendHealth = () => {
  const [health, setHealth] = useState<ServiceHealth | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadHealth = async () => {
      try {
        const healthSnapshot = await fetchServiceHealth();
        setHealth(healthSnapshot);
        await logFrontend('info', 'hook', 'health snapshot loaded for shell', {
          service: healthSnapshot.service
        });
      } catch {
        await logFrontend('error', 'hook', 'health snapshot fetch failed');
      } finally {
        setIsLoading(false);
      }
    };

    loadHealth().catch(async () => {
      await logFrontend('fatal', 'hook', 'health hook crashed unexpectedly');
    });
  }, []);

  return { health, isLoading };
};
