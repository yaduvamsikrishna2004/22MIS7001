import { isAxiosError } from 'axios';

import { executeRequest } from '@shared/api/request-client';
import type { NotificationPageResult, NotificationRecord, NotificationType } from '@shared/contracts/notification-contracts';
import { logFrontend } from '@shared/telemetry/frontend-log';

interface FetchNotificationsInput {
  signal: AbortSignal;
  page: number;
  limit: number;
  notificationType?: NotificationType;
}

const parsePriority = (value: unknown): NotificationRecord['priority'] => {
  if (value === 'low' || value === 'normal' || value === 'high' || value === 'critical') {
    return value;
  }

  return 'normal';
};

const parseNotificationType = (value: unknown): NotificationType => {
  if (value === 'Event' || value === 'Result' || value === 'Placement') {
    return value;
  }

  return 'Event';
};

const parseItem = (candidate: unknown): NotificationRecord | null => {
  if (!candidate || typeof candidate !== 'object') {
    return null;
  }

  const record = candidate as Record<string, unknown>;
  const notificationId = typeof record.notificationId === 'string' ? record.notificationId : null;
  const title = typeof record.title === 'string' ? record.title : null;
  const message = typeof record.message === 'string' ? record.message : null;
  const deliveryTimestamp =
    typeof record.deliveryTimestamp === 'string' ? record.deliveryTimestamp : new Date().toISOString();

  if (!notificationId || !title || !message) {
    return null;
  }

  return {
    notificationId,
    title,
    message,
    deliveryTimestamp,
    notificationType: parseNotificationType(record.notification_type ?? record.notificationType),
    priority: parsePriority(record.priority),
    isRead: typeof record.isRead === 'boolean' ? record.isRead : false,
    metadata: record.metadata && typeof record.metadata === 'object' ? (record.metadata as Record<string, unknown>) : {}
  };
};

const normalizePageResponse = (rawData: unknown, page: number, limit: number): NotificationPageResult => {
  if (Array.isArray(rawData)) {
    const items = rawData.map(parseItem).filter((entry): entry is NotificationRecord => entry !== null);
    return {
      items,
      page,
      limit,
      hasMore: items.length >= limit
    };
  }

  if (!rawData || typeof rawData !== 'object') {
    return {
      items: [],
      page,
      limit,
      hasMore: false
    };
  }

  const asObject = rawData as Record<string, unknown>;
  const candidateItems =
    (Array.isArray(asObject.items) ? asObject.items : null) ??
    (Array.isArray(asObject.notifications) ? asObject.notifications : null) ??
    [];

  const items = candidateItems
    .map(parseItem)
    .filter((entry): entry is NotificationRecord => entry !== null);

  const totalPages =
    typeof asObject.totalPages === 'number' && Number.isFinite(asObject.totalPages)
      ? asObject.totalPages
      : undefined;
  const totalCount =
    typeof asObject.totalCount === 'number' && Number.isFinite(asObject.totalCount)
      ? asObject.totalCount
      : undefined;

  const hasMore =
    typeof asObject.hasMore === 'boolean'
      ? asObject.hasMore
      : totalPages !== undefined
        ? page < totalPages
        : items.length >= limit;

  return {
    items,
    page,
    limit,
    hasMore,
    totalPages,
    totalCount
  };
};

export const fetchNotificationsPage = async ({
  signal,
  page,
  limit,
  notificationType
}: FetchNotificationsInput): Promise<NotificationPageResult> => {
  try {
    const rawData = await executeRequest<unknown>('api', {
      method: 'get',
      url: '/evaluation-service/notifications',
      signal,
      params: {
        page,
        limit,
        notification_type: notificationType
      }
    });

    return normalizePageResponse(rawData, page, limit);
  } catch (error) {
    if (isAxiosError(error) && error.code === 'ERR_CANCELED') {
      throw error;
    }

    await logFrontend('warn', 'api', 'notification fetch API failed', {
      page,
      limit,
      notificationType: notificationType || 'all'
    });
    throw error;
  }
};

