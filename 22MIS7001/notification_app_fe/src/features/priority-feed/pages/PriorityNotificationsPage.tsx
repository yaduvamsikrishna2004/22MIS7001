import { Box, FormControl, InputLabel, MenuItem, Select, Stack, Typography } from '@mui/material';
import { useMemo, useState } from 'react';

import { EmptyStatePanel } from '@features/notifications/components/EmptyStatePanel';
import { ErrorStatePanel } from '@features/notifications/components/ErrorStatePanel';
import { FilterSelector } from '@features/notifications/components/FilterSelector';
import { LoadingPanel } from '@features/notifications/components/LoadingPanel';
import { useViewedNotificationsState } from '@features/notifications/state/viewed-notifications-context';
import type { NotificationType } from '@shared/contracts/notification-contracts';
import { logFrontend } from '@shared/telemetry/frontend-log';
import { usePriorityFeed } from '../hooks/use-priority-feed';
import { PriorityNotificationCard } from '../components/PriorityNotificationCard';

export const PriorityNotificationsPage = () => {
  const [selectedType, setSelectedType] = useState<NotificationType | undefined>(undefined);
  const [topN, setTopN] = useState<number>(5);

  const { markViewed } = useViewedNotificationsState();
  const { rankedItems, isLoading, isError, errorMessage, refresh } = usePriorityFeed({
    topN,
    notificationType: selectedType
  });

  const cards = useMemo(
    () =>
      rankedItems.map((rankedNotification) => (
        <PriorityNotificationCard
          key={rankedNotification.item.notificationId}
          rankedNotification={rankedNotification}
          onOpen={(notificationId) => {
            markViewed(notificationId);
            void logFrontend('info', 'component', 'priority notification viewed', {
              notificationId
            });
          }}
        />
      )),
    [markViewed, rankedItems]
  );

  return (
    <Stack spacing={2}>
      <Box>
        <Typography variant="h5" component="h2" fontWeight={650}>
          Priority Notifications
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Ranked high-signal feed driven by priority score and unread emphasis.
        </Typography>
      </Box>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1.5}
        alignItems={{ xs: 'stretch', sm: 'center' }}
        justifyContent="space-between"
      >
        <Box sx={{ width: { xs: '100%', sm: 260 } }}>
          <FilterSelector selectedType={selectedType} onTypeChange={setSelectedType} disabled={isLoading} />
        </Box>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel id="priority-top-n-label">Top N</InputLabel>
          <Select
            labelId="priority-top-n-label"
            value={String(topN)}
            label="Top N"
            onChange={(event) => setTopN(Number(event.target.value))}
          >
            {[3, 5, 10].map((value) => (
              <MenuItem key={value} value={value}>
                Top {value}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      {isLoading ? <LoadingPanel rows={3} /> : null}
      {!isLoading && isError ? <ErrorStatePanel message={errorMessage} onRetry={() => void refresh()} /> : null}
      {!isLoading && !isError && cards.length === 0 ? (
        <EmptyStatePanel
          title="No priority notifications found"
          subtitle="Try expanding Top N or remove a type filter to broaden the queue."
        />
      ) : null}
      {!isLoading && !isError && cards.length > 0 ? <Stack spacing={1.5}>{cards}</Stack> : null}
    </Stack>
  );
};

