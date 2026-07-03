'use client';

import { animate, stagger } from 'animejs';
import { useEffect, useRef, type RefObject } from 'react';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

interface ScrollStaggerOptions {
  selector?: string;
  y?: number;
  staggerMs?: number;
  durationMs?: number;
  onActiveCountChange?: (count: number) => void;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function getVisibleElements(root: HTMLElement, selector: string) {
  return Array.from(root.querySelectorAll<HTMLElement>(selector)).filter((el) => {
    const rect = el.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  });
}

function getSectionProgress(section: HTMLElement) {
  const rect = section.getBoundingClientRect();
  const viewport = window.innerHeight;
  const travelDistance = rect.height + viewport * 0.55;
  const traveled = viewport * 0.88 - rect.top;
  return clamp(traveled / travelDistance, 0, 1);
}

export function useScrollStaggerReveal(
  ref: RefObject<HTMLElement | null>,
  {
    selector = '[data-stagger-item]',
    y = 20,
    staggerMs = 70,
    durationMs = 450,
    onActiveCountChange,
  }: ScrollStaggerOptions = {},
) {
  const reducedMotion = usePrefersReducedMotion();
  const onActiveCountChangeRef = useRef(onActiveCountChange);
  onActiveCountChangeRef.current = onActiveCountChange;

  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    let items = getVisibleElements(root, selector);
    let activeCount = 0;
    let rafId = 0;

    const applyCount = (nextCount: number, animateChange: boolean) => {
      items = getVisibleElements(root, selector);
      const count = clamp(nextCount, 0, items.length);
      if (count === activeCount) return;

      const increasing = count > activeCount;

      if (!animateChange || items.length === 0) {
        items.forEach((el, index) => {
          if (index < count) {
            el.style.opacity = '1';
            el.style.transform = 'none';
            el.style.pointerEvents = '';
          } else {
            el.style.opacity = '0';
            el.style.transform = `translateY(${y}px)`;
            el.style.pointerEvents = 'none';
          }
        });
        activeCount = count;
        onActiveCountChangeRef.current?.(count);
        return;
      }

      if (increasing) {
        const toReveal = items.slice(activeCount, count);
        animate(toReveal, {
          opacity: [0, 1],
          y: [y, 0],
          duration: durationMs,
          delay: stagger(staggerMs),
          ease: 'outExpo',
          onComplete: () => {
            for (const el of toReveal) {
              el.style.opacity = '1';
              el.style.transform = 'none';
              el.style.pointerEvents = '';
            }
          },
        });
      } else {
        const toHide = items.slice(count, activeCount).reverse();
        animate(toHide, {
          opacity: [1, 0],
          y: [0, y],
          duration: durationMs * 0.85,
          delay: stagger(staggerMs),
          ease: 'inExpo',
          onComplete: () => {
            for (const el of toHide) {
              el.style.opacity = '0';
              el.style.transform = `translateY(${y}px)`;
              el.style.pointerEvents = 'none';
            }
          },
        });
      }

      activeCount = count;
      onActiveCountChangeRef.current?.(count);
    };

    const update = () => {
      items = getVisibleElements(root, selector);
      if (items.length === 0) return;
      const progress = getSectionProgress(root);
      const nextCount = Math.round(progress * items.length);
      applyCount(nextCount, true);
    };

    if (reducedMotion) {
      items = getVisibleElements(root, selector);
      for (const el of items) {
        el.style.opacity = '1';
        el.style.transform = 'none';
      }
      onActiveCountChangeRef.current?.(items.length);
      return;
    }

    items = getVisibleElements(root, selector);
    for (const el of items) {
      el.style.opacity = '0';
      el.style.transform = `translateY(${y}px)`;
      el.style.pointerEvents = 'none';
    }

    const onScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      for (const el of getVisibleElements(root, selector)) {
        el.style.opacity = '1';
        el.style.transform = 'none';
        el.style.pointerEvents = '';
      }
    };
  }, [ref, reducedMotion, selector, y, staggerMs, durationMs]);

  return reducedMotion;
}
