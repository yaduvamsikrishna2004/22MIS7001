import type { NotificationType } from '@shared/contracts/notification-contracts';

export const notificationTypeOptions: Array<{ label: string; value: NotificationType }> = [
  { label: 'Event', value: 'Event' },
  { label: 'Result', value: 'Result' },
  { label: 'Placement', value: 'Placement' }
];

