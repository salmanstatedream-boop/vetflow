'use client';

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import TopLoadingBar from '@/components/layout/TopLoadingBar';

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

export function NavigationLoadingProvider({ children }: { children: ReactNode }) {
  const [isNavigating, setIsNavigating] = useState(false);
  const [navigationTarget, setNavigationTarget] = useState<string | null>(null);
  const [actionCount, setActionCount] = useState(0);
  const actionCountRef = useRef(0);

  const syncActionCount = useCallback((next: number) => {
    actionCountRef.current = Math.max(0, next);
    setActionCount(actionCountRef.current);
  }, []);

  const startNavigation = useCallback((target?: string) => {
    setIsNavigating(true);
    if (target) setNavigationTarget(target);
  }, []);

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

  const isActionLoading = actionCount > 0;

  return (
    <GlobalLoadingContext.Provider
      value={{
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
      }}
    >
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
