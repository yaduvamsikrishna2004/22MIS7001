import type { LoggingRuntimeConfig } from '../types/log-contract.js';

const readNumeric = (value: string | undefined, fallback: number): number => {
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const resolveLoggingConfig = (): LoggingRuntimeConfig => {
  const baseUrl =
    process.env.LOG_API_BASE_URL?.trim() || 'http://localhost:9001';

  return {
    baseUrl,
    timeoutMs: readNumeric(process.env.LOG_API_TIMEOUT_MS, 2500),
    maxRetries: readNumeric(process.env.LOG_API_MAX_RETRIES, 2),
    retryDelayMs: readNumeric(process.env.LOG_API_RETRY_DELAY_MS, 150),
    authEndpoint: process.env.LOG_API_AUTH_ENDPOINT?.trim(),
    clientId: process.env.LOG_API_CLIENT_ID?.trim(),
    clientSecret: process.env.LOG_API_CLIENT_SECRET?.trim()
  };
};
