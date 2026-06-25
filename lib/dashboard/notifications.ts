export type DashboardNotificationKind =
  | 'checkout'
  | 'unpaid_invoice'
  | 'low_stock'
  | 'emergency_queue';

export type DashboardNotification = {
  id: string;
  kind: DashboardNotificationKind;
  title: string;
  body: string;
  href: string;
  priority: number;
  createdAt?: string | null;
};

const KIND_PRIORITY: Record<DashboardNotificationKind, number> = {
  emergency_queue: 0,
  checkout: 1,
  unpaid_invoice: 2,
  low_stock: 3,
};

export function sortDashboardNotifications(
  items: DashboardNotification[]
): DashboardNotification[] {
  return [...items].sort((a, b) => {
    const kindDiff = KIND_PRIORITY[a.kind] - KIND_PRIORITY[b.kind];
    if (kindDiff !== 0) return kindDiff;
    if (a.priority !== b.priority) return a.priority - b.priority;
    if (a.createdAt && b.createdAt) {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    return 0;
  });
}

export function notificationBadgeCount(items: DashboardNotification[]): number {
  return items.length;
}

export function filterDismissedNotifications(
  items: DashboardNotification[],
  dismissedIds: ReadonlySet<string>
): DashboardNotification[] {
  if (dismissedIds.size === 0) return items;
  return items.filter((item) => !dismissedIds.has(item.id));
}

export function checkoutNotifications(
  items: DashboardNotification[]
): DashboardNotification[] {
  return items.filter((n) => n.kind === 'checkout');
}
