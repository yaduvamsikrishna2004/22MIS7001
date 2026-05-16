import { Router } from 'express';

import { healthRoute } from '../health/health-route.js';

export const registerCoreRoutes = (router: Router): void => {
  router.use(healthRoute);
};
