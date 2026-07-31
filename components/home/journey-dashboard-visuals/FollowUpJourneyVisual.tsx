'use client';

import {
  Bell,
  CheckCircle2,
  Mail,
  MessageSquare,
  Smartphone,
} from 'lucide-react';
import {
  ChannelIcon,
  PetStockAvatar,
  StatusPill,
  ToolbarButton,
} from '@/components/home/solution-dashboard-visuals/shared';
import { FeatureRail, JourneyFrame, KpiStrip, SummaryCard, TimelineItem } from './shared';

const ROWS = [
  { date: 'May 14 · 10:00', type: 'Recheck', notes: 'Post GI review', channel: 'WhatsApp' as const, status: 'Scheduled', tone: 'green' as const },
  { date: 'May 16 · 14:00', type: 'Lab Review', notes: 'CBC results', channel: 'Email' as const, status: 'Pending', tone: 'orange' as const },
  { date: 'May 20 · 09:30', type: 'Vaccination', notes: 'Booster due', channel: 'SMS' as const, status: 'Scheduled', tone: 'green' as const },
];

export default function FollowUpJourneyVisual() {
  return (
    <JourneyFrame>
      <div className="flex min-w-0">
        <FeatureRail
          badge="FOLLOW UP"
          title="Never Miss a Care."
          features={[
            { icon: Bell, label: 'Automated Reminders', desc: 'SMS, WhatsApp & Email' },
            { icon: CheckCircle2, label: 'Recheck Management', desc: 'Track upcoming visits' },
            { icon: MessageSquare, label: 'Client Communication', desc: 'Instant updates' },
            { icon: Smartphone, label: 'Multi-channel', desc: 'Reach every owner' },
            { icon: Mail, label: 'Care Never Missed', desc: 'Reduce no-shows' },
          ]}
          stat={{ label: 'Follow-ups Scheduled Today', value: '14', delta: '+27% vs yesterday' }}
        />
        <div className="flex-1 min-w-0 p-2.5 sm:p-3">
          <div className="flex items-center gap-2 mb-2">
            <PetStockAvatar pet="bruno" size="md" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-[#F8FAFC]">Follow-ups for Bruno</p>
              <p className="text-[8px] text-[#64748B]">Last visit May 12 · Acute Gastroenteritis</p>
            </div>
          </div>
          <div className="flex gap-1 mb-2 text-[8px] flex-wrap">
            {['Upcoming Follow-ups', 'Completed', 'All Reminders', 'History'].map((t, i) => (
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
          <div className="rounded-lg border border-white/10 overflow-hidden">
            <div className="grid grid-cols-[1fr_0.7fr_1fr_0.6fr_0.7fr] gap-1 px-2 py-1.5 bg-white/[0.04] text-[7px] uppercase text-[#64748B]">
              <span>Date & Time</span>
              <span>Type</span>
              <span>Notes</span>
              <span>Channel</span>
              <span>Status</span>
            </div>
            {ROWS.map((row) => (
              <div
                key={row.date}
                className="grid grid-cols-[1fr_0.7fr_1fr_0.6fr_0.7fr] gap-1 px-2 py-1.5 border-t border-white/5 text-[8px] items-center"
              >
                <span className="text-[#94A3B8]">{row.date}</span>
                <span className="text-[#F8FAFC]">{row.type}</span>
                <span className="text-[#64748B] truncate">{row.notes}</span>
                <ChannelIcon channel={row.channel} />
                <StatusPill label={row.status} tone={row.tone} />
              </div>
            ))}
          </div>
          <p className="text-[8px] text-[#8B5CF6] mt-2">Smart Follow-up Automation · Multi-channel · No-show reduction</p>
        </div>
        <div className="hidden lg:block w-[150px] shrink-0 border-l border-white/10 p-2.5 space-y-2">
          <SummaryCard title="Patient Summary">
            <PetStockAvatar pet="bruno" size="sm" />
            <p className="text-[9px] text-[#F8FAFC] mt-1">Bruno · Active</p>
            <p className="text-[8px] text-[#64748B]">Owner: Sarah Johnson</p>
            <p className="text-[8px] text-[#64748B]">Visits: 8</p>
          </SummaryCard>
          <div className="space-y-1.5">
            <TimelineItem label="Reminder Sent" state="done" />
            <TimelineItem label="Next Follow-up" state="active" />
            <TimelineItem label="Reminder Scheduled" state="pending" />
            <TimelineItem label="Follow-up Completed" state="pending" />
          </div>
          <ToolbarButton>View Full History</ToolbarButton>
        </div>
      </div>
      <KpiStrip
        items={[
          { label: 'Scheduled Today', value: '14', delta: '↑ 27%', icon: Bell },
          { label: 'Reminders Sent', value: '38', delta: '↑ 18%', icon: MessageSquare },
          { label: 'Completed', value: '24', delta: '↑ 15%', icon: CheckCircle2 },
          { label: 'Completion Rate', value: '92%', delta: '↑ 6%', icon: Mail },
          { label: 'No-show Reduction', value: '35%', delta: '↑ 12%', icon: Smartphone },
        ]}
      />
    </JourneyFrame>
  );
}
