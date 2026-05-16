import type { HealthSnapshot } from './health-domain.js';
import { runtimeConfig } from '../../shared/config/runtime-config.js';
import { logBackend } from '../../integrations/logging/backend-log.js';

export const buildHealthSnapshot = async (): Promise<HealthSnapshot> => {
  const snapshot: HealthSnapshot = {
    status: 'ok',
    service: runtimeConfig.serviceName,
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    dependencies: {
      db: 'ok',
      cache: 'ok',
      realtimeGateway: 'ok'
    }
  };

  await logBackend('debug', 'service', 'health snapshot generated', {
    service: snapshot.service,
    uptimeSeconds: snapshot.uptimeSeconds
  });

  return snapshot;
};
