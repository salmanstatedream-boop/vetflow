'use client';

import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { Sparkles } from 'lucide-react';
import {
  createContext,
  useContext,
  type ReactNode,
} from 'react';
import { PetStockAvatar } from '@/components/home/solution-dashboard-visuals/shared';
import type { SolutionPetKey } from '@/lib/solution-mockup-assets';
import { cn } from '@/lib/utils';

const STAGGER: Record<'rail' | 'main' | 'aside' | 'footer', number> = {
  rail: 0,
  main: 0.1,
  aside: 0.2,
  footer: 0.3,
};

const JourneyMotionCtx = createContext(false);

export function JourneyScreenMotion({
  children,
  reducedMotion = false,
  className,
}: {
  children: ReactNode;
  reducedMotion?: boolean;
  className?: string;
}) {
  return (
    <JourneyMotionCtx.Provider value={reducedMotion}>
      <div className={cn('w-full', className)}>{children}</div>
    </JourneyMotionCtx.Provider>
  );
}

export function MotionSlot({
  slot,
  children,
  className,
}: {
  slot: keyof typeof STAGGER;
  children: ReactNode;
  className?: string;
}) {
  const reduced = useContext(JourneyMotionCtx);
  if (reduced) {
    return <div className={className}>{children}</div>;
  }
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: STAGGER[slot],
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </motion.div>
  );
}

export function JourneyFrame({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'w-full text-left antialiased bg-[#0B0B0F] overflow-hidden rounded-2xl border border-white/10',
        className,
      )}
    >
      {children}
    </div>
  );
}

export function FeatureRail({
  badge,
  title,
  titleAccent,
  features,
  stat,
  className,
}: {
  badge: string;
  title: string;
  titleAccent?: string;
  features: { icon: LucideIcon; label: string; desc: string }[];
  stat?: { label: string; value: string; delta: string; sparkline?: boolean };
  className?: string;
}) {
  return (
    <div
      className={cn(
        'hidden md:flex flex-col w-[200px] xl:w-[240px] shrink-0 border-r border-white/10 p-4 bg-white/[0.02]',
        className,
      )}
    >
      <p className="text-[9px] font-mono uppercase tracking-[0.18em] text-[#C4B5FD] mb-2">{badge}</p>
      <p className="text-sm font-semibold text-[#F8FAFC] leading-snug mb-4">
        {title}
        {titleAccent ? (
          <>
            <br />
            <span className="bg-gradient-to-r from-[#A78BFA] to-[#8B5CF6] bg-clip-text text-transparent">
              {titleAccent}
            </span>
          </>
        ) : null}
      </p>
      <ul className="space-y-3 flex-1">
        {features.map((f) => (
          <li key={f.label} className="flex gap-2.5">
            <span className="w-7 h-7 rounded-lg bg-[#8B5CF6]/15 border border-[#8B5CF6]/30 flex items-center justify-center shrink-0">
              <f.icon className="w-3.5 h-3.5 text-[#C4B5FD]" />
            </span>
            <div className="min-w-0">
              <p className="text-[10px] font-medium text-[#F8FAFC] leading-tight">{f.label}</p>
              <p className="text-[9px] text-[#64748B] leading-snug mt-0.5">{f.desc}</p>
            </div>
          </li>
        ))}
      </ul>
      {stat ? (
        <div className="mt-4 rounded-xl border border-[#8B5CF6]/30 bg-[#8B5CF6]/10 p-3 shadow-[0_0_24px_rgba(139,92,246,0.15)]">
          <p className="text-[8px] font-mono uppercase tracking-wider text-[#94A3B8]">{stat.label}</p>
          <div className="flex items-end justify-between gap-2 mt-1">
            <p className="text-2xl font-bold text-[#F8FAFC] leading-none">{stat.value}</p>
            {stat.sparkline ? <MiniSparkline /> : null}
          </div>
          <p className="text-[9px] text-[#86EFAC] mt-1.5">{stat.delta}</p>
        </div>
      ) : null}
    </div>
  );
}

export function MiniSparkline({ className }: { className?: string }) {
  const pts = [4, 8, 6, 12, 9, 14, 11, 16];
  const max = Math.max(...pts);
  const w = 56;
  const h = 22;
  const d = pts
    .map((v, i) => {
      const x = (i / (pts.length - 1)) * w;
      const y = h - (v / max) * (h - 2);
      return `${i === 0 ? 'M' : 'L'}${x},${y}`;
    })
    .join(' ');
  return (
    <svg width={w} height={h} className={cn('shrink-0 opacity-90', className)} aria-hidden>
      <path d={d} fill="none" stroke="#A78BFA" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function KpiStrip({
  items,
}: {
  items: { label: string; value: string; delta?: string; icon: LucideIcon; tone?: 'purple' | 'green' | 'red' | 'amber' | 'teal' }[];
}) {
  const tones = {
    purple: 'bg-[#8B5CF6]/15 border-[#8B5CF6]/25 text-[#C4B5FD]',
    green: 'bg-[#22C55E]/15 border-[#22C55E]/25 text-[#86EFAC]',
    red: 'bg-[#F43F5E]/15 border-[#F43F5E]/25 text-[#FDA4AF]',
    amber: 'bg-[#F59E0B]/15 border-[#F59E0B]/25 text-[#FCD34D]',
    teal: 'bg-[#2DD4BF]/15 border-[#2DD4BF]/25 text-[#5EEAD4]',
  };
  return (
    <div
      className={cn(
        'grid gap-2 border-t border-white/10 px-3 py-3 bg-[#0B0B0F]',
        items.length <= 4 ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5',
      )}
    >
      {items.map((item) => (
        <div
          key={item.label}
          className="flex items-center gap-2.5 min-w-0 rounded-xl border border-white/10 bg-white/[0.03] px-2.5 py-2"
        >
          <span
            className={cn(
              'w-8 h-8 rounded-full border flex items-center justify-center shrink-0',
              tones[item.tone ?? 'purple'],
            )}
          >
            <item.icon className="w-3.5 h-3.5" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-bold text-[#F8FAFC] leading-none tabular-nums">{item.value}</p>
            <p className="text-[8px] text-[#64748B] mt-0.5 truncate">{item.label}</p>
            {item.delta ? <p className="text-[8px] text-[#86EFAC]">{item.delta}</p> : null}
          </div>
        </div>
      ))}
    </div>
  );
}

export function SummaryCard({
  title,
  children,
  className,
}: {
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('rounded-xl border border-white/10 bg-white/[0.03] p-3', className)}>
      {title ? <p className="text-[10px] font-semibold text-[#F8FAFC] mb-2.5">{title}</p> : null}
      {children}
    </div>
  );
}

export function TimelineItem({
  label,
  state,
  sub,
}: {
  label: string;
  state: 'done' | 'active' | 'pending';
  sub?: string;
}) {
  return (
    <div className="flex items-start gap-2.5 text-[9px]">
      <span
        className={cn(
          'w-2.5 h-2.5 rounded-full shrink-0 mt-0.5',
          state === 'done' && 'bg-[#22C55E]',
          state === 'active' && 'bg-[#8B5CF6] shadow-[0_0_10px_rgba(139,92,246,0.7)]',
          state === 'pending' && 'border border-[#64748B] bg-transparent',
        )}
      />
      <div className="min-w-0">
        <span className={state === 'pending' ? 'text-[#64748B]' : 'text-[#E2E8F0]'}>{label}</span>
        {sub ? <p className="text-[8px] text-[#64748B] mt-0.5">{sub}</p> : null}
      </div>
    </div>
  );
}

export function ConfidenceGauge({ value, label = 'Confidence' }: { value: number; label?: string }) {
  const r = 28;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - value / 100);
  return (
    <div className="relative w-[72px] h-[72px] flex items-center justify-center">
      <svg width="72" height="72" className="absolute inset-0 -rotate-90" aria-hidden>
        <circle cx="36" cy="36" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
        <circle
          cx="36"
          cy="36"
          r={r}
          fill="none"
          stroke="#8B5CF6"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="relative flex flex-col items-center justify-center">
        <span className="text-sm font-bold text-[#F8FAFC] leading-none">{value}%</span>
        <span className="text-[7px] text-[#64748B] uppercase tracking-wide mt-0.5">{label}</span>
      </div>
    </div>
  );
}

export function ProgressBar({
  label,
  value,
  color = '#8B5CF6',
}: {
  label: string;
  value: number;
  color?: string;
}) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between gap-2 text-[9px]">
        <span className="text-[#CBD5E1] truncate">{label}</span>
        <span className="text-[#94A3B8] tabular-nums shrink-0">{value}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${value}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

export function StatusBadge({
  label,
  tone = 'green',
}: {
  label: string;
  tone?: 'green' | 'orange' | 'purple' | 'red' | 'blue';
}) {
  const styles = {
    green: 'bg-[#22C55E]/15 text-[#86EFAC] border-[#22C55E]/35',
    orange: 'bg-[#F97316]/15 text-[#FDBA74] border-[#F97316]/35',
    purple: 'bg-[#8B5CF6]/15 text-[#C4B5FD] border-[#8B5CF6]/35',
    red: 'bg-[#F43F5E]/15 text-[#FDA4AF] border-[#F43F5E]/35',
    blue: 'bg-[#3B82F6]/15 text-[#93C5FD] border-[#3B82F6]/35',
  };
  return (
    <span className={cn('inline-flex px-2 py-0.5 rounded-full text-[8px] font-semibold uppercase tracking-wide border', styles[tone])}>
      {label}
    </span>
  );
}

export type WeekBlock = {
  day: number;
  rowStart: number;
  rowSpan: number;
  pet?: SolutionPetKey;
  label: string;
  breed?: string;
  time: string;
  color: string;
};

const WEEK_HEADER_H = 30;
const WEEK_ROW_H = 34;

export function WeekScheduleGrid({
  days,
  times,
  blocks,
  nowRow,
  nowLabel,
}: {
  days: { label: string; date: number; active?: boolean }[];
  times: string[];
  blocks: WeekBlock[];
  nowRow?: number;
  nowLabel?: string;
}) {
  return (
    <div className="overflow-x-auto scrollbar-none">
      <div
        className="relative min-w-[620px] grid rounded-lg border border-white/10 overflow-hidden"
        style={{
          gridTemplateColumns: `40px repeat(${days.length}, minmax(0, 1fr))`,
          gridTemplateRows: `${WEEK_HEADER_H}px repeat(${times.length}, ${WEEK_ROW_H}px)`,
        }}
      >
        <div className="bg-white/[0.04] border-b border-white/10" />
        {days.map((d) => (
          <div
            key={d.label}
            className={cn(
              'bg-white/[0.04] border-b border-l border-white/10 flex flex-col items-center justify-center',
              d.active && 'bg-[#8B5CF6]/10',
            )}
          >
            <span className="text-[8px] text-[#64748B] uppercase leading-none">{d.label}</span>
            <span
              className={cn(
                'text-[10px] font-semibold leading-none mt-0.5',
                d.active ? 'text-[#C4B5FD]' : 'text-[#E2E8F0]',
              )}
            >
              {d.date}
            </span>
          </div>
        ))}

        {times.map((time, rowIdx) => (
          <div key={time} className="contents">
            <span
              className="text-[7px] text-[#64748B] pr-1 pt-0.5 text-right border-t border-white/5"
              style={{ gridColumn: 1, gridRow: rowIdx + 2 }}
            >
              {time}
            </span>
            {days.map((d, colIdx) => (
              <div
                key={`${time}-${d.label}`}
                className="border-t border-l border-white/5"
                style={{ gridColumn: colIdx + 2, gridRow: rowIdx + 2 }}
              />
            ))}
          </div>
        ))}

        {blocks.map((block) => (
          <div
            key={`${block.day}-${block.rowStart}-${block.label}`}
            className="rounded-md px-1.5 py-1 border text-[7px] leading-tight z-10 m-[2px] overflow-hidden flex flex-col gap-0.5"
            style={{
              gridColumn: block.day + 2,
              gridRow: `${block.rowStart + 2} / span ${block.rowSpan}`,
              backgroundColor: `${block.color}22`,
              borderColor: `${block.color}66`,
              borderLeft: `2px solid ${block.color}`,
            }}
          >
            <div className="flex items-center gap-1 min-w-0">
              {block.pet ? <PetStockAvatar pet={block.pet} size="sm" /> : null}
              <span className="font-semibold text-[#F8FAFC] truncate">{block.label}</span>
            </div>
            {block.breed ? <span className="text-[#94A3B8] truncate">{block.breed}</span> : null}
            <span style={{ color: block.color }} className="truncate">
              {block.time}
            </span>
          </div>
        ))}

        {nowRow !== undefined ? (
          <div
            className="absolute left-0 right-0 z-20 pointer-events-none"
            style={{ top: WEEK_HEADER_H + nowRow * WEEK_ROW_H }}
          >
            <div className="relative flex items-center">
              <span className="absolute -left-0.5 -top-[7px] text-[7px] font-semibold text-white bg-[#F43F5E] rounded px-1 py-[1px] leading-none">
                {nowLabel}
              </span>
              <span className="h-px w-full bg-[#F43F5E]" />
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function AutomationRow({
  title,
  items,
}: {
  title: string;
  items: { icon: LucideIcon; label: string; desc: string }[];
}) {
  return (
    <div className="mt-3 rounded-xl border border-[#8B5CF6]/25 bg-[#8B5CF6]/[0.06] p-3">
      <p className="text-[10px] font-semibold text-[#F8FAFC] flex items-center gap-1.5 mb-2.5">
        <Sparkles className="w-3.5 h-3.5 text-[#C4B5FD]" />
        {title}
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
        {items.map((item) => (
          <div key={item.label} className="flex flex-col gap-1">
            <span className="w-7 h-7 rounded-lg bg-[#8B5CF6]/15 border border-[#8B5CF6]/30 flex items-center justify-center">
              <item.icon className="w-3.5 h-3.5 text-[#C4B5FD]" />
            </span>
            <p className="text-[9px] font-medium text-[#F8FAFC] leading-tight">{item.label}</p>
            <p className="text-[8px] text-[#64748B] leading-snug">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function LineChart({
  points,
  height = 60,
  peakLabel,
  color = '#A78BFA',
}: {
  points: number[];
  height?: number;
  peakLabel?: string;
  color?: string;
}) {
  const w = 240;
  const h = height;
  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = max - min || 1;
  const coords = points.map((v, i) => {
    const x = (i / (points.length - 1)) * w;
    const y = h - 6 - ((v - min) / range) * (h - 14);
    return { x, y, v };
  });
  const line = coords.map((c, i) => `${i === 0 ? 'M' : 'L'}${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(' ');
  const area = `${line} L${w},${h} L0,${h} Z`;
  let peakIdx = 0;
  coords.forEach((c, i) => {
    if (c.v > coords[peakIdx].v) peakIdx = i;
  });
  const peak = coords[peakIdx];
  const peakFrac = peakIdx / (points.length - 1);
  return (
    <div className="relative w-full" style={{ height }}>
      <svg
        viewBox={`0 0 ${w} ${h}`}
        className="w-full h-full"
        preserveAspectRatio="none"
        aria-hidden
      >
        <defs>
          <linearGradient id="lineChartFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.35" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#lineChartFill)" />
        <path d={line} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      </svg>
      <span
        className="absolute w-2 h-2 rounded-full border-2 border-[#0B0B0F]"
        style={{
          backgroundColor: color,
          left: `${peakFrac * 100}%`,
          top: peak.y,
          transform: 'translate(-50%, -50%)',
        }}
      />
      {peakLabel ? (
        <span
          className="absolute text-[8px] font-semibold text-[#F8FAFC]"
          style={{ left: `${peakFrac * 100}%`, top: peak.y, transform: 'translate(-100%, -140%)' }}
        >
          {peakLabel}
        </span>
      ) : null}
    </div>
  );
}
