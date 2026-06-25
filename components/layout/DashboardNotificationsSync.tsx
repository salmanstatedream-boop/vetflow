'use client';

import { useCallback, useEffect, useRef } from 'react';
import { getDashboardNotificationsAction } from '@/lib/services/dashboard-notifications-actions';
import { useDashboardShell } from '@/lib/context/DashboardShellContext';

const POLL_MS = 15_000;

export default function DashboardNotificationsSync() {
  const shell = useDashboardShell();
  const setNotificationsRef = useRef(shell?.setNotifications);
  const setNotificationCountRef = useRef(shell?.setNotificationCount);

  useEffect(() => {
    setNotificationsRef.current = shell?.setNotifications;
    setNotificationCountRef.current = shell?.setNotificationCount;
  }, [shell?.setNotifications, shell?.setNotificationCount]);

  const sync = useCallback(async () => {
    const result = await getDashboardNotificationsAction();
    if (result.success) {
      setNotificationsRef.current?.(result.notifications);
      setNotificationCountRef.current?.(result.count);
    }
  }, []);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null;

    const start = () => {
      if (timer) return;
      timer = setInterval(() => {
        if (document.visibilityState === 'visible') {
          void sync();
        }
      }, POLL_MS);
    };

    const stop = () => {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    };

    void sync();

    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        void sync();
        start();
      } else {
        stop();
      }
    };

    if (document.visibilityState === 'visible') {
      start();
    }

    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      stop();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [sync]);

  return null;
}
