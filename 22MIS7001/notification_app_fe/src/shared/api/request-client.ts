import type { AxiosRequestConfig } from 'axios';

import { axiosClient } from './axios-client';
import { runtimeConfig } from '../config/runtime-config';
import type { ApiSuccessEnvelope } from '../contracts/api-envelope';
import { logFrontend } from '../telemetry/frontend-log';

interface ExecuteRequestOptions {
  allowMissingAuthToken?: boolean;
}

export const executeRequest = async <TData>(
  packageLabel: 'api' | 'hook' | 'state' | 'component' | 'page' | 'style',
  requestConfig: AxiosRequestConfig,
  options: ExecuteRequestOptions = {}
): Promise<TData> => {
  const startedAt = Date.now();
  const allowMissingAuthToken = options.allowMissingAuthToken ?? false;

  await logFrontend('debug', 'api', 'http request queued', {
    method: (requestConfig.method || 'get').toString(),
    url: requestConfig.url || ''
  });

  if (!allowMissingAuthToken && !runtimeConfig.bearerToken) {
    await logFrontend('error', 'api', 'request blocked because bearer token is missing', {
      method: (requestConfig.method || 'get').toString(),
      url: requestConfig.url || ''
    });
    throw new Error('Missing API bearer token');
  }

  try {
    const response = await axiosClient.request<ApiSuccessEnvelope<TData>>(requestConfig);

    await logFrontend('info', packageLabel, 'http request succeeded', {
      method: (requestConfig.method || 'get').toString(),
      url: requestConfig.url || '',
      statusCode: response.status,
      elapsedMs: Date.now() - startedAt
    });

    return response.data.data;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown request error';

    await logFrontend('warn', packageLabel, 'http request failed', {
      method: (requestConfig.method || 'get').toString(),
      url: requestConfig.url || '',
      elapsedMs: Date.now() - startedAt,
      message
    });

    throw error;
  }
};
