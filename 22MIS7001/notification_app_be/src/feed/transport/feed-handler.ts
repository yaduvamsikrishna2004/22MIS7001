import type { Request, Response } from 'express';

import { decodeFeedCursor } from '../../pagination/cursor/feed-cursor-codec.js';
import { sendSuccess } from '../../shared/transport/http-response.js';
import { notificationFeedAggregator } from '../aggregation/feed-aggregation-composition.js';
import type { FeedQuery } from '../contracts/notification-feed.js';

const parseLimit = (rawLimit: string | undefined): number => {
  const parsed = Number(rawLimit);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return 20;
  }

  return Math.min(parsed, 100);
};

const parseStudentId = (req: Request): string => {
  return req.header('x-student-id')?.trim() || 'student-demo';
};

export const getNotificationFeed = async (req: Request, res: Response): Promise<void> => {
  const studentId = parseStudentId(req);
  const encodedCursor = typeof req.query.cursor === 'string' ? req.query.cursor : undefined;
  const cursor = await decodeFeedCursor(encodedCursor);

  const query: FeedQuery = {
    studentId,
    limit: parseLimit(typeof req.query.limit === 'string' ? req.query.limit : undefined),
    encodedCursor,
    category:
      typeof req.query.category === 'string'
        ? (req.query.category as FeedQuery['category'])
        : undefined
  };

  const page = await notificationFeedAggregator.getFeedPage(query, cursor);

  sendSuccess(res, 200, req.requestId, {
    items: page.items,
    nextCursor: page.nextCursor,
    hasMore: page.hasMore
  });
};

export const getUnreadCount = async (req: Request, res: Response): Promise<void> => {
  const studentId = parseStudentId(req);
  const unreadCount = await notificationFeedAggregator.getUnreadCount(studentId);

  sendSuccess(res, 200, req.requestId, {
    unreadCount,
    generatedAt: new Date().toISOString()
  });
};
