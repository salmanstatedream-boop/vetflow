import { describe, expect, it } from 'vitest';
import { ALL_FEATURES } from '@/lib/auth/features';
import { filterNavGroups } from '@/lib/navigation/dashboard-nav';

describe('filterNavGroups', () => {
  it('excludes Operations section for doctors', () => {
    const groups = filterNavGroups('doctor', ALL_FEATURES);
    const operations = groups.find((g) => g.section === 'Operations');
    expect(operations).toBeUndefined();
  });

  it('includes Stock intake for receptionists when inventory feature is enabled', () => {
    const groups = filterNavGroups('receptionist', ALL_FEATURES);
    const operations = groups.find((g) => g.section === 'Operations');
    expect(operations?.items.some((item) => item.name === 'Stock intake')).toBe(true);
  });
});
