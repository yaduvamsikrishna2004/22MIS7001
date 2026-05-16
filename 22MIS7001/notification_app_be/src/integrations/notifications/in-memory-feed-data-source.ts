import type { FeedDataSource } from '../../feed/contracts/feed-data-source.js';
import type { FeedCursor } from '../../pagination/contracts/feed-cursor.js';
import type { NotificationFeedItem } from '../../feed/contracts/notification-feed.js';
import { logBackend } from '../logging/backend-log.js';

const defaultItems: NotificationFeedItem[] = [];

export class InMemoryFeedDataSource implements FeedDataSource {
  public async fetchFeedPage(query: {
    studentId: string;
    limit: number;
    cursor: FeedCursor | null;
    category?: 'placements' | 'events' | 'exam_results' | 'announcements';
    preferReplica: boolean;
  }): Promise<{ items: NotificationFeedItem[]; hasMore: boolean }> {
    const filtered = defaultItems
      .filter((item) => item.studentId === query.studentId)
      .filter((item) => (query.category ? item.category === query.category : true));

    try {
      if (!query.preferReplica) {
        return { items: filtered.slice(0, query.limit), hasMore: filtered.length > query.limit };
      }

      return { items: filtered.slice(0, query.limit), hasMore: filtered.length > query.limit };
    } catch {
      await logBackend('warn', 'repository', 'read replica fallback activated', {
        studentId: query.studentId
      });

      return { items: filtered.slice(0, query.limit), hasMore: filtered.length > query.limit };
    }
  }

  public async fetchUnreadCount(studentId: string, preferReplica: boolean): Promise<number> {
    try {
      const count = defaultItems.filter(
        (item) => item.studentId === studentId && item.isRead === false
      ).length;

      if (!preferReplica) {
        return count;
      }

      return count;
    } catch {
      await logBackend('warn', 'repository', 'read replica fallback for unread count', {
        studentId
      });

      return defaultItems.filter((item) => item.studentId === studentId && item.isRead === false).length;
    }
  }

  public async fetchDelta(
    studentId: string,
    sinceCursor: FeedCursor | null,
    limit: number,
    preferReplica: boolean
  ): Promise<NotificationFeedItem[]> {
    try {
      const baseline = defaultItems.filter((item) => item.studentId === studentId);
      const afterCursor = sinceCursor
        ? baseline.filter(
            (item) =>
              Date.parse(item.deliveryTimestamp) > Date.parse(sinceCursor.deliveredAt) ||
              (item.deliveryTimestamp === sinceCursor.deliveredAt &&
                item.notificationId > sinceCursor.notificationId)
          )
        : baseline;

      if (!preferReplica) {
        return afterCursor.slice(0, limit);
      }

      return afterCursor.slice(0, limit);
    } catch {
      await logBackend('warn', 'repository', 'read replica fallback for delta sync', {
        studentId,
        limit
      });

      return [];
    }
  }
}
