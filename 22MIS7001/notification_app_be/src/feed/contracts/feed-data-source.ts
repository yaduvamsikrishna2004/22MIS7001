import type { FeedCursor } from '../../pagination/contracts/feed-cursor.js';
import type { FeedQuery, NotificationFeedItem } from './notification-feed.js';

export interface FeedDataSource {
  fetchFeedPage(query: {
    studentId: string;
    limit: number;
    cursor: FeedCursor | null;
    category?: FeedQuery['category'];
    preferReplica: boolean;
  }): Promise<{ items: NotificationFeedItem[]; hasMore: boolean }>;
  fetchUnreadCount(studentId: string, preferReplica: boolean): Promise<number>;
  fetchDelta(
    studentId: string,
    sinceCursor: FeedCursor | null,
    limit: number,
    preferReplica: boolean
  ): Promise<NotificationFeedItem[]>;
}
