import { Pagination, Stack, Typography } from '@mui/material';

interface PaginationControlsProps {
  page: number;
  totalPages?: number;
  hasMore: boolean;
  disabled?: boolean;
  onPageChange: (nextPage: number) => void;
}

export const PaginationControls = ({
  page,
  totalPages,
  hasMore,
  disabled,
  onPageChange
}: PaginationControlsProps) => {
  const computedTotal = totalPages && totalPages > 1 ? totalPages : hasMore ? page + 1 : page;

  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
      <Typography variant="caption" color="text.secondary">
        Page {page}
      </Typography>
      <Pagination
        color="primary"
        size="small"
        page={page}
        count={computedTotal}
        disabled={disabled}
        onChange={(_, nextPage) => onPageChange(nextPage)}
      />
    </Stack>
  );
};

