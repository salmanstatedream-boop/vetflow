'use client';

import { Bell, CheckCircle2, Clock, Mail, MessageSquare, Smartphone } from 'lucide-react';
import {
  AvatarChip,
  CategoryBar,
  DashboardShell,
  MiniStatCard,
  PanelHeader,
  SearchRow,
  StatusPill,
  TabBar,
  ToolbarButton,
} from './shared';

const REMINDERS = [
  { patient: 'Bella', type: 'Post-op Check', channel: 'SMS', due: 'May 14', status: 'Scheduled', tone: 'blue' as const },
  { patient: 'Max', type: 'Vaccination', channel: 'WhatsApp', due: 'May 13', status: 'Sent', tone: 'green' as const },
  { patient: 'Luna', type: 'Follow-up Visit', channel: 'Email', due: 'May 12', status: 'Completed', tone: 'green' as const },
  { patient: 'Rocky', type: 'Medication Refill', channel: 'SMS', due: 'May 11', status: 'Overdue', tone: 'red' as const },
];

export default function FollowUpVisual() {
  return (
    <DashboardShell className="p-2 sm:p-3">
      <div className="grid lg:grid-cols-[1fr_150px] gap-3">
        <div className="space-y-2 min-w-0">
          <PanelHeader
            title="Follow-up Queue"
            actions={
              <div className="flex gap-1">
                <ToolbarButton>All Types ▾</ToolbarButton>
                <ToolbarButton>This Week 📅</ToolbarButton>
              </div>
            }
          />

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            <MiniStatCard label="Reminders Sent" value="64" delta="↑ 12% vs last week" icon={Bell} iconTone="purple" />
            <MiniStatCard label="SMS / WhatsApp" value="38" delta="59% of total" icon={Smartphone} iconTone="blue" />
            <MiniStatCard label="Email" value="26" delta="41% of total" icon={Mail} iconTone="orange" />
            <MiniStatCard label="Completion Rate" value="87%" delta="↑ 5% vs last week" icon={CheckCircle2} iconTone="green" />
          </div>

          <TabBar tabs={['Active Queue', 'Completed', 'Overdue', 'All Reminders']} active="Active Queue" />
          <SearchRow placeholder="Search reminders..." />

          <div className="rounded-lg border border-white/10 overflow-hidden">
            <div className="grid grid-cols-[1fr_1fr_0.7fr_0.55fr_0.65fr] gap-1 px-2 py-1.5 bg-white/[0.04] text-[7px] font-medium text-[#64748B] uppercase">
              <span>Patient</span>
              <span>Type</span>
              <span>Channel</span>
              <span>Due</span>
              <span>Status</span>
            </div>
            {REMINDERS.map((row) => (
              <div
                key={`${row.patient}-${row.type}`}
                className="grid grid-cols-[1fr_1fr_0.7fr_0.55fr_0.65fr] gap-1 px-2 py-1.5 border-t border-white/5 text-[8px] items-center even:bg-white/[0.02]"
              >
                <span className="flex items-center gap-1.5">
                  <AvatarChip name={row.patient} color="#8B5CF6" />
                  <span className="text-[#F8FAFC]">{row.patient}</span>
                </span>
                <span className="text-[#94A3B8] truncate">{row.type}</span>
                <span className="flex items-center gap-1 text-[#94A3B8]">
                  {row.channel === 'Email' ? <Mail className="w-3 h-3 shrink-0" /> : <MessageSquare className="w-3 h-3 shrink-0" />}
                  {row.channel}
                </span>
                <span className="text-[#64748B]">{row.due}</span>
                <StatusPill label={row.status} tone={row.tone} />
              </div>
            ))}
          </div>
          <p className="text-[8px] text-[#8B5CF6] font-medium">View all reminders →</p>
        </div>

        <div className="space-y-2 hidden lg:block">
          <div className="rounded-lg border border-white/10 bg-white/[0.02] p-2.5">
            <PanelHeader title="Channel Breakdown" />
            <div className="space-y-2">
              <CategoryBar label="SMS" pct={35} tone="blue" />
              <CategoryBar label="WhatsApp" pct={24} tone="green" />
              <CategoryBar label="Email" pct={41} tone="orange" />
            </div>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/[0.02] p-2.5">
            <PanelHeader title="Upcoming Today" />
            <div className="space-y-1.5 text-[8px]">
              <div className="flex items-center gap-2 text-[#94A3B8]"><Clock className="w-3 h-3 text-[#C4B5FD]" /> 09:00 — Bella check-up</div>
              <div className="flex items-center gap-2 text-[#94A3B8]"><Clock className="w-3 h-3 text-[#C4B5FD]" /> 11:30 — Max vaccination</div>
              <div className="flex items-center gap-2 text-[#94A3B8]"><Clock className="w-3 h-3 text-[#C4B5FD]" /> 14:00 — Luna follow-up</div>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
