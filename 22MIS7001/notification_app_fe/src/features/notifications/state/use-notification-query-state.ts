import { useCallback, useEffect, useMemo, useState } from 'react';

import type { NotificationType } from '@shared/contracts/notification-contracts';

interface NotificationQueryState {
  page: number;
  limit: number;
  notificationType?: NotificationType;
}

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 12;
const LIMIT_CHOICES = new Set([6, 12, 24]);

const parseNotificationType = (value: string | null): NotificationType | undefined => {
  if (value === 'Event' || value === 'Result' || value === 'Placement') {
    return value;
  }
  return undefined;
};

const parsePositiveInt = (value: string | null, fallback: number): number => {
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return fallback;
  }

  return parsed;
};

const readStateFromSearch = (): NotificationQueryState => {
  const searchParams = new URLSearchParams(window.location.search);
  const page = parsePositiveInt(searchParams.get('page'), DEFAULT_PAGE);
  const limitCandidate = parsePositiveInt(searchParams.get('limit'), DEFAULT_LIMIT);

  return {
    page,
    limit: LIMIT_CHOICES.has(limitCandidate) ? limitCandidate : DEFAULT_LIMIT,
    notificationType: parseNotificationType(searchParams.get('notificationType'))
  };
};

const writeStateToSearch = (state: NotificationQueryState): void => {
  const searchParams = new URLSearchParams(window.location.search);
  searchParams.set('page', String(state.page));
  searchParams.set('limit', String(state.limit));

  if (state.notificationType) {
    searchParams.set('notificationType', state.notificationType);
  } else {
    searchParams.delete('notificationType');
  }

  const queryText = searchParams.toString();
  window.history.replaceState({}, '', `${window.location.pathname}${queryText ? `?${queryText}` : ''}`);
};

export const useNotificationQueryState = () => {
  const [state, setState] = useState<NotificationQueryState>(() => readStateFromSearch());

  useEffect(() => {
    const handlePopState = () => setState(readStateFromSearch());
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    writeStateToSearch(state);
  }, [state]);

  const setPage = useCallback((nextPage: number) => {
    setState((currentValue) => ({
      ...currentValue,
      page: nextPage <= 0 ? DEFAULT_PAGE : nextPage
    }));
  }, []);

  const setLimit = useCallback((nextLimit: number) => {
    const safeLimit = LIMIT_CHOICES.has(nextLimit) ? nextLimit : DEFAULT_LIMIT;
    setState((currentValue) => ({
      ...currentValue,
      limit: safeLimit,
      page: DEFAULT_PAGE
    }));
  }, []);

  const setNotificationType = useCallback((nextType?: NotificationType) => {
    setState((currentValue) => ({
      ...currentValue,
      notificationType: nextType,
      page: DEFAULT_PAGE
    }));
  }, []);

  return useMemo(
    () => ({
      ...state,
      setPage,
      setLimit,
      setNotificationType
    }),
    [setLimit, setNotificationType, setPage, state]
  );
};

