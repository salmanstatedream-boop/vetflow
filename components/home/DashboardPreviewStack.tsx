'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion, type PanInfo } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import LiveDashboardMockup from '@/components/home/LiveDashboardMockup';
import { DASHBOARD_PREVIEW_STACK } from '@/lib/home-data';
import { cn } from '@/lib/utils';

const ROTATIONS = [3, -2, -6];
const AUTO_PLAY_MS = 5000;
const DRAG_THRESHOLD = 60;

interface DashboardPreviewStackProps {
  animate?: boolean;
  reducedMotion?: boolean;
  className?: string;
}

export default function DashboardPreviewStack({
  animate = false,
  reducedMotion = false,
  className,
}: DashboardPreviewStackProps) {
  const items = DASHBOARD_PREVIEW_STACK;
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const goTo = useCallback(
    (index: number) => {
      const clamped = ((index % items.length) + items.length) % items.length;
      setActiveIndex(clamped);
    },
    [items.length],
  );

  const goNext = useCallback(() => goTo(activeIndex + 1), [activeIndex, goTo]);
  const goPrev = useCallback(() => goTo(activeIndex - 1), [activeIndex, goTo]);

  useEffect(() => {
    if (reducedMotion || paused || items.length <= 1) return;
    const timer = window.setInterval(goNext, AUTO_PLAY_MS);
    return () => window.clearInterval(timer);
  }, [goNext, items.length, paused, reducedMotion]);

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -DRAG_THRESHOLD) goNext();
    else if (info.offset.x > DRAG_THRESHOLD) goPrev();
  };

  const visibleIndices = useMemo(() => {
    if (reducedMotion) return [0];
    return items.map((_, i) => i);
  }, [items, reducedMotion]);

  const activeItem = items[activeIndex];

  return (
    <div
      className={cn('relative', className)}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setPaused(false);
      }}
    >
        <div
          className="relative mx-auto w-full max-w-[520px] aspect-[4/3] sm:aspect-[16/11]"
          style={{ perspective: '1400px' }}
        >
          {visibleIndices.map((index) => {
            const item = items[index];
            const isActive = index === activeIndex;
            const offset = index - activeIndex;

            return (
              <motion.div
                key={item.id}
                className={cn(
                  'absolute inset-0 rounded-xl overflow-hidden border border-white/10 bg-[#0B1020] shadow-2xl',
                  isActive && 'cursor-grab active:cursor-grabbing',
                )}
                style={{ transformStyle: 'preserve-3d' }}
                drag={isActive && !reducedMotion ? 'x' : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.12}
                onDragEnd={isActive ? handleDragEnd : undefined}
                initial={{
                  x: offset * 18,
                  y: Math.abs(offset) * 8,
                  rotateZ: ROTATIONS[index % ROTATIONS.length],
                  scale: 0.88 - Math.abs(offset) * 0.04,
                  opacity: isActive ? 1 : 0.45,
                  zIndex: 10 - Math.abs(offset),
                }}
                animate={
                  isActive
                    ? {
                        x: 0,
                        y: 0,
                        rotateZ: 0,
                        scale: 1,
                        opacity: 1,
                        zIndex: 30,
                      }
                    : {
                        x: offset * 22,
                        y: Math.abs(offset) * 10,
                        rotateZ: ROTATIONS[index % ROTATIONS.length],
                        scale: 0.86 - Math.abs(offset) * 0.03,
                        opacity: 0.5,
                        zIndex: 10 - Math.abs(offset),
                      }
                }
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="h-full overflow-hidden overflow-y-auto">
                  {item.type === 'component' ? (
                    <LiveDashboardMockup
                      animate={animate && isActive}
                      reducedMotion={reducedMotion}
                      className="p-4 sm:p-5"
                    />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.image}
                      alt={item.label}
                      className="w-full h-full object-cover object-top"
                      draggable={false}
                    />
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

      <div className="mt-5 flex flex-col items-center gap-3">
        <p className="text-sm font-medium text-[#F8FAFC]">{activeItem.label}</p>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={goPrev}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-[#94A3B8] hover:bg-white/10 hover:text-[#F8FAFC] transition-colors"
            aria-label="Previous dashboard preview"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-1.5">
            {items.map((item, index) => (
              <button
                key={item.id}
                type="button"
                onClick={() => goTo(index)}
                className={cn(
                  'h-2 rounded-full transition-all',
                  index === activeIndex ? 'w-5 bg-[#22D3EE]' : 'w-2 bg-white/20 hover:bg-white/35',
                )}
                aria-label={`Show ${item.label}`}
                aria-current={index === activeIndex ? 'true' : undefined}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={goNext}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-[#94A3B8] hover:bg-white/10 hover:text-[#F8FAFC] transition-colors"
            aria-label="Next dashboard preview"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
