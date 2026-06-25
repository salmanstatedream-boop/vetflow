'use client';

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import {
  filterDismissedNotifications,
  notificationBadgeCount,
  type DashboardNotification,
} from '@/lib/dashboard/notifications';

type DashboardShellContextValue = {
  notifications: DashboardNotification[];
  setNotifications: (items: DashboardNotification[]) => void;
  notificationCount: number;
  clearNotifications: () => void;
};

const DashboardShellContext = createContext<DashboardShellContextValue | null>(null);

export function DashboardShellProvider({ children }: { children: ReactNode }) {
  const [allNotifications, setAllNotifications] = useState<DashboardNotification[]>([]);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(() => new Set());

  const setNotifications = useCallback((items: DashboardNotification[]) => {
    setAllNotifications(items);
  }, []);

  const clearNotifications = useCallback(() => {
    setDismissedIds((prev) => {
      const next = new Set(prev);
      for (const item of allNotifications) {
        next.add(item.id);
      }
      return next;
    });
  }, [allNotifications]);

  const notifications = useMemo(
    () => filterDismissedNotifications(allNotifications, dismissedIds),
    [allNotifications, dismissedIds]
  );

  const notificationCount = useMemo(
    () => notificationBadgeCount(notifications),
    [notifications]
  );

  const value = useMemo(
    () => ({
      notifications,
      setNotifications,
      notificationCount,
      clearNotifications,
    }),
    [notifications, setNotifications, notificationCount, clearNotifications]
  );

  return (
    <DashboardShellContext.Provider value={value}>{children}</DashboardShellContext.Provider>
  );
}

export function useDashboardShell() {
  return useContext(DashboardShellContext);
}
