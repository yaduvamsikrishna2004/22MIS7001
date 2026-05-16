import { runtimeConfig } from '../../shared/config/runtime-config.js';
import { logBackend } from '../../integrations/logging/backend-log.js';
import type { ReconnectDecision } from '../contracts/realtime-session.js';
import { RealtimeSessionRegistry } from '../session/realtime-session-registry.js';

interface ReconnectWindow {
  windowStartEpochMs: number;
  attempts: number;
}

export class ReconnectCoordinator {
  private readonly reconnectWindows = new Map<string, ReconnectWindow>();

  public constructor(private readonly sessionRegistry: RealtimeSessionRegistry) {}

  public async registerReconnect(studentId: string): Promise<ReconnectDecision> {
    const now = Date.now();
    const windowDurationMs = runtimeConfig.reconnectWindowSeconds * 1000;

    const current = this.reconnectWindows.get(studentId);
    if (!current || now - current.windowStartEpochMs > windowDurationMs) {
      this.reconnectWindows.set(studentId, {
        windowStartEpochMs: now,
        attempts: 1
      });

      return { allowed: true };
    }

    current.attempts += 1;
    if (current.attempts > runtimeConfig.maxReconnectAttemptsPerWindow) {
      const retryAfterSeconds = Math.ceil(
        (windowDurationMs - (now - current.windowStartEpochMs)) / 1000
      );

      await logBackend('warn', 'service', 'websocket reconnect storm mitigated', {
        studentId,
        activeSessions: this.sessionRegistry.activeSessionCount(studentId),
        attempts: current.attempts,
        retryAfterSeconds
      });

      return {
        allowed: false,
        retryAfterSeconds
      };
    }

    await logBackend('info', 'service', 'websocket reconnect accepted', {
      studentId,
      attempts: current.attempts,
      activeSessions: this.sessionRegistry.activeSessionCount(studentId)
    });

    return { allowed: true };
  }
}
