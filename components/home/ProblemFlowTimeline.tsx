'use client';

import type { LucideIcon } from 'lucide-react';
import {
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform,
  type MotionValue,
} from 'framer-motion';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion';
import { cn } from '@/lib/utils';

const toneRing: Record<string, string> = {
  purple: 'border-[#8B5CF6]/40 bg-[#8B5CF6]/10 text-[#C4B5FD]',
  orange: 'border-[#F97316]/40 bg-[#F97316]/10 text-[#FDBA74]',
  blue: 'border-[#3B82F6]/40 bg-[#3B82F6]/10 text-[#93C5FD]',
};

const toneGlow: Record<string, string> = {
  purple: 'bg-[#8B5CF6]/25',
  orange: 'bg-[#F97316]/25',
  blue: 'bg-[#3B82F6]/25',
};

const toneRingActive: Record<string, string> = {
  purple: 'border-[#8B5CF6]/70 bg-[#8B5CF6]/20 text-[#C4B5FD]',
  orange: 'border-[#F97316]/70 bg-[#F97316]/20 text-[#FDBA74]',
  blue: 'border-[#3B82F6]/70 bg-[#3B82F6]/20 text-[#93C5FD]',
};

export type ProblemFlowStep = {
  id: string;
  label: string;
  problem: string;
  outcome: string;
  icon: LucideIcon;
  tone: 'purple' | 'orange' | 'blue';
};

interface ProblemFlowTimelineProps {
  steps: readonly ProblemFlowStep[];
}

function buildPath(points: { x: number; y: number }[]) {
  if (points.length === 0) return '';
  const [first, ...rest] = points;
  return `M ${first.x} ${first.y}${rest.map((p) => ` L ${p.x} ${p.y}`).join('')}`;
}

function ProblemFlowRow({
  step,
  isActive,
  iconRef,
}: {
  step: ProblemFlowStep;
  isActive: boolean;
  iconRef: (el: HTMLDivElement | null) => void;
}) {
  const Icon = step.icon;

  return (
    <div className="grid lg:grid-cols-[auto_1fr_auto_1fr] gap-4 items-center">
      <div className="relative flex items-center justify-center w-12 h-12 shrink-0">
        <motion.div
          className={cn(
            'absolute inset-0 rounded-full blur-md',
            toneGlow[step.tone],
          )}
          initial={false}
          animate={{ opacity: isActive ? 0.9 : 0, scale: isActive ? 1.35 : 1 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          aria-hidden
        />
        <motion.div
          ref={iconRef}
          className={cn(
            'relative w-12 h-12 rounded-full border flex items-center justify-center z-10',
            isActive ? toneRingActive[step.tone] : toneRing[step.tone],
          )}
          initial={false}
          animate={{ scale: isActive ? 1.08 : 1 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          <Icon className="w-5 h-5" />
        </motion.div>
      </div>

      <motion.div
        className="phx-card p-4"
        initial={false}
        animate={{
          opacity: isActive ? 1 : 0,
          x: isActive ? 0 : -20,
        }}
        transition={{ duration: 0.4, delay: isActive ? 0.05 : 0, ease: [0.22, 1, 0.36, 1] }}
      >
        <p className="text-[10px] font-mono uppercase tracking-wider text-[#64748B] mb-1">{step.label}</p>
        <p className="text-sm text-[#F8FAFC]">{step.problem}</p>
      </motion.div>

      <motion.div
        className="hidden lg:flex items-center justify-center text-[#64748B] text-xl"
        aria-hidden
        initial={false}
        animate={{
          opacity: isActive ? 1 : 0,
          scaleX: isActive ? 1 : 0.6,
        }}
        transition={{ duration: 0.3, delay: isActive ? 0.12 : 0, ease: [0.22, 1, 0.36, 1] }}
      >
        →
      </motion.div>

      <motion.div
        className="phx-card p-4 border-dashed border-[#F97316]/25"
        initial={false}
        animate={{
          opacity: isActive ? 1 : 0,
          x: isActive ? 0 : 20,
        }}
        transition={{ duration: 0.4, delay: isActive ? 0.18 : 0, ease: [0.22, 1, 0.36, 1] }}
      >
        <p className="text-sm text-[#94A3B8]">{step.outcome}</p>
      </motion.div>
    </div>
  );
}

function TimelinePath({
  pathD,
  drawProgress,
}: {
  pathD: string;
  drawProgress: MotionValue<number> | number;
}) {
  if (!pathD) return null;

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
      aria-hidden
    >
      <defs>
        <linearGradient id="problem-timeline-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#22D3EE" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </linearGradient>
        <filter id="problem-timeline-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <motion.path
        d={pathD}
        fill="none"
        stroke="url(#problem-timeline-gradient)"
        strokeWidth="2"
        strokeLinecap="round"
        filter="url(#problem-timeline-glow)"
        style={{ pathLength: drawProgress }}
      />
    </svg>
  );
}

export default function ProblemFlowTimeline({ steps }: ProblemFlowTimelineProps) {
  const reducedMotion = usePrefersReducedMotion();
  const flowRef = useRef<HTMLDivElement>(null);
  const iconRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [pathD, setPathD] = useState('');
  const [maxActivated, setMaxActivated] = useState(reducedMotion ? steps.length - 1 : -1);

  const { scrollYProgress } = useScroll({
    target: flowRef,
    offset: ['start 0.85', 'end 0.35'],
  });

  const drawProgress = useTransform(scrollYProgress, [0, 1], [0, 1]);

  const measurePath = useCallback(() => {
    const container = flowRef.current;
    if (!container) return;

    const containerRect = container.getBoundingClientRect();
    const points = iconRefs.current
      .map((icon) => {
        if (!icon) return null;
        const rect = icon.getBoundingClientRect();
        return {
          x: rect.left - containerRect.left + rect.width / 2,
          y: rect.top - containerRect.top + rect.height / 2,
        };
      })
      .filter((p): p is { x: number; y: number } => p !== null);

    if (points.length >= 2) {
      setPathD(buildPath(points));
    }
  }, []);

  useLayoutEffect(() => {
    measurePath();
    const container = flowRef.current;
    if (!container) return;

    const observer = new ResizeObserver(() => measurePath());
    observer.observe(container);
    window.addEventListener('resize', measurePath);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measurePath);
    };
  }, [measurePath, steps.length]);

  useMotionValueEvent(scrollYProgress, 'change', (value) => {
    if (reducedMotion) return;
    const idx = Math.min(steps.length - 1, Math.floor(value * steps.length));
    setMaxActivated((prev) => Math.max(prev, idx));
  });

  useEffect(() => {
    if (reducedMotion) {
      setMaxActivated(steps.length - 1);
      return;
    }

    const v = scrollYProgress.get();
    if (v > 0) {
      const idx = Math.min(steps.length - 1, Math.floor(v * steps.length));
      setMaxActivated((prev) => Math.max(prev, idx));
    }

    const timer = window.setTimeout(() => {
      setMaxActivated((prev) => (prev < 0 ? steps.length - 1 : prev));
    }, 2000);

    return () => window.clearTimeout(timer);
  }, [reducedMotion, scrollYProgress, steps.length]);

  const pathProgress = reducedMotion ? 1 : drawProgress;

  return (
    <div ref={flowRef} className="relative mt-12 lg:mt-16 max-w-4xl mx-auto">
      <TimelinePath pathD={pathD} drawProgress={pathProgress} />
      <div className="space-y-6 relative">
        {steps.map((step, index) => (
          <ProblemFlowRow
            key={step.id}
            step={step}
            isActive={index <= maxActivated}
            iconRef={(el) => {
              iconRefs.current[index] = el;
            }}
          />
        ))}
      </div>
    </div>
  );
}
