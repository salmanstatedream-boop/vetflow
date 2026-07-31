'use client';

import {
  type LucideIcon,
  CreditCard,
  Droplets,
  FileText,
  Leaf,
  Percent,
  Pill,
  Plus,
  Printer,
  Receipt,
  Stethoscope,
  Syringe,
  TestTube,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import { PetStockAvatar, ToolbarButton } from '@/components/home/solution-dashboard-visuals/shared';
import {
  FeatureRail,
  JourneyFrame,
  JourneyScreenMotion,
  KpiStrip,
  MotionSlot,
  StatusBadge,
  SummaryCard,
  TimelineItem,
} from './shared';

const ITEMS: { icon: LucideIcon; item: string; desc: string; qty: number; price: string; total: string }[] = [
  { icon: Stethoscope, item: 'Consultation', desc: 'General consultation fee', qty: 1, price: '1,500', total: '1,500' },
  { icon: Droplets, item: 'IV Fluid Therapy', desc: "Ringer's Lactate", qty: 1, price: '2,800', total: '2,800' },
  { icon: Syringe, item: 'Maropitant Injection', desc: 'Antiemetic', qty: 1, price: '1,200', total: '1,200' },
  { icon: Pill, item: 'Metronidazole', desc: '15 mg/kg', qty: 10, price: '80', total: '800' },
  { icon: Leaf, item: 'Probiotic Paste', desc: 'Gut Support', qty: 1, price: '950', total: '950' },
  { icon: TestTube, item: 'CBC Test', desc: 'Complete Blood Count', qty: 1, price: '2,000', total: '2,000' },
];

export default function BillingJourneyVisual({
  reducedMotion = false,
}: {
  reducedMotion?: boolean;
}) {
  return (
    <JourneyScreenMotion reducedMotion={reducedMotion}>
      <JourneyFrame>
        <div className="flex min-w-0">
          <MotionSlot slot="rail">
            <FeatureRail
              badge="SMOOTH BILLING. STRONGER CASHFLOW."
              title="Simple for You."
              titleAccent="Transparent for Clients."
              features={[
                { icon: Receipt, label: 'Auto Invoice Generation', desc: 'Creates professional invoices in seconds.' },
                { icon: CreditCard, label: 'Multiple Payment Options', desc: 'Cash, Card, Bank Transfer or Digital Wallets.' },
                { icon: FileText, label: 'Insurance Friendly', desc: 'Generate claim-ready invoices instantly.' },
                { icon: Percent, label: 'Discounts & Packages', desc: 'Apply offers, packages and loyalty discounts easily.' },
                { icon: Wallet, label: 'Payment Tracking', desc: 'Track all payments and outstanding balances.' },
              ]}
              stat={{ label: 'Invoices Generated Today', value: '18', delta: '+22% vs yesterday', sparkline: true }}
            />
          </MotionSlot>

          <MotionSlot slot="main" className="flex-1 min-w-0 p-3 sm:p-4">
            <p className="text-sm font-semibold text-[#F8FAFC] mb-3">Invoice for Bruno</p>

            <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 mb-3">
              <div className="flex items-center gap-2.5 flex-wrap">
                <PetStockAvatar pet="bruno" size="lg" />
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold text-[#F8FAFC]">Bruno</p>
                  <p className="text-[8px] text-[#64748B]">Golden Retriever · 3Y · Male · 32kg</p>
                </div>
                <div className="flex flex-wrap gap-x-5 gap-y-1 ml-auto text-[8px]">
                  <div>
                    <p className="text-[#64748B]">Visit Date</p>
                    <p className="text-[#CBD5E1]">May 12, 2026 · 09:15 AM</p>
                  </div>
                  <div>
                    <p className="text-[#64748B]">Doctor</p>
                    <p className="text-[#CBD5E1]">Dr. Sarah Johnson</p>
                  </div>
                  <div>
                    <p className="text-[#64748B]">Reason</p>
                    <p className="text-[#CBD5E1]">Vomiting, Diarrhea</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mb-3 text-[9px] border-b border-white/10 pb-2">
              {['Invoice Items', 'Payments', 'History'].map((t, i) => (
                <span
                  key={t}
                  className={
                    i === 0
                      ? 'text-[#C4B5FD] font-semibold border-b-2 border-[#8B5CF6] pb-2 -mb-2'
                      : 'text-[#64748B]'
                  }
                >
                  {t}
                </span>
              ))}
            </div>

            <div className="grid lg:grid-cols-[1fr_190px] gap-3">
              <div>
                <div className="rounded-xl border border-white/10 overflow-hidden overflow-x-auto">
                  <table className="w-full min-w-[480px] text-left">
                    <thead>
                      <tr className="bg-white/[0.04] text-[8px] uppercase tracking-wider text-[#64748B]">
                        <th className="px-2.5 py-2 font-medium">Item</th>
                        <th className="px-2.5 py-2 font-medium">Description</th>
                        <th className="px-2.5 py-2 font-medium">Qty</th>
                        <th className="px-2.5 py-2 font-medium">Price (PKR)</th>
                        <th className="px-2.5 py-2 font-medium">Tax</th>
                        <th className="px-2.5 py-2 font-medium">Total (PKR)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ITEMS.map((row) => (
                        <tr key={row.item} className="border-t border-white/5 text-[9px]">
                          <td className="px-2.5 py-2">
                            <span className="flex items-center gap-1.5 font-medium text-[#F8FAFC]">
                              <span className="w-5 h-5 rounded-md bg-[#8B5CF6]/15 border border-[#8B5CF6]/25 flex items-center justify-center shrink-0">
                                <row.icon className="w-2.5 h-2.5 text-[#C4B5FD]" />
                              </span>
                              {row.item}
                            </span>
                          </td>
                          <td className="px-2.5 py-2 text-[#94A3B8]">{row.desc}</td>
                          <td className="px-2.5 py-2 text-[#CBD5E1]">{row.qty}</td>
                          <td className="px-2.5 py-2 text-[#CBD5E1] tabular-nums">{row.price}</td>
                          <td className="px-2.5 py-2 text-[#64748B]">0%</td>
                          <td className="px-2.5 py-2 text-[#F8FAFC] tabular-nums font-medium">{row.total}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <button type="button" className="mt-2 w-full flex items-center justify-center gap-1 rounded-lg border border-dashed border-[#8B5CF6]/35 text-[9px] text-[#C4B5FD] py-1.5 hover:bg-[#8B5CF6]/10 transition-colors">
                  <Plus className="w-3 h-3" /> Add Item
                </button>

                <SummaryCard className="mt-3">
                  <p className="text-[9px] font-semibold text-[#F8FAFC] mb-1">Notes</p>
                  <p className="text-[8px] text-[#94A3B8]">Follow-up after 3 days. Monitor appetite and hydration.</p>
                </SummaryCard>
              </div>

              <SummaryCard className="h-fit">
                <div className="space-y-1.5 text-[9px]">
                  <p className="flex justify-between text-[#94A3B8]">
                    <span>Subtotal</span>
                    <span className="tabular-nums">9,250</span>
                  </p>
                  <p className="flex justify-between text-[#94A3B8]">
                    <span>Discount</span>
                    <span className="tabular-nums text-[#86EFAC]">- 500</span>
                  </p>
                  <p className="flex justify-between text-[#94A3B8]">
                    <span>Tax (0%)</span>
                    <span className="tabular-nums">0</span>
                  </p>
                  <div className="pt-2 border-t border-white/10 flex justify-between items-baseline">
                    <span className="text-[10px] font-semibold text-[#F8FAFC]">Total</span>
                    <span className="text-lg font-bold text-[#A78BFA] tabular-nums">8,750</span>
                  </div>
                  <p className="flex justify-between text-[#94A3B8] pt-1">
                    <span>Amount Paid</span>
                    <span className="tabular-nums">0</span>
                  </p>
                </div>
                <div className="mt-2 rounded-lg border border-[#8B5CF6]/35 bg-[#8B5CF6]/10 px-2.5 py-2 flex justify-between items-baseline">
                  <span className="text-[9px] text-[#C4B5FD]">Balance Due</span>
                  <span className="text-sm font-bold text-[#F8FAFC] tabular-nums">
                    8,750 <span className="text-[8px] text-[#C4B5FD]">PKR</span>
                  </span>
                </div>
                <div className="flex flex-col gap-1.5 mt-3">
                  <ToolbarButton primary>
                    <span className="inline-flex items-center gap-1">
                      <CreditCard className="w-3 h-3" /> Record Payment
                    </span>
                  </ToolbarButton>
                  <ToolbarButton>
                    <span className="inline-flex items-center gap-1">
                      <Printer className="w-3 h-3" /> Download / Print Invoice
                    </span>
                  </ToolbarButton>
                </div>
              </SummaryCard>
            </div>
          </MotionSlot>

          <MotionSlot slot="aside" className="hidden lg:flex flex-col w-[200px] xl:w-[220px] shrink-0 border-l border-white/10 p-3 gap-3">
            <SummaryCard title="Patient Summary">
              <div className="flex items-center gap-2.5 mb-2.5">
                <PetStockAvatar pet="bruno" size="lg" />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-[11px] font-semibold text-[#F8FAFC]">Bruno</p>
                    <StatusBadge label="Active" tone="green" />
                  </div>
                  <p className="text-[8px] text-[#64748B]">Golden Retriever · 3Y · Male · 32kg</p>
                </div>
              </div>
              <div className="space-y-1.5 text-[8px] text-[#94A3B8]">
                <p>
                  <span className="text-[#64748B]">Owner </span>Sarah Johnson
                </p>
                <p>
                  <span className="text-[#64748B]">Phone </span>+1 (555) 123-4567
                </p>
                <p>
                  <span className="text-[#64748B]">Email </span>sarah.johnson@email.com
                </p>
                <p>
                  <span className="text-[#64748B]">Total Visits </span>8
                </p>
                <p>
                  <span className="text-[#64748B]">Last Visit </span>May 12, 2026
                </p>
              </div>
            </SummaryCard>
            <SummaryCard title="Billing Status">
              <div className="space-y-2.5">
                <TimelineItem label="Invoice Created" state="done" sub="May 12, 2026 · 10:20 AM" />
                <TimelineItem label="Payment Pending" state="active" sub="8,750 PKR · Due in 7 days" />
                <TimelineItem label="Payment Received" state="pending" />
                <TimelineItem label="Receipt Sent" state="pending" sub="Pending" />
              </div>
              <p className="text-[9px] text-[#C4B5FD] mt-3">View All Invoices →</p>
            </SummaryCard>
          </MotionSlot>
        </div>

        <MotionSlot slot="footer">
          <KpiStrip
            items={[
              { icon: Receipt, label: 'Invoices Generated', value: '18', delta: '↑ 22% vs yesterday' },
              { icon: TrendingUp, label: 'Total Revenue', value: 'PKR 156,250', delta: '↑ 18% vs yesterday' },
              { icon: Wallet, label: 'Payments Received', value: 'PKR 98,500', delta: '↑ 15% vs yesterday', tone: 'green' },
              { icon: CreditCard, label: 'Outstanding Balance', value: 'PKR 57,750', delta: '↑ 10% vs yesterday', tone: 'amber' },
              { icon: Percent, label: 'Collection Rate', value: '89%', delta: '↑ 6% vs yesterday', tone: 'teal' },
            ]}
          />
        </MotionSlot>
      </JourneyFrame>
    </JourneyScreenMotion>
  );
}
