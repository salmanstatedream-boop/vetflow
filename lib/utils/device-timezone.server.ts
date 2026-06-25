import 'server-only';

import { cookies } from 'next/headers';
import { getTodayYmdInTimezone } from '@/lib/utils/timezones';
import {
  DEVICE_TZ_COOKIE,
  normalizeDeviceTimezone,
} from '@/lib/utils/device-timezone';

/** Server-side device timezone from cookie. */
export async function getDeviceTimezoneFromCookies(): Promise<string> {
  const cookieStore = await cookies();
  return normalizeDeviceTimezone(cookieStore.get(DEVICE_TZ_COOKIE)?.value);
}

/** Today's YYYY-MM-DD in the device timezone (server). */
export async function getDeviceTodayYmd(): Promise<string> {
  const tz = await getDeviceTimezoneFromCookies();
  return getTodayYmdInTimezone(tz);
}
