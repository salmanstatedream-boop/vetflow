'use client';

import type { FC, ReactNode } from 'react';
import { Calendar, Camera, FileText, Globe, Search } from 'lucide-react';
import type { ProblemChaosVisualKey } from '@/lib/home-data';
import { cn } from '@/lib/utils';

const toneBorder: Record<string, string> = {
  purple: 'border-[#8B5CF6]/30 shadow-[0_0_40px_rgba(139,92,246,0.12)]',
  orange: 'border-[#F97316]/30 shadow-[0_0_40px_rgba(249,115,22,0.12)]',
  blue: 'border-[#3B82F6]/30 shadow-[0_0_40px_rgba(59,130,246,0.12)]',
};

function VisualShell({
  tone,
  children,
  className,
}: {
  tone: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'rounded-xl border bg-[#0B1020]/80 p-4 min-h-[200px] flex items-center justify-center',
        toneBorder[tone] ?? toneBorder.purple,
        className,
      )}
    >
      {children}
    </div>
  );
}

function AppointmentsVisual() {
  return (
    <div className="w-full space-y-3 text-[10px]">
      <div className="flex justify-center gap-2">
        {[
          { label: 'Instagram', icon: Camera, color: 'text-[#E879F9]' },
          { label: 'Website', icon: Globe, color: 'text-[#22D3EE]' },
          { label: 'Google', icon: Search, color: 'text-[#93C5FD]' },
        ].map((src) => (
          <div key={src.label} className="flex flex-col items-center gap-1">
            <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
              <src.icon className={cn('w-4 h-4', src.color)} />
            </div>
            <span className="text-[#64748B]">{src.label}</span>
          </div>
        ))}
      </div>
      <div className="flex justify-center">
        <div className="w-px h-4 bg-dashed border-l border-dashed border-[#64748B]/50" />
      </div>
      <div className="flex justify-center">
        <div className="w-12 h-12 rounded-xl bg-[#8B5CF6]/20 border border-[#8B5CF6]/40 flex items-center justify-center">
          <Calendar className="w-6 h-6 text-[#C4B5FD]" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-1.5 pt-1">
        {['Double bookings', 'Missed slots', 'Manual updates', 'Frustrated clients'].map((w) => (
          <span
            key={w}
            className="text-center px-2 py-1 rounded-md bg-[#F97316]/10 border border-[#F97316]/25 text-[#FDBA74]"
          >
            {w}
          </span>
        ))}
      </div>
    </div>
  );
}

function RecordsVisual() {
  return (
    <div className="w-full space-y-2">
      <div className="rounded-lg border border-white/10 bg-white/5 p-3">
        <p className="text-[10px] font-mono text-[#64748B] mb-1">Patient Profile</p>
        <p className="text-sm font-semibold text-[#F8FAFC]">Bella · Golden Retriever</p>
        <div className="mt-2 space-y-1">
          <div className="h-1.5 w-full rounded bg-white/10" />
          <div className="h-1.5 w-4/5 rounded bg-white/10" />
          <div className="h-1.5 w-3/5 rounded bg-white/10" />
        </div>
      </div>
      <div className="flex flex-wrap gap-1">
        {['Labs.pdf', 'X-ray.jpg', 'Notes.doc', 'Invoice'].map((f) => (
          <span key={f} className="text-[9px] px-2 py-0.5 rounded bg-[#F97316]/10 text-[#FDBA74] border border-[#F97316]/20">
            {f}
          </span>
        ))}
      </div>
    </div>
  );
}

function LabsVisual() {
  const rows = [
    { test: 'WBC', value: '18.2', status: 'High', color: 'text-[#F97316]' },
    { test: 'RBC', value: '4.1', status: 'Low', color: 'text-[#3B82F6]' },
    { test: 'Glucose', value: '95', status: 'Normal', color: 'text-[#64748B]' },
  ];
  return (
    <div className="w-full">
      <p className="text-[10px] font-mono uppercase text-[#64748B] mb-2">IDEXX Lab Results</p>
      <div className="rounded-lg border border-white/10 overflow-hidden">
        {rows.map((row) => (
          <div key={row.test} className="flex items-center justify-between px-3 py-2 border-b border-white/5 last:border-0 text-xs">
            <span className="text-[#CBD5E1]">{row.test}</span>
            <span className="text-[#F8FAFC] font-mono">{row.value}</span>
            <span className={cn('text-[10px] font-medium', row.color)}>{row.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function InventoryVisual() {
  const items = [
    { label: 'Royal Canine', pct: 82 },
    { label: 'Cat Litter', pct: 14 },
    { label: 'Rabies Vaccine', pct: 61 },
  ];
  return (
    <div className="w-full space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-mono uppercase text-[#64748B]">Inventory Overview</p>
        <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/30">
          LOW
        </span>
      </div>
      {items.map((item) => (
        <div key={item.label}>
          <div className="flex justify-between text-[10px] mb-1">
            <span className="text-[#CBD5E1]">{item.label}</span>
            <span className={item.pct < 40 ? 'text-[#EF4444]' : 'text-[#64748B]'}>{item.pct}%</span>
          </div>
          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full',
                item.pct < 40
                  ? 'bg-gradient-to-r from-[#EF4444] to-[#F97316]'
                  : 'bg-gradient-to-r from-[#22D3EE] to-[#3B82F6]',
              )}
              style={{ width: `${item.pct}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function BillingVisual() {
  const invoices = [
    { id: '#1042', amount: '$248', status: 'Overdue', warn: true },
    { id: '#1038', amount: '$89', status: 'Pending', warn: false },
    { id: '#1035', amount: '$412', status: 'Paid', warn: false },
  ];
  return (
    <div className="w-full">
      <p className="text-[10px] font-mono uppercase text-[#64748B] mb-2">Billing Overview</p>
      <div className="space-y-2">
        {invoices.map((inv) => (
          <div
            key={inv.id}
            className={cn(
              'flex items-center justify-between rounded-lg px-3 py-2 border text-xs',
              inv.warn
                ? 'border-[#EF4444]/30 bg-[#EF4444]/5'
                : 'border-white/10 bg-white/5',
            )}
          >
            <span className="text-[#CBD5E1]">{inv.id}</span>
            <span className="text-[#F8FAFC] font-mono">{inv.amount}</span>
            <span className={inv.warn ? 'text-[#EF4444]' : 'text-[#64748B]'}>{inv.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function DischargeVisual() {
  const fields = ['Reason for Visit', 'Diagnosis', 'Treatment', 'Follow-up Instructions'];
  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-2">
        <FileText className="w-4 h-4 text-[#FDBA74]" />
        <p className="text-xs font-semibold text-[#F8FAFC]">Discharge Note — Max</p>
      </div>
      <div className="space-y-2">
        {fields.map((field) => (
          <div key={field} className="rounded-md border border-white/10 bg-white/5 p-2">
            <p className="text-[9px] text-[#64748B] mb-1">{field}</p>
            <div className="h-1.5 w-3/4 rounded bg-white/10" />
          </div>
        ))}
      </div>
    </div>
  );
}

function FollowupVisual() {
  const tasks = [
    { pet: 'Bella', task: 'Post-op check', status: 'Due Today', tone: 'purple' },
    { pet: 'Luna', task: 'Vaccine booster', status: 'Overdue', tone: 'red' },
    { pet: 'Cooper', task: 'Lab follow-up', status: 'This week', tone: 'blue' },
  ];
  const statusClass: Record<string, string> = {
    purple: 'bg-[#8B5CF6]/15 text-[#C4B5FD] border-[#8B5CF6]/30',
    red: 'bg-[#EF4444]/15 text-[#FCA5A5] border-[#EF4444]/30',
    blue: 'bg-[#3B82F6]/15 text-[#93C5FD] border-[#3B82F6]/30',
  };
  return (
    <div className="w-full">
      <p className="text-[10px] font-mono uppercase text-[#64748B] mb-2">Follow-up Dashboard</p>
      <div className="space-y-2">
        {tasks.map((t) => (
          <div key={t.pet} className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2">
            <div>
              <p className="text-xs font-medium text-[#F8FAFC]">{t.pet}</p>
              <p className="text-[10px] text-[#64748B]">{t.task}</p>
            </div>
            <span className={cn('text-[9px] px-2 py-0.5 rounded-full border', statusClass[t.tone])}>
              {t.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

const visualMap: Record<ProblemChaosVisualKey, FC> = {
  appointments: AppointmentsVisual,
  records: RecordsVisual,
  labs: LabsVisual,
  inventory: InventoryVisual,
  billing: BillingVisual,
  discharge: DischargeVisual,
  followup: FollowupVisual,
};

export default function ProblemChaosVisual({
  visual,
  tone,
}: {
  visual: ProblemChaosVisualKey;
  tone: string;
}) {
  const Component = visualMap[visual];
  return (
    <VisualShell tone={tone}>
      <Component />
    </VisualShell>
  );
}
