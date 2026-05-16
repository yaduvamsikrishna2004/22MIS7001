import type { HealthSnapshot } from './health-domain.js';
import { runtimeConfig } from '../../shared/config/runtime-config.js';

export const buildHealthSnapshot = async (): Promise<HealthSnapshot> => {
  return {
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
};
