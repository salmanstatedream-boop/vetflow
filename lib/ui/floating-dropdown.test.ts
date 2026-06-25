// @vitest-environment jsdom
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import {
  computeFloatingDropdownPosition,
  parseMaxHeightClass,
} from '@/lib/ui/floating-dropdown';

describe('parseMaxHeightClass', () => {
  it('parses tailwind max-h-* classes', () => {
    expect(parseMaxHeightClass('max-h-56')).toBe(224);
    expect(parseMaxHeightClass('max-h-72')).toBe(288);
  });

  it('parses arbitrary pixel classes', () => {
    expect(parseMaxHeightClass('max-h-[200px]')).toBe(200);
  });
});

describe('computeFloatingDropdownPosition', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'innerHeight', {
      configurable: true,
      value: 600,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  function mockTrigger(rect: Partial<DOMRect>): HTMLElement {
    return {
      getBoundingClientRect: () =>
        ({
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          width: 200,
          height: 32,
          x: 0,
          y: 0,
          toJSON: () => ({}),
          ...rect,
        }) as DOMRect,
    } as HTMLElement;
  }

  it('places dropdown below when space is sufficient', () => {
    const trigger = mockTrigger({ top: 100, bottom: 132, left: 40, width: 240 });
    const pos = computeFloatingDropdownPosition(trigger, { preferredListMaxPx: 224 });
    expect(pos.placement).toBe('bottom');
    expect(pos.left).toBe(40);
    expect(pos.width).toBe(240);
  });

  it('flips to top when space below is limited', () => {
    const trigger = mockTrigger({ top: 520, bottom: 552, left: 16, width: 280 });
    const pos = computeFloatingDropdownPosition(trigger, {
      preferredListMaxPx: 224,
      minListPx: 120,
    });
    expect(pos.placement).toBe('top');
  });
});
