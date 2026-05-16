import type { NextFunction, Request, Response } from 'express';

export type AsyncRequestHandler = (req: Request, res: Response, next: NextFunction) => Promise<void>;

export const wrapAsync = (handler: AsyncRequestHandler) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    handler(req, res, next).catch(next);
  };
};
