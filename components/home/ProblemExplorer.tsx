'use client';

import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, X } from 'lucide-react';
import { useState } from 'react';
import ProblemChaosVisual from '@/components/home/problem-chaos-visuals';
import { PROBLEM_SECTION, type ProblemFlowId } from '@/lib/home-data';
import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion';
import { cn } from '@/lib/utils';

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

const statToneText: Record<string, string> = {
  purple: 'text-[#C4B5FD]',
  orange: 'text-[#FDBA74]',
  pink: 'text-[#F9A8D4]',
};

function TimelineNav({
  activeId,
  onSelect,
  variant,
}: {
  activeId: ProblemFlowId;
  onSelect: (id: ProblemFlowId) => void;
  variant: 'sidebar' | 'pills';
}) {
  const steps = PROBLEM_SECTION.flow;

  if (variant === 'pills') {
    return (
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none lg:hidden">
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
                'shrink-0 flex items-center gap-2 rounded-full px-3 py-2 text-xs font-medium border transition-colors phx-focus-ring',
                isActive
                  ? 'border-[#8B5CF6]/50 bg-[#8B5CF6]/15 text-[#F8FAFC]'
                  : 'border-white/10 bg-white/5 text-[#64748B] hover:text-[#F8FAFC]',
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="font-mono">{step.index}</span>
              <span>{step.label}</span>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <nav className="hidden lg:block relative pl-1" aria-label="Problem categories">
      <div
        className="absolute left-[23px] top-6 bottom-6 w-px border-l border-dashed border-[#64748B]/40"
        aria-hidden
      />
      <ul className="space-y-1 relative">
        {steps.map((step) => {
          const Icon = step.icon;
          const isActive = step.id === activeId;
          return (
            <li key={step.id}>
              <button
                type="button"
                onClick={() => onSelect(step.id)}
                aria-selected={isActive}
                className={cn(
                  'w-full flex items-center gap-3 py-2.5 pr-2 rounded-lg text-left transition-colors phx-focus-ring group',
                  isActive ? 'text-[#F8FAFC]' : 'text-[#64748B] hover:text-[#94A3B8]',
                )}
              >
                <div className="relative flex items-center justify-center w-12 h-12 shrink-0">
                  {isActive && (
                    <motion.div
                      layoutId="problem-timeline-glow"
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
                <div className="min-w-0">
                  <p className={cn('text-[10px] font-mono', isActive ? 'text-[#8B5CF6]' : 'text-[#64748B]')}>
                    {step.index}
                  </p>
                  <p className={cn('text-sm font-medium truncate', isActive && 'text-[#F8FAFC]')}>
                    {step.label}
                  </p>
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function ChaosCard({ stepId }: { stepId: ProblemFlowId }) {
  const step = PROBLEM_SECTION.flow.find((s) => s.id === stepId)!;

  return (
    <div className="phx-card p-5 sm:p-6">
      <h3 className="text-sm font-semibold text-[#F8FAFC] mb-4">The daily chaos</h3>
      <div className="grid md:grid-cols-2 gap-5 items-center">
        <ul className="space-y-3">
          {step.chaos.bullets.map((bullet) => (
            <li key={bullet} className="flex items-start gap-2.5 text-sm text-[#94A3B8]">
              <span className="mt-0.5 w-5 h-5 rounded-full bg-[#8B5CF6]/15 border border-[#8B5CF6]/30 flex items-center justify-center shrink-0">
                <X className="w-3 h-3 text-[#C4B5FD]" />
              </span>
              {bullet}
            </li>
          ))}
        </ul>
        <ProblemChaosVisual visual={step.chaos.visual} tone={step.tone} />
      </div>
    </div>
  );
}

function ImpactCard() {
  const { impact } = PROBLEM_SECTION;

  return (
    <div className="phx-card p-5 sm:p-6">
      <h3 className="text-sm font-semibold text-[#F8FAFC] mb-4">The impact</h3>
      <div className="grid md:grid-cols-2 gap-5 items-center">
        <ul className="space-y-3">
          {impact.losses.map((loss) => {
            const Icon = loss.icon;
            return (
              <li key={loss.id} className="flex items-center gap-3 text-sm text-[#94A3B8]">
                <span className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                  <Icon className="w-4 h-4 text-[#22D3EE]" />
                </span>
                {loss.label}
              </li>
            );
          })}
        </ul>
        <div className="grid gap-3">
          {impact.stats.map((stat) => (
            <div key={stat.id} className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
              <p className={cn('text-2xl font-bold font-[family-name:var(--font-display)]', statToneText[stat.tone])}>
                {stat.value}
              </p>
              <p className="text-[11px] text-[#64748B] mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ConsequencesCard() {
  return (
    <div className="phx-card p-5 sm:p-6 text-center">
      <h3 className="text-sm font-semibold text-[#F8FAFC]">It all adds up.</h3>
      <p className="text-xs text-[#64748B] mt-1 mb-5">Small inefficiencies. Big consequences.</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {PROBLEM_SECTION.consequences.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.id} className="flex flex-col items-center gap-2">
              <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#8B5CF6]/20 to-[#F97316]/20 border border-white/10 flex items-center justify-center">
                <Icon className="w-5 h-5 text-[#C4B5FD]" />
              </span>
              <p className="text-[11px] text-[#94A3B8] leading-snug">{item.label}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function BottomCta() {
  const { cta } = PROBLEM_SECTION;

  return (
    <div className="phx-card p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
      <p className="text-sm text-[#94A3B8] text-center sm:text-left">
        {cta.lead}{' '}
        <span className="text-[#8B5CF6] font-semibold">{cta.highlight}</span>
      </p>
      <div className="flex items-center gap-3">
        <p className="text-sm text-[#94A3B8] hidden md:block">
          {cta.trailing}{' '}
          <span className="text-[#F97316] font-semibold">{cta.trailingHighlight}</span>
        </p>
        <Link
          href={cta.href}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-[#8B5CF6]/40 bg-[#8B5CF6]/15 text-[#C4B5FD] hover:bg-[#8B5CF6]/25 transition-colors phx-focus-ring"
          aria-label="Go to solution"
        >
          <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    </div>
  );
}

export default function ProblemExplorer() {
  const reducedMotion = usePrefersReducedMotion();
  const [activeId, setActiveId] = useState<ProblemFlowId>(PROBLEM_SECTION.flow[0].id);

  const transition = reducedMotion
    ? { duration: 0 }
    : { duration: 0.3, ease: [0.22, 1, 0.36, 1] as const };

  return (
    <div className="mt-12 lg:mt-16 max-w-6xl mx-auto">
      <TimelineNav activeId={activeId} onSelect={setActiveId} variant="pills" />

      <div className="grid lg:grid-cols-[220px_1fr] gap-8 lg:gap-10 items-start">
        <TimelineNav activeId={activeId} onSelect={setActiveId} variant="sidebar" />

        <div className="space-y-4 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeId}
              initial={reducedMotion ? false : { opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={reducedMotion ? undefined : { opacity: 0, x: -12 }}
              transition={transition}
            >
              <ChaosCard stepId={activeId} />
            </motion.div>
          </AnimatePresence>

          <ImpactCard />
          <ConsequencesCard />
          <BottomCta />
        </div>
      </div>
    </div>
  );
}
