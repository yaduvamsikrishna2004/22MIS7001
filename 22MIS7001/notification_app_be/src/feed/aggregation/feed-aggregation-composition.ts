import { InMemoryCacheProvider } from '../../cache/providers/in-memory-cache-provider.js';
import { FeedCacheStrategy } from '../../cache/strategies/feed-cache-strategy.js';
import { InMemoryFeedDataSource } from '../../integrations/notifications/in-memory-feed-data-source.js';
import { NotificationFeedAggregator } from './notification-feed-aggregator.js';

const cacheProvider = new InMemoryCacheProvider();
const cacheStrategy = new FeedCacheStrategy(cacheProvider);
const dataSource = new InMemoryFeedDataSource();

export const notificationFeedAggregator = new NotificationFeedAggregator(
  dataSource,
  cacheStrategy
);
