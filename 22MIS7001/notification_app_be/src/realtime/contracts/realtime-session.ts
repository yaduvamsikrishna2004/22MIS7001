export interface RealtimeSession {
  sessionId: string;
  studentId: string;
  connectedAt: string;
  lastSeenCursor?: string;
  reconnectCount: number;
}

export interface ReconnectDecision {
  allowed: boolean;
  retryAfterSeconds?: number;
}
