import type { PropsWithChildren } from 'react';
import { createContext, useEffect, useMemo } from 'react';

import { runtimeConfig } from '@shared/config/runtime-config';
import { logFrontend } from '@shared/telemetry/frontend-log';

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

  useEffect(() => {
    void logFrontend('debug', 'state', 'api provider initialized', {
      apiBaseUrl: value.apiBaseUrl
    });
  }, [value.apiBaseUrl]);

  return <ApiContext.Provider value={value}>{children}</ApiContext.Provider>;
};
