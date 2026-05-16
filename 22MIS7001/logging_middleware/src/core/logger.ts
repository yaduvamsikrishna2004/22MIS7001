import { dispatchLog } from './log-dispatcher.js';
import type {
  LogContext,
  LogLevel,
  LogPackage,
  LogStack,
  LogPayload
} from '../types/log-contract.js';

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
    timestamp: new Date().toISOString(),
    context
  };

  await dispatchLog(payload);
};
