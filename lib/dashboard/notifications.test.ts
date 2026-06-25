// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import {
  checkoutNotifications,
  notificationBadgeCount,
  sortDashboardNotifications,
  type DashboardNotification,
} from '@/lib/dashboard/notifications';

function item(
  kind: DashboardNotification['kind'],
  id: string,
  priority = 1
): DashboardNotification {
  return {
    id,
    kind,
    title: id,
    body: 'test',
    href: '/dashboard',
    priority,
  };
}

describe('sortDashboardNotifications', () => {
  it('sorts checkout before low_stock', () => {
    const sorted = sortDashboardNotifications([
      item('low_stock', 'a'),
      item('checkout', 'b'),
      item('unpaid_invoice', 'c'),
    ]);
    expect(sorted.map((n) => n.kind)).toEqual([
      'checkout',
      'unpaid_invoice',
      'low_stock',
    ]);
  });

  it('sorts emergency_queue first', () => {
    const sorted = sortDashboardNotifications([
      item('checkout', 'a'),
      item('emergency_queue', 'b'),
    ]);
    expect(sorted[0]?.kind).toBe('emergency_queue');
  });
});

describe('notificationBadgeCount', () => {
  it('returns item count', () => {
    expect(notificationBadgeCount([item('checkout', '1'), item('checkout', '2')])).toBe(2);
  });
});

describe('checkoutNotifications', () => {
  it('filters checkout kind only', () => {
    const all = [item('checkout', '1'), item('low_stock', '2')];
    expect(checkoutNotifications(all)).toHaveLength(1);
    expect(checkoutNotifications(all)[0]?.kind).toBe('checkout');
  });
});
