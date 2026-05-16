import { Box, CssBaseline, Stack, Tab, Tabs, Typography } from '@mui/material';

import { NotificationsDashboardPage } from '@features/notifications/pages/NotificationsDashboardPage';
import { PriorityNotificationsPage } from '@features/priority-feed/pages/PriorityNotificationsPage';
import { runtimeConfig } from '@shared/config/runtime-config';
import { AppErrorBoundary } from '@shared/ui/AppErrorBoundary';
import { PrimaryLayout } from './layout/PrimaryLayout';
import { useAppRoute } from './router/use-app-route';

export const AppShell = () => {
  const { routePath, navigateTo } = useAppRoute();

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
