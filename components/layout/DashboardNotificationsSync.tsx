'use client';

import { useCallback, useEffect, useRef } from 'react';
import { getDashboardNotificationsAction } from '@/lib/services/dashboard-notifications-actions';
import { useDashboardShell } from '@/lib/context/DashboardShellContext';
import {
  playNotificationBell,
  unlockNotificationAudio,
} from '@/lib/dashboard/notification-sound';

const POLL_MS = 15_000;

export default function DashboardNotificationsSync() {
  const shell = useDashboardShell();
  const setNotificationsRef = useRef(shell?.setNotifications);
  const knownIdsRef = useRef<Set<string> | null>(null);

  useEffect(() => {
    setNotificationsRef.current = shell?.setNotifications;
  }, [shell?.setNotifications]);

  // Unlock Web Audio after first user gesture so poll-driven chimes can play.
  useEffect(() => {
    const unlock = () => unlockNotificationAudio();
    document.addEventListener('pointerdown', unlock, { once: true, capture: true });
    document.addEventListener('keydown', unlock, { once: true, capture: true });
    return () => {
      document.removeEventListener('pointerdown', unlock, true);
      document.removeEventListener('keydown', unlock, true);
    };
  }, []);

  const sync = useCallback(async () => {
    const result = await getDashboardNotificationsAction();
    if (!result.success) return;

    const next = result.notifications;
    const nextIds = next.map((n) => n.id);

    if (knownIdsRef.current === null) {
      // Baseline: do not chime on first load / refresh.
      knownIdsRef.current = new Set(nextIds);
    } else {
      const known = knownIdsRef.current;
      const hasNew = nextIds.some((id) => !known.has(id));
      if (hasNew) {
        playNotificationBell();
      }
      for (const id of nextIds) known.add(id);
    }

    setNotificationsRef.current?.(next);
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
