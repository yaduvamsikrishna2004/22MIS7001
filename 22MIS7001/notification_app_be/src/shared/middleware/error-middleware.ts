import type { NextFunction, Request, Response } from 'express';

import { logBackend } from '../../integrations/logging/backend-log.js';

export const notFoundMiddleware = (req: Request, res: Response): void => {
  void logBackend('warn', 'route', 'route not found', {
    path: req.path,
    method: req.method,
    requestId: req.requestId
  });

  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: 'The requested resource was not found',
      traceId: req.requestId,
      timestamp: new Date().toISOString(),
      retryable: false
    }
  });
};

export const errorMiddleware = (
  error: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  void logBackend('error', 'handler', 'unhandled request error', {
    path: req.path,
    method: req.method,
    requestId: req.requestId,
    message: error.message
  });

  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Unexpected server error',
      traceId: req.requestId,
      timestamp: new Date().toISOString(),
      retryable: true
    }
  });
};
