import type { PropsWithChildren } from 'react';
import { createContext, useCallback, useContext, useMemo, useState } from 'react';

import { logFrontend } from '@shared/telemetry/frontend-log';

const STORAGE_KEY = 'notification_app_fe:viewed_ids';

interface ViewedNotificationsContextValue {
  viewedIds: ReadonlySet<string>;
  isViewed: (notificationId: string) => boolean;
  markViewed: (notificationId: string) => void;
}

const readInitialSet = (): Set<string> => {
  try {
    const rawValue = window.localStorage.getItem(STORAGE_KEY);
    if (!rawValue) {
      return new Set<string>();
    }

    const parsed = JSON.parse(rawValue);
    if (!Array.isArray(parsed)) {
      return new Set<string>();
    }

    return new Set(parsed.filter((entry) => typeof entry === 'string'));
  } catch {
    void logFrontend('warn', 'state', 'viewed notification state could not be restored');
    return new Set<string>();
  }
};

const persistSet = (value: Set<string>): void => {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(value)));
  } catch {
    void logFrontend('warn', 'state', 'viewed notification state persistence failed');
  }
};

const ViewedNotificationsContext = createContext<ViewedNotificationsContextValue | null>(null);

export const ViewedNotificationsProvider = ({ children }: PropsWithChildren) => {
  const [viewedIds, setViewedIds] = useState<Set<string>>(() => readInitialSet());

  const markViewed = useCallback((notificationId: string) => {
    setViewedIds((currentValue) => {
      if (currentValue.has(notificationId)) {
        return currentValue;
      }

      const nextValue = new Set(currentValue);
      nextValue.add(notificationId);
      persistSet(nextValue);
      return nextValue;
    });
  }, []);

  const isViewed = useCallback((notificationId: string) => viewedIds.has(notificationId), [viewedIds]);

  const contextValue = useMemo<ViewedNotificationsContextValue>(
    () => ({
      viewedIds,
      isViewed,
      markViewed
    }),
    [isViewed, markViewed, viewedIds]
  );

  return (
    <ViewedNotificationsContext.Provider value={contextValue}>
      {children}
    </ViewedNotificationsContext.Provider>
  );
};

export const useViewedNotificationsState = (): ViewedNotificationsContextValue => {
  const contextValue = useContext(ViewedNotificationsContext);
  if (!contextValue) {
    throw new Error('useViewedNotificationsState must be used within ViewedNotificationsProvider');
  }

  return contextValue;
};

