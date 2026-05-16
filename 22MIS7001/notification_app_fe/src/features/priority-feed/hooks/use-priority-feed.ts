import { useMemo } from 'react';

import { useNotificationsPage } from '@features/notifications/hooks/use-notifications-page';
import type { NotificationType } from '@shared/contracts/notification-contracts';
import { rankPriorityNotifications } from '../utils/rank-priority-notifications';

interface UsePriorityFeedInput {
  topN: number;
  notificationType?: NotificationType;
}

export const usePriorityFeed = ({ topN, notificationType }: UsePriorityFeedInput) => {
  const query = useNotificationsPage({
    page: 1,
    limit: 60,
    notificationType
  });

  const rankedItems = useMemo(() => rankPriorityNotifications(query.items, topN), [query.items, topN]);

  return {
    ...query,
    rankedItems
  };
};

