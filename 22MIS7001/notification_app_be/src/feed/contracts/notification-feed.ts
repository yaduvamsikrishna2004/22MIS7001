export type NotificationType = 'Event' | 'Result' | 'Placement' | 'Announcement';
export type NotificationPriority = 'low' | 'normal' | 'high' | 'critical';

export interface NotificationFeedItem {
  notificationId: string;
  studentId: string;
  notificationType: NotificationType;
  category: 'placements' | 'events' | 'exam_results' | 'announcements';
  title: string;
  message: string;
  priority: NotificationPriority;
  deliveryTimestamp: string;
  isRead: boolean;
  metadata: Record<string, unknown>;
}

export interface FeedPage {
  items: NotificationFeedItem[];
  nextCursor?: string;
  hasMore: boolean;
}

export interface FeedQuery {
  studentId: string;
  limit: number;
  encodedCursor?: string;
  category?: NotificationFeedItem['category'];
}
