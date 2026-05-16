import type { LogLevel } from 'logging_middleware';
import { Log } from 'logging_middleware';

type FrontendPackage = 'api' | 'component' | 'hook' | 'page' | 'state' | 'style';
type SharedPackage = 'middleware' | 'utils' | 'auth' | 'config';

export const logFrontend = async (
  level: LogLevel,
  pkg: FrontendPackage | SharedPackage,
  message: string,
  context?: Record<string, string | number | boolean | null>
): Promise<void> => {
  await Log('frontend', level, pkg, message, context);
};
