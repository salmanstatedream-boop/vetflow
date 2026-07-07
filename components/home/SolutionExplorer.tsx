'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useState } from 'react';
import SolutionDashboardVisual from '@/components/home/solution-dashboard-visuals';
import { SOLUTION_SECTION, type SolutionRowId } from '@/lib/home-data';
import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion';
import { cn } from '@/lib/utils';

const AUTO_PLAY_MS = 3800;

const toneRing: Record<string, string> = {
  purple: 'border-[#8B5CF6]/40 bg-[#8B5CF6]/10 text-[#C4B5FD]',
  orange: 'border-[#F97316]/40 bg-[#F97316]/10 text-[#FDBA74]',
  blue: 'border-[#3B82F6]/40 bg-[#3B82F6]/10 text-[#93C5FD]',
};

const toneRingActive: Record<string, string> = {
  purple: 'border-[#8B5CF6] bg-[#8B5CF6]/25 text-[#E9D5FF] shadow-[0_0_24px_rgba(139,92,246,0.45)]',
  orange: 'border-[#F97316] bg-[#F97316]/25 text-[#FED7AA] shadow-[0_0_24px_rgba(249,115,22,0.4)]',
  blue: 'border-[#3B82F6] bg-[#3B82F6]/25 text-[#BFDBFE] shadow-[0_0_24px_rgba(59,130,246,0.4)]',
};

const toneGlow: Record<string, string> = {
  purple: 'bg-[#8B5CF6]/30',
  orange: 'bg-[#F97316]/30',
  blue: 'bg-[#3B82F6]/30',
};

const statIconTone: Record<string, string> = {
  purple: 'bg-[#8B5CF6]/15 text-[#C4B5FD] border-[#8B5CF6]/25',
  blue: 'bg-[#3B82F6]/15 text-[#93C5FD] border-[#3B82F6]/25',
  orange: 'bg-[#F97316]/15 text-[#FDBA74] border-[#F97316]/25',
  green: 'bg-[#22C55E]/15 text-[#86EFAC] border-[#22C55E]/25',
  red: 'bg-[#EF4444]/15 text-[#FCA5A5] border-[#EF4444]/25',
};

function SolutionModuleNav({
  activeId,
  onSelect,
}: {
  activeId: SolutionRowId;
  onSelect: (id: SolutionRowId) => void;
}) {
  const steps = SOLUTION_SECTION.rows;

  return (
    <nav className="relative mt-10 mb-6" aria-label="Solution modules">
      <div
        className="absolute top-[22px] left-[6%] right-[6%] h-px border-t border-dashed border-[#8B5CF6]/30 hidden sm:block"
        aria-hidden
      />
      <div className="flex gap-2 sm:gap-3 sm:justify-between overflow-x-auto pb-4 scrollbar-none snap-x snap-mandatory">
        {steps.map((step) => {
          const Icon = step.icon;
          const isActive = step.id === activeId;
          return (
            <button
              key={step.id}
              type="button"
              onClick={() => onSelect(step.id)}
              aria-selected={isActive}
              className={cn(
                'snap-start shrink-0 flex flex-col items-center gap-1 transition-all phx-focus-ring',
                isActive ? 'opacity-100' : 'opacity-60 hover:opacity-80',
              )}
            >
              <div
                className={cn(
                  'flex flex-col items-center gap-1.5 px-2.5 py-2 rounded-xl transition-all',
                  isActive && 'border border-[#8B5CF6]/60 bg-[#8B5CF6]/10 shadow-[0_0_20px_rgba(139,92,246,0.2)]',
                )}
              >
                <div className="relative flex items-center justify-center w-11 h-11">
                  {isActive && (
                    <motion.div
                      layoutId="solution-nav-glow"
                      className={cn('absolute inset-0 rounded-full blur-md', toneGlow[step.tone])}
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                  <div
                    className={cn(
                      'relative z-10 w-11 h-11 rounded-full border flex items-center justify-center transition-all',
                      isActive ? toneRingActive[step.tone] : toneRing[step.tone],
                    )}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
                <span
                  className={cn(
                    'text-[10px] sm:text-xs font-medium text-center leading-tight max-w-[80px]',
                    isActive ? 'text-[#F8FAFC]' : 'text-[#64748B]',
                  )}
                >
                  {step.tabLabel}
                </span>
              </div>
              {isActive && (
                <span
                  className="w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent border-t-[#8B5CF6]"
                  aria-hidden
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

function FeaturePanel({ row }: { row: (typeof SOLUTION_SECTION.rows)[number] }) {
  return (
    <div className="p-5 lg:p-6 border-b lg:border-b-0 lg:border-r border-white/10 bg-[#0B1020]/40">
      <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider text-[#C4B5FD] bg-[#8B5CF6]/15 border border-[#8B5CF6]/30">
        {row.moduleBadge}
      </span>
      <h3 className="mt-3 text-lg font-bold text-[#F8FAFC] font-[family-name:var(--font-display)] leading-snug">
        {row.title}
        <br />
        <span className="bg-gradient-to-r from-[#C4B5FD] to-[#8B5CF6] bg-clip-text text-transparent">
          {row.titleAccent}
        </span>
      </h3>
      <p className="mt-2 text-sm text-[#64748B] leading-relaxed">{row.description}</p>
      <ul className="mt-5 space-y-4">
        {row.features.map((feature) => {
          const Icon = feature.icon;
          return (
            <li key={feature.title} className="flex items-start gap-3">
              <span className="w-9 h-9 rounded-xl bg-[#8B5CF6]/15 border border-[#8B5CF6]/25 flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(139,92,246,0.15)]">
                <Icon className="w-4 h-4 text-[#C4B5FD]" />
              </span>
              <div>
                <p className="text-sm font-semibold text-[#F8FAFC]">{feature.title}</p>
                <p className="text-xs text-[#64748B] mt-0.5 leading-relaxed">{feature.description}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function StatsBar({ row }: { row: (typeof SOLUTION_SECTION.rows)[number] }) {
  const footer = 'statsFooter' in row ? row.statsFooter : undefined;

  if (footer) {
    const FooterIcon = footer.icon;
    return (
      <div className="flex flex-col lg:flex-row lg:items-center gap-4 border-t border-white/10 px-5 py-4 lg:px-6 bg-[#0B1020]/30">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <span className="w-9 h-9 rounded-lg border border-[#8B5CF6]/25 bg-[#8B5CF6]/15 flex items-center justify-center shrink-0">
            <FooterIcon className="w-4 h-4 text-[#C4B5FD]" />
          </span>
          <p className="text-[11px] text-[#64748B] leading-relaxed">{footer.message}</p>
        </div>
        <div className="grid grid-cols-3 gap-4 lg:shrink-0">
          {row.stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="flex items-center gap-2">
                <span className={cn('w-8 h-8 rounded-lg border flex items-center justify-center shrink-0', statIconTone[stat.tone])}>
                  <Icon className="w-3.5 h-3.5" />
                </span>
                <div>
                  <p className="text-base font-bold text-[#F8FAFC] leading-none">{stat.value}</p>
                  <p className="text-[10px] text-[#64748B] mt-0.5">{stat.label}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'grid gap-4 border-t border-white/10 px-5 py-4 lg:px-6 bg-[#0B1020]/30',
        row.stats.length === 5
          ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5'
          : 'grid-cols-2 lg:grid-cols-4',
      )}
    >
      {row.stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div key={stat.label} className="flex items-center gap-3">
            <span className={cn('w-9 h-9 rounded-lg border flex items-center justify-center shrink-0', statIconTone[stat.tone])}>
              <Icon className="w-4 h-4" />
            </span>
            <div>
              <p className="text-lg font-bold text-[#F8FAFC] leading-none">{stat.value}</p>
              <p className="text-[11px] text-[#64748B] mt-0.5">{stat.label}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

interface SolutionExplorerProps {
  reducedMotion?: boolean;
}

export default function SolutionExplorer({ reducedMotion: reducedMotionProp }: SolutionExplorerProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const reducedMotion = reducedMotionProp ?? prefersReducedMotion;
  const rows = SOLUTION_SECTION.rows;
  const [activeId, setActiveId] = useState<SolutionRowId>(rows[0].id);
  const [paused, setPaused] = useState(false);

  const activeIndex = rows.findIndex((r) => r.id === activeId);
  const row = rows[activeIndex];

  const goTo = useCallback((id: SolutionRowId) => setActiveId(id), []);

  const goNext = useCallback(() => {
    const next = rows[(activeIndex + 1) % rows.length];
    setActiveId(next.id);
  }, [activeIndex, rows]);

  useEffect(() => {
    if (reducedMotion || paused || rows.length <= 1) return;
    const timer = window.setInterval(goNext, AUTO_PLAY_MS);
    return () => window.clearInterval(timer);
  }, [goNext, paused, reducedMotion, rows.length]);

  const transition = reducedMotion
    ? { duration: 0 }
    : { duration: 0.22, ease: [0.22, 1, 0.36, 1] as const };

  return (
    <div
      className="max-w-6xl mx-auto"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setPaused(false);
      }}
    >
      <SolutionModuleNav activeId={activeId} onSelect={goTo} />

      <div className="phx-card overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeId}
            initial={reducedMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reducedMotion ? undefined : { opacity: 0, y: -8 }}
            transition={transition}
          >
            <div className="grid lg:grid-cols-[260px_1fr]">
              <FeaturePanel row={row} />
              <div className="min-w-0 p-3 lg:p-4">
                <div className="rounded-xl border border-white/10 bg-[#0B1020]/80 overflow-hidden min-h-[440px]">
                  <SolutionDashboardVisual visual={row.visual} />
                </div>
              </div>
            </div>
            <StatsBar row={row} />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
