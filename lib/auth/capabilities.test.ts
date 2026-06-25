import { describe, expect, it } from 'vitest';
import { canAccessRoute, normalizeRouteHref } from '@/lib/auth/capabilities';

describe('normalizeRouteHref', () => {
  it('strips query and hash from href', () => {
    expect(normalizeRouteHref('/dashboard/inventory?tab=intake')).toBe('/dashboard/inventory');
    expect(normalizeRouteHref('/dashboard/invoices?status=unpaid#top')).toBe('/dashboard/invoices');
  });
});

describe('canAccessRoute', () => {
  it('denies inventory routes for doctors including query-string hrefs', () => {
    expect(canAccessRoute('doctor', '/dashboard/inventory?tab=intake')).toBe(false);
    expect(canAccessRoute('doctor', '/dashboard/inventory')).toBe(false);
  });

  it('allows dashboard for doctors', () => {
    expect(canAccessRoute('doctor', '/dashboard')).toBe(true);
  });

  it('allows inventory intake for receptionists', () => {
    expect(canAccessRoute('receptionist', '/dashboard/inventory?tab=intake')).toBe(true);
  });
});
