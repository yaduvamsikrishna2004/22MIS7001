import { Box, Container } from '@mui/material';
import type { PropsWithChildren } from 'react';

export const PrimaryLayout = ({ children }: PropsWithChildren) => {
  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(180deg, #f3f7fb 0%, #eef3fa 100%)' }}>
      <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 3, md: 4 } }}>
        {children}
      </Container>
    </Box>
  );
};
