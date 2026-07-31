'use client';

import {
  Activity,
  AlertTriangle,
  Brain,
  Clock,
  Lightbulb,
  Mic,
  Sparkles,
  Target,
  Waves,
} from 'lucide-react';
import { PetStockAvatar, ToolbarButton } from '@/components/home/solution-dashboard-visuals/shared';
import {
  ConfidenceGauge,
  FeatureRail,
  JourneyFrame,
  JourneyScreenMotion,
  KpiStrip,
  LineChart,
  MiniSparkline,
  MotionSlot,
  ProgressBar,
  StatusBadge,
  SummaryCard,
} from './shared';

const KPIS = [
  { label: 'Cases Analyzed', value: '156', delta: '+18%', color: '#8B5CF6' },
  { label: 'Insights Generated', value: '428', delta: '+24%', color: '#3B82F6' },
  { label: 'High Risk Alerts', value: '12', delta: '−8%', color: '#F43F5E' },
  { label: 'AI Accuracy', value: '94.7%', delta: '+3.6%', color: '#2DD4BF' },
];

const CONDITIONS = [
  { label: 'Gastroenteritis', value: 28, color: '#8B5CF6' },
  { label: 'Skin Allergies', value: 18, color: '#A78BFA' },
  { label: 'Dental Disease', value: 14, color: '#3B82F6' },
  { label: 'Otitis Externa', value: 11, color: '#22D3EE' },
  { label: 'Arthritis', value: 9, color: '#2DD4BF' },
];

const RECS = [
  { title: 'Consider CBC Test', priority: 'High', tone: 'red' as const },
  { title: 'Monitor hydration closely', priority: 'Med', tone: 'orange' as const },
  { title: 'Recommend Probiotic Support', priority: 'Low', tone: 'green' as const },
];

const CHART = [180, 240, 210, 320, 380, 350, 428];
const CHART_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function AiAnalysisJourneyVisual({
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
              badge="AI ANALYSIS"
              title="Smarter Decisions."
              titleAccent="Better Outcomes."
              features={[
                { icon: Mic, label: 'Voice to Insights', desc: 'Live extraction from conversation.' },
                { icon: Waves, label: 'Pattern Recognition', desc: 'Spot trends across cases.' },
                { icon: AlertTriangle, label: 'Risk Alerts', desc: 'Flag high-risk patients early.' },
                { icon: Lightbulb, label: 'Smart Suggestions', desc: 'Tests, plans & next steps.' },
                { icon: Brain, label: 'Continuous Learning', desc: 'Improves with every visit.' },
              ]}
              stat={{ label: 'Insights Generated Today', value: '142', delta: '+27% upward trend', sparkline: true }}
            />
          </MotionSlot>

          <MotionSlot slot="main" className="flex-1 min-w-0 p-3 sm:p-4 space-y-3">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <p className="text-sm font-semibold text-[#F8FAFC]">AI Analysis Dashboard</p>
              <div className="flex gap-1.5 text-[8px] flex-wrap">
                <span className="px-2 py-1 rounded-lg border border-white/10 text-[#94A3B8]">May 12–18, 2026</span>
                <span className="px-2 py-1 rounded-lg border border-white/10 text-[#94A3B8]">All Departments</span>
                <span className="px-2 py-1 rounded-full border border-[#8B5CF6]/35 bg-[#8B5CF6]/10 text-[#C4B5FD]">
                  Model: Phoenix Vet AI
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 xl:grid-cols-4 gap-2">
              {KPIS.map((k) => (
                <div
                  key={k.label}
                  className="rounded-xl border border-white/10 bg-white/[0.03] p-2.5"
                  style={{ boxShadow: `0 0 20px ${k.color}18` }}
                >
                  <p className="text-[8px] text-[#64748B]">{k.label}</p>
                  <p className="text-lg font-bold text-[#F8FAFC] mt-0.5 tabular-nums">{k.value}</p>
                  <p className="text-[8px] mt-0.5" style={{ color: k.color }}>
                    {k.delta}
                  </p>
                </div>
              ))}
            </div>

            <div className="grid md:grid-cols-3 gap-2">
              <SummaryCard title="Top Detected Conditions" className="md:col-span-1">
                <div className="space-y-2">
                  {CONDITIONS.map((c) => (
                    <ProgressBar key={c.label} label={c.label} value={c.value} color={c.color} />
                  ))}
                </div>
              </SummaryCard>

              <SummaryCard title="Insights Over Time" className="md:col-span-1">
                <LineChart points={CHART} height={72} peakLabel="428" />
                <div className="flex justify-between mt-1">
                  {CHART_DAYS.map((d) => (
                    <span key={d} className="text-[6px] text-[#64748B]">
                      {d}
                    </span>
                  ))}
                </div>
                <p className="text-[8px] text-[#94A3B8] mt-1.5">Peak 428 insights · Sun</p>
              </SummaryCard>

              <SummaryCard title="AI Recommendations (Live)" className="md:col-span-1">
                <div className="space-y-2">
                  {RECS.map((r) => (
                    <div
                      key={r.title}
                      className="flex items-center justify-between gap-2 rounded-lg border border-white/10 bg-white/[0.02] px-2 py-1.5"
                    >
                      <p className="text-[9px] text-[#E2E8F0]">{r.title}</p>
                      <StatusBadge label={r.priority} tone={r.tone} />
                    </div>
                  ))}
                </div>
              </SummaryCard>
            </div>

            <SummaryCard title="AI Extracted Summary — Bruno">
              <div className="grid sm:grid-cols-[1fr_1fr_1fr_auto] gap-3 items-start">
                <div>
                  <p className="text-[8px] font-mono uppercase text-[#64748B] mb-1">Symptoms</p>
                  <ul className="text-[9px] text-[#CBD5E1] space-y-0.5 list-disc list-inside">
                    <li>Vomiting (2 days)</li>
                    <li>Diarrhea</li>
                    <li>Reduced appetite</li>
                  </ul>
                </div>
                <div>
                  <p className="text-[8px] font-mono uppercase text-[#64748B] mb-1">Probable Conditions</p>
                  <ul className="text-[9px] text-[#CBD5E1] space-y-0.5 list-disc list-inside">
                    <li>Acute Gastroenteritis</li>
                    <li>Dietary indiscretion</li>
                    <li>Mild dehydration</li>
                  </ul>
                </div>
                <div>
                  <p className="text-[8px] font-mono uppercase text-[#64748B] mb-1">Suggested Actions</p>
                  <ul className="text-[9px] text-[#CBD5E1] space-y-0.5 list-disc list-inside">
                    <li>CBC + Chemistry</li>
                    <li>IV fluid therapy</li>
                    <li>Antiemetic Rx</li>
                  </ul>
                </div>
                <div className="flex justify-center">
                  <ConfidenceGauge value={82} />
                </div>
              </div>
            </SummaryCard>
          </MotionSlot>

          <MotionSlot slot="aside" className="hidden lg:flex flex-col w-[190px] xl:w-[210px] shrink-0 border-l border-white/10 p-3 gap-3">
            <SummaryCard title="Insight Snapshot">
              <p className="text-[8px] text-[#64748B] mb-2">This Week Summary</p>
              <div className="space-y-1.5 text-[9px] text-[#CBD5E1]">
                <p className="flex justify-between">
                  <span>GI cases</span>
                  <span className="text-[#C4B5FD]">28%</span>
                </p>
                <p className="flex justify-between">
                  <span>Treatment success</span>
                  <span className="text-[#86EFAC]">91%</span>
                </p>
                <p className="flex justify-between">
                  <span>Avg insight latency</span>
                  <span>1.2s</span>
                </p>
              </div>
              <div className="mt-2 flex justify-end">
                <MiniSparkline />
              </div>
            </SummaryCard>
            <SummaryCard>
              <p className="text-[8px] text-[#64748B]">High Risk Cases</p>
              <p className="text-2xl font-bold text-[#F8FAFC] mt-1">12</p>
              <p className="text-[8px] text-[#FDA4AF] mb-2">require attention</p>
              <ToolbarButton primary>View All Alerts</ToolbarButton>
            </SummaryCard>
            <SummaryCard title="AI Model Status">
              <div className="flex items-center gap-2 mb-2">
                <StatusBadge label="Online" tone="green" />
              </div>
              <p className="text-[8px] text-[#94A3B8]">Last update · 2 min ago</p>
              <p className="text-[9px] text-[#C4B5FD] mt-2 cursor-default">Model Performance →</p>
            </SummaryCard>
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] p-2">
              <PetStockAvatar pet="bruno" size="md" />
              <div>
                <p className="text-[9px] font-medium text-[#F8FAFC]">Bruno</p>
                <p className="text-[8px] text-[#64748B]">Active case</p>
              </div>
            </div>
          </MotionSlot>
        </div>

        <MotionSlot slot="footer">
          <KpiStrip
            items={[
              { icon: Activity, label: 'Cases Analyzed', value: '156', delta: '+18%', tone: 'purple' },
              { icon: Sparkles, label: 'Insights Generated', value: '428', delta: '+24%', tone: 'teal' },
              { icon: AlertTriangle, label: 'High Risk Alerts', value: '12', delta: '−8%', tone: 'red' },
              { icon: Target, label: 'AI Accuracy', value: '94.7%', delta: '+3.6%', tone: 'green' },
              { icon: Clock, label: 'Time Saved', value: '4.2 hrs', tone: 'purple' },
            ]}
          />
        </MotionSlot>
      </JourneyFrame>
    </JourneyScreenMotion>
  );
}
