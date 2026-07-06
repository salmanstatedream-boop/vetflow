'use client';

import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { SOLUTION_SECTION } from '@/lib/home-data';
import { cn } from '@/lib/utils';

const AUTO_PLAY_MS = 6000;

const toneAccent: Record<string, string> = {
  purple: 'text-[#C4B5FD]',
  orange: 'text-[#FDBA74]',
  blue: 'text-[#93C5FD]',
};

interface SolutionCarouselProps {
  reducedMotion?: boolean;
}

export default function SolutionCarousel({ reducedMotion = false }: SolutionCarouselProps) {
  const rows = SOLUTION_SECTION.rows;
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [paused, setPaused] = useState(false);

  const goTo = useCallback(
    (index: number, dir: number) => {
      const clamped = ((index % rows.length) + rows.length) % rows.length;
      setDirection(dir);
      setActiveIndex(clamped);
    },
    [rows.length],
  );

  const goNext = useCallback(() => goTo(activeIndex + 1, 1), [activeIndex, goTo]);
  const goPrev = useCallback(() => goTo(activeIndex - 1, -1), [activeIndex, goTo]);

  useEffect(() => {
    if (reducedMotion || paused || rows.length <= 1) return;
    const timer = window.setInterval(goNext, AUTO_PLAY_MS);
    return () => window.clearInterval(timer);
  }, [goNext, paused, reducedMotion, rows.length]);

  const row = rows[activeIndex];

  return (
    <div
      className="mt-10"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setPaused(false);
      }}
    >
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {rows.map((tab, index) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => goTo(index, index > activeIndex ? 1 : -1)}
            className={cn(
              'shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors border',
              index === activeIndex
                ? 'border-[#22D3EE]/40 bg-[#22D3EE]/10 text-[#F8FAFC]'
                : 'border-white/10 bg-white/5 text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-white/8',
            )}
          >
            {tab.tabLabel}
          </button>
        ))}
      </div>

      <div className="relative mt-4 min-h-[320px] sm:min-h-[360px] lg:min-h-[280px]">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={row.id}
            custom={direction}
            initial={{ opacity: 0, x: direction * 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -40 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="grid lg:grid-cols-2 gap-4 lg:gap-6 items-stretch"
          >
            <div className="phx-card p-4 flex flex-col justify-center">
              <p className="text-xs text-[#64748B] mb-1.5">{row.problem}</p>
              <h3
                className={cn(
                  'text-lg font-bold mb-2 font-[family-name:var(--font-display)]',
                  toneAccent[row.tone],
                )}
              >
                {row.title}
              </h3>
              <p className="text-sm text-[#94A3B8] mb-3 line-clamp-2">{row.description}</p>
              <ul className="space-y-1.5">
                {row.bullets.map((bullet) => (
                  <li key={bullet} className="flex items-start gap-2 text-sm text-[#F8FAFC]">
                    <Check className="w-4 h-4 text-[#22D3EE] shrink-0 mt-0.5" />
                    {bullet}
                  </li>
                ))}
              </ul>
            </div>
            <div className="phx-card p-3 overflow-hidden flex items-center justify-center min-h-[180px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={row.preview}
                alt=""
                className="w-full max-h-[220px] object-contain rounded-lg"
              />
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-4 flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={goPrev}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-[#94A3B8] hover:bg-white/10 hover:text-[#F8FAFC] transition-colors"
          aria-label="Previous solution"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-1.5">
          {rows.map((tab, index) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => goTo(index, index > activeIndex ? 1 : -1)}
              className={cn(
                'h-2 rounded-full transition-all',
                index === activeIndex ? 'w-5 bg-[#F97316]' : 'w-2 bg-white/20 hover:bg-white/35',
              )}
              aria-label={`Show ${tab.tabLabel}`}
              aria-current={index === activeIndex ? 'true' : undefined}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={goNext}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-[#94A3B8] hover:bg-white/10 hover:text-[#F8FAFC] transition-colors"
          aria-label="Next solution"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
