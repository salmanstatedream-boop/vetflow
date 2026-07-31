'use client';

import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function JourneyFrame({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('w-full text-left antialiased bg-[#0B1020] overflow-hidden', className)}>
      {children}
    </div>
  );
}

export function FeatureRail({
  badge,
  title,
  features,
  stat,
}: {
  badge: string;
  title: string;
  features: { icon: LucideIcon; label: string; desc: string }[];
  stat?: { label: string; value: string; delta: string };
}) {
  return (
    <div className="hidden md:flex flex-col w-[160px] xl:w-[180px] shrink-0 border-r border-white/10 p-3 bg-white/[0.02]">
      <p className="text-[8px] font-mono uppercase tracking-[0.16em] text-[#C4B5FD] mb-1.5">{badge}</p>
      <p className="text-xs font-semibold text-[#F8FAFC] leading-snug mb-3">{title}</p>
      <ul className="space-y-2.5 flex-1">
        {features.map((f) => (
          <li key={f.label} className="flex gap-2">
            <span className="w-6 h-6 rounded-md bg-[#8B5CF6]/15 border border-[#8B5CF6]/25 flex items-center justify-center shrink-0">
              <f.icon className="w-3 h-3 text-[#C4B5FD]" />
            </span>
            <div className="min-w-0">
              <p className="text-[9px] font-medium text-[#F8FAFC]">{f.label}</p>
              <p className="text-[8px] text-[#64748B] leading-snug">{f.desc}</p>
            </div>
          </li>
        ))}
      </ul>
      {stat ? (
        <div className="mt-3 rounded-lg border border-[#8B5CF6]/25 bg-[#8B5CF6]/10 p-2.5">
          <p className="text-[8px] text-[#94A3B8]">{stat.label}</p>
          <p className="text-lg font-bold text-[#F8FAFC] leading-none mt-1">{stat.value}</p>
          <p className="text-[8px] text-[#86EFAC] mt-1">{stat.delta}</p>
        </div>
      ) : null}
    </div>
  );
}

export function KpiStrip({
  items,
}: {
  items: { label: string; value: string; delta?: string; icon: LucideIcon }[];
}) {
  return (
    <div
      className={cn(
        'grid gap-2 border-t border-white/10 px-3 py-2.5 bg-[#0B1020]/90',
        items.length <= 4 ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5',
      )}
    >
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-2 min-w-0 rounded-lg border border-white/10 bg-white/[0.03] px-2 py-1.5">
          <span className="w-7 h-7 rounded-md bg-[#8B5CF6]/15 border border-[#8B5CF6]/25 flex items-center justify-center shrink-0">
            <item.icon className="w-3.5 h-3.5 text-[#C4B5FD]" />
          </span>
          <div className="min-w-0">
            <p className="text-[11px] font-bold text-[#F8FAFC] leading-none">{item.value}</p>
            <p className="text-[7px] text-[#64748B] mt-0.5 truncate">{item.label}</p>
            {item.delta ? <p className="text-[7px] text-[#86EFAC]">{item.delta}</p> : null}
          </div>
        </div>
      ))}
    </div>
  );
}

export function SummaryCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.03] p-2.5">
      <p className="text-[9px] font-semibold text-[#F8FAFC] mb-2">{title}</p>
      {children}
    </div>
  );
}

export function TimelineItem({
  label,
  state,
}: {
  label: string;
  state: 'done' | 'active' | 'pending';
}) {
  return (
    <div className="flex items-center gap-2 text-[8px]">
      <span
        className={cn(
          'w-2 h-2 rounded-full shrink-0',
          state === 'done' && 'bg-[#22C55E]',
          state === 'active' && 'bg-[#8B5CF6] ring-2 ring-[#8B5CF6]/35',
          state === 'pending' && 'border border-[#64748B]',
        )}
      />
      <span className={state === 'pending' ? 'text-[#64748B]' : 'text-[#E2E8F0]'}>{label}</span>
    </div>
  );
}
