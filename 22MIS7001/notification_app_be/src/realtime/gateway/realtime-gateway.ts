import { randomUUID } from 'node:crypto';

import { logBackend } from '../../integrations/logging/backend-log.js';
import { ReconnectCoordinator } from '../reconnect/reconnect-coordinator.js';
import type { RealtimeSession } from '../contracts/realtime-session.js';
import { RealtimeSessionRegistry } from '../session/realtime-session-registry.js';

export class RealtimeGateway {
  public constructor(
    private readonly sessionRegistry: RealtimeSessionRegistry,
    private readonly reconnectCoordinator: ReconnectCoordinator
  ) {}

  public async connect(studentId: string, lastSeenCursor?: string): Promise<RealtimeSession | null> {
    const decision = await this.reconnectCoordinator.registerReconnect(studentId);
    if (!decision.allowed) {
      return null;
    }

    const session: RealtimeSession = {
      sessionId: randomUUID(),
      studentId,
      connectedAt: new Date().toISOString(),
      lastSeenCursor,
      reconnectCount: 0
    };

    this.sessionRegistry.upsert(session);

    await logBackend('info', 'service', 'realtime session connected', {
      studentId,
      sessionId: session.sessionId
    });

    return session;
  }

  public async disconnect(studentId: string, sessionId: string): Promise<void> {
    this.sessionRegistry.remove(studentId, sessionId);
    await logBackend('debug', 'service', 'realtime session disconnected', {
      studentId,
      sessionId
    });
  }
}
