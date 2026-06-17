'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { usePathname } from 'next/navigation';
import TopLoadingBar from '@/components/layout/TopLoadingBar';

interface GlobalLoadingContextValue {
  isLoading: boolean;
  isNavigating: boolean;
  startLoading: () => void;
  stopLoading: () => void;
  startNavigation: () => void;
}

const GlobalLoadingContext = createContext<GlobalLoadingContextValue | null>(null);

export function NavigationLoadingProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [loadingCount, setLoadingCount] = useState(0);
  const prevPath = useRef(pathname);
  const countRef = useRef(0);

  const syncCount = useCallback((next: number) => {
    countRef.current = Math.max(0, next);
    setLoadingCount(countRef.current);
  }, []);

  const startLoading = useCallback(() => {
    syncCount(countRef.current + 1);
  }, [syncCount]);

  const stopLoading = useCallback(() => {
    syncCount(countRef.current - 1);
  }, [syncCount]);

  const startNavigation = useCallback(() => {
    startLoading();
  }, [startLoading]);

  useEffect(() => {
    if (pathname !== prevPath.current) {
      syncCount(0);
      prevPath.current = pathname;
    }
  }, [pathname, syncCount]);

  const isLoading = loadingCount > 0;

  return (
    <GlobalLoadingContext.Provider
      value={{
        isLoading,
        isNavigating: isLoading,
        startLoading,
        stopLoading,
        startNavigation,
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
