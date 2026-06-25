'use client';

import { useCallback, useEffect, useState, type RefObject } from 'react';
import {
  computeFloatingDropdownPosition,
  type FloatingDropdownPosition,
} from '@/lib/ui/floating-dropdown';

export type UseFloatingDropdownPositionOptions = {
  searchHeaderPx?: number;
  footerPx?: number;
  preferredListMaxPx?: number;
  preferPlacement?: 'auto' | 'top' | 'bottom';
  /** Re-run layout when inner content changes (e.g. search query). */
  repositionDeps?: unknown[];
};

export function useFloatingDropdownPosition(
  open: boolean,
  triggerRef: RefObject<HTMLElement | null>,
  options: UseFloatingDropdownPositionOptions = {}
): FloatingDropdownPosition | null {
  const {
    searchHeaderPx = 0,
    footerPx = 0,
    preferredListMaxPx,
    preferPlacement = 'auto',
    repositionDeps = [],
  } = options;

  const [pos, setPos] = useState<FloatingDropdownPosition | null>(null);

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    setPos(
      computeFloatingDropdownPosition(triggerRef.current, {
        searchHeaderPx,
        footerPx,
        preferredListMaxPx,
        preferPlacement,
      })
    );
  }, [footerPx, preferPlacement, preferredListMaxPx, searchHeaderPx, triggerRef]);

  useEffect(() => {
    if (!open) {
      setPos(null);
      return;
    }
    updatePosition();
    const raf = requestAnimationFrame(updatePosition);
    const onLayout = () => updatePosition();
    window.addEventListener('resize', onLayout);
    window.addEventListener('scroll', onLayout, true);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onLayout);
      window.removeEventListener('scroll', onLayout, true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- repositionDeps are intentional extras
  }, [open, updatePosition, ...repositionDeps]);

  return pos;
}
