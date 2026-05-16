import { Card, CardContent, Chip, Stack, Typography } from '@mui/material';

import { useBackendHealth } from '@shared/hook/use-backend-health';

export const NotificationHome = () => {
  const { health, isLoading } = useBackendHealth();

  return (
    <Card elevation={0} sx={{ border: '1px solid #d9e2ec', borderRadius: 3 }}>
      <CardContent>
        <Stack spacing={1.5}>
          <Typography variant="h6">Notification Feed Bootstrap</Typography>
          <Typography variant="body2" color="text.secondary">
            This shell verifies backend reachability before wiring live notifications.
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
            <Chip
              label={isLoading ? 'Checking service...' : health ? 'Backend reachable' : 'Backend unavailable'}
              color={isLoading ? 'default' : health ? 'success' : 'warning'}
            />
            {health ? <Chip label={`uptime ${health.uptimeSeconds}s`} variant="outlined" /> : null}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};
