'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import {
  DEVICE_TZ_COOKIE,
  isValidIanaTimezone,
  normalizeDeviceTimezone,
} from '@/lib/utils/device-timezone';

export async function setDeviceTimezoneAction(timezone: string): Promise<{
  success: boolean;
  changed: boolean;
  timezone: string;
}> {
  const normalized = normalizeDeviceTimezone(timezone);
  if (!isValidIanaTimezone(normalized)) {
    return { success: false, changed: false, timezone: 'UTC' };
  }

  const cookieStore = await cookies();
  const previous = cookieStore.get(DEVICE_TZ_COOKIE)?.value;
  const changed = previous !== normalized;

  cookieStore.set(DEVICE_TZ_COOKIE, normalized, {
    path: '/',
    maxAge: 365 * 24 * 60 * 60,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });

  if (changed) {
    revalidatePath('/dashboard', 'layout');
  }

  return { success: true, changed, timezone: normalized };
}
