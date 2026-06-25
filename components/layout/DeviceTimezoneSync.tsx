'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getDeviceTimezone } from '@/lib/utils/device-timezone';
import { setDeviceTimezoneAction } from '@/lib/services/device-timezone-actions';

export default function DeviceTimezoneSync() {
  const router = useRouter();
  const syncedRef = useRef(false);

  useEffect(() => {
    if (syncedRef.current) return;
    syncedRef.current = true;

    const tz = getDeviceTimezone();
    void setDeviceTimezoneAction(tz).then((res) => {
      if (res.success && res.changed) {
        router.refresh();
      }
    });
  }, [router]);

  return null;
}
