import type { DashboardNotificationKind } from '@/lib/dashboard/notifications';

export type NotificationPrefs = Partial<Record<DashboardNotificationKind, boolean>>;

export const NOTIFICATION_PREF_KEYS: DashboardNotificationKind[] = [
  'checkout',
  'assigned_to_me',
  'assigned_in_clinic',
  'unpaid_invoice',
  'low_stock',
  'emergency_queue',
  'staff_chat_message',
  'staff_task_update',
  'appointment_request',
  'owner_chat_message',
];

export const NOTIFICATION_PREF_LABELS: Record<DashboardNotificationKind, string> = {
  checkout: 'Ready for checkout (green bar)',
  assigned_to_me: 'Patient assigned / waiting for you (blue bar)',
  assigned_in_clinic: 'Assigned consultations in clinic',
  unpaid_invoice: 'Unpaid invoices',
  low_stock: 'Low stock alerts',
  emergency_queue: 'Emergency queue',
  staff_chat_message: 'Staff chat messages',
  staff_task_update: 'Staff task updates',
  appointment_request: 'Owner appointment requests',
  owner_chat_message: 'Owner chat messages',
};

/** Missing keys default to enabled. Explicit `false` disables. */
export function isNotificationKindEnabled(
  prefs: NotificationPrefs | null | undefined,
  kind: DashboardNotificationKind
): boolean {
  if (!prefs || typeof prefs !== 'object') return true;
  return prefs[kind] !== false;
}

export function normalizeNotificationPrefs(raw: unknown): Record<DashboardNotificationKind, boolean> {
  const src =
    raw && typeof raw === 'object' && !Array.isArray(raw)
      ? (raw as Record<string, unknown>)
      : {};
  const out = {} as Record<DashboardNotificationKind, boolean>;
  for (const key of NOTIFICATION_PREF_KEYS) {
    out[key] = src[key] !== false;
  }
  return out;
}
