export interface HealthSnapshot {
  status: 'ok';
  service: string;
  uptimeSeconds: number;
  timestamp: string;
  dependencies: {
    db: 'ok';
    cache: 'ok';
    realtimeGateway: 'ok';
  };
}
