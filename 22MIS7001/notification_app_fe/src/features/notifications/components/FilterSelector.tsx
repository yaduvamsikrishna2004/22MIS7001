import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';

import type { NotificationType } from '@shared/contracts/notification-contracts';
import { notificationTypeOptions } from '../utils/notification-type-options';

interface FilterSelectorProps {
  selectedType?: NotificationType;
  onTypeChange: (nextType?: NotificationType) => void;
  disabled?: boolean;
}

export const FilterSelector = ({ selectedType, onTypeChange, disabled }: FilterSelectorProps) => {
  return (
    <FormControl fullWidth size="small" disabled={disabled}>
      <InputLabel id="notification-type-filter-label">Notification Type</InputLabel>
      <Select
        labelId="notification-type-filter-label"
        value={selectedType || ''}
        label="Notification Type"
        onChange={(event) => {
          const nextValue = event.target.value;
          onTypeChange(nextValue ? (nextValue as NotificationType) : undefined);
        }}
      >
        <MenuItem value="">All Types</MenuItem>
        {notificationTypeOptions.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

