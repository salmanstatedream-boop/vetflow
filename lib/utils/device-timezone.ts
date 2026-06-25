export const DEVICE_TZ_COOKIE = 'clinix_device_tz';

/** Validate IANA timezone string (device may use zones outside clinic list). */
export function isValidIanaTimezone(value: string): boolean {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: value });
    return true;
  } catch {
    return false;
  }
}

export function normalizeDeviceTimezone(value: string | null | undefined): string {
  if (value && isValidIanaTimezone(value)) return value;
  return 'UTC';
}

/** Client-side device timezone. */
export function getDeviceTimezone(): string {
  if (typeof Intl === 'undefined') return 'UTC';
  return normalizeDeviceTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);
}
