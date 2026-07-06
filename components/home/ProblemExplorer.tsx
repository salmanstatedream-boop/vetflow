'use client';

import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Sparkles, X } from 'lucide-react';
import type { ReactNode } from 'react';
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

const toneIndexText: Record<string, string> = {
  purple: 'text-[#C4B5FD]',
  orange: 'text-[#FDBA74]',
  blue: 'text-[#93C5FD]',
};

const toneBulletBg: Record<string, string> = {
  purple: 'bg-[#8B5CF6]/15 border-[#8B5CF6]/30',
  orange: 'bg-[#F97316]/15 border-[#F97316]/30',
  blue: 'bg-[#3B82F6]/15 border-[#3B82F6]/30',
};

const toneBulletIcon: Record<string, string> = {
  purple: 'text-[#C4B5FD]',
  orange: 'text-[#FDBA74]',
  blue: 'text-[#93C5FD]',
};

const tonePillActive: Record<string, string> = {
  purple: 'border-[#8B5CF6]/50 bg-[#8B5CF6]/15',
  orange: 'border-[#F97316]/50 bg-[#F97316]/15',
  blue: 'border-[#3B82F6]/50 bg-[#3B82F6]/15',
};

const statToneText: Record<string, string> = {
  purple: 'text-[#C4B5FD]',
  orange: 'text-[#FDBA74]',
  pink: 'text-[#F9A8D4]',
};

function ExplorerCard({
  title,
  subtitle,
  children,
  className,
}: {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('phx-card p-6', className)}>
      {title && (
        <div className={cn('mb-5', subtitle ? '' : '')}>
          <h3 className="text-sm font-semibold text-[#F8FAFC] tracking-tight">{title}</h3>
          {subtitle && <p className="text-xs text-[#64748B] mt-1">{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  );
}

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
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory lg:hidden">
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
                'snap-start shrink-0 flex items-center gap-2 rounded-full px-3 py-2 text-xs font-medium border transition-colors phx-focus-ring',
                isActive
                  ? cn(tonePillActive[step.tone], 'text-[#F8FAFC]')
                  : 'border-white/10 bg-white/5 text-[#64748B] hover:text-[#F8FAFC]',
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="font-mono">{step.index}</span>
              <span className="hidden sm:inline">{step.label}</span>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <nav
      className="hidden lg:block relative lg:sticky lg:top-28 self-start"
      aria-label="Problem categories"
    >
      <div
        className="absolute left-6 top-8 bottom-8 w-px border-l border-dashed border-[#64748B]/40"
        aria-hidden
      />
      <ul className="space-y-0.5 relative">
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
                  'w-full flex items-center gap-3 py-3 pr-2 rounded-lg text-left transition-all phx-focus-ring',
                  isActive ? 'text-[#F8FAFC] opacity-100' : 'text-[#64748B] opacity-60 hover:opacity-80 hover:text-[#94A3B8]',
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
                      'relative z-10 w-12 h-12 rounded-full border flex items-center justify-center transition-all',
                      isActive ? toneRingActive[step.tone] : toneRing[step.tone],
                    )}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
                <div className="min-w-0">
                  <p
                    className={cn(
                      'text-[10px] font-mono',
                      isActive ? toneIndexText[step.tone] : 'text-[#64748B]',
                    )}
                  >
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
    <ExplorerCard title="The daily chaos">
      <div className="grid md:grid-cols-[1fr_auto_1fr] gap-6 items-stretch">
        <ul className="space-y-3.5">
          {step.chaos.bullets.map((bullet) => (
            <li key={bullet} className="flex items-start gap-2.5 text-sm text-[#94A3B8] leading-relaxed">
              <span
                className={cn(
                  'mt-0.5 w-5 h-5 rounded-full border flex items-center justify-center shrink-0',
                  toneBulletBg[step.tone],
                )}
              >
                <X className={cn('w-3 h-3', toneBulletIcon[step.tone])} />
              </span>
              {bullet}
            </li>
          ))}
        </ul>
        <div className="hidden md:block w-px bg-white/10 self-stretch" aria-hidden />
        <ProblemChaosVisual visual={step.chaos.visual} tone={step.tone} className="h-full" />
      </div>
    </ExplorerCard>
  );
}

function ImpactCard() {
  const { impact } = PROBLEM_SECTION;

  return (
    <ExplorerCard title="The impact">
      <div className="space-y-3">
        {impact.losses.map((loss, i) => {
          const stat = impact.stats[i];
          const Icon = loss.icon;
          return (
            <div
              key={loss.id}
              className="grid sm:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] gap-4 items-center rounded-xl border border-white/10 bg-white/5 px-4 py-3"
            >
              <div className="flex items-center gap-3 text-sm text-[#94A3B8]">
                <span className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-[#22D3EE]" />
                </span>
                {loss.label}
              </div>
              <div className="sm:text-right">
                <p
                  className={cn(
                    'text-2xl font-bold font-[family-name:var(--font-display)] leading-none',
                    statToneText[stat.tone],
                  )}
                >
                  {stat.value}
                </p>
                <p className="text-[11px] text-[#64748B] mt-1 leading-snug">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>
    </ExplorerCard>
  );
}

function ConsequencesCard() {
  return (
    <ExplorerCard
      title="It all adds up."
      subtitle="Small inefficiencies. Big consequences."
      className="text-center"
    >
      <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 max-w-3xl mx-auto">
        {PROBLEM_SECTION.consequences.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.id} className="flex flex-col items-center gap-2 w-[88px]">
              <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#8B5CF6]/20 to-[#F97316]/20 border border-white/10 flex items-center justify-center">
                <Icon className="w-4 h-4 text-[#C4B5FD]" />
              </span>
              <p className="text-[11px] text-[#94A3B8] leading-snug">{item.label}</p>
            </div>
          );
        })}
      </div>
    </ExplorerCard>
  );
}

function BottomCta() {
  const { cta } = PROBLEM_SECTION;

  return (
    <ExplorerCard>
      <div className="flex flex-col sm:flex-row items-center gap-4 sm:justify-between">
        <div className="flex items-start sm:items-center gap-4">
          <span className="w-10 h-10 shrink-0 rounded-full bg-[#8B5CF6]/20 border border-[#8B5CF6]/40 flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.25)]">
            <Sparkles className="w-5 h-5 text-[#C4B5FD]" />
          </span>
          <div className="text-sm text-[#94A3B8] text-left space-y-1">
            <p>
              {cta.lead}{' '}
              <span className="text-[#8B5CF6] font-semibold">{cta.highlight}</span>
            </p>
            <p>
              {cta.trailing}{' '}
              <span className="text-[#F97316] font-semibold">{cta.trailingHighlight}</span>
            </p>
          </div>
        </div>
        <Link
          href={cta.href}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#8B5CF6]/40 bg-[#8B5CF6]/15 text-[#C4B5FD] hover:bg-[#8B5CF6]/25 transition-colors phx-focus-ring"
          aria-label="Go to solution"
        >
          <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    </ExplorerCard>
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

      <div className="grid lg:grid-cols-[240px_1fr] gap-6 lg:gap-8 items-start">
        <TimelineNav activeId={activeId} onSelect={setActiveId} variant="sidebar" />

        <div className="space-y-5 min-w-0">
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
