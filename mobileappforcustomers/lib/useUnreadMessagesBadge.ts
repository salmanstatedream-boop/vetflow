import { useCallback, useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { ownerApi } from '@/lib/api';

export function useUnreadMessagesBadge(): number | undefined {
  const [count, setCount] = useState(0);

  const refresh = useCallback(async () => {
    try {
      const res = await ownerApi.messageThreads();
      const total = res.threads.reduce((sum, t) => sum + (t.unreadCount || 0), 0);
      setCount(total);
    } catch {
      setCount(0);
    }
  }, []);

  useEffect(() => {
    void refresh();
    const interval = setInterval(() => void refresh(), 15000);
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') void refresh();
    });
    return () => {
      clearInterval(interval);
      sub.remove();
    };
  }, [refresh]);

  return count > 0 ? count : undefined;
}
