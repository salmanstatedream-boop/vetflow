'use client';

import { CheckCircle2, Clock, CreditCard, DollarSign, Receipt } from 'lucide-react';
import {
  AvatarChip,
  CategoryBar,
  DashboardShell,
  MiniStatCard,
  PanelHeader,
  SearchRow,
  StatusPill,
  TabBar,
  ToolbarButton,
} from './shared';

const INVOICES = [
  { patient: 'Bella', id: 'INV-1042', amount: '$285.00', date: 'May 12', status: 'Paid', tone: 'green' as const },
  { patient: 'Max', id: 'INV-1041', amount: '$420.00', date: 'May 11', status: 'Pending', tone: 'orange' as const },
  { patient: 'Luna', id: 'INV-1040', amount: '$156.00', date: 'May 10', status: 'Overdue', tone: 'red' as const },
  { patient: 'Rocky', id: 'INV-1039', amount: '$890.00', date: 'May 09', status: 'Paid', tone: 'green' as const },
];

export default function BillingVisual() {
  return (
    <DashboardShell className="p-2 sm:p-3">
      <div className="grid lg:grid-cols-[1fr_150px] gap-3">
        <div className="space-y-2 min-w-0">
          <PanelHeader
            title="Billing Overview"
            actions={
              <div className="flex gap-1">
                <ToolbarButton>All Locations ▾</ToolbarButton>
                <ToolbarButton>This Month 📅</ToolbarButton>
              </div>
            }
          />

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            <MiniStatCard label="Revenue" value="$42k" delta="↑ 15% vs last month" icon={DollarSign} iconTone="purple" />
            <MiniStatCard label="Invoices Sent" value="186" delta="↑ 8% vs last month" icon={Receipt} iconTone="blue" />
            <MiniStatCard label="Collection Rate" value="94%" delta="↑ 3% vs last month" icon={CheckCircle2} iconTone="green" />
            <MiniStatCard label="Outstanding" value="$3.2k" delta="12 pending" deltaTone="orange" icon={Clock} iconTone="orange" />
          </div>

          <TabBar tabs={['Recent Invoices', 'Pending', 'Overdue', 'All Invoices']} active="Recent Invoices" />
          <SearchRow placeholder="Search invoices..." />

          <div className="rounded-lg border border-white/10 overflow-hidden">
            <div className="grid grid-cols-[1fr_0.75fr_0.65fr_0.55fr_0.65fr] gap-1 px-2 py-1.5 bg-white/[0.04] text-[7px] font-medium text-[#64748B] uppercase">
              <span>Patient</span>
              <span>Invoice</span>
              <span>Amount</span>
              <span>Date</span>
              <span>Status</span>
            </div>
            {INVOICES.map((row) => (
              <div
                key={row.id}
                className="grid grid-cols-[1fr_0.75fr_0.65fr_0.55fr_0.65fr] gap-1 px-2 py-1.5 border-t border-white/5 text-[8px] items-center even:bg-white/[0.02]"
              >
                <span className="flex items-center gap-1.5">
                  <AvatarChip name={row.patient} color="#8B5CF6" />
                  <span className="text-[#F8FAFC]">{row.patient}</span>
                </span>
                <span className="text-[#64748B]">{row.id}</span>
                <span className="text-[#F8FAFC] font-medium">{row.amount}</span>
                <span className="text-[#94A3B8]">{row.date}</span>
                <StatusPill label={row.status} tone={row.tone} />
              </div>
            ))}
          </div>
          <p className="text-[8px] text-[#8B5CF6] font-medium">View all invoices →</p>
        </div>

        <div className="space-y-2 hidden lg:block">
          <div className="rounded-lg border border-white/10 bg-white/[0.02] p-2.5">
            <PanelHeader title="Collection Insights" />
            <div className="space-y-2">
              <CategoryBar label="Paid" pct={94} tone="green" />
              <CategoryBar label="Pending" pct={4} tone="orange" />
              <CategoryBar label="Overdue" pct={2} tone="orange" />
            </div>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/[0.02] p-2.5">
            <PanelHeader title="Payment Methods" />
            <div className="space-y-1.5 text-[8px]">
              <div className="flex items-center gap-2 text-[#94A3B8]"><CreditCard className="w-3 h-3 text-[#C4B5FD]" /> Card — 62%</div>
              <div className="flex items-center gap-2 text-[#94A3B8]"><DollarSign className="w-3 h-3 text-[#86EFAC]" /> Cash — 28%</div>
              <div className="flex items-center gap-2 text-[#94A3B8]"><Receipt className="w-3 h-3 text-[#93C5FD]" /> Transfer — 10%</div>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
