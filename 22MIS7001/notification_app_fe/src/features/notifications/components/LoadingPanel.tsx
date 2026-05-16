import { Card, CardContent, Skeleton, Stack } from '@mui/material';

interface LoadingPanelProps {
  rows?: number;
}

export const LoadingPanel = ({ rows = 3 }: LoadingPanelProps) => {
  return (
    <Stack spacing={1.5}>
      {Array.from({ length: rows }).map((_, index) => (
        <Card key={index} elevation={0} sx={{ border: '1px solid #dfe7ef', borderRadius: 2.5 }}>
          <CardContent>
            <Stack spacing={1}>
              <Skeleton variant="text" width="45%" />
              <Skeleton variant="text" width="85%" />
              <Skeleton variant="text" width="72%" />
            </Stack>
          </CardContent>
        </Card>
      ))}
    </Stack>
  );
};

