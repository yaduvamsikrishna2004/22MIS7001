export type LogStack = 'backend' | 'frontend';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export type BackendPackage =
  | 'cache'
  | 'controller'
  | 'cron_job'
  | 'db'
  | 'domain'
  | 'handler'
  | 'repository'
  | 'route'
  | 'service';

export type FrontendPackage =
  | 'api'
  | 'component'
  | 'hook'
  | 'page'
  | 'state'
  | 'style';

export type SharedPackage = 'middleware' | 'utils' | 'auth' | 'config';

export type LogPackage = BackendPackage | FrontendPackage | SharedPackage;

export type LogContext = Record<string, string | number | boolean | null>;

export interface LogPayload {
  stack: LogStack;
  level: LogLevel;
  package: LogPackage;
  message: string;
  timestamp: string;
  context?: LogContext;
}

export interface LoggingRuntimeConfig {
  baseUrl: string;
  timeoutMs: number;
  maxRetries: number;
  retryDelayMs: number;
  authEndpoint?: string;
  clientId?: string;
  clientSecret?: string;
}
