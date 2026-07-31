'use client';

import {
  CreditCard,
  DollarSign,
  FileText,
  Receipt,
  ShieldCheck,
} from 'lucide-react';
import {
  PetStockAvatar,
  StatusPill,
  ToolbarButton,
} from '@/components/home/solution-dashboard-visuals/shared';
import { FeatureRail, JourneyFrame, KpiStrip, SummaryCard, TimelineItem } from './shared';

const ITEMS = [
  { desc: 'Consultation', qty: 1, price: '2,500', total: '2,500' },
  { desc: 'IV Fluid Therapy', qty: 1, price: '3,500', total: '3,500' },
  { desc: 'Maropitant Injection', qty: 1, price: '1,800', total: '1,800' },
  { desc: 'Probiotic Paste', qty: 1, price: '1,450', total: '1,450' },
];

export default function BillingJourneyVisual() {
  return (
    <JourneyFrame>
      <div className="flex min-w-0">
        <FeatureRail
          badge="BILLING"
          title="Simple for You. Transparent for Clients."
          features={[
            { icon: FileText, label: 'Auto Invoice', desc: 'Generated from treatment' },
            { icon: CreditCard, label: 'Multiple Payments', desc: 'Card, cash, transfer' },
            { icon: ShieldCheck, label: 'Insurance Friendly', desc: 'Claims-ready exports' },
            { icon: Receipt, label: 'Instant Receipts', desc: 'Print or email' },
          ]}
          stat={{ label: 'Invoices Generated Today', value: '18', delta: '↑ 22% vs yesterday' }}
        />
        <div className="flex-1 min-w-0 p-2.5 sm:p-3">
          <div className="flex items-center gap-2 mb-2">
            <PetStockAvatar pet="bruno" size="md" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-[#F8FAFC]">Invoice for Bruno</p>
              <p className="text-[8px] text-[#64748B]">May 12 · Dr. Sarah · Vomiting, Diarrhea</p>
            </div>
          </div>
          <div className="flex gap-1 mb-2 text-[8px]">
            {['Invoice Items', 'Payments', 'History'].map((t, i) => (
              <span
                key={t}
                className={`px-2 py-1 rounded-md border ${
                  i === 0
                    ? 'border-[#8B5CF6]/40 text-[#C4B5FD] bg-[#8B5CF6]/10'
                    : 'border-white/10 text-[#64748B]'
                }`}
              >
                {t}
              </span>
            ))}
          </div>
          <div className="grid sm:grid-cols-[1fr_140px] gap-2">
            <div className="rounded-lg border border-white/10 overflow-hidden">
              <div className="grid grid-cols-[1.4fr_0.4fr_0.6fr_0.6fr] gap-1 px-2 py-1.5 bg-white/[0.04] text-[7px] uppercase text-[#64748B]">
                <span>Description</span>
                <span>Qty</span>
                <span>Price</span>
                <span>Total</span>
              </div>
              {ITEMS.map((row) => (
                <div
                  key={row.desc}
                  className="grid grid-cols-[1.4fr_0.4fr_0.6fr_0.6fr] gap-1 px-2 py-1.5 border-t border-white/5 text-[8px]"
                >
                  <span className="text-[#E2E8F0] truncate">{row.desc}</span>
                  <span className="text-[#94A3B8]">{row.qty}</span>
                  <span className="text-[#94A3B8]">{row.price}</span>
                  <span className="text-[#F8FAFC]">{row.total}</span>
                </div>
              ))}
            </div>
            <div className="rounded-lg border border-white/10 bg-white/[0.03] p-2.5">
              <p className="text-[8px] text-[#64748B]">Subtotal</p>
              <p className="text-[10px] text-[#F8FAFC]">9,250</p>
              <p className="text-[8px] text-[#64748B] mt-1">Discount</p>
              <p className="text-[10px] text-[#F97316]">-500</p>
              <p className="text-[8px] text-[#64748B] mt-2">Total</p>
              <p className="text-lg font-bold text-[#F8FAFC]">8,750</p>
              <div className="mt-2 flex flex-col gap-1">
                <ToolbarButton primary>Record Payment</ToolbarButton>
                <ToolbarButton>Download / Print</ToolbarButton>
              </div>
            </div>
          </div>
        </div>
        <div className="hidden lg:block w-[150px] shrink-0 border-l border-white/10 p-2.5 space-y-2">
          <SummaryCard title="Patient Summary">
            <PetStockAvatar pet="bruno" size="sm" />
            <p className="text-[9px] text-[#F8FAFC] mt-1">Bruno</p>
            <p className="text-[8px] text-[#64748B]">Owner: Sarah Johnson</p>
            <StatusPill label="Active" tone="green" />
          </SummaryCard>
          <div className="space-y-1.5">
            <TimelineItem label="Invoice Created" state="done" />
            <TimelineItem label="Payment Pending" state="active" />
            <TimelineItem label="Payment Received" state="pending" />
            <TimelineItem label="Receipt Sent" state="pending" />
          </div>
        </div>
      </div>
      <KpiStrip
        items={[
          { label: 'Invoices Generated', value: '18', delta: '↑ 22%', icon: FileText },
          { label: 'Total Revenue', value: '156k', delta: '↑ 18%', icon: DollarSign },
          { label: 'Payments Received', value: '98k', delta: '↑ 15%', icon: CreditCard },
          { label: 'Outstanding', value: '57k', icon: Receipt },
          { label: 'Collection Rate', value: '89%', delta: '↑ 6%', icon: ShieldCheck },
        ]}
      />
    </JourneyFrame>
  );
}
