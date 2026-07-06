'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { TESTIMONIALS } from '@/lib/home-data';
import { cn } from '@/lib/utils';

type AnimatedTestimonialsProps = {
  className?: string;
  width?: number;
  autoPlay?: boolean;
  autoPlayInterval?: number;
  showNavigation?: boolean;
  showCounter?: boolean;
  compact?: boolean;
};

export default function AnimatedTestimonials({
  className,
  width = 520,
  autoPlay = true,
  autoPlayInterval = 4500,
  showNavigation = true,
  showCounter = true,
  compact = false,
}: AnimatedTestimonialsProps) {
  const items = TESTIMONIALS;
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const rotations = useMemo(() => [4, -2, -9, 7], []);
  const activeItem = items[activeIndex];

  useEffect(() => {
    if (!autoPlay || items.length <= 1) return;
    const interval = setInterval(() => {
      setDirection(1);
      setActiveIndex((prev) => (prev + 1) % items.length);
    }, autoPlayInterval);
    return () => clearInterval(interval);
  }, [autoPlay, autoPlayInterval, items.length]);

  const handleNext = () => {
    setDirection(1);
    setActiveIndex((prev) => (prev + 1) % items.length);
  };

  const handlePrev = () => {
    setDirection(-1);
    setActiveIndex((prev) => (prev === 0 ? items.length - 1 : prev - 1));
  };

  return (
    <div className={cn('w-full', className)}>
      <div
        className={cn(
          'relative grid grid-cols-1 md:grid-cols-[1fr_1fr] gap-x-8 gap-y-4 w-full mx-auto',
          compact && 'md:grid-cols-1',
        )}
        style={{ perspective: '1400px', maxWidth: compact ? '100%' : `${width}px` }}
      >
        {showCounter && !compact && (
          <div className="row-start-1 md:col-start-2 text-right font-mono text-sm text-[#64748B]">
            {activeIndex + 1} / {items.length}
          </div>
        )}

        <div
          className={cn(
            'relative w-full aspect-square max-w-[280px] mx-auto md:max-w-none',
            compact ? 'max-h-[220px] aspect-[4/3]' : '',
          )}
        >
          <AnimatePresence custom={direction}>
            {items.map((item, index) => {
              const isActive = index === activeIndex;
              const offset = index - activeIndex;
              return (
                <motion.div
                  key={item.id}
                  className="absolute inset-0 overflow-hidden border-[5px] border-[#1E293B] bg-[#0B1020] shadow-2xl rounded-xl"
                  initial={{
                    x: offset * 12,
                    y: Math.abs(offset) * 5,
                    scale: 0.88 - Math.abs(offset) * 0.04,
                    rotateZ: rotations[index % 4],
                    opacity: isActive ? 1 : 0.45,
                    zIndex: 10 - Math.abs(offset),
                  }}
                  animate={
                    isActive
                      ? {
                          x: [offset * 12, direction === 1 ? -180 : 180, 0],
                          y: [Math.abs(offset) * 5, 0, 0],
                          scale: [0.88, 1.04, 1],
                          rotateZ: [rotations[index % 4], -4, 0],
                          opacity: 1,
                          zIndex: 100,
                        }
                      : {
                          x: offset * 12,
                          y: Math.abs(offset) * 5,
                          rotateZ: rotations[index % 4],
                          scale: 0.88 - Math.abs(offset) * 0.04,
                          opacity: 0.45,
                          zIndex: 10 - Math.abs(offset),
                        }
                  }
                  exit={{
                    x: direction === 1 ? -220 : 220,
                    scale: 0.75,
                    rotateZ: direction === 1 ? -10 : 10,
                    opacity: 0,
                  }}
                  transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.image} alt="" className="w-full h-full object-cover" draggable={false} />
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        <div className="flex flex-col justify-center min-h-[120px] px-2">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeItem.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.35 }}
            >
              <p className="text-[11px] font-mono uppercase tracking-[0.15em] text-[#22D3EE] mb-2">
                {activeItem.subtitle}
              </p>
              <h3 className="text-xl font-bold text-[#F8FAFC] font-[family-name:var(--font-display)]">
                {activeItem.title}
              </h3>
              <p className="text-sm text-[#94A3B8] mt-3 leading-relaxed">&ldquo;{activeItem.description}&rdquo;</p>
            </motion.div>
          </AnimatePresence>

          {showNavigation && items.length > 1 && (
            <div className="flex gap-2 mt-5">
              <button
                type="button"
                onClick={handlePrev}
                className="flex items-center justify-center w-10 h-10 rounded-full border border-white/10 bg-[#101A33] text-[#94A3B8] hover:text-[#F8FAFC] hover:border-[#22D3EE]/30 transition-colors"
                aria-label="Previous testimonial"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="flex items-center justify-center w-10 h-10 rounded-full border border-white/10 bg-[#101A33] text-[#94A3B8] hover:text-[#F8FAFC] hover:border-[#22D3EE]/30 transition-colors"
                aria-label="Next testimonial"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
