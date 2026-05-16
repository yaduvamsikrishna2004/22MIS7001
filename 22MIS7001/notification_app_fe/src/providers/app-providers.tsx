import type { PropsWithChildren } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';

import { ApiProvider } from './ApiProvider';

const theme = createTheme({
  palette: {
    primary: {
      main: '#0f4c81'
    },
    secondary: {
      main: '#d17a22'
    },
    background: {
      default: '#f3f7fb'
    }
  },
  shape: {
    borderRadius: 10
  }
});

export const AppProviders = ({ children }: PropsWithChildren) => {
  return (
    <ThemeProvider theme={theme}>
      <ApiProvider>{children}</ApiProvider>
    </ThemeProvider>
  );
};
