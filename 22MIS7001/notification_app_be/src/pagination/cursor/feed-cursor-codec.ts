import type { FeedCursor } from '../contracts/feed-cursor.js';
import { decodeBase64Url, encodeBase64Url } from '../utils/base64url.js';
import { logBackend } from '../../integrations/logging/backend-log.js';

export const encodeFeedCursor = (cursor: FeedCursor): string => {
  return encodeBase64Url(JSON.stringify(cursor));
};

export const decodeFeedCursor = async (
  encodedCursor: string | undefined
): Promise<FeedCursor | null> => {
  if (!encodedCursor) {
    return null;
  }

  try {
    const decoded = decodeBase64Url(encodedCursor);
    const parsed = JSON.parse(decoded) as FeedCursor;

    if (!parsed.deliveredAt || !parsed.notificationId) {
      throw new Error('cursor missing required fields');
    }

    return parsed;
  } catch {
    await logBackend('warn', 'utils', 'cursor parsing failure', {
      encodedCursor
    });
    return null;
  }
};
