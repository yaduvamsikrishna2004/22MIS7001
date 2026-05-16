import { Stack } from '@mui/material';
import { memo } from 'react';

import type { NotificationRecord } from '@shared/contracts/notification-contracts';
import { NotificationCard } from './NotificationCard';

interface NotificationListProps {
  items: NotificationRecord[];
  onOpen: (notificationId: string) => void;
}

export const NotificationList = memo(({ items, onOpen }: NotificationListProps) => {
  return (
    <Stack spacing={1.5}>
      {items.map((item) => (
        <NotificationCard key={item.notificationId} item={item} onOpen={onOpen} />
      ))}
    </Stack>
  );
});

NotificationList.displayName = 'NotificationList';

