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

function getVisibleElements(root: HTMLElement, selector: string) {
  return Array.from(root.querySelectorAll<HTMLElement>(selector)).filter((el) => {
    const rect = el.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  });
}

function isSectionInView(root: HTMLElement) {
  const rect = root.getBoundingClientRect();
  return rect.top < window.innerHeight * 0.92 && rect.bottom > 0;
}

/**
 * Reveals a section's child elements when the section enters the viewport.
 * Listens for Lenis smooth-scroll via the phx:scroll custom event so content
 * is never stuck invisible when IntersectionObserver misses virtual scroll.
 */
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
    let safetyTimer: ReturnType<typeof setTimeout> | null = null;

    const reveal = (instant: boolean) => {
      if (revealed) return;
      if (!isSectionInView(root)) return;
      revealed = true;
      observer?.disconnect();
      if (safetyTimer) clearTimeout(safetyTimer);

      if (instant || items.length === 0) {
        showStatic();
      } else {
        animate(items, {
          opacity: [0, 1],
          y: [y, 0],
          scale: [0.96, 1],
          duration: durationMs,
          delay: stagger(staggerMs),
          ease: 'outExpo',
          onComplete: showStatic,
        });
      }
      onRevealRef.current?.();
    };

    const checkInView = () => {
      if (revealed) return;
      if (isSectionInView(root)) {
        const rect = root.getBoundingClientRect();
        reveal(rect.top < window.innerHeight * 0.55);
      }
    };

    if (isSectionInView(root)) {
      const rect = root.getBoundingClientRect();
      reveal(rect.top < window.innerHeight * 0.55);
    } else {
      for (const el of items) {
        el.style.opacity = '0';
        el.style.transform = `translateY(${y}px) scale(0.96)`;
      }

      observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) reveal(false);
        },
        { rootMargin: '0px 0px -8% 0px', threshold: 0 },
      );
      observer.observe(root);

      window.addEventListener('phx:scroll', checkInView);
      window.addEventListener('scroll', checkInView, { passive: true });

      safetyTimer = setTimeout(() => {
        if (!revealed) reveal(true);
      }, 2000);
    }

    return () => {
      observer?.disconnect();
      window.removeEventListener('phx:scroll', checkInView);
      window.removeEventListener('scroll', checkInView);
      if (safetyTimer) clearTimeout(safetyTimer);
      if (!revealed) showStatic();
    };
  }, [ref, reducedMotion, selector, y, staggerMs, durationMs]);

  return reducedMotion;
}
