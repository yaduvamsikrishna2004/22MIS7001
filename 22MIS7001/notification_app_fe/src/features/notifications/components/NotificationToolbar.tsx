import { Box, Chip, MenuItem, Stack, TextField, Typography } from '@mui/material';

import type { NotificationType } from '@shared/contracts/notification-contracts';
import { FilterSelector } from './FilterSelector';

interface NotificationToolbarProps {
  selectedType?: NotificationType;
  limit: number;
  onTypeChange: (nextType?: NotificationType) => void;
  onLimitChange: (nextLimit: number) => void;
  totalCount?: number;
  disabled?: boolean;
}

export const NotificationToolbar = ({
  selectedType,
  limit,
  onTypeChange,
  onLimitChange,
  totalCount,
  disabled
}: NotificationToolbarProps) => {
  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={1.5}
      alignItems={{ xs: 'stretch', sm: 'center' }}
      justifyContent="space-between"
    >
      <Box sx={{ width: { xs: '100%', sm: 260 } }}>
        <FilterSelector selectedType={selectedType} onTypeChange={onTypeChange} disabled={disabled} />
      </Box>
      <Stack direction="row" spacing={1} alignItems="center" justifyContent="flex-end">
        <TextField
          select
          size="small"
          label="Rows"
          value={String(limit)}
          disabled={disabled}
          onChange={(event) => onLimitChange(Number(event.target.value))}
          sx={{ minWidth: 90 }}
        >
          {[6, 12, 24].map((candidate) => (
            <MenuItem key={candidate} value={candidate}>
              {candidate}
            </MenuItem>
          ))}
        </TextField>
        {typeof totalCount === 'number' ? (
          <Chip color="primary" variant="outlined" label={`${totalCount} total`} />
        ) : (
          <Typography variant="caption" color="text.secondary">
            Feed scope updates in realtime
          </Typography>
        )}
      </Stack>
    </Stack>
  );
};

