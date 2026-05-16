import { Card, CardContent, Stack, Typography } from '@mui/material';

interface EmptyStatePanelProps {
  title: string;
  subtitle: string;
}

export const EmptyStatePanel = ({ title, subtitle }: EmptyStatePanelProps) => {
  return (
    <Card elevation={0} sx={{ border: '1px dashed #bfd2e3', borderRadius: 2.5, bgcolor: '#f8fbfe' }}>
      <CardContent>
        <Stack spacing={0.75}>
          <Typography variant="subtitle1" fontWeight={600}>
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
};

