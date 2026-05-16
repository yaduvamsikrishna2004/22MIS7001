import { Alert, Button, Card, CardContent, Stack, Typography } from '@mui/material';

interface ErrorStatePanelProps {
  message: string;
  onRetry: () => void;
}

export const ErrorStatePanel = ({ message, onRetry }: ErrorStatePanelProps) => {
  return (
    <Card elevation={0} sx={{ border: '1px solid #f0c7c2', borderRadius: 2.5 }}>
      <CardContent>
        <Stack spacing={1.5}>
          <Typography variant="subtitle1" fontWeight={600}>
            We could not load notifications
          </Typography>
          <Alert severity="warning">{message || 'Please retry in a few seconds.'}</Alert>
          <Stack direction="row" justifyContent="flex-start">
            <Button variant="contained" onClick={onRetry}>
              Retry
            </Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};

