import { executeRequest } from './request-client';

export interface ServiceHealth {
  status: string;
  service: string;
  uptimeSeconds: number;
  timestamp: string;
  dependencies: {
    db: string;
    cache: string;
    realtimeGateway: string;
  };
}

export const fetchServiceHealth = async (): Promise<ServiceHealth> => {
  return executeRequest<ServiceHealth>('api', {
    method: 'get',
    url: '/v1/health/status'
  });
};
