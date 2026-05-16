import type { NextFunction, Request, Response } from 'express';

import { logBackend } from '../../integrations/logging/backend-log.js';

export const httpAccessLogMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  void logBackend('info', 'route', 'incoming request', {
    method: req.method,
    path: req.path,
    requestId: req.requestId
  });

  res.on('finish', () => {
    const durationMs = Date.now() - req.requestStartEpochMs;

    void logBackend('info', 'middleware', 'request completed', {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      durationMs,
      requestId: req.requestId
    });
  });

  next();
};
