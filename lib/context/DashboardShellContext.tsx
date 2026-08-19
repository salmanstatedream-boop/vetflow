'use client';

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import {
  filterDismissedNotifications,
  notificationBadgeCount,
  type DashboardNotification,
} from '@/lib/dashboard/notifications';

export type NavIndicators = {
  '/dashboard/chat'?: boolean;
  '/dashboard/tasks'?: boolean;
  '/dashboard/owner-messages'?: boolean;
};

type DashboardShellContextValue = {
  notifications: DashboardNotification[];
  setNotifications: (items: DashboardNotification[]) => void;
  notificationCount: number;
  clearNotifications: () => void;
  navIndicators: NavIndicators;
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

  const navIndicators = useMemo<NavIndicators>(() => {
    let chat = false;
    let tasks = false;
    let ownerChat = false;
    for (const n of notifications) {
      if (n.kind === 'staff_chat_message') chat = true;
      if (n.kind === 'staff_task_update') tasks = true;
      if (n.kind === 'owner_chat_message') ownerChat = true;
      if (chat && tasks && ownerChat) break;
    }
    return {
      '/dashboard/chat': chat,
      '/dashboard/tasks': tasks,
      '/dashboard/owner-messages': ownerChat,
    };
  }, [notifications]);

  const value = useMemo(
    () => ({
      notifications,
      setNotifications,
      notificationCount,
      clearNotifications,
      navIndicators,
    }),
    [notifications, setNotifications, notificationCount, clearNotifications, navIndicators]
  );

  return (
    <DashboardShellContext.Provider value={value}>{children}</DashboardShellContext.Provider>
  );
}

export function useDashboardShell() {
  return useContext(DashboardShellContext);
}
