import { loadBackendEnvironment } from './environment.js';

export interface BackendRuntimeConfig {
  port: number;
  serviceName: string;
  nodeEnv: 'development' | 'test' | 'production';
  feedCacheTtlSeconds: number;
  unreadCacheTtlSeconds: number;
  reconnectWindowSeconds: number;
  maxReconnectAttemptsPerWindow: number;
  slowQueryThresholdMs: number;
  deltaSyncHardLimit: number;
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

const parsePositiveInteger = (
  value: string | undefined,
  fallback: number,
  label: string
): number => {
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`${label} must be a positive integer`);
  }

  return parsed;
};

export const loadRuntimeConfig = (): BackendRuntimeConfig => {
  const env = loadBackendEnvironment();

  return {
    port: parsePort(env.BE_PORT),
    serviceName: parseServiceName(env.BE_SERVICE_NAME),
    nodeEnv: parseNodeEnv(env.BE_NODE_ENV),
    feedCacheTtlSeconds: parsePositiveInteger(env.BE_FEED_CACHE_TTL_SECONDS, 30, 'BE_FEED_CACHE_TTL_SECONDS'),
    unreadCacheTtlSeconds: parsePositiveInteger(env.BE_UNREAD_CACHE_TTL_SECONDS, 15, 'BE_UNREAD_CACHE_TTL_SECONDS'),
    reconnectWindowSeconds: parsePositiveInteger(env.BE_RECONNECT_WINDOW_SECONDS, 30, 'BE_RECONNECT_WINDOW_SECONDS'),
    maxReconnectAttemptsPerWindow: parsePositiveInteger(
      env.BE_MAX_RECONNECT_ATTEMPTS,
      6,
      'BE_MAX_RECONNECT_ATTEMPTS'
    ),
    slowQueryThresholdMs: parsePositiveInteger(env.BE_SLOW_QUERY_THRESHOLD_MS, 400, 'BE_SLOW_QUERY_THRESHOLD_MS'),
    deltaSyncHardLimit: parsePositiveInteger(env.BE_DELTA_SYNC_HARD_LIMIT, 200, 'BE_DELTA_SYNC_HARD_LIMIT')
  };
};

export const runtimeConfig = loadRuntimeConfig();
