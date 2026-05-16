import type { Request, Response } from 'express';

import { decodeFeedCursor } from '../../pagination/cursor/feed-cursor-codec.js';
import { sendSuccess } from '../../shared/transport/http-response.js';
import { notificationFeedAggregator } from '../../feed/aggregation/feed-aggregation-composition.js';

const parseLimit = (rawLimit: string | undefined): number => {
  const parsed = Number(rawLimit);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return 50;
  }

  return Math.min(parsed, 200);
};

export const getRealtimeDelta = async (req: Request, res: Response): Promise<void> => {
  const studentId = req.header('x-student-id')?.trim() || 'student-demo';
  const sinceCursor =
    typeof req.query.sinceCursor === 'string' ? await decodeFeedCursor(req.query.sinceCursor) : null;
  const limit = parseLimit(typeof req.query.limit === 'string' ? req.query.limit : undefined);

  const items = await notificationFeedAggregator.getDeltaSync(studentId, sinceCursor, limit);

  sendSuccess(res, 200, req.requestId, {
    items,
    nextCursor: items.length > 0 ? req.query.sinceCursor ?? null : req.query.sinceCursor ?? null,
    syncComplete: items.length < limit
  });
};
