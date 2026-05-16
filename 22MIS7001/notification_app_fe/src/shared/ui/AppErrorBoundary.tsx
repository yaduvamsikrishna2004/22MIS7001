import { Alert, Box, Button, Stack, Typography } from '@mui/material';
import type { ErrorInfo, PropsWithChildren } from 'react';
import { Component } from 'react';

import { logFrontend } from '@shared/telemetry/frontend-log';

interface AppErrorBoundaryState {
  hasError: boolean;
}

export class AppErrorBoundary extends Component<PropsWithChildren, AppErrorBoundaryState> {
  public constructor(props: PropsWithChildren) {
    super(props);
    this.state = { hasError: false };
  }

  public static getDerivedStateFromError(): AppErrorBoundaryState {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    const componentStack = (errorInfo.componentStack || '').slice(0, 400);

    void logFrontend('fatal', 'component', 'render failure intercepted', {
      message: error.message,
      componentStack
    });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', px: 2 }}>
          <Stack spacing={2} sx={{ width: 'min(560px, 100%)' }}>
            <Typography variant="h5" fontWeight={600}>
              Notification experience paused
            </Typography>
            <Alert severity="error">
              Something broke while rendering this page. Refresh to retry the experience.
            </Alert>
            <Button variant="contained" onClick={() => window.location.reload()}>
              Reload
            </Button>
          </Stack>
        </Box>
      );
    }

    return this.props.children;
  }
}
