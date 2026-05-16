import { Router } from 'express';

import { wrapAsync } from '../../shared/middleware/async-handler.js';
import { getRealtimeDelta } from './realtime-sync-handler.js';

export const realtimeRoute = Router();

realtimeRoute.get('/v1/realtime/sync', wrapAsync(getRealtimeDelta));
