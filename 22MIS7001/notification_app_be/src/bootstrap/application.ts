import cors from 'cors';
import express, { Router } from 'express';

import { registerCoreRoutes } from '../core/route/register-routes.js';
import { errorMiddleware, notFoundMiddleware } from '../shared/middleware/error-middleware.js';
import { requestContextMiddleware } from '../shared/middleware/request-context.js';
import { requestTimingMiddleware } from '../shared/middleware/request-timing.js';

export const createApplication = () => {
  const app = express();

  app.use(cors());
  app.use(express.json({ limit: '1mb' }));
  app.use(requestContextMiddleware);
  app.use(requestTimingMiddleware);

  const apiRouter = Router();
  registerCoreRoutes(apiRouter);
  app.use(apiRouter);

  app.use(notFoundMiddleware);
  app.use(errorMiddleware);

  return app;
};
