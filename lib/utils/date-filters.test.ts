import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { resolveDashboardFilterDate } from '@/lib/utils/date-filters';
import { isValidIanaTimezone, normalizeDeviceTimezone } from '@/lib/utils/device-timezone';

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

  it('defaults to device timezone today when param is absent', () => {
    expect(resolveDashboardFilterDate(null, 'Asia/Karachi')).toBe('2026-06-26');
    expect(resolveDashboardFilterDate(undefined, 'UTC')).toBe('2026-06-25');
  });

  it('ignores invalid param and falls back to device today', () => {
    expect(resolveDashboardFilterDate('not-a-date', 'Asia/Karachi')).toBe('2026-06-26');
  });
});

describe('device timezone helpers', () => {
  it('validates IANA timezones', () => {
    expect(isValidIanaTimezone('Asia/Karachi')).toBe(true);
    expect(isValidIanaTimezone('Invalid/Zone')).toBe(false);
  });

  it('normalizes invalid timezone to UTC', () => {
    expect(normalizeDeviceTimezone('Asia/Karachi')).toBe('Asia/Karachi');
    expect(normalizeDeviceTimezone('bad')).toBe('UTC');
  });
});
