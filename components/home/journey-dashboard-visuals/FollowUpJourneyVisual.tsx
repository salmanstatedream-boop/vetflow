'use client';

import {
  Bell,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  Heart,
  Mail,
  MessageCircle,
  MessageSquare,
  Network,
  Plus,
  Smartphone,
  Sparkles,
  TrendingDown,
  Users,
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

const ROWS = [
  {
    when: 'May 15, 2026',
    time: '10:00 AM',
    type: 'Recheck',
    reason: 'Recheck after 3 days',
    notes: 'Assess improvement',
    channel: 'WhatsApp',
    channelIcon: MessageCircle,
    status: 'Scheduled',
    tone: 'green' as const,
  },
  {
    when: 'May 19, 2026',
    time: '09:00 AM',
    type: 'Lab Review',
    reason: 'CBC Test Review',
    notes: 'Discuss lab results',
    channel: 'Email',
    channelIcon: Mail,
    status: 'Scheduled',
    tone: 'green' as const,
  },
  {
    when: 'May 26, 2026',
    time: '10:30 AM',
    type: 'Recheck',
    reason: 'Post treatment review',
    notes: 'Weight & hydration check',
    channel: 'SMS',
    channelIcon: MessageSquare,
    status: 'Scheduled',
    tone: 'green' as const,
  },
  {
    when: 'Jun 12, 2026',
    time: '09:00 AM',
    type: 'Vaccination',
    reason: 'Annual vaccination',
    notes: 'Rabies + DHPP',
    channel: 'App Notification',
    channelIcon: Bell,
    status: 'Pending',
    tone: 'orange' as const,
  },
];

const AUTOMATIONS = [
  { icon: Clock, label: 'Smart Timing', desc: 'Optimal follow-up intervals.' },
  { icon: Network, label: 'Multi-channel', desc: 'Reach clients on their preferred channel.' },
  { icon: TrendingDown, label: 'No-show Reduction', desc: 'Reduce no-shows by up to 35%.' },
];

export default function FollowUpJourneyVisual({
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
              badge="STAY CONNECTED. BETTER OUTCOMES."
              title="Follow Up."
              titleAccent="Never Miss a Care."
              features={[
                { icon: Smartphone, label: 'Automated Reminders', desc: 'SMS, WhatsApp & Email reminders on autopilot.' },
                { icon: Calendar, label: 'Recheck Management', desc: 'Schedule rechecks and track upcoming follow-ups.' },
                { icon: FileText, label: 'Treatment Monitoring', desc: 'Monitor progress and update treatment plans.' },
                { icon: MessageSquare, label: 'Client Communication', desc: 'Share updates and instructions instantly.' },
                { icon: Heart, label: 'Care Never Missed', desc: 'Reduce no-shows and improve patient outcomes.' },
              ]}
              stat={{ label: 'Follow-ups Scheduled Today', value: '14', delta: '+27% vs yesterday', sparkline: true }}
            />
          </MotionSlot>

          <MotionSlot slot="main" className="flex-1 min-w-0 p-3 sm:p-4">
            <p className="text-sm font-semibold text-[#F8FAFC] mb-3">Follow-ups for Bruno</p>

            <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 mb-3">
              <div className="flex items-center gap-2.5 flex-wrap">
                <PetStockAvatar pet="bruno" size="lg" />
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold text-[#F8FAFC]">Bruno</p>
                  <p className="text-[8px] text-[#64748B]">Golden Retriever · 3Y · Male · 32kg</p>
                </div>
                <div className="flex flex-wrap gap-x-5 gap-y-1 ml-auto text-[8px]">
                  <div>
                    <p className="text-[#64748B]">Last Visit</p>
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

            <div className="flex gap-3 mb-3 text-[9px] border-b border-white/10 pb-2 overflow-x-auto scrollbar-none">
              {['Upcoming Follow-ups', 'Completed', 'All Reminders', 'History'].map((t, i) => (
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

            <div className="rounded-xl border border-white/10 overflow-hidden overflow-x-auto">
              <table className="w-full min-w-[600px] text-left">
                <thead>
                  <tr className="bg-white/[0.04] text-[8px] uppercase tracking-wider text-[#64748B]">
                    <th className="px-2.5 py-2 font-medium">Date &amp; Time</th>
                    <th className="px-2.5 py-2 font-medium">Type</th>
                    <th className="px-2.5 py-2 font-medium">Reason / Notes</th>
                    <th className="px-2.5 py-2 font-medium">Channel</th>
                    <th className="px-2.5 py-2 font-medium">Status</th>
                    <th className="px-2.5 py-2 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {ROWS.map((row) => (
                    <tr key={row.when + row.type} className="border-t border-white/5 text-[9px]">
                      <td className="px-2.5 py-2 whitespace-nowrap">
                        <p className="text-[#CBD5E1]">{row.when}</p>
                        <p className="text-[8px] text-[#64748B]">{row.time}</p>
                      </td>
                      <td className="px-2.5 py-2 font-medium text-[#F8FAFC]">{row.type}</td>
                      <td className="px-2.5 py-2">
                        <p className="text-[#CBD5E1]">{row.reason}</p>
                        <p className="text-[8px] text-[#64748B]">{row.notes}</p>
                      </td>
                      <td className="px-2.5 py-2">
                        <span className="inline-flex items-center gap-1 text-[#94A3B8]">
                          <row.channelIcon className="w-3 h-3 text-[#C4B5FD]" />
                          {row.channel}
                        </span>
                      </td>
                      <td className="px-2.5 py-2">
                        <StatusBadge label={row.status} tone={row.tone} />
                      </td>
                      <td className="px-2.5 py-2 text-[#64748B]">···</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button type="button" className="mt-2 w-full flex items-center justify-center gap-1 rounded-lg border border-dashed border-[#8B5CF6]/35 text-[9px] text-[#C4B5FD] py-1.5 hover:bg-[#8B5CF6]/10 transition-colors">
              <Plus className="w-3 h-3" /> Add Follow-up
            </button>

            <div className="mt-3 rounded-xl border border-[#8B5CF6]/25 bg-[#8B5CF6]/[0.06] p-3">
              <div className="grid md:grid-cols-[1.3fr_1fr_1fr_1fr] gap-3 items-start">
                <div>
                  <p className="text-[10px] font-semibold text-[#F8FAFC] flex items-center gap-1.5 mb-1">
                    <Sparkles className="w-3.5 h-3.5 text-[#C4B5FD]" />
                    Smart Follow-up Automation
                  </p>
                  <p className="text-[8px] text-[#64748B] leading-snug">
                    Phoenix OS suggests follow-ups based on diagnosis, treatment and patient history to ensure nothing slips through.
                  </p>
                </div>
                {AUTOMATIONS.map((a) => (
                  <div key={a.label} className="flex flex-col gap-1">
                    <span className="w-7 h-7 rounded-lg bg-[#8B5CF6]/15 border border-[#8B5CF6]/30 flex items-center justify-center">
                      <a.icon className="w-3.5 h-3.5 text-[#C4B5FD]" />
                    </span>
                    <p className="text-[9px] font-medium text-[#F8FAFC] leading-tight">{a.label}</p>
                    <p className="text-[8px] text-[#64748B] leading-snug">{a.desc}</p>
                  </div>
                ))}
              </div>
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
            <SummaryCard title="Follow-up Activity">
              <div className="space-y-2.5">
                <TimelineItem label="Reminder Sent" state="done" sub="May 12, 2026 · 10:20 AM · WhatsApp" />
                <TimelineItem label="Next Follow-up" state="active" sub="May 15, 2026 · 10:00 AM · Recheck" />
                <TimelineItem label="Reminder Scheduled" state="pending" sub="May 14, 2026 · 09:00 AM · WhatsApp" />
                <TimelineItem label="Follow-up Completed" state="pending" sub="Pending" />
              </div>
              <p className="text-[9px] text-[#C4B5FD] mt-3">View Full History →</p>
            </SummaryCard>
          </MotionSlot>
        </div>

        <MotionSlot slot="footer">
          <KpiStrip
            items={[
              { icon: Calendar, label: 'Follow-ups Scheduled Today', value: '14', delta: '↑ 27% vs yesterday' },
              { icon: Bell, label: 'Reminders Sent This Week', value: '38', delta: '↑ 18% vs last week', tone: 'amber' },
              { icon: CheckCircle2, label: 'Completed Follow-ups', value: '24', delta: '↑ 15% vs last week', tone: 'green' },
              { icon: Users, label: 'Follow-up Completion Rate', value: '92%', delta: '↑ 6% vs last week', tone: 'teal' },
              { icon: TrendingDown, label: 'No-show Reduction', value: '35%', delta: '↑ 12% vs last month', tone: 'purple' },
            ]}
          />
        </MotionSlot>
      </JourneyFrame>
    </JourneyScreenMotion>
  );
}
