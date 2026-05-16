import type { AxiosRequestConfig } from 'axios';

import { axiosClient } from './axios-client';
import type { ApiSuccessEnvelope } from '../contracts/api-envelope';
import { logFrontend } from '../telemetry/frontend-log';

export const executeRequest = async <TData>(
  packageLabel: 'api' | 'hook' | 'state' | 'component' | 'page' | 'style',
  requestConfig: AxiosRequestConfig
): Promise<TData> => {
  const startedAt = Date.now();

  await logFrontend('debug', 'api', 'http request queued', {
    method: (requestConfig.method || 'get').toString(),
    url: requestConfig.url || ''
  });

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
