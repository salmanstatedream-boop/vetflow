import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { resolveDashboardFilterDate } from '@/lib/utils/date-filters';

describe('resolveDashboardFilterDate', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-25T20:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('uses explicit date param when valid', () => {
    expect(resolveDashboardFilterDate('2026-06-26', 'UTC')).toBe('2026-06-26');
  });

  it('defaults to clinic timezone today when param is absent', () => {
    expect(resolveDashboardFilterDate(null, 'Asia/Karachi')).toBe('2026-06-26');
    expect(resolveDashboardFilterDate(undefined, 'UTC')).toBe('2026-06-25');
  });

  it('ignores invalid param and falls back to clinic today', () => {
    expect(resolveDashboardFilterDate('not-a-date', 'Asia/Karachi')).toBe('2026-06-26');
  });
});
