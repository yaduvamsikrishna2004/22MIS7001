import { Card, CardActionArea, CardContent, Chip, LinearProgress, Stack, Typography } from '@mui/material';
import { memo } from 'react';

import type { RankedPriorityNotification } from '@features/priority-feed/utils/rank-priority-notifications';
import { formatNotificationDate } from '@features/notifications/utils/format-notification-date';

interface PriorityNotificationCardProps {
  rankedNotification: RankedPriorityNotification;
  onOpen: (notificationId: string) => void;
}

export const PriorityNotificationCard = memo(
  ({ rankedNotification, onOpen }: PriorityNotificationCardProps) => {
    const { item, score } = rankedNotification;

    return (
      <Card elevation={0} sx={{ border: '1px solid #d7e4f0', borderRadius: 2.5 }}>
        <CardActionArea onClick={() => onOpen(item.notificationId)}>
          <CardContent>
            <Stack spacing={1.5}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" gap={1}>
                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                  <Chip label={item.notificationType} size="small" variant="outlined" />
                  <Chip
                    size="small"
                    label={item.isRead ? 'Viewed' : 'Unread'}
                    color={item.isRead ? 'default' : 'primary'}
                  />
                </Stack>
                <Typography variant="caption" color="text.secondary">
                  {formatNotificationDate(item.deliveryTimestamp)}
                </Typography>
              </Stack>
              <Typography variant="subtitle1" fontWeight={item.isRead ? 600 : 700}>
                {item.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {item.message}
              </Typography>
              <Stack spacing={0.75}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="caption" color="text.secondary">
                    Priority score
                  </Typography>
                  <Typography variant="caption" fontWeight={600}>
                    {score}/100
                  </Typography>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={score}
                  color={score >= 80 ? 'error' : score >= 60 ? 'warning' : 'primary'}
                  sx={{ height: 8, borderRadius: 8 }}
                />
              </Stack>
            </Stack>
          </CardContent>
        </CardActionArea>
      </Card>
    );
  }
);

PriorityNotificationCard.displayName = 'PriorityNotificationCard';

