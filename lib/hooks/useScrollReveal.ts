'use client';

import { animate, stagger } from 'animejs';
import { useEffect, useRef, type RefObject } from 'react';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

interface ScrollRevealOptions {
  /** CSS selector for elements to reveal inside the section. */
  selector?: string;
  /** Vertical offset the elements travel while fading in. */
  y?: number;
  /** Stagger between elements in ms. */
  staggerMs?: number;
  /** Duration of each element's reveal in ms. */
  durationMs?: number;
  /** Called once when the section reveals (for section-specific animations). */
  onReveal?: () => void;
}

/**
 * Reveals a section's child elements the moment the section enters the
 * viewport. Unlike scroll-position triggers tied to a section's bottom edge,
 * this fires early (top of section at ~88% viewport) and can never leave
 * content stuck invisible: elements are only hidden after mount, and if the
 * section is already on screen it reveals immediately.
 *
 * Returns `true` when reduced motion is active (content stays static).
 */
function getVisibleElements(root: HTMLElement, selector: string) {
  return Array.from(root.querySelectorAll<HTMLElement>(selector)).filter((el) => {
    const rect = el.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  });
}

export function useScrollReveal(
  ref: RefObject<HTMLElement | null>,
  {
    selector = '[data-reveal]',
    y = 24,
    staggerMs = 90,
    durationMs = 700,
    onReveal,
  }: ScrollRevealOptions = {},
) {
  const reducedMotion = usePrefersReducedMotion();
  const onRevealRef = useRef(onReveal);
  onRevealRef.current = onReveal;

  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    const items = getVisibleElements(root, selector);

    const showStatic = () => {
      for (const el of items) {
        el.style.opacity = '1';
        el.style.transform = 'none';
      }
    };

    if (reducedMotion) {
      showStatic();
      onRevealRef.current?.();
      return;
    }

    let revealed = false;
    let observer: IntersectionObserver | null = null;

    const reveal = (instant: boolean) => {
      if (revealed) return;
      revealed = true;
      observer?.disconnect();

      if (instant || items.length === 0) {
        showStatic();
      } else {
        animate(items, {
          opacity: [0, 1],
          y: [y, 0],
          duration: durationMs,
          delay: stagger(staggerMs),
          ease: 'outExpo',
          onComplete: showStatic,
        });
      }
      onRevealRef.current?.();
    };

    const rect = root.getBoundingClientRect();
    const inView = rect.top < window.innerHeight * 0.92 && rect.bottom > 0;

    if (inView) {
      // Already visible (initial load or mid-page reload): never hide content.
      reveal(rect.top < window.innerHeight * 0.4);
      return;
    }

    for (const el of items) {
      el.style.opacity = '0';
      el.style.transform = `translateY(${y}px)`;
    }

    observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) reveal(false);
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0 },
    );
    observer.observe(root);

    return () => {
      observer?.disconnect();
      // Safety: never leave content hidden across effect re-runs.
      if (!revealed) showStatic();
    };
  }, [ref, reducedMotion, selector, y, staggerMs, durationMs]);

  return reducedMotion;
}
