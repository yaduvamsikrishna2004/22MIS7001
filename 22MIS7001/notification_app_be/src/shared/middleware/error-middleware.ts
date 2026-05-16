import type { NextFunction, Request, Response } from 'express';

import { logBackend } from '../../integrations/logging/backend-log.js';
import { sendError } from '../transport/http-response.js';

export const notFoundMiddleware = (req: Request, res: Response): void => {
  void logBackend('warn', 'route', 'route not found', {
    method: req.method,
    path: req.originalUrl,
    requestId: req.requestId
  });

  sendError(res, 404, req.requestId, {
    code: 'NOT_FOUND',
    message: 'Requested endpoint does not exist',
    retryable: false
  });
};

export const errorMiddleware = (
  error: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  void logBackend('error', 'handler', 'unhandled exception in request pipeline', {
    method: req.method,
    path: req.originalUrl,
    requestId: req.requestId,
    message: error.message
  });

  sendError(res, 500, req.requestId, {
    code: 'INTERNAL_ERROR',
    message: 'Unexpected server error',
    retryable: true
  });
};
