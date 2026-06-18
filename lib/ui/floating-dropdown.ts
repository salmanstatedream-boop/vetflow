import type { CSSProperties } from 'react';

const GAP_PX = 4;
const VIEWPORT_PAD_PX = 8;
const DEFAULT_LIST_MAX_PX = 288;

/** Parse Tailwind max-h-* class to pixels (supports max-h-56, max-h-72, arbitrary). */
export function parseMaxHeightClass(className: string | undefined): number {
  if (!className) return DEFAULT_LIST_MAX_PX;
  const match = className.match(/max-h-(\d+)/);
  if (match) return Number(match[1]) * 4;
  const arbitrary = className.match(/max-h-\[(\d+)px\]/);
  if (arbitrary) return Number(arbitrary[1]);
  return DEFAULT_LIST_MAX_PX;
}

export type DropdownPlacement = 'top' | 'bottom';

export type FloatingDropdownPosition = {
  left: number;
  width: number;
  placement: DropdownPlacement;
  anchorTop: number;
  anchorBottom: number;
  maxListHeight: number;
};

export function computeFloatingDropdownPosition(
  trigger: HTMLElement,
  options: {
    searchHeaderPx?: number;
    footerPx?: number;
    preferredListMaxPx?: number;
    minListPx?: number;
    preferPlacement?: 'auto' | 'top' | 'bottom';
  } = {}
): FloatingDropdownPosition {
  const rect = trigger.getBoundingClientRect();
  const searchHeaderPx = options.searchHeaderPx ?? 0;
  const footerPx = options.footerPx ?? 0;
  const chromePx = searchHeaderPx + footerPx;
  const preferredListMaxPx = options.preferredListMaxPx ?? DEFAULT_LIST_MAX_PX;
  const minListPx = options.minListPx ?? 120;

  const spaceBelow = window.innerHeight - rect.bottom - VIEWPORT_PAD_PX;
  const spaceAbove = rect.top - VIEWPORT_PAD_PX;

  let placement: DropdownPlacement = 'bottom';

  if (options.preferPlacement === 'top') {
    placement = spaceAbove >= minListPx + chromePx + GAP_PX ? 'top' : 'bottom';
  } else if (options.preferPlacement === 'bottom') {
    placement = 'bottom';
  } else {
    const needBelow = minListPx + chromePx + GAP_PX;
    const fitsBelow = spaceBelow >= needBelow;
    const fitsAbove = spaceAbove >= needBelow;
    if (!fitsBelow && fitsAbove) {
      placement = 'top';
    } else if (!fitsBelow && !fitsAbove) {
      placement = spaceAbove > spaceBelow ? 'top' : 'bottom';
    } else if (fitsBelow && fitsAbove) {
      placement = spaceBelow >= spaceAbove ? 'bottom' : 'top';
    }
  }

  const available =
    (placement === 'top' ? spaceAbove : spaceBelow) - GAP_PX - chromePx;
  const maxListHeight = Math.max(
    minListPx,
    Math.min(preferredListMaxPx, Math.floor(available))
  );

  return {
    left: rect.left,
    width: rect.width,
    placement,
    anchorTop: rect.top,
    anchorBottom: rect.bottom,
    maxListHeight,
  };
}

export function floatingDropdownStyle(pos: FloatingDropdownPosition): CSSProperties {
  return {
    position: 'fixed',
    left: pos.left,
    width: pos.width,
    zIndex: 9999,
    ...(pos.placement === 'top'
      ? { bottom: window.innerHeight - pos.anchorTop + GAP_PX, top: 'auto' }
      : { top: pos.anchorBottom + GAP_PX, bottom: 'auto' }),
  };
}
