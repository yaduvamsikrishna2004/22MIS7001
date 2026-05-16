import type { NotificationRecord } from '@shared/contracts/notification-contracts';

const priorityWeightMap: Record<NotificationRecord['priority'], number> = {
  low: 20,
  normal: 45,
  high: 72,
  critical: 92
};

const clampScore = (score: number): number => {
  if (score < 0) {
    return 0;
  }
  if (score > 100) {
    return 100;
  }
  return Math.round(score);
};

export interface RankedPriorityNotification {
  item: NotificationRecord;
  score: number;
}

export const calculatePriorityScore = (item: NotificationRecord): number => {
  const metadataScore = item.metadata.priorityScore;
  if (typeof metadataScore === 'number' && Number.isFinite(metadataScore)) {
    return clampScore(metadataScore);
  }

  const recencyWindowHours = Math.max(
    0,
    72 - (Date.now() - Date.parse(item.deliveryTimestamp)) / (1000 * 60 * 60)
  );
  const recencyBoost = Math.min(18, Math.floor(recencyWindowHours / 4));
  const unreadBoost = item.isRead ? 0 : 8;

  return clampScore(priorityWeightMap[item.priority] + recencyBoost + unreadBoost);
};

export const rankPriorityNotifications = (
  notifications: NotificationRecord[],
  topN: number
): RankedPriorityNotification[] => {
  return notifications
    .map((item) => ({ item, score: calculatePriorityScore(item) }))
    .sort((left, right) => right.score - left.score)
    .slice(0, Math.max(1, topN));
};

