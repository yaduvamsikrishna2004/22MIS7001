export interface FrontendRuntimeConfig {
  apiBaseUrl: string;
  appName: string;
  requestTimeoutMs: number;
  bearerToken: string;
  defaultStudentId: string;
}

export interface RuntimeConfigurationWarning {
  key: 'missingBearerToken' | 'missingApiBaseUrl' | 'invalidApiBaseUrl';
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

const DEFAULT_API_BASE_URL = 'http://localhost:8080';

const normalizeApiBaseUrl = (
  rawValue: string | undefined
): { apiBaseUrl: string; warning?: RuntimeConfigurationWarning } => {
  const candidate = rawValue?.trim();
  if (!candidate) {
    return {
      apiBaseUrl: DEFAULT_API_BASE_URL,
      warning: {
        key: 'missingApiBaseUrl',
        message: `API base URL not configured. Falling back to ${DEFAULT_API_BASE_URL}.`
      }
    };
  }

  try {
    new URL(candidate);
    return { apiBaseUrl: candidate };
  } catch {
    return {
      apiBaseUrl: DEFAULT_API_BASE_URL,
      warning: {
        key: 'invalidApiBaseUrl',
        message: `API base URL is invalid. Falling back to ${DEFAULT_API_BASE_URL}.`
      }
    };
  }
};

const parsedApiBaseUrl = normalizeApiBaseUrl(
  import.meta.env.VITE_NOTIFICATION_API_URL || import.meta.env.VITE_API_BASE_URL
);

const bearerToken = (import.meta.env.VITE_API_BEARER_TOKEN || '').trim();

export const runtimeConfig: FrontendRuntimeConfig = {
  apiBaseUrl: parsedApiBaseUrl.apiBaseUrl,
  appName: import.meta.env.VITE_APP_NAME || 'Campus Notification Platform',
  requestTimeoutMs: parseTimeout(import.meta.env.VITE_API_TIMEOUT_MS),
  bearerToken,
  defaultStudentId: import.meta.env.VITE_STUDENT_ID || 'student-demo'
};

export const runtimeWarnings: RuntimeConfigurationWarning[] = [
  ...(parsedApiBaseUrl.warning ? [parsedApiBaseUrl.warning] : []),
  ...(bearerToken
    ? []
    : [
        {
          key: 'missingBearerToken' as const,
          message: 'VITE_API_BEARER_TOKEN is missing. API calls will fail until a token is configured.'
        }
      ])
];
