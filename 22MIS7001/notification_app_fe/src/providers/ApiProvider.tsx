import type { PropsWithChildren } from 'react';
import { createContext, useMemo } from 'react';

import { httpClient } from '@shared/api/http-client';

interface ApiContextValue {
  apiBaseUrl: string;
}

export const ApiContext = createContext<ApiContextValue>({
  apiBaseUrl: ''
});

export const ApiProvider = ({ children }: PropsWithChildren) => {
  const value = useMemo(
    () => ({
      apiBaseUrl: httpClient.defaults.baseURL || ''
    }),
    []
  );

  return <ApiContext.Provider value={value}>{children}</ApiContext.Provider>;
};
