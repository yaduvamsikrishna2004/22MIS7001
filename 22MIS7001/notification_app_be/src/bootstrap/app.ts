import cors from 'cors';
import express from 'express';

import { healthRoute } from '../core/health/health-route.js';
import { errorMiddleware, notFoundMiddleware } from '../shared/middleware/error-middleware.js';
import { httpAccessLogMiddleware } from '../shared/middleware/http-access-log.js';
import { requestContextMiddleware } from '../shared/middleware/request-context.js';

export const createApp = () => {
  const app = express();

  app.use(cors());
  app.use(express.json({ limit: '1mb' }));
  app.use(requestContextMiddleware);
  app.use(httpAccessLogMiddleware);

  app.use(healthRoute);

  app.use(notFoundMiddleware);
  app.use(errorMiddleware);

  return app;
};
