'use client';

import { AlertTriangle, CheckCircle2, Clock, CreditCard, DollarSign, Receipt } from 'lucide-react';
import type { SolutionPetKey } from '@/lib/solution-mockup-assets';
import {
  CategoryBar,
  DashboardShell,
  MiniStatCard,
  PanelHeader,
  PaymentDonut,
  PetStockAvatar,
  SearchRow,
  StatusPill,
  TabBar,
  ToolbarButton,
} from './shared';

const INVOICES: {
  id: string;
  pet: SolutionPetKey;
  patient: string;
  date: string;
  amount: string;
  status: string;
  dueDate: string;
  tone: 'green' | 'blue' | 'orange' | 'red';
}[] = [
  { id: 'INV-1042', pet: 'bella', patient: 'Bella', date: 'May 12', amount: '$285.00', status: 'Paid', dueDate: 'May 12', tone: 'green' },
  { id: 'INV-1041', pet: 'max', patient: 'Max', date: 'May 11', amount: '$420.00', status: 'Partially Paid', dueDate: 'May 18', tone: 'blue' },
  { id: 'INV-1040', pet: 'luna', patient: 'Luna', date: 'May 10', amount: '$156.00', status: 'Pending', dueDate: 'May 20', tone: 'orange' },
  { id: 'INV-1039', pet: 'rocky', patient: 'Rocky', date: 'May 09', amount: '$890.00', status: 'Overdue', dueDate: 'May 05', tone: 'red' },
  { id: 'INV-1038', pet: 'milo', patient: 'Milo', date: 'May 08', amount: '$312.00', status: 'Paid', dueDate: 'May 08', tone: 'green' },
];

export default function BillingVisual() {
  return (
    <DashboardShell className="p-2 sm:p-3">
      <div className="grid lg:grid-cols-[1fr_160px] gap-3">
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
            <MiniStatCard label="Total Billed" value="$124,830" delta="↑ 12% vs last month" icon={DollarSign} iconTone="purple" />
            <MiniStatCard label="Collected" value="$93,845" delta="↑ 8% vs last month" icon={CheckCircle2} iconTone="green" />
            <MiniStatCard label="Pending" value="$22,178" delta="18 invoices" deltaTone="orange" icon={Clock} iconTone="orange" />
            <MiniStatCard label="Overdue" value="$8,823" delta="6 accounts" deltaTone="red" icon={AlertTriangle} iconTone="red" />
          </div>

          <TabBar tabs={['Recent Invoices', 'Payments', 'Adjustments', 'Claims', 'Refunds']} active="Recent Invoices" />
          <SearchRow placeholder="Search invoices..." />

          <div className="rounded-lg border border-white/10 overflow-hidden">
            <div className="grid grid-cols-[0.75fr_1fr_0.55fr_0.65fr_0.75fr_0.65fr_0.45fr] gap-1 px-2 py-1.5 bg-white/[0.04] text-[7px] font-medium text-[#64748B] uppercase">
              <span>Invoice ID</span>
              <span>Patient</span>
              <span>Date</span>
              <span>Amount</span>
              <span>Status</span>
              <span>Due Date</span>
              <span>Actions</span>
            </div>
            {INVOICES.map((row) => (
              <div
                key={row.id}
                className="grid grid-cols-[0.75fr_1fr_0.55fr_0.65fr_0.75fr_0.65fr_0.45fr] gap-1 px-2 py-1.5 border-t border-white/5 text-[8px] items-center even:bg-white/[0.02]"
              >
                <span className="text-[#64748B]">{row.id}</span>
                <span className="flex items-center gap-1.5 min-w-0">
                  <PetStockAvatar pet={row.pet} size="sm" />
                  <span className="text-[#F8FAFC] truncate">{row.patient}</span>
                </span>
                <span className="text-[#94A3B8]">{row.date}</span>
                <span className="text-[#F8FAFC] font-medium">{row.amount}</span>
                <StatusPill label={row.status} tone={row.tone} />
                <span className="text-[#64748B]">{row.dueDate}</span>
                <span className="text-[#8B5CF6] font-medium">View</span>
              </div>
            ))}
          </div>
          <p className="text-[8px] text-[#8B5CF6] font-medium">View all invoices →</p>
        </div>

        <div className="space-y-2 hidden lg:block">
          <div className="rounded-lg border border-white/10 bg-white/[0.02] p-2.5">
            <PanelHeader title="Payment Collection" />
            <PaymentDonut collectedPct={75} centerValue="75%" />
          </div>
          <div className="rounded-lg border border-white/10 bg-white/[0.02] p-2.5">
            <PanelHeader title="Top Payment Modes" />
            <div className="space-y-2">
              <CategoryBar label="Card" pct={62} tone="purple" />
              <CategoryBar label="Cash" pct={28} tone="green" />
              <CategoryBar label="Transfer" pct={10} tone="blue" />
            </div>
            <div className="mt-2 space-y-1 text-[8px] text-[#64748B]">
              <div className="flex items-center gap-2"><CreditCard className="w-3 h-3 text-[#C4B5FD]" /> Card — 62%</div>
              <div className="flex items-center gap-2"><DollarSign className="w-3 h-3 text-[#86EFAC]" /> Cash — 28%</div>
              <div className="flex items-center gap-2"><Receipt className="w-3 h-3 text-[#93C5FD]" /> Transfer — 10%</div>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
