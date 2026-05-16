import type { NextFunction, Request, Response } from 'express';
import { randomUUID } from 'node:crypto';

declare module 'express-serve-static-core' {
  interface Request {
    requestId: string;
    requestStartEpochMs: number;
  }
}

export const requestContextMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  req.requestId = req.header('x-request-id') || randomUUID();
  req.requestStartEpochMs = Date.now();
  res.setHeader('x-request-id', req.requestId);
  next();
};
