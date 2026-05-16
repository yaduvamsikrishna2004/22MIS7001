import { Router } from 'express';

import { getHealthStatus } from './health-handler.js';

export const healthRoute = Router();

healthRoute.get('/v1/health/status', (req, res, next) => {
  getHealthStatus(req, res).catch(next);
});
