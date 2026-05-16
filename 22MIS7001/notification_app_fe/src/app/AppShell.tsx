import { CssBaseline, Stack, Typography } from '@mui/material';

import { NotificationHome } from '@features/notifications/notification-home';
import { runtimeConfig } from '@shared/config/runtime-config';
import { PrimaryLayout } from './layout/PrimaryLayout';

export const AppShell = () => {
  return (
    <>
      <CssBaseline />
      <PrimaryLayout>
        <Stack spacing={2.5}>
          <Typography variant="h4" component="h1" fontWeight={600}>
            {runtimeConfig.appName}
          </Typography>
          <NotificationHome />
        </Stack>
      </PrimaryLayout>
    </>
  );
};
