import { useEffect } from 'react';
import { AppState } from 'react-native';
import { ownerApi } from '@/lib/api';

/** Polls owner notifications + message threads while the home screen is mounted. */
export function useOwnerNotificationPoll(onUpdate: (unread: number) => void) {
  useEffect(() => {
    let cancelled = false;

    const refresh = async () => {
      try {
        const [notifs, threads] = await Promise.all([
          ownerApi.notifications(),
          ownerApi.messageThreads().catch(() => ({ threads: [] as { unreadCount?: number }[] })),
        ]);
        const chatUnread = threads.threads.reduce(
          (sum, t) => sum + (t.unreadCount || 0),
          0
        );
        if (!cancelled) {
          onUpdate((notifs.unreadCount || 0) + chatUnread);
        }
      } catch {
        if (!cancelled) onUpdate(0);
      }
    };

    void refresh();
    const interval = setInterval(() => void refresh(), 15000);
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') void refresh();
    });

    return () => {
      cancelled = true;
      clearInterval(interval);
      sub.remove();
    };
  }, [onUpdate]);
}
