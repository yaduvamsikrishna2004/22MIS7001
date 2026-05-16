import axios from 'axios';

import { runtimeConfig } from '../config/runtime-config';
import { logFrontend } from '../telemetry/frontend-log';

export const axiosClient = axios.create({
  baseURL: runtimeConfig.apiBaseUrl,
  timeout: runtimeConfig.requestTimeoutMs,
  headers: {
    'Content-Type': 'application/json'
  }
});

let didLogMissingTokenWarning = false;

axiosClient.interceptors.request.use((config) => {
  try {
    const headers = config.headers || {};

    if (!runtimeConfig.bearerToken) {
      if (!didLogMissingTokenWarning) {
        didLogMissingTokenWarning = true;
        void logFrontend('warn', 'api', 'auth header injection skipped because token is missing', {
          url: config.url || ''
        });
      }
    } else {
      headers.Authorization = `Bearer ${runtimeConfig.bearerToken}`;
    }

    headers['X-Student-Id'] = runtimeConfig.defaultStudentId;
    config.headers = headers;
  } catch {
    void logFrontend('error', 'api', 'auth header injection failed unexpectedly', {
      url: config.url || ''
    });
  }

  return config;
});

axiosClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    const statusCode =
      typeof error === 'object' && error && 'response' in error
        ? (error as { response?: { status?: number } }).response?.status
        : undefined;

    if (statusCode === 401) {
      void logFrontend('error', 'api', 'authorization rejected by upstream API', {
        statusCode,
        baseUrl: runtimeConfig.apiBaseUrl
      });
    }

    return Promise.reject(error);
  }
);
