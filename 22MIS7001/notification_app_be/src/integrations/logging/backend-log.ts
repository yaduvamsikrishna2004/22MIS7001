import type { LogLevel } from 'logging_middleware';
import { Log } from 'logging_middleware';

type BackendPackage =
  | 'cache'
  | 'controller'
  | 'cron_job'
  | 'db'
  | 'domain'
  | 'handler'
  | 'repository'
  | 'route'
  | 'service';

type SharedPackage = 'middleware' | 'utils' | 'auth' | 'config';

export const logBackend = async (
  level: LogLevel,
  pkg: BackendPackage | SharedPackage,
  message: string,
  context?: Record<string, string | number | boolean | null>
): Promise<void> => {
  await Log('backend', level, pkg, message, context);
};
