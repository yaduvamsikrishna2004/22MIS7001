export interface FeedCursor {
  deliveredAt: string;
  notificationId: string;
}

export interface CursorParseResult {
  value: FeedCursor | null;
  isValid: boolean;
}
