'use client';

import {
  ClipboardList,
  FileText,
  FlaskConical,
  Pill,
  Share2,
} from 'lucide-react';
import {
  PetStockAvatar,
  StatusPill,
  ToolbarButton,
} from '@/components/home/solution-dashboard-visuals/shared';
import { FeatureRail, JourneyFrame, KpiStrip, SummaryCard, TimelineItem } from './shared';

export default function TreatmentJourneyVisual() {
  return (
    <JourneyFrame>
      <div className="flex min-w-0">
        <FeatureRail
          badge="TREATMENT. MADE EASY."
          title="Everything You Need, In One Place."
          features={[
            { icon: Pill, label: 'Generate Prescriptions', desc: 'One-click Rx' },
            { icon: FlaskConical, label: 'Add Lab Requests', desc: 'CBC & more' },
            { icon: FileText, label: 'Save Treatment Plans', desc: 'Reusable templates' },
            { icon: ClipboardList, label: 'Discharge Instructions', desc: 'Owner-ready' },
            { icon: Share2, label: 'Share Instantly', desc: 'Print or send' },
          ]}
          stat={{ label: 'Treatments Created Today', value: '12', delta: '+18% vs yesterday' }}
        />
        <div className="flex-1 min-w-0 p-2.5 sm:p-3">
          <div className="flex items-center gap-2 mb-2">
            <PetStockAvatar pet="bruno" size="md" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-[#F8FAFC]">Treatment for Bruno</p>
              <p className="text-[8px] text-[#64748B]">Acute Gastroenteritis · Dr. Sarah Johnson</p>
            </div>
            <StatusPill label="Active" tone="green" />
          </div>
          <div className="flex gap-1 mb-2 text-[8px] flex-wrap">
            {['Treatment Plan', 'Prescriptions', 'Lab Requests', 'Client Instructions'].map((t, i) => (
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
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
            {[
              { title: 'Treatment Plan', items: ['IV Fluid Therapy', 'Maropitant', 'Rest & Monitor'] },
              { title: 'Prescriptions', items: ['Maropitant Citrate', 'Metronidazole', 'Probiotic Paste'] },
              { title: 'Lab Requests', items: ['CBC', 'Serum Biochemistry', 'Fecal Exam'] },
              { title: 'Client Instructions', items: ['Small frequent meals', 'Monitor water intake', 'Return if worsens'] },
            ].map((col) => (
              <div key={col.title} className="rounded-lg border border-white/10 bg-white/[0.03] p-2">
                <p className="text-[9px] font-semibold text-[#F8FAFC] mb-1.5">{col.title}</p>
                <ul className="space-y-1 text-[8px] text-[#94A3B8]">
                  {col.items.map((item) => (
                    <li key={item} className="flex gap-1">
                      <span className="text-[#8B5CF6]">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
                <p className="text-[8px] text-[#8B5CF6] mt-2">+ Add</p>
              </div>
            ))}
          </div>
          <div className="flex gap-1.5 mt-2 flex-wrap">
            <ToolbarButton primary>Generate Prescription</ToolbarButton>
            <ToolbarButton>Save Treatment Plan</ToolbarButton>
            <ToolbarButton>Print / Share</ToolbarButton>
          </div>
        </div>
        <div className="hidden lg:block w-[150px] shrink-0 border-l border-white/10 p-2.5">
          <SummaryCard title="Patient Summary">
            <PetStockAvatar pet="bruno" size="md" />
            <p className="text-[9px] text-[#F8FAFC] mt-1.5">Bruno · Active</p>
            <p className="text-[8px] text-[#64748B] mt-1">Vomiting, Diarrhea</p>
          </SummaryCard>
          <div className="mt-2 space-y-1.5">
            <TimelineItem label="Consultation Completed" state="done" />
            <TimelineItem label="Diagnosis Confirmed" state="done" />
            <TimelineItem label="Treatment Plan Created" state="active" />
            <TimelineItem label="Prescription Generated" state="pending" />
            <TimelineItem label="Invoice Pending" state="pending" />
          </div>
        </div>
      </div>
      <KpiStrip
        items={[
          { label: 'Prescriptions Today', value: '12', delta: '↑ 18%', icon: Pill },
          { label: 'Lab Requests', value: '7', delta: '↑ 12%', icon: FlaskConical },
          { label: 'Plans Saved', value: '9', delta: '↑ 15%', icon: FileText },
          { label: 'Instructions Shared', value: '11', delta: '↑ 20%', icon: Share2 },
        ]}
      />
    </JourneyFrame>
  );
}
