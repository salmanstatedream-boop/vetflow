'use client';

import {
  Check,
  FileText,
  FlaskConical,
  Pencil,
  Pill,
  Plus,
  Printer,
  Share2,
  Trash2,
} from 'lucide-react';
import {
  PetStockAvatar,
  ProductThumb,
  ToolbarButton,
} from '@/components/home/solution-dashboard-visuals/shared';
import type { SolutionProductKey } from '@/lib/solution-mockup-assets';
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

const PLAN = [
  { name: 'IV Fluid Therapy', detail: "Ringer's Lactate" },
  { name: 'Maropitant', detail: '1 mg/kg IV once daily' },
  { name: 'Metronidazole', detail: '15 mg/kg PO q12 hours' },
  { name: 'Probiotic Paste', detail: '1 ml/kg PO once daily' },
];

const RX: { name: string; cat: string; dose: string; freq: string; product: SolutionProductKey }[] = [
  { name: 'Maropitant Citrate', cat: 'Antiemetic', dose: '1 mg/kg', freq: 'Once daily', product: 'syringe' },
  { name: 'Metronidazole', cat: 'Antibacterial', dose: '15 mg/kg', freq: 'Every 12 hours', product: 'amoxicillin' },
  { name: 'Probiotic Paste', cat: 'Gut Support', dose: '1 ml/kg', freq: 'Once daily', product: 'strips' },
];

const LABS = [
  { name: 'CBC', checked: true },
  { name: 'Serum Biochemistry', checked: true },
  { name: 'Fecal Examination', checked: true },
];

const INSTRUCTIONS = [
  'Feed small, easily digestible meals.',
  'Ensure fresh water at all times.',
  'Avoid fatty foods and treats.',
  'Monitor for vomiting or diarrhea.',
  'Recheck if symptoms persist.',
];

function AddRow({ label }: { label: string }) {
  return (
    <button
      type="button"
      className="mt-2 w-full flex items-center justify-center gap-1 rounded-lg border border-dashed border-[#8B5CF6]/35 text-[8px] text-[#C4B5FD] py-1.5 hover:bg-[#8B5CF6]/10 transition-colors"
    >
      <Plus className="w-3 h-3" /> {label}
    </button>
  );
}

export default function TreatmentJourneyVisual({
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
              badge="TREATMENT. MADE EASY."
              title="Everything You"
              titleAccent="Need, In One Place."
              features={[
                { icon: Pill, label: 'Generate Prescriptions', desc: 'Create accurate prescriptions in seconds.' },
                { icon: FlaskConical, label: 'Add Lab Requests', desc: 'Select tests and send requests instantly.' },
                { icon: FileText, label: 'Save Treatment Plans', desc: 'Reuse saved care plans for future.' },
                { icon: Share2, label: 'Discharge Instructions', desc: 'Provide clear care instructions.' },
                { icon: Printer, label: 'Share Instantly', desc: 'Print or share via SMS, Email or WhatsApp.' },
              ]}
              stat={{ label: 'Treatments Created Today', value: '12', delta: '+18% vs yesterday', sparkline: true }}
            />
          </MotionSlot>

          <MotionSlot slot="main" className="flex-1 min-w-0 p-3 sm:p-4">
            <p className="text-sm font-semibold text-[#F8FAFC] mb-3">Treatment for Bruno</p>

            <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 mb-3">
              <div className="flex items-center gap-2.5 flex-wrap">
                <PetStockAvatar pet="bruno" size="lg" />
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold text-[#F8FAFC]">Bruno</p>
                  <p className="text-[8px] text-[#64748B]">Golden Retriever · 3Y · Male · 32kg</p>
                </div>
                <div className="flex flex-wrap gap-x-5 gap-y-1 ml-auto text-[8px]">
                  <div>
                    <p className="text-[#64748B]">Diagnosis</p>
                    <p className="text-[#CBD5E1]">Acute Gastroenteritis</p>
                  </div>
                  <div>
                    <p className="text-[#64748B]">Consultation Time</p>
                    <p className="text-[#CBD5E1]">May 12, 2026 · 09:15 AM</p>
                  </div>
                  <div>
                    <p className="text-[#64748B]">Doctor</p>
                    <p className="text-[#CBD5E1]">Dr. Sarah Johnson</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mb-3 text-[9px] border-b border-white/10 pb-2 overflow-x-auto scrollbar-none">
              {['Treatment Plan', 'Prescriptions', 'Lab Requests', 'Client Instructions'].map((t, i) => (
                <span
                  key={t}
                  className={
                    i === 0
                      ? 'text-[#C4B5FD] font-semibold border-b-2 border-[#8B5CF6] pb-2 -mb-2 whitespace-nowrap'
                      : 'text-[#64748B] whitespace-nowrap'
                  }
                >
                  {t}
                </span>
              ))}
            </div>

            <div className="grid md:grid-cols-2 gap-2.5">
              <SummaryCard title="Treatment Plan">
                <ul className="space-y-2">
                  {PLAN.map((item) => (
                    <li key={item.name} className="flex items-start gap-2 text-[9px]">
                      <span className="w-4 h-4 rounded-full bg-[#8B5CF6]/20 border border-[#8B5CF6]/40 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-2.5 h-2.5 text-[#C4B5FD]" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-[#E2E8F0] font-medium">{item.name}</p>
                        <p className="text-[8px] text-[#64748B]">{item.detail}</p>
                      </div>
                    </li>
                  ))}
                </ul>
                <AddRow label="Add Treatment Item" />
              </SummaryCard>

              <SummaryCard title="Prescriptions">
                <div className="space-y-2">
                  {RX.map((rx) => (
                    <div key={rx.name} className="rounded-lg border border-white/10 bg-white/[0.02] p-2 flex items-center gap-2">
                      <ProductThumb product={rx.product} className="w-8 h-8" />
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-semibold text-[#F8FAFC] truncate">{rx.name}</p>
                        <p className="text-[8px] text-[#C4B5FD]">{rx.cat}</p>
                      </div>
                      <div className="text-[8px] text-[#94A3B8] text-right shrink-0">
                        <p>
                          <span className="text-[#64748B]">Dose </span>
                          {rx.dose}
                        </p>
                        <p>
                          <span className="text-[#64748B]">Freq </span>
                          {rx.freq}
                        </p>
                      </div>
                      <span className="flex gap-1.5 text-[#64748B] shrink-0">
                        <Pencil className="w-3 h-3" />
                        <Trash2 className="w-3 h-3" />
                      </span>
                    </div>
                  ))}
                </div>
                <AddRow label="Add Prescription" />
              </SummaryCard>

              <SummaryCard title="Lab Requests">
                <ul className="space-y-1.5">
                  {LABS.map((lab) => (
                    <li key={lab.name} className="flex items-center gap-2 text-[9px] text-[#CBD5E1]">
                      <span className="w-3.5 h-3.5 rounded border border-[#8B5CF6]/50 bg-[#8B5CF6]/20 flex items-center justify-center">
                        <Check className="w-2 h-2 text-[#C4B5FD]" />
                      </span>
                      {lab.name}
                    </li>
                  ))}
                </ul>
                <AddRow label="Add Test" />
              </SummaryCard>

              <SummaryCard title="Client Instructions">
                <ul className="space-y-1 text-[8px] text-[#94A3B8] list-disc list-inside">
                  {INSTRUCTIONS.map((i) => (
                    <li key={i}>{i}</li>
                  ))}
                </ul>
                <AddRow label="Add Instruction" />
              </SummaryCard>
            </div>

            <div className="flex flex-wrap gap-2 mt-3">
              <ToolbarButton primary>Generate Prescription</ToolbarButton>
              <ToolbarButton>Save Treatment Plan</ToolbarButton>
              <ToolbarButton>Print / Share</ToolbarButton>
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
                  <p className="text-[8px] text-[#64748B]">Golden Retriever · 3Y · Male</p>
                </div>
              </div>
              <div className="space-y-1.5 text-[8px] text-[#94A3B8]">
                <p>
                  <span className="text-[#64748B]">Visit Date </span>May 12, 2026
                </p>
                <p>
                  <span className="text-[#64748B]">Consultation </span>09:15 AM
                </p>
                <p>
                  <span className="text-[#64748B]">Doctor </span>Dr. Sarah Johnson
                </p>
                <p>
                  <span className="text-[#64748B]">Reason </span>Vomiting, Diarrhea
                </p>
                <p>
                  <span className="text-[#64748B]">Diagnosis </span>Acute Gastroenteritis
                </p>
              </div>
            </SummaryCard>
            <SummaryCard title="Treatment Status">
              <div className="space-y-2.5">
                <TimelineItem label="Consultation Completed" state="done" sub="May 12, 2026 · 09:15 AM" />
                <TimelineItem label="Diagnosis Confirmed" state="done" sub="May 12, 2026 · 09:25 AM" />
                <TimelineItem label="Treatment Plan Created" state="active" sub="May 12, 2026 · 09:30 AM" />
                <TimelineItem label="Prescription Generated" state="pending" sub="Pending" />
                <TimelineItem label="Invoice Pending" state="pending" sub="Pending" />
              </div>
              <p className="text-[9px] text-[#C4B5FD] mt-3">View Full History →</p>
            </SummaryCard>
          </MotionSlot>
        </div>

        <MotionSlot slot="footer">
          <KpiStrip
            items={[
              { icon: Pill, label: 'Prescriptions Today', value: '12', delta: '+18% vs yesterday' },
              { icon: FlaskConical, label: 'Lab Requests', value: '7', delta: '+12% vs yesterday' },
              { icon: FileText, label: 'Treatment Plans Saved', value: '9', delta: '+15% vs yesterday' },
              { icon: Share2, label: 'Client Instructions Shared', value: '11', delta: '+20% vs yesterday' },
            ]}
          />
        </MotionSlot>
      </JourneyFrame>
    </JourneyScreenMotion>
  );
}
