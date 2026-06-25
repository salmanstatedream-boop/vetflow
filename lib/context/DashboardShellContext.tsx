'use client';

import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

type DashboardShellContextValue = {
  notificationCount: number;
  setNotificationCount: (count: number) => void;
};

const DashboardShellContext = createContext<DashboardShellContextValue | null>(null);

export function DashboardShellProvider({ children }: { children: ReactNode }) {
  const [notificationCount, setNotificationCount] = useState(0);
  const value = useMemo(
    () => ({ notificationCount, setNotificationCount }),
    [notificationCount]
  );
  return (
    <DashboardShellContext.Provider value={value}>{children}</DashboardShellContext.Provider>
  );
}

export function useDashboardShell() {
  return useContext(DashboardShellContext);
}
