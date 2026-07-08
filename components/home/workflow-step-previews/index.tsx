'use client';

import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Brain, Check, Pencil, Sparkles, TrendingUp, Zap } from 'lucide-react';
import { AnimatedWaveform, motionSpring, useMotionSafe } from '@/components/home/marketing-visuals/animations';
import { PetStockAvatar } from '@/components/home/solution-dashboard-visuals/shared';
import { INTERACTIVE_WORKFLOW } from '@/lib/home-data';
import { cn } from '@/lib/utils';

function PreviewShell({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('h-[68px] rounded-md bg-[#0B1020]/90 border border-white/5 overflow-hidden p-2', className)}>
      {children}
    </div>
  );
}

export function StepPreviewBooked() {
  return (
    <PreviewShell>
      <div className="grid grid-cols-7 gap-0.5 h-full">
        {Array.from({ length: 14 }).map((_, i) => (
          <span
            key={i}
            className={cn(
              'rounded-[2px]',
              i === 3 || i === 9 ? 'bg-[#8B5CF6]/50' : i === 6 ? 'bg-[#22D3EE]/40' : 'bg-white/5',
            )}
          />
        ))}
      </div>
    </PreviewShell>
  );
}

export function StepPreviewCheckin() {
  return (
    <PreviewShell className="flex items-center gap-1.5">
      <PetStockAvatar pet="max" size="sm" />
      <div className="flex-1 min-w-0">
        <p className="text-[8px] font-semibold text-[#F8FAFC] truncate">Bruno</p>
        <p className="text-[7px] text-[#64748B]">Check-in</p>
      </div>
      <Pencil className="w-2.5 h-2.5 text-[#64748B] shrink-0" aria-hidden />
    </PreviewShell>
  );
}

export function StepPreviewListening({ active = false }: { active?: boolean }) {
  return (
    <PreviewShell className="flex items-end justify-center pb-1.5">
      <AnimatedWaveform
        barCount={14}
        className="h-full w-full justify-center"
        barClassName="w-0.5 min-h-[4px]"
        minHeight={28}
        maxHeight={92}
        active={active}
      />
    </PreviewShell>
  );
}

export function StepPreviewSoap() {
  const rows = ['S', 'O', 'A', 'P'];
  return (
    <PreviewShell className="space-y-1">
      {rows.map((r) => (
        <div key={r} className="flex items-center gap-1.5">
          <span className="text-[7px] font-mono text-[#C4B5FD] w-2.5">{r}</span>
          <span className="h-1 flex-1 rounded bg-white/10" />
        </div>
      ))}
    </PreviewShell>
  );
}

export function StepPreviewReview() {
  return (
    <PreviewShell className="flex items-center gap-2">
      <span className="w-5 h-5 rounded-full bg-gradient-to-br from-[#8B5CF6] to-[#3B82F6] flex items-center justify-center text-[7px] font-bold text-white shrink-0">
        RU
      </span>
      <div className="flex-1 space-y-1">
        <div className="flex gap-0.5">
          {[1, 2, 3].map((n) => (
            <Check key={n} className="w-2.5 h-2.5 text-[#86EFAC]" />
          ))}
        </div>
        <span className="block text-[7px] px-1.5 py-0.5 rounded-md bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] text-white text-center font-medium">
          Approve
        </span>
      </div>
    </PreviewShell>
  );
}

export function StepPreviewRx() {
  return (
    <PreviewShell className="space-y-1 text-[7px]">
      <p className="text-[#64748B]">Rx · Metoclopramide</p>
      <p className="text-[#94A3B8]">5mg · BID · 7 days</p>
      <span className="inline-block px-1.5 py-0.5 rounded border border-[#8B5CF6]/30 text-[#C4B5FD]">Send →</span>
    </PreviewShell>
  );
}

export function StepPreviewInvoice() {
  return (
    <PreviewShell className="space-y-1 text-[7px]">
      <div className="flex justify-between text-[#94A3B8]">
        <span>Consult</span>
        <span>$170</span>
      </div>
      <div className="flex justify-between text-[#94A3B8]">
        <span>Lab</span>
        <span>$100</span>
      </div>
      <div className="flex justify-between font-semibold text-[#F8FAFC] border-t border-white/10 pt-1">
        <span>Total</span>
        <span>$270.00</span>
      </div>
    </PreviewShell>
  );
}

export function StepPreviewFollowup() {
  return (
    <PreviewShell className="flex flex-col items-center justify-center gap-1">
      <p className="text-[8px] font-semibold text-[#F8FAFC]">May 20</p>
      <span className="text-[7px] px-2 py-0.5 rounded-md bg-[#8B5CF6]/25 text-[#C4B5FD] font-medium">Schedule</span>
    </PreviewShell>
  );
}

const previewMap = [
  StepPreviewBooked,
  StepPreviewCheckin,
  StepPreviewListening,
  StepPreviewSoap,
  StepPreviewReview,
  StepPreviewRx,
  StepPreviewInvoice,
  StepPreviewFollowup,
] as const;

export function WorkflowStepPreview({ index, isActive = false }: { index: number; isActive?: boolean }) {
  if (index === 2) return <StepPreviewListening active={isActive} />;
  const Component = previewMap[index] ?? StepPreviewBooked;
  return <Component />;
}

const ADVANTAGE_ICONS = [Brain, Zap, Sparkles, TrendingUp] as const;
const ADVANTAGE_TONES = ['purple', 'blue', 'orange', 'green'] as const;
const advantageToneStyles = {
  purple: 'bg-[#8B5CF6]/15 text-[#C4B5FD] border-[#8B5CF6]/25',
  blue: 'bg-[#3B82F6]/15 text-[#93C5FD] border-[#3B82F6]/25',
  orange: 'bg-[#F97316]/15 text-[#FDBA74] border-[#F97316]/25',
  green: 'bg-[#22C55E]/15 text-[#86EFAC] border-[#22C55E]/25',
};

function WorkflowDetailColumn({
  title,
  badge,
  children,
  className,
  variant = 'default',
  emphasized = false,
}: {
  title: string;
  badge?: ReactNode;
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'advantage';
  emphasized?: boolean;
}) {
  const { reducedMotion, spring } = useMotionSafe();
  return (
    <motion.div
      animate={{
        backgroundColor: emphasized ? 'rgba(139, 92, 246, 0.06)' : 'rgba(0, 0, 0, 0)',
      }}
      transition={spring}
      className={cn(
        'p-4 sm:p-5 flex flex-col min-h-[220px]',
        emphasized && 'ring-1 ring-inset ring-[#8B5CF6]/20',
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2 mb-4">
        <p
          className={cn(
            'text-[#22D3EE]',
            variant === 'advantage'
              ? 'text-sm font-semibold normal-case tracking-normal'
              : 'text-[10px] font-mono uppercase tracking-wider',
          )}
        >
          {title}
        </p>
        {badge}
      </div>
      <div className="flex-1">{children}</div>
    </motion.div>
  );
}

function WorkflowAdvantageList() {
  return (
    <ul className="space-y-3">
      {INTERACTIVE_WORKFLOW.advantages.map((item, i) => {
        const Icon = ADVANTAGE_ICONS[i];
        const tone = ADVANTAGE_TONES[i];
        return (
          <li key={item.title} className="flex gap-2.5">
            <span className={cn('w-7 h-7 rounded-lg border flex items-center justify-center shrink-0', advantageToneStyles[tone])}>
              <Icon className="w-3.5 h-3.5" />
            </span>
            <div>
              <p className="text-[11px] font-semibold text-[#F8FAFC]">{item.title}</p>
              <p className="text-[10px] text-[#64748B] mt-0.5 leading-snug">{item.description}</p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

const SOAP_LINES = [
  { key: 'S', text: 'Vomiting, reduced appetite' },
  { key: 'O', text: 'Mild dehydration noted' },
  { key: 'A', text: 'Acute gastroenteritis' },
  { key: 'P', text: 'Fluids, anti-emetic, recheck 48h' },
] as const;

export function WorkflowDetailCard({ activeStep }: { activeStep: number }) {
  const { reducedMotion, spring } = useMotionSafe();
  const visitEmphasis = activeStep >= 1;
  const voiceEmphasis = activeStep === 2 || activeStep === 4;
  const soapEmphasis = activeStep >= 3;
  const waveformActive = activeStep === 2 || activeStep === 4;
  const visibleSoapLines = activeStep >= 3 ? SOAP_LINES.length : Math.max(1, activeStep);

  return (
    <div className="rounded-2xl border border-white/10 bg-[#0B1020]/80 overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
      <div className="grid lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-white/10">
        <WorkflowDetailColumn title="VISIT IN PROGRESS" emphasized={visitEmphasis}>
          <motion.div
            key={`visit-${activeStep >= 1}`}
            initial={reducedMotion ? false : { opacity: 0.85, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={spring}
            className="flex items-start gap-2.5"
          >
            <PetStockAvatar pet="max" size="lg" />
            <div>
              <p className="text-sm font-semibold text-[#F8FAFC] leading-tight">Bruno</p>
              <p className="text-[10px] text-[#64748B] mt-0.5">3y · Male · 32kg</p>
              <p className="text-[10px] text-[#94A3B8] mt-1.5">Sarah Johnson</p>
              <p className="text-[10px] text-[#64748B] mt-0.5">Vomiting, loss of appetite</p>
            </div>
          </motion.div>
        </WorkflowDetailColumn>

        <WorkflowDetailColumn
          title="AI VOICE CAPTURE"
          emphasized={voiceEmphasis}
          badge={
            <motion.span
              animate={{ opacity: waveformActive && !reducedMotion ? [1, 0.6, 1] : 1 }}
              transition={{ duration: 1.2, repeat: waveformActive && !reducedMotion ? Infinity : 0 }}
              className="text-[8px] px-1.5 py-0.5 rounded bg-[#8B5CF6]/20 text-[#C4B5FD]"
            >
              Live
            </motion.span>
          }
        >
          <AnimatedWaveform
            barCount={18}
            className="h-10 mb-3 w-full"
            barClassName="w-1 min-h-[3px] bg-[#8B5CF6]/70"
            minHeight={24}
            maxHeight={100}
            active={waveformActive}
          />
          <p className="text-[9px] text-[#94A3B8] leading-relaxed italic">
            &quot;Dr. Smith, Bruno has been vomiting since yesterday…&quot;
          </p>
        </WorkflowDetailColumn>

        <WorkflowDetailColumn title="GENERATED SOAP (PREVIEW)" className="flex flex-col" emphasized={soapEmphasis}>
          <div className="space-y-1.5 text-[9px] text-[#94A3B8] flex-1">
            {SOAP_LINES.slice(0, visibleSoapLines).map((line, i) => (
              <motion.p
                key={line.key}
                initial={reducedMotion ? false : { opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ ...spring, delay: reducedMotion ? 0 : i * 0.05 }}
              >
                <span className="text-[#C4B5FD]">{line.key}:</span> {line.text}
              </motion.p>
            ))}
          </div>
          <button
            type="button"
            className={cn(
              'mt-4 w-full py-2.5 rounded-lg bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] text-[10px] font-semibold text-white transition-opacity',
              activeStep >= 4 && 'shadow-[0_0_20px_rgba(139,92,246,0.35)]',
            )}
          >
            Approve & Continue
          </button>
        </WorkflowDetailColumn>

        <WorkflowDetailColumn title="The Phoenix OS Advantage" variant="advantage">
          <WorkflowAdvantageList />
        </WorkflowDetailColumn>
      </div>
    </div>
  );
}
