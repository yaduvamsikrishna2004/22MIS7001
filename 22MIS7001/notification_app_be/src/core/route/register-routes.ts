import { Router } from 'express';

import { healthRoute } from '../health/health-route.js';
import { feedRoute } from '../../feed/transport/feed-route.js';
import { realtimeRoute } from '../../realtime/gateway/realtime-route.js';

export const registerCoreRoutes = (router: Router): void => {
  router.use(healthRoute);
  router.use(feedRoute);
  router.use(realtimeRoute);
};
