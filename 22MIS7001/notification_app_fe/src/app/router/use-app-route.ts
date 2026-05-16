import { useCallback, useEffect, useState } from 'react';

export type AppRoutePath = '/notifications' | '/priority-feed';

const ROUTE_SET: ReadonlySet<string> = new Set(['/notifications', '/priority-feed']);

const resolveRoutePath = (pathname: string): AppRoutePath => {
  if (ROUTE_SET.has(pathname)) {
    return pathname as AppRoutePath;
  }

  return '/notifications';
};

const readRoute = (): AppRoutePath => resolveRoutePath(window.location.pathname);

export const useAppRoute = () => {
  const [routePath, setRoutePath] = useState<AppRoutePath>(() => readRoute());

  useEffect(() => {
    const normalized = resolveRoutePath(window.location.pathname);
    if (window.location.pathname !== normalized) {
      window.history.replaceState({}, '', `${normalized}${window.location.search}`);
    }
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      setRoutePath(readRoute());
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = useCallback((nextPath: AppRoutePath) => {
    if (window.location.pathname === nextPath) {
      return;
    }

    window.history.pushState({}, '', `${nextPath}${window.location.search}`);
    setRoutePath(nextPath);
  }, []);

  return { routePath, navigateTo };
};

