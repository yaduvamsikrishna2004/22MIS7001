import { Box, CssBaseline, Stack, Tab, Tabs, Typography } from '@mui/material';
import { useEffect } from 'react';

import { NotificationsDashboardPage } from '@features/notifications/pages/NotificationsDashboardPage';
import { PriorityNotificationsPage } from '@features/priority-feed/pages/PriorityNotificationsPage';
import { runtimeConfig, runtimeWarnings } from '@shared/config/runtime-config';
import { logFrontend } from '@shared/telemetry/frontend-log';
import { AppErrorBoundary } from '@shared/ui/AppErrorBoundary';
import { RuntimeConfigWarningPanel } from '@shared/ui/RuntimeConfigWarningPanel';
import { PrimaryLayout } from './layout/PrimaryLayout';
import { useAppRoute } from './router/use-app-route';

export const AppShell = () => {
  const { routePath, navigateTo } = useAppRoute();

  useEffect(() => {
    void logFrontend('info', 'page', 'app shell initialized', {
      routePath,
      hasBearerToken: Boolean(runtimeConfig.bearerToken),
      apiBaseUrl: runtimeConfig.apiBaseUrl
    });
  }, [routePath]);

  useEffect(() => {
    if (runtimeWarnings.length === 0) {
      return;
    }

    runtimeWarnings.forEach((warning) => {
      void logFrontend('warn', 'config', 'runtime configuration warning detected', {
        key: warning.key,
        message: warning.message
      });
    });
  }, []);

  return (
    <AppErrorBoundary>
      <CssBaseline />
      <PrimaryLayout>
        <Stack spacing={2}>
          <Box>
            <Typography variant="h4" component="h1" fontWeight={650}>
              {runtimeConfig.appName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Realtime-aware campus updates optimized for clarity across devices.
            </Typography>
          </Box>
          <RuntimeConfigWarningPanel warnings={runtimeWarnings} />
          <Tabs
            value={routePath}
            onChange={(_, value) => navigateTo(value)}
            variant="fullWidth"
            aria-label="notification pages"
          >
            <Tab
              value="/notifications"
              label="Dashboard"
            />
            <Tab
              value="/priority-feed"
              label="Priority"
            />
          </Tabs>
          {routePath === '/notifications' ? <NotificationsDashboardPage /> : <PriorityNotificationsPage />}
        </Stack>
      </PrimaryLayout>
    </AppErrorBoundary>
  );
};
