import { isAxiosError } from 'axios';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { fetchNotificationsPage } from '@features/notifications/api/notifications-api';
import { useViewedNotificationsState } from '@features/notifications/state/viewed-notifications-context';
import type { NotificationPageResult, NotificationRecord, NotificationType } from '@shared/contracts/notification-contracts';
import { logFrontend } from '@shared/telemetry/frontend-log';

interface UseNotificationsPageInput {
  page: number;
  limit: number;
  notificationType?: NotificationType;
}

interface UseNotificationsPageOutput {
  items: NotificationRecord[];
  isLoading: boolean;
  isError: boolean;
  errorMessage: string;
  hasMore: boolean;
  totalPages?: number;
  totalCount?: number;
  refresh: () => Promise<void>;
  markItemViewed: (notificationId: string) => void;
}

const applyViewedState = (
  items: NotificationRecord[],
  isViewed: (notificationId: string) => boolean
): NotificationRecord[] => {
  return items.map((item) => (isViewed(item.notificationId) ? { ...item, isRead: true } : item));
};

const EMPTY_PAGE: NotificationPageResult = {
  items: [],
  page: 1,
  limit: 12,
  hasMore: false
};

export const useNotificationsPage = ({
  page,
  limit,
  notificationType
}: UseNotificationsPageInput): UseNotificationsPageOutput => {
  const [result, setResult] = useState<NotificationPageResult>(EMPTY_PAGE);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { isViewed, markViewed, viewedIds } = useViewedNotificationsState();

  const loadNotifications = useCallback(
    async (signal: AbortSignal) => {
      setIsLoading(true);
      setIsError(false);

      try {
        const pageResult = await fetchNotificationsPage({
          page,
          limit,
          notificationType,
          signal
        });

        const decoratedItems = applyViewedState(pageResult.items, isViewed);

        setResult({
          ...pageResult,
          items: decoratedItems
        });

        await logFrontend('info', 'hook', 'notification page loaded', {
          page,
          limit,
          itemCount: decoratedItems.length,
          notificationType: notificationType || 'all'
        });
      } catch (error) {
        if (isAxiosError(error) && error.code === 'ERR_CANCELED') {
          await logFrontend('debug', 'hook', 'notification request cancelled', {
            page,
            limit
          });
          return;
        }

        const message = error instanceof Error ? error.message : 'Notification request failed';
        setIsError(true);
        setErrorMessage(message);

        await logFrontend('error', 'hook', 'notification page fetch failed', {
          page,
          limit,
          notificationType: notificationType || 'all',
          message
        });
      } finally {
        setIsLoading(false);
      }
    },
    [isViewed, limit, notificationType, page]
  );

  useEffect(() => {
    const abortController = new AbortController();

    loadNotifications(abortController.signal).catch(async () => {
      await logFrontend('fatal', 'hook', 'notification page hook crashed');
    });

    return () => abortController.abort();
  }, [loadNotifications]);

  const refresh = useCallback(async () => {
    const abortController = new AbortController();
    await loadNotifications(abortController.signal);
  }, [loadNotifications]);

  const markItemViewed = useCallback(
    (notificationId: string) => {
      markViewed(notificationId);
      setResult((currentValue) => ({
        ...currentValue,
        items: currentValue.items.map((item) =>
          item.notificationId === notificationId ? { ...item, isRead: true } : item
        )
      }));
    },
    [markViewed]
  );

  useEffect(() => {
    setResult((currentValue) => ({
      ...currentValue,
      items: applyViewedState(currentValue.items, isViewed)
    }));
  }, [isViewed, viewedIds]);

  return useMemo(
    () => ({
      items: result.items,
      isLoading,
      isError,
      errorMessage,
      hasMore: result.hasMore,
      totalPages: result.totalPages,
      totalCount: result.totalCount,
      refresh,
      markItemViewed
    }),
    [errorMessage, isError, isLoading, markItemViewed, refresh, result]
  );
};

