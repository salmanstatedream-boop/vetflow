'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { usePathname } from 'next/navigation';
import TopLoadingBar from '@/components/layout/TopLoadingBar';
import { routePathsMatch } from '@/lib/utils/route-path';

interface GlobalLoadingContextValue {
  isNavigating: boolean;
  isActionLoading: boolean;
  /** @deprecated Use isActionLoading */
  isLoading: boolean;
  navigationTarget: string | null;
  startNavigation: (target?: string) => void;
  completeNavigation: () => void;
  startAction: () => void;
  stopAction: () => void;
  /** @deprecated Use startAction */
  startLoading: () => void;
  /** @deprecated Use stopAction */
  stopLoading: () => void;
}

const GlobalLoadingContext = createContext<GlobalLoadingContextValue | null>(null);

const NAVIGATION_SAFETY_MS = 8000;

export function NavigationLoadingProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [isNavigating, setIsNavigating] = useState(false);
  const [navigationTarget, setNavigationTarget] = useState<string | null>(null);
  const [actionCount, setActionCount] = useState(0);
  const actionCountRef = useRef(0);

  const syncActionCount = useCallback((next: number) => {
    actionCountRef.current = Math.max(0, next);
    setActionCount(actionCountRef.current);
  }, []);

  const startNavigation = useCallback((target?: string) => {
    if (target && routePathsMatch(target, pathname)) return;
    setIsNavigating(true);
    if (target) setNavigationTarget(target);
  }, [pathname]);

  const completeNavigation = useCallback(() => {
    setIsNavigating(false);
    setNavigationTarget(null);
  }, []);

  const startAction = useCallback(() => {
    syncActionCount(actionCountRef.current + 1);
  }, [syncActionCount]);

  const stopAction = useCallback(() => {
    syncActionCount(actionCountRef.current - 1);
  }, [syncActionCount]);

  useEffect(() => {
    if (!isNavigating) return;

    const safety = setTimeout(() => {
      completeNavigation();
    }, NAVIGATION_SAFETY_MS);

    return () => {
      clearTimeout(safety);
    };
  }, [isNavigating, completeNavigation]);

  const isActionLoading = actionCount > 0;

  const value = useMemo<GlobalLoadingContextValue>(
    () => ({
      isNavigating,
      isActionLoading,
      isLoading: isActionLoading,
      navigationTarget,
      startNavigation,
      completeNavigation,
      startAction,
      stopAction,
      startLoading: startAction,
      stopLoading: stopAction,
    }),
    [
      isNavigating,
      isActionLoading,
      navigationTarget,
      startNavigation,
      completeNavigation,
      startAction,
      stopAction,
    ]
  );

  return (
    <GlobalLoadingContext.Provider value={value}>
      <TopLoadingBar />
      {children}
    </GlobalLoadingContext.Provider>
  );
}

export function useGlobalLoading() {
  const ctx = useContext(GlobalLoadingContext);
  if (!ctx) {
    throw new Error('useGlobalLoading must be used within NavigationLoadingProvider');
  }
  return ctx;
}

export function useGlobalLoadingOptional() {
  return useContext(GlobalLoadingContext);
}

/** @deprecated Use useGlobalLoading */
export function useNavigationLoading() {
  return useGlobalLoading();
}

/** @deprecated Use useGlobalLoadingOptional */
export function useNavigationLoadingOptional() {
  return useGlobalLoadingOptional();
}
