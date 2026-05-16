import { Box, Stack, Typography } from '@mui/material';
import { useCallback } from 'react';

import { ErrorStatePanel } from '@features/notifications/components/ErrorStatePanel';
import { NotificationList } from '@features/notifications/components/NotificationList';
import { NotificationToolbar } from '@features/notifications/components/NotificationToolbar';
import { PaginationControls } from '@features/notifications/components/PaginationControls';
import { useNotificationsPage } from '@features/notifications/hooks/use-notifications-page';
import { useNotificationQueryState } from '@features/notifications/state/use-notification-query-state';
import { EmptyStatePanel } from '../components/EmptyStatePanel';
import { LoadingPanel } from '../components/LoadingPanel';

export const NotificationsDashboardPage = () => {
  const { page, limit, notificationType, setPage, setLimit, setNotificationType } =
    useNotificationQueryState();
  const { items, isLoading, isError, errorMessage, hasMore, totalPages, totalCount, refresh, markItemViewed } =
    useNotificationsPage({
      page,
      limit,
      notificationType
    });

  const handleNotificationOpen = useCallback(
    (notificationId: string) => {
      markItemViewed(notificationId);
    },
    [markItemViewed]
  );

  return (
    <Stack spacing={2}>
      <Box>
        <Typography variant="h5" component="h2" fontWeight={650}>
          Notifications Dashboard
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Campus activity feed with unread emphasis and realtime-ready pagination.
        </Typography>
      </Box>
      <NotificationToolbar
        selectedType={notificationType}
        limit={limit}
        onTypeChange={setNotificationType}
        onLimitChange={setLimit}
        totalCount={totalCount}
        disabled={isLoading}
      />
      {isLoading ? <LoadingPanel rows={4} /> : null}
      {!isLoading && isError ? <ErrorStatePanel message={errorMessage} onRetry={() => void refresh()} /> : null}
      {!isLoading && !isError && items.length === 0 ? (
        <EmptyStatePanel
          title="No notifications in this view"
          subtitle="Try another notification type or come back shortly for new campus updates."
        />
      ) : null}
      {!isLoading && !isError && items.length > 0 ? (
        <Stack spacing={1.75}>
          <NotificationList items={items} onOpen={handleNotificationOpen} />
          <PaginationControls
            page={page}
            totalPages={totalPages}
            hasMore={hasMore}
            onPageChange={setPage}
            disabled={isLoading}
          />
        </Stack>
      ) : null}
    </Stack>
  );
};

