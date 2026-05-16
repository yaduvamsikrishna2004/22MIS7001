export const buildFeedCacheKey = (
  studentId: string,
  category: string | undefined,
  encodedCursor: string | undefined,
  limit: number
): string => {
  return [
    'feed',
    `student:${studentId}`,
    `category:${category ?? 'all'}`,
    `cursor:${encodedCursor ?? 'none'}`,
    `limit:${limit}`
  ].join('|');
};

export const buildUnreadCountCacheKey = (studentId: string): string => {
  return `unread|student:${studentId}`;
};
