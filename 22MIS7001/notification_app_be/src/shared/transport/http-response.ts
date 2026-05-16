import type { Response } from 'express';

import type { ApiErrorEnvelope, ApiSuccessEnvelope } from '../contracts/api-envelope.js';

export const sendSuccess = <TData>(
  res: Response,
  statusCode: number,
  requestId: string,
  data: TData
): void => {
  const body: ApiSuccessEnvelope<TData> = {
    data,
    meta: {
      requestId,
      timestamp: new Date().toISOString()
    }
  };

  res.status(statusCode).json(body);
};

export const sendError = (
  res: Response,
  statusCode: number,
  requestId: string,
  payload: Omit<ApiErrorEnvelope['error'], 'traceId' | 'timestamp'>
): void => {
  const body: ApiErrorEnvelope = {
    error: {
      ...payload,
      traceId: requestId,
      timestamp: new Date().toISOString()
    }
  };

  res.status(statusCode).json(body);
};
