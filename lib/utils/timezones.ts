/** Curated IANA timezones for clinic settings (display + validation). */
export const CLINIC_TIMEZONES = [
  { value: 'UTC', label: 'UTC — Coordinated Universal Time' },
  { value: 'Asia/Karachi', label: 'Pakistan — PKT (UTC+5)' },
  { value: 'Asia/Dubai', label: 'UAE — GST (UTC+4)' },
  { value: 'Asia/Riyadh', label: 'Saudi Arabia — AST (UTC+3)' },
  { value: 'Asia/Kolkata', label: 'India — IST (UTC+5:30)' },
  { value: 'Asia/Dhaka', label: 'Bangladesh — BST (UTC+6)' },
  { value: 'Asia/Bangkok', label: 'Thailand — ICT (UTC+7)' },
  { value: 'Asia/Singapore', label: 'Singapore — SGT (UTC+8)' },
  { value: 'Asia/Tokyo', label: 'Japan — JST (UTC+9)' },
  { value: 'Australia/Sydney', label: 'Australia — AEST/AEDT' },
  { value: 'Europe/London', label: 'United Kingdom — GMT/BST' },
  { value: 'Europe/Paris', label: 'Central Europe — CET/CEST' },
  { value: 'Europe/Istanbul', label: 'Turkey — TRT (UTC+3)' },
  { value: 'Africa/Cairo', label: 'Egypt — EET (UTC+2)' },
  { value: 'Africa/Johannesburg', label: 'South Africa — SAST (UTC+2)' },
  { value: 'America/New_York', label: 'US Eastern — EST/EDT' },
  { value: 'America/Chicago', label: 'US Central — CST/CDT' },
  { value: 'America/Denver', label: 'US Mountain — MST/MDT' },
  { value: 'America/Los_Angeles', label: 'US Pacific — PST/PDT' },
  { value: 'America/Toronto', label: 'Canada Eastern — EST/EDT' },
  { value: 'America/Sao_Paulo', label: 'Brazil — BRT (UTC-3)' },
] as const;

export type ClinicTimezone = (typeof CLINIC_TIMEZONES)[number]['value'];

export const CLINIC_TIMEZONE_VALUES = CLINIC_TIMEZONES.map((t) => t.value);

export const DEFAULT_CLINIC_TIMEZONE: ClinicTimezone = 'UTC';

export function isClinicTimezone(value: string): value is ClinicTimezone {
  return (CLINIC_TIMEZONE_VALUES as readonly string[]).includes(value);
}

export function normalizeClinicTimezone(value: string | null | undefined): ClinicTimezone {
  if (value && isClinicTimezone(value)) return value;
  return DEFAULT_CLINIC_TIMEZONE;
}

export function getClinicTimezoneLabel(value: string): string {
  const match = CLINIC_TIMEZONES.find((t) => t.value === value);
  return match?.label ?? value;
}

/** Short label for schedule headers, e.g. "PKT (UTC+5)". */
export function getClinicTimezoneShortLabel(value: string): string {
  const full = getClinicTimezoneLabel(value);
  const dash = full.indexOf(' — ');
  if (dash >= 0) return full.slice(dash + 3);
  return full;
}
