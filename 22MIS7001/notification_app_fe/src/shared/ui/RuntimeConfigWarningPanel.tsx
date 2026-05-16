import { Alert, Stack } from '@mui/material';

import type { RuntimeConfigurationWarning } from '@shared/config/runtime-config';

interface RuntimeConfigWarningPanelProps {
  warnings: RuntimeConfigurationWarning[];
}

export const RuntimeConfigWarningPanel = ({ warnings }: RuntimeConfigWarningPanelProps) => {
  if (warnings.length === 0) {
    return null;
  }

  return (
    <Stack spacing={1}>
      {warnings.map((warning) => (
        <Alert key={warning.key} severity="warning">
          {warning.message}
        </Alert>
      ))}
    </Stack>
  );
};

