import { Router } from 'express';

import { wrapAsync } from '../../shared/middleware/async-handler.js';
import { getNotificationFeed, getUnreadCount } from './feed-handler.js';

export const feedRoute = Router();

feedRoute.get('/v1/notifications', wrapAsync(getNotificationFeed));
feedRoute.get('/v1/notifications/unread-count', wrapAsync(getUnreadCount));
