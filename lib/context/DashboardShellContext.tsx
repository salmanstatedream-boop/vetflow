'use client';

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import type { DashboardNotification } from '@/lib/dashboard/notifications';

type DashboardShellContextValue = {
  notifications: DashboardNotification[];
  setNotifications: (items: DashboardNotification[]) => void;
  notificationCount: number;
  setNotificationCount: (count: number) => void;
};

const DashboardShellContext = createContext<DashboardShellContextValue | null>(null);

export function DashboardShellProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotificationsState] = useState<DashboardNotification[]>([]);
  const [notificationCount, setNotificationCount] = useState(0);

  const setNotifications = useCallback((items: DashboardNotification[]) => {
    setNotificationsState(items);
  }, []);

  const value = useMemo(
    () => ({
      notifications,
      setNotifications,
      notificationCount,
      setNotificationCount,
    }),
    [notifications, setNotifications, notificationCount]
  );

  return (
    <DashboardShellContext.Provider value={value}>{children}</DashboardShellContext.Provider>
  );
}

export function useDashboardShell() {
  return useContext(DashboardShellContext);
}
