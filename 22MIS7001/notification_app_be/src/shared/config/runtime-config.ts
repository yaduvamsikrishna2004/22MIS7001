import { loadBackendEnvironment } from './environment.js';

export interface BackendRuntimeConfig {
  port: number;
  serviceName: string;
  nodeEnv: 'development' | 'test' | 'production';
}

const parsePort = (value: string | undefined): number => {
  if (!value) {
    return 8080;
  }

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0 || parsed > 65535) {
    throw new Error('BE_PORT must be a positive integer between 1 and 65535');
  }

  return parsed;
};

const parseNodeEnv = (value: string | undefined): BackendRuntimeConfig['nodeEnv'] => {
  if (!value || value === 'development') {
    return 'development';
  }

  if (value === 'test' || value === 'production') {
    return value;
  }

  throw new Error('BE_NODE_ENV must be development, test, or production');
};

const parseServiceName = (value: string | undefined): string => {
  const normalized = value?.trim();
  if (!normalized) {
    return 'notification-app-be';
  }

  if (normalized.length < 3) {
    throw new Error('BE_SERVICE_NAME must contain at least 3 characters');
  }

  return normalized;
};

export const loadRuntimeConfig = (): BackendRuntimeConfig => {
  const env = loadBackendEnvironment();

  return {
    port: parsePort(env.BE_PORT),
    serviceName: parseServiceName(env.BE_SERVICE_NAME),
    nodeEnv: parseNodeEnv(env.BE_NODE_ENV)
  };
};

export const runtimeConfig = loadRuntimeConfig();
