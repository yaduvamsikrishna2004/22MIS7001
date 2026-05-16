import { FeedCacheStrategy } from '../../cache/strategies/feed-cache-strategy.js';
import { runtimeConfig } from '../../shared/config/runtime-config.js';
import { encodeFeedCursor } from '../../pagination/cursor/feed-cursor-codec.js';
import type { FeedDataSource } from '../contracts/feed-data-source.js';
import type { FeedPage, FeedQuery, NotificationFeedItem } from '../contracts/notification-feed.js';
import { rankFeedItems } from '../ranking/priority-ranker.js';
import { logBackend } from '../../integrations/logging/backend-log.js';
import type { FeedCursor } from '../../pagination/contracts/feed-cursor.js';

export class NotificationFeedAggregator {
  public constructor(
    private readonly dataSource: FeedDataSource,
    private readonly feedCacheStrategy: FeedCacheStrategy
  ) {}

  public async getFeedPage(query: FeedQuery, cursor: FeedCursor | null): Promise<FeedPage> {
    return this.feedCacheStrategy.getFeedPage(
      {
        studentId: query.studentId,
        category: query.category,
        encodedCursor: query.encodedCursor,
        limit: query.limit
      },
      async () => {
        const data = await this.dataSource.fetchFeedPage({
          studentId: query.studentId,
          limit: query.limit,
          cursor,
          category: query.category,
          preferReplica: true
        });

        const ranked = rankFeedItems(data.items);
        const nextCursor = this.buildNextCursor(ranked, data.hasMore);

        return {
          items: ranked,
          nextCursor,
          hasMore: data.hasMore
        };
      }
    );
  }

  public async getUnreadCount(studentId: string): Promise<number> {
    return this.feedCacheStrategy.getUnreadCount(studentId, async () => {
      return this.dataSource.fetchUnreadCount(studentId, true);
    });
  }

  public async getDeltaSync(
    studentId: string,
    sinceCursor: FeedCursor | null,
    limit: number
  ): Promise<NotificationFeedItem[]> {
    const data = await this.dataSource.fetchDelta(studentId, sinceCursor, limit, true);

    await logBackend('info', 'service', 'delta sync generated', {
      studentId,
      itemCount: data.length,
      limit
    });

    return rankFeedItems(data).slice(0, runtimeConfig.deltaSyncHardLimit);
  }

  private buildNextCursor(items: NotificationFeedItem[], hasMore: boolean): string | undefined {
    if (!hasMore || items.length === 0) {
      return undefined;
    }

    const lastItem = items[items.length - 1];
    return encodeFeedCursor({
      deliveredAt: lastItem.deliveryTimestamp,
      notificationId: lastItem.notificationId
    });
  }
}
