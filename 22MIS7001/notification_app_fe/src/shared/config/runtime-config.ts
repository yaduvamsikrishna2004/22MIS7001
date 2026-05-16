export interface FrontendRuntimeConfig {
  apiBaseUrl: string;
  appName: string;
}

export const runtimeConfig: FrontendRuntimeConfig = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
  appName: import.meta.env.VITE_APP_NAME || 'Campus Notification Platform'
};
