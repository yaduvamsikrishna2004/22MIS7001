import type { LoggingRuntimeConfig } from '../types/log-contract.js';
import { readEnv, readIntegerEnv } from './env-reader.js';

export const resolveLoggingConfig = (): LoggingRuntimeConfig => {
  return {
    baseUrl: readEnv('LOG_API_BASE_URL') || 'http://localhost:9001',
    timeoutMs: readIntegerEnv('LOG_API_TIMEOUT_MS', 2500),
    maxRetries: readIntegerEnv('LOG_API_MAX_RETRIES', 2),
    retryDelayMs: readIntegerEnv('LOG_API_RETRY_DELAY_MS', 150),
    authEndpoint: readEnv('LOG_API_AUTH_ENDPOINT'),
    clientId: readEnv('LOG_API_CLIENT_ID'),
    clientSecret: readEnv('LOG_API_CLIENT_SECRET')
  };
};
