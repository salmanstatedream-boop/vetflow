'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion';
import { cn } from '@/lib/utils';

export const motionSpring = {
  type: 'spring' as const,
  stiffness: 260,
  damping: 28,
};

export function useMotionSafe() {
  const reducedMotion = usePrefersReducedMotion();
  return {
    reducedMotion,
    spring: reducedMotion ? { duration: 0 } : motionSpring,
    fade: reducedMotion
      ? { initial: false, animate: { opacity: 1, y: 0 } }
      : { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 } },
  };
}

function randomHeights(count: number, min: number, max: number) {
  return Array.from({ length: count }, () => min + Math.floor(Math.random() * (max - min + 1)));
}

export function AnimatedWaveform({
  barCount = 14,
  className,
  barClassName,
  minHeight = 24,
  maxHeight = 100,
  intervalMs = 150,
  active = true,
}: {
  barCount?: number;
  className?: string;
  barClassName?: string;
  minHeight?: number;
  maxHeight?: number;
  intervalMs?: number;
  active?: boolean;
}) {
  const reducedMotion = usePrefersReducedMotion();
  const [heights, setHeights] = useState(() => randomHeights(barCount, minHeight, maxHeight));

  useEffect(() => {
    if (reducedMotion || !active) return;
    const id = window.setInterval(() => {
      setHeights(randomHeights(barCount, minHeight, maxHeight));
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [active, barCount, intervalMs, maxHeight, minHeight, reducedMotion]);

  const staticHeights = useMemo(
    () => Array.from({ length: barCount }, (_, i) => minHeight + ((i % 5) * (maxHeight - minHeight)) / 5),
    [barCount, maxHeight, minHeight],
  );

  const displayHeights = reducedMotion || !active ? staticHeights : heights;

  return (
    <div className={cn('flex items-end gap-0.5', className)} aria-hidden>
      {displayHeights.map((h, i) => (
        <span
          key={i}
          className={cn('rounded-full bg-[#8B5CF6] transition-[height] duration-100 ease-out', barClassName)}
          style={{ height: `${h}%` }}
        />
      ))}
    </div>
  );
}
