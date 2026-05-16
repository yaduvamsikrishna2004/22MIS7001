import type { PropsWithChildren } from 'react';
import { createContext, useMemo } from 'react';

import { runtimeConfig } from '@shared/config/runtime-config';

interface ApiContextValue {
  apiBaseUrl: string;
}

export const ApiContext = createContext<ApiContextValue>({
  apiBaseUrl: ''
});

export const ApiProvider = ({ children }: PropsWithChildren) => {
  const value = useMemo(
    () => ({
      apiBaseUrl: runtimeConfig.apiBaseUrl
    }),
    []
  );

  return <ApiContext.Provider value={value}>{children}</ApiContext.Provider>;
};
