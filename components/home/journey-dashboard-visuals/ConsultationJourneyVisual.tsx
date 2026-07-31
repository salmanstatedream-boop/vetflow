'use client';

import { FileText, Mic, Sparkles, Stethoscope } from 'lucide-react';
import {
  PetStockAvatar,
  StatusPill,
  ToolbarButton,
} from '@/components/home/solution-dashboard-visuals/shared';
import { FeatureRail, JourneyFrame, KpiStrip, SummaryCard } from './shared';

export default function ConsultationJourneyVisual() {
  return (
    <JourneyFrame>
      <div className="flex min-w-0">
        <FeatureRail
          badge="CONSULTATION"
          title="SOAP Notes & AI Assistance."
          features={[
            { icon: Mic, label: 'AI Listening', desc: 'Live voice capture' },
            { icon: FileText, label: 'Auto SOAP', desc: 'Structured notes' },
            { icon: Sparkles, label: 'Suggestions', desc: 'Diagnoses & plans' },
            { icon: Stethoscope, label: 'Vitals Sync', desc: 'Real-time patient data' },
          ]}
        />
        <div className="flex-1 min-w-0 p-2.5 sm:p-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-[#F8FAFC]">Consultation in Progress</p>
            <span className="text-[8px] px-2 py-0.5 rounded-full bg-[#EF4444]/20 text-[#FCA5A5] border border-[#EF4444]/30">
              Live
            </span>
          </div>
          <div className="flex items-center gap-2 mb-2.5 rounded-lg border border-white/10 bg-white/[0.03] p-2">
            <PetStockAvatar pet="bruno" size="md" />
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-semibold text-[#F8FAFC]">Bruno · Golden Retriever</p>
              <p className="text-[8px] text-[#64748B]">3Y · 32kg · Male</p>
            </div>
            <StatusPill label="Active" tone="green" />
          </div>
          <div className="grid sm:grid-cols-[1fr_150px] gap-2">
            <div className="rounded-lg border border-white/10 bg-white/[0.03] p-2.5">
              <div className="flex gap-1 mb-2 text-[8px]">
                {['S', 'O', 'A', 'P'].map((tab, i) => (
                  <span
                    key={tab}
                    className={`w-6 h-6 rounded-md flex items-center justify-center font-semibold ${
                      i === 0
                        ? 'bg-[#8B5CF6] text-white'
                        : 'border border-white/10 text-[#64748B]'
                    }`}
                  >
                    {tab}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-2 mb-2 text-[8px] text-[#C4B5FD]">
                <Mic className="w-3 h-3" />
                AI is listening…
              </div>
              <div className="space-y-1.5 text-[8px]">
                <p className="text-[#94A3B8]">
                  <span className="text-[#F8FAFC]">Dr. Smith:</span> Since yesterday, he&apos;s been vomiting and not eating properly.
                </p>
                <p className="text-[#C4B5FD]">
                  <span className="text-[#A78BFA]">AI:</span> Noted. Analyzing symptoms…
                </p>
                <p className="text-[#94A3B8]">
                  <span className="text-[#F8FAFC]">Dr. Smith:</span> Also seems lethargic.
                </p>
              </div>
              <div className="mt-2 rounded-md border border-white/10 px-2 py-1.5 text-[8px] text-[#64748B]">
                Ask AI or type your note…
              </div>
            </div>
            <div className="space-y-2">
              <SummaryCard title="AI Suggestions">
                <p className="text-[8px] text-[#F8FAFC] font-medium">Acute Gastroenteritis · 82%</p>
                <ul className="mt-1.5 space-y-1 text-[8px] text-[#94A3B8]">
                  <li>☐ Fluid Therapy</li>
                  <li>☐ Antiemetic</li>
                  <li>☐ Probiotic Support</li>
                </ul>
                <div className="mt-2">
                  <ToolbarButton primary>Create Prescription</ToolbarButton>
                </div>
              </SummaryCard>
              <SummaryCard title="Vitals">
                <p className="text-[8px] text-[#94A3B8]">Temp 101.2°F · HR 96 · RR 28</p>
              </SummaryCard>
            </div>
          </div>
        </div>
      </div>
      <KpiStrip
        items={[
          { label: 'Consults Today', value: '14', icon: Stethoscope },
          { label: 'SOAP Generated', value: '11', icon: FileText },
          { label: 'AI Assists', value: '38', icon: Sparkles },
          { label: 'Avg Duration', value: '18m', icon: Mic },
        ]}
      />
    </JourneyFrame>
  );
}
