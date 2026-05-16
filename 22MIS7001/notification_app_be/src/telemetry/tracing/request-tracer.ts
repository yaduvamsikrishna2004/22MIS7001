import { randomUUID } from 'node:crypto';

import { logBackend } from '../../integrations/logging/backend-log.js';

export class RequestTracer {
  public beginSpan(name: string, context: Record<string, string | number | boolean>): {
    traceId: string;
    end: () => Promise<void>;
  } {
    const startedAt = Date.now();
    const traceId = randomUUID();

    const end = async (): Promise<void> => {
      const elapsedMs = Date.now() - startedAt;
      await logBackend('debug', 'utils', 'trace span finished', {
        traceId,
        spanName: name,
        elapsedMs,
        ...context
      });
    };

    return {
      traceId,
      end
    };
  }
}
