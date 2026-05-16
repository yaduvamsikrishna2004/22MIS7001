import axios from 'axios';

import { runtimeConfig } from '../config/runtime-config';
import { logFrontend } from '../utils/frontend-log';

export const httpClient = axios.create({
  baseURL: runtimeConfig.apiBaseUrl,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json'
  }
});

httpClient.interceptors.request.use((request) => {
  void logFrontend('debug', 'api', 'frontend request started', {
    method: request.method || 'get',
    url: request.url || ''
  });

  return request;
});

httpClient.interceptors.response.use(
  (response) => {
    void logFrontend('info', 'api', 'frontend request completed', {
      status: response.status,
      url: response.config.url || ''
    });

    return response;
  },
  async (error) => {
    void logFrontend('warn', 'api', 'frontend request failed', {
      code: error.code || 'unknown_error',
      status: error.response?.status || 0,
      url: error.config?.url || ''
    });

    return Promise.reject(error);
  }
);
