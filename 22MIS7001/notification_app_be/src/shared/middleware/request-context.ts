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
  _res: Response,
  next: NextFunction
): void => {
  req.requestId = req.header('x-request-id') || randomUUID();
  req.requestStartEpochMs = Date.now();
  next();
};
