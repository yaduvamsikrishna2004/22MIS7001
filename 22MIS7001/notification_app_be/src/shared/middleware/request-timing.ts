import type { NextFunction, Request, Response } from 'express';

import { logBackend } from '../../integrations/logging/backend-log.js';

export const requestTimingMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  void logBackend('info', 'route', 'request received', {
    method: req.method,
    path: req.originalUrl,
    requestId: req.requestId
  });

  res.on('finish', () => {
    const elapsedMs = Date.now() - req.requestStartEpochMs;
    const level = res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info';

    void logBackend(level, 'middleware', 'request completed', {
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      elapsedMs,
      requestId: req.requestId
    });
  });

  next();
};
