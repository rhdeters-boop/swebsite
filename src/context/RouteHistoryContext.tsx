import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useLocation, useInRouterContext } from 'react-router-dom';

type RouteHistoryCtx = {
  stack: string[];
  previous: string | undefined;
  replaceTop: (path: string) => void;
  pop: () => void;
};

const RouteHistoryContext = createContext<RouteHistoryCtx | null>(null);
const STORAGE_KEY = 'route-history';
const MAX = 50;

function dedupeTogglePush(stack: string[], next: string): string[] {
  if (stack.length === 0) return [next];
  const last = stack[stack.length - 1];
  if (last === next) return stack; // ignore same
  const prev = stack[stack.length - 2];
  if (prev === next) {
    // collapse A,B,A -> [A]
    const s = stack.slice(0, -1);
    return s;
  }
  const s = [...stack, next];
  if (s.length > MAX) s.shift();
  return s;
}

export const RouteHistoryProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const inRouter = useInRouterContext();
  if (!inRouter) return <>{children}</>; // no-op outside Router

  const location = useLocation();
  const [stack, setStack] = useState<string[]>(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) as string[] : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    const path = location.pathname + location.search + location.hash;
    setStack((curr) => {
      const next = dedupeTogglePush(curr, path);
      try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  }, [location.pathname, location.search, location.hash]);

  const value = useMemo<RouteHistoryCtx>(() => ({
    stack,
    previous: stack.length > 1 ? stack[stack.length - 2] : undefined,
    replaceTop: (path: string) => {
      setStack((curr) => {
        const next = curr.length ? [...curr.slice(0, -1), path] : [path];
        try {
          sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        } catch {}
        return next;
      });
    },
    pop: () => {
      setStack((curr) => {
        const next = curr.slice(0, -1);
        try {
          sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        } catch {}
        return next;
      });
    },
  }), [stack]);

  return (
    <RouteHistoryContext.Provider value={value}>{children}</RouteHistoryContext.Provider>
  );
};

export function useRouteHistory() {
  const ctx = useContext(RouteHistoryContext);
  if (!ctx) throw new Error('useRouteHistory must be used within RouteHistoryProvider');
  return ctx;
}