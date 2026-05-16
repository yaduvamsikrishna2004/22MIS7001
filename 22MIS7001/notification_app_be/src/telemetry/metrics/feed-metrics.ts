import { logBackend } from '../../integrations/logging/backend-log.js';

export class FeedMetrics {
  public async observeFeedLatency(studentId: string, elapsedMs: number): Promise<void> {
    const level = elapsedMs > 800 ? 'warn' : 'debug';
    await logBackend(level, 'service', 'feed latency recorded', {
      studentId,
      elapsedMs
    });
  }
}
