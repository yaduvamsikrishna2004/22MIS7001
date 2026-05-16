import { Card, CardActionArea, CardContent, Chip, Stack, Typography } from '@mui/material';
import { memo } from 'react';

import type { NotificationRecord } from '@shared/contracts/notification-contracts';
import { formatNotificationDate } from '../utils/format-notification-date';

interface NotificationCardProps {
  item: NotificationRecord;
  onOpen: (notificationId: string) => void;
}

const toneByPriority: Record<NotificationRecord['priority'], 'default' | 'error' | 'warning' | 'info'> = {
  low: 'default',
  normal: 'info',
  high: 'warning',
  critical: 'error'
};

export const NotificationCard = memo(({ item, onOpen }: NotificationCardProps) => {
  return (
    <Card
      elevation={0}
      sx={{
        border: item.isRead ? '1px solid #dfe7ef' : '1px solid #0f4c81',
        borderRadius: 2.5,
        bgcolor: item.isRead ? '#ffffff' : '#f6fbff'
      }}
    >
      <CardActionArea onClick={() => onOpen(item.notificationId)}>
        <CardContent>
          <Stack spacing={1.5}>
            <Stack direction="row" justifyContent="space-between" gap={1.5} alignItems="center">
              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                <Chip label={item.notificationType} size="small" variant="outlined" />
                <Chip label={item.priority.toUpperCase()} size="small" color={toneByPriority[item.priority]} />
                {!item.isRead ? <Chip label="Unread" size="small" color="primary" /> : null}
              </Stack>
              <Typography variant="caption" color="text.secondary">
                {formatNotificationDate(item.deliveryTimestamp)}
              </Typography>
            </Stack>
            <Typography variant="subtitle1" fontWeight={item.isRead ? 500 : 700}>
              {item.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {item.message}
            </Typography>
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  );
});

NotificationCard.displayName = 'NotificationCard';

