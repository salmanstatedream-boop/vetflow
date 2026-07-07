'use client';

import { AlertTriangle, Bell, CheckCircle2, Clock } from 'lucide-react';
import type { SolutionPetKey } from '@/lib/solution-mockup-assets';
import {
  ChannelIcon,
  DashboardShell,
  DonutRing,
  JourneyStep,
  MiniStatCard,
  PanelHeader,
  PetStockAvatar,
  SearchRow,
  StatusPill,
  TabBar,
  ToolbarButton,
} from './shared';

const FOLLOWUPS: {
  pet: SolutionPetKey;
  patient: string;
  reason: string;
  dueDate: string;
  status: string;
  channel: 'WhatsApp' | 'SMS' | 'Email';
  tone: 'green' | 'blue' | 'orange' | 'red';
}[] = [
  { pet: 'bella', patient: 'Bella', reason: 'Post-op Check', dueDate: 'May 14', status: 'Due Today', channel: 'WhatsApp', tone: 'orange' },
  { pet: 'max', patient: 'Max', reason: 'Vaccination Booster', dueDate: 'May 15', status: 'Upcoming', channel: 'SMS', tone: 'blue' },
  { pet: 'luna', patient: 'Luna', reason: 'Dental Follow-up', dueDate: 'May 16', status: 'Upcoming', channel: 'Email', tone: 'blue' },
  { pet: 'rocky', patient: 'Rocky', reason: 'Medication Refill', dueDate: 'May 11', status: 'Overdue', channel: 'WhatsApp', tone: 'red' },
  { pet: 'milo', patient: 'Milo', reason: 'Wellness Review', dueDate: 'May 13', status: 'Due Today', channel: 'SMS', tone: 'orange' },
];

export default function FollowUpVisual() {
  return (
    <DashboardShell className="p-2 sm:p-3">
      <div className="grid lg:grid-cols-[1fr_160px] gap-3">
        <div className="space-y-2 min-w-0">
          <PanelHeader
            title="Follow-up Overview"
            actions={
              <div className="flex gap-1">
                <ToolbarButton>All Types ▾</ToolbarButton>
                <ToolbarButton>This Week 📅</ToolbarButton>
              </div>
            }
          />

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            <MiniStatCard label="Due This Week" value="126" delta="↑ 14% vs last week" icon={Bell} iconTone="purple" />
            <MiniStatCard label="Upcoming" value="84" delta="Next 7 days" icon={Clock} iconTone="blue" />
            <MiniStatCard label="Completed" value="312" delta="↑ 9% vs last week" icon={CheckCircle2} iconTone="green" />
            <MiniStatCard label="Overdue" value="11" delta="Needs attention" deltaTone="red" icon={AlertTriangle} iconTone="red" />
          </div>

          <TabBar tabs={['All', 'Due Today', 'Due This Week', 'Overdue']} active="All" />
          <SearchRow placeholder="Search follow-ups..." />

          <div className="rounded-lg border border-white/10 overflow-hidden">
            <div className="grid grid-cols-[1fr_1.1fr_0.65fr_0.75fr_0.45fr] gap-1 px-2 py-1.5 bg-white/[0.04] text-[7px] font-medium text-[#64748B] uppercase">
              <span>Patient</span>
              <span>Reason</span>
              <span>Due Date</span>
              <span>Status</span>
              <span>Channel</span>
            </div>
            {FOLLOWUPS.map((row) => (
              <div
                key={`${row.patient}-${row.reason}`}
                className="grid grid-cols-[1fr_1.1fr_0.65fr_0.75fr_0.45fr] gap-1 px-2 py-1.5 border-t border-white/5 text-[8px] items-center even:bg-white/[0.02]"
              >
                <span className="flex items-center gap-1.5 min-w-0">
                  <PetStockAvatar pet={row.pet} size="sm" />
                  <span className="text-[#F8FAFC] truncate">{row.patient}</span>
                </span>
                <span className="text-[#94A3B8] truncate">{row.reason}</span>
                <span className="text-[#64748B]">{row.dueDate}</span>
                <StatusPill label={row.status} tone={row.tone} />
                <ChannelIcon channel={row.channel} />
              </div>
            ))}
          </div>
          <p className="text-[8px] text-[#8B5CF6] font-medium">View all follow-ups →</p>
        </div>

        <div className="space-y-2 hidden lg:block">
          <div className="rounded-lg border border-white/10 bg-white/[0.02] p-2.5">
            <PanelHeader title="Follow-up Journey" />
            <JourneyStep title="Reminder Sent" subtitle="May 10 · WhatsApp" />
            <JourneyStep title="Patient Responded" subtitle="May 11 · Confirmed slot" active />
            <JourneyStep title="Appointment Booked" subtitle="May 14 · 10:30 AM" />
            <JourneyStep title="Follow-up Completed" subtitle="Pending visit" last />
          </div>
          <div className="rounded-lg border border-white/10 bg-white/[0.02] p-2.5">
            <PanelHeader title="Follow-up Insights" />
            <DonutRing
              centerValue="92%"
              centerLabel="Completion Rate"
              segments={[
                { pct: 92, color: '#22C55E', label: 'Completed' },
                { pct: 8, color: '#334155', label: 'Pending' },
              ]}
            />
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
