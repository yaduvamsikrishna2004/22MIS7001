export interface FrontendRuntimeConfig {
  apiBaseUrl: string;
  appName: string;
  requestTimeoutMs: number;
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
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
  appName: import.meta.env.VITE_APP_NAME || 'Campus Notification Platform',
  requestTimeoutMs: parseTimeout(import.meta.env.VITE_API_TIMEOUT_MS)
};
