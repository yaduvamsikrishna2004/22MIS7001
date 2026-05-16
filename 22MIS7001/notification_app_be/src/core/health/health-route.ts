import { Router } from 'express';

import { getHealthStatus } from './health-handler.js';
import { wrapAsync } from '../../shared/middleware/async-handler.js';

export const healthRoute = Router();

healthRoute.get('/v1/health/status', wrapAsync(getHealthStatus));
