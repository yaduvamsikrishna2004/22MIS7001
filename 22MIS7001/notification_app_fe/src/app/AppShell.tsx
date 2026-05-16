import { Container, CssBaseline, Stack, Typography } from '@mui/material';

import { NotificationHome } from '@features/notifications/notification-home';
import { runtimeConfig } from '@shared/config/runtime-config';

export const AppShell = () => {
  return (
    <>
      <CssBaseline />
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Stack spacing={2.5}>
          <Typography variant="h4" component="h1" fontWeight={600}>
            {runtimeConfig.appName}
          </Typography>
          <NotificationHome />
        </Stack>
      </Container>
    </>
  );
};
