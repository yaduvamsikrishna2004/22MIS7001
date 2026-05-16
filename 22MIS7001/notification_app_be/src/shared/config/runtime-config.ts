import 'dotenv/config';

interface BackendRuntimeConfig {
  port: number;
  serviceName: string;
  nodeEnv: 'development' | 'test' | 'production';
}

const parsePort = (value: string | undefined): number => {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return 8080;
  }

  return parsed;
};

export const runtimeConfig: BackendRuntimeConfig = {
  port: parsePort(process.env.BE_PORT),
  serviceName: process.env.BE_SERVICE_NAME?.trim() || 'notification-app-be',
  nodeEnv:
    process.env.BE_NODE_ENV === 'production' || process.env.BE_NODE_ENV === 'test'
      ? process.env.BE_NODE_ENV
      : 'development'
};
