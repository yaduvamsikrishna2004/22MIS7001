export const formatNotificationDate = (timestampIso: string): string => {
  const parsed = Date.parse(timestampIso);
  if (Number.isNaN(parsed)) {
    return 'Unknown time';
  }

  const formatter = new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });

  return formatter.format(new Date(parsed));
};

