import { logBackend } from '../../integrations/logging/backend-log.js';
import { runtimeConfig } from '../../shared/config/runtime-config.js';
import type { CacheStore } from '../contracts/cache-store.js';
import { buildFeedCacheKey, buildUnreadCountCacheKey } from './notification-cache-keys.js';

interface FeedCacheRequest {
  studentId: string;
  category?: string;
  encodedCursor?: string;
  limit: number;
}

export class FeedCacheStrategy {
  public constructor(private readonly cacheStore: CacheStore) {}

  public async getFeedPage<TData>(
    request: FeedCacheRequest,
    resolver: () => Promise<TData>
  ): Promise<TData> {
    const cacheKey = buildFeedCacheKey(
      request.studentId,
      request.category,
      request.encodedCursor,
      request.limit
    );

    const cached = await this.cacheStore.get<TData>(cacheKey);
    if (cached) {
      await logBackend('debug', 'cache', 'feed cache hit', {
        studentId: request.studentId,
        cacheKey
      });
      return cached;
    }

    await logBackend('info', 'cache', 'feed cache miss', {
      studentId: request.studentId,
      cacheKey
    });

    const startedAt = Date.now();
    const resolved = await resolver();
    const elapsedMs = Date.now() - startedAt;

    if (elapsedMs > runtimeConfig.slowQueryThresholdMs) {
      await logBackend('warn', 'service', 'slow feed retrieval observed', {
        studentId: request.studentId,
        elapsedMs
      });
    }

    await this.cacheStore.set(cacheKey, resolved, {
      ttlSeconds: runtimeConfig.feedCacheTtlSeconds
    });

    await logBackend('debug', 'cache', 'feed cache hydrated', {
      studentId: request.studentId,
      cacheKey,
      ttlSeconds: runtimeConfig.feedCacheTtlSeconds
    });

    return resolved;
  }

  public async getUnreadCount(
    studentId: string,
    resolver: () => Promise<number>
  ): Promise<number> {
    const cacheKey = buildUnreadCountCacheKey(studentId);

    const cached = await this.cacheStore.get<number>(cacheKey);
    if (cached !== null) {
      await logBackend('debug', 'cache', 'unread counter cache hit', { studentId });
      return cached;
    }

    await logBackend('info', 'cache', 'unread counter cache miss', { studentId });

    const resolved = await resolver();

    await this.cacheStore.set(cacheKey, resolved, {
      ttlSeconds: runtimeConfig.unreadCacheTtlSeconds
    });

    await logBackend('debug', 'cache', 'unread counter cache hydrated', {
      studentId,
      unreadCount: resolved
    });

    return resolved;
  }
}
