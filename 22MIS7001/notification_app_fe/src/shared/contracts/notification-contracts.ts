export type NotificationType = 'Event' | 'Result' | 'Placement';
export type NotificationPriority = 'low' | 'normal' | 'high' | 'critical';

export interface NotificationRecord {
  notificationId: string;
  title: string;
  message: string;
  notificationType: NotificationType;
  priority: NotificationPriority;
  deliveryTimestamp: string;
  isRead: boolean;
  metadata: Record<string, unknown>;
}

export interface NotificationPageResult {
  items: NotificationRecord[];
  page: number;
  limit: number;
  hasMore: boolean;
  totalPages?: number;
  totalCount?: number;
}

