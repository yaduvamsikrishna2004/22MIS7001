export interface FrontendRuntimeConfig {
  apiBaseUrl: string;
  appName: string;
  requestTimeoutMs: number;
  bearerToken: string;
  defaultStudentId: string;
}

export interface RuntimeConfigurationWarning {
  key: 'missingBearerToken' | 'missingApiBaseUrl';
  message: string;
}

const parseTimeout = (value: string | undefined): number => {
  if (!value) {
    return 5000;
  }

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return 5000;
  }

  return parsed;
};

export const runtimeConfig: FrontendRuntimeConfig = {
  apiBaseUrl:
    import.meta.env.VITE_NOTIFICATION_API_URL ||
    import.meta.env.VITE_API_BASE_URL ||
    'http://localhost:8080',
  appName: import.meta.env.VITE_APP_NAME || 'Campus Notification Platform',
  requestTimeoutMs: parseTimeout(import.meta.env.VITE_API_TIMEOUT_MS),
  bearerToken: import.meta.env.VITE_API_BEARER_TOKEN || '',
  defaultStudentId: import.meta.env.VITE_STUDENT_ID || 'student-demo'
};

export const runtimeWarnings: RuntimeConfigurationWarning[] = [
  ...(runtimeConfig.apiBaseUrl ? [] : [{ key: 'missingApiBaseUrl' as const, message: 'API base URL is not configured.' }]),
  ...(runtimeConfig.bearerToken
    ? []
    : [
        {
          key: 'missingBearerToken' as const,
          message: 'VITE_API_BEARER_TOKEN is missing. API calls will fail until a token is configured.'
        }
      ])
];
