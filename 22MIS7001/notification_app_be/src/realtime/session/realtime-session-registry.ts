import type { RealtimeSession } from '../contracts/realtime-session.js';

export class RealtimeSessionRegistry {
  private readonly sessionsByStudent = new Map<string, Map<string, RealtimeSession>>();

  public upsert(session: RealtimeSession): void {
    const existing = this.sessionsByStudent.get(session.studentId) ?? new Map<string, RealtimeSession>();
    existing.set(session.sessionId, session);
    this.sessionsByStudent.set(session.studentId, existing);
  }

  public remove(studentId: string, sessionId: string): void {
    const existing = this.sessionsByStudent.get(studentId);
    if (!existing) {
      return;
    }

    existing.delete(sessionId);
    if (existing.size === 0) {
      this.sessionsByStudent.delete(studentId);
    }
  }

  public getStudentSessions(studentId: string): RealtimeSession[] {
    return [...(this.sessionsByStudent.get(studentId)?.values() ?? [])];
  }

  public activeSessionCount(studentId: string): number {
    return this.sessionsByStudent.get(studentId)?.size ?? 0;
  }
}
