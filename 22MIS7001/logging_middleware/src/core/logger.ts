import { dispatchLog } from './log-dispatcher.js';
import type { LogContext, LogLevel, LogPackage, LogPayload, LogStack } from '../types/log-contract.js';
import { normalizeIsoTimestamp } from '../utils/timestamp.js';

export const Log = async (
  stack: LogStack,
  level: LogLevel,
  pkg: LogPackage,
  message: string,
  context?: LogContext
): Promise<void> => {
  const payload: LogPayload = {
    stack,
    level,
    package: pkg,
    message,
    timestamp: normalizeIsoTimestamp(),
    context
  };

  try {
    await dispatchLog(payload);
  } catch {
    // logging path must never break application path
  }
};
