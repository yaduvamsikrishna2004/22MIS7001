import type { NotificationFeedItem } from '../contracts/notification-feed.js';

const priorityWeight: Record<NotificationFeedItem['priority'], number> = {
  critical: 40,
  high: 25,
  normal: 10,
  low: 1
};

export const rankFeedItems = (items: NotificationFeedItem[]): NotificationFeedItem[] => {
  return [...items].sort((left, right) => {
    const scoreDifference = priorityWeight[right.priority] - priorityWeight[left.priority];
    if (scoreDifference !== 0) {
      return scoreDifference;
    }

    return Date.parse(right.deliveryTimestamp) - Date.parse(left.deliveryTimestamp);
  });
};
