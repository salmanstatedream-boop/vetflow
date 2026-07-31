'use client';

import {
  Activity,
  AlertTriangle,
  Brain,
  CheckCircle2,
  Mic,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { MiniStatCard, PetStockAvatar, StatusPill } from '@/components/home/solution-dashboard-visuals/shared';
import { FeatureRail, JourneyFrame, KpiStrip, SummaryCard } from './shared';

const CONDITIONS = [
  { name: 'Gastroenteritis', pct: 28 },
  { name: 'Skin Allergies', pct: 18 },
  { name: 'Dental Disease', pct: 14 },
  { name: 'Otitis', pct: 11 },
];

const RECS = [
  { text: 'Consider CBC Test', priority: 'High', tone: 'orange' as const },
  { text: 'Recommend Probiotic Support', priority: 'Low', tone: 'blue' as const },
  { text: 'Monitor hydration closely', priority: 'Med', tone: 'purple' as const },
];

export default function AiAnalysisJourneyVisual() {
  return (
    <JourneyFrame>
      <div className="flex min-w-0">
        <FeatureRail
          badge="AI ANALYSIS"
          title="Smarter Decisions. Better Outcomes."
          features={[
            { icon: Mic, label: 'Voice to Insights', desc: 'Live capture' },
            { icon: Brain, label: 'Pattern Recognition', desc: 'Condition trends' },
            { icon: AlertTriangle, label: 'Risk Alerts', desc: 'Flag high risk' },
            { icon: Sparkles, label: 'Suggested Actions', desc: 'Next best step' },
            { icon: Activity, label: 'Confidence Scores', desc: 'Transparent AI' },
          ]}
          stat={{ label: 'Insights Generated Today', value: '142', delta: '+18% vs last week' }}
        />
        <div className="flex-1 min-w-0 p-2.5 sm:p-3 space-y-2.5">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <p className="text-xs font-semibold text-[#F8FAFC]">AI Analysis Dashboard</p>
            <span className="text-[8px] px-2 py-1 rounded-full border border-[#8B5CF6]/30 text-[#C4B5FD]">
              AI Model: Phoenix Vet AI
            </span>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-1.5">
            <MiniStatCard label="Cases Analyzed" value="156" delta="↑ 18%" icon={Activity} iconTone="purple" />
            <MiniStatCard label="Insights" value="428" delta="↑ 22%" icon={Sparkles} iconTone="blue" />
            <MiniStatCard label="High Risk" value="12" delta="alerts" deltaTone="orange" icon={AlertTriangle} iconTone="orange" />
            <MiniStatCard label="AI Accuracy" value="94.7%" delta="↑ 2%" icon={CheckCircle2} iconTone="green" />
          </div>
          <div className="grid sm:grid-cols-2 gap-2">
            <div className="rounded-lg border border-white/10 bg-white/[0.03] p-2.5">
              <p className="text-[9px] font-semibold text-[#F8FAFC] mb-2">Top Detected Conditions</p>
              <div className="space-y-1.5">
                {CONDITIONS.map((c) => (
                  <div key={c.name}>
                    <div className="flex justify-between text-[8px] mb-0.5">
                      <span className="text-[#94A3B8]">{c.name}</span>
                      <span className="text-[#C4B5FD]">{c.pct}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <div className="h-full rounded-full bg-[#8B5CF6]" style={{ width: `${c.pct * 3}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/[0.03] p-2.5">
              <p className="text-[9px] font-semibold text-[#F8FAFC] mb-2">AI Recommendations</p>
              <ul className="space-y-2">
                {RECS.map((r) => (
                  <li key={r.text} className="flex items-center justify-between gap-2 text-[8px]">
                    <span className="text-[#E2E8F0] truncate">{r.text}</span>
                    <StatusPill label={r.priority} tone={r.tone} />
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/[0.03] p-2.5 flex gap-3 items-center">
            <PetStockAvatar pet="bruno" size="md" />
            <div className="flex-1 min-w-0">
              <p className="text-[9px] font-semibold text-[#F8FAFC]">Bruno — Extracted Summary</p>
              <p className="text-[8px] text-[#94A3B8] mt-0.5">
                Symptoms: Vomiting, Lethargy · Probable: Gastroenteritis 82%
              </p>
            </div>
            <div className="text-center shrink-0">
              <p className="text-sm font-bold text-[#C4B5FD]">82%</p>
              <p className="text-[7px] text-[#64748B]">Confidence</p>
            </div>
          </div>
        </div>
        <div className="hidden lg:block w-[150px] shrink-0 border-l border-white/10 p-2.5 space-y-2">
          <SummaryCard title="Insight Snapshot">
            <p className="text-[8px] text-[#94A3B8]">Top condition this week</p>
            <p className="text-[10px] text-[#F8FAFC] font-medium mt-0.5">Gastroenteritis</p>
            <p className="text-[8px] text-[#94A3B8] mt-2">Most used test</p>
            <p className="text-[10px] text-[#F8FAFC] font-medium mt-0.5">CBC Panel</p>
          </SummaryCard>
          <SummaryCard title="Model Status">
            <p className="text-[8px] text-[#86EFAC]">Online · Healthy</p>
          </SummaryCard>
        </div>
      </div>
      <KpiStrip
        items={[
          { label: 'Cases Analyzed', value: '156', icon: Activity },
          { label: 'Insights', value: '428', icon: Sparkles },
          { label: 'High Risk', value: '12', icon: AlertTriangle },
          { label: 'Accuracy', value: '94.7%', icon: TrendingUp },
          { label: 'Time Saved', value: '4.2 hrs', icon: CheckCircle2 },
        ]}
      />
    </JourneyFrame>
  );
}
