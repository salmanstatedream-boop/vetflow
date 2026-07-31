'use client';

import {
  Bell,
  CalendarCheck,
  CheckCircle2,
  Clock,
  Smartphone,
  Users,
} from 'lucide-react';
import {
  PetStockAvatar,
  ScheduleGrid,
  StatusPill,
  ToolbarButton,
} from '@/components/home/solution-dashboard-visuals/shared';
import { FeatureRail, JourneyFrame, KpiStrip, SummaryCard, TimelineItem } from './shared';

const TIMES = ['09:00', '10:00', '11:00', '12:00', '01:00', '02:00', '03:00'];
const DOCTORS = [
  { name: 'Dr. Sarah', role: 'Vet', variant: 'sarah' as const, color: '#8B5CF6' },
  { name: 'Dr. Taylor', role: 'Surgery', variant: 'taylor' as const, color: '#F97316' },
  { name: 'Dr. Morgan', role: 'Dental', variant: 'morgan' as const, color: '#3B82F6' },
  { name: 'Dr. Lee', role: 'Cardio', variant: 'lee' as const, color: '#22C55E' },
];
const BLOCKS = [
  { col: 0, rowStart: 0, rowSpan: 2, label: 'Bruno', sub: 'Check-up', color: '#8B5CF6' },
  { col: 1, rowStart: 0, rowSpan: 3, label: 'Luna', sub: 'Surgery', color: '#F97316' },
  { col: 2, rowStart: 1, rowSpan: 2, label: 'Max', sub: 'Dental', color: '#3B82F6' },
  { col: 3, rowStart: 2, rowSpan: 2, label: 'Bella', sub: 'Cardio', color: '#22C55E' },
  { col: 0, rowStart: 3, rowSpan: 2, label: 'Milo', sub: 'Follow-up', color: '#8B5CF6' },
];

export default function AppointmentJourneyVisual() {
  return (
    <JourneyFrame>
      <div className="flex min-w-0">
        <FeatureRail
          badge="SMART SCHEDULING"
          title="Zero Confusion. Full Control."
          features={[
            { icon: Smartphone, label: 'Online Booking', desc: 'Clients book anytime' },
            { icon: CalendarCheck, label: 'Smart Calendar', desc: 'Conflict-free slots' },
            { icon: Bell, label: 'Auto Reminders', desc: 'SMS & WhatsApp' },
            { icon: CheckCircle2, label: 'Easy Check-in', desc: 'Arrival in seconds' },
            { icon: Users, label: 'Real-time Updates', desc: 'Team stays synced' },
          ]}
          stat={{ label: 'No-shows reduced', value: '35%', delta: 'with smart reminders' }}
        />
        <div className="flex-1 min-w-0 p-2.5 sm:p-3">
          <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
            <p className="text-xs font-semibold text-[#F8FAFC]">Appointments — Week View</p>
            <div className="flex gap-1">
              <ToolbarButton>Today</ToolbarButton>
              <ToolbarButton>Week</ToolbarButton>
              <ToolbarButton primary>+ New Appointment</ToolbarButton>
            </div>
          </div>
          <ScheduleGrid times={TIMES} doctors={DOCTORS} blocks={BLOCKS} />
        </div>
        <div className="hidden lg:flex flex-col w-[170px] shrink-0 border-l border-white/10 p-2.5 gap-2.5">
          <SummaryCard title="Bruno · Golden Retriever">
            <div className="flex items-center gap-2 mb-2">
              <PetStockAvatar pet="bruno" size="md" />
              <div>
                <p className="text-[9px] text-[#F8FAFC]">3Y · 32kg</p>
                <StatusPill label="Confirmed" tone="green" />
              </div>
            </div>
            <p className="text-[8px] text-[#94A3B8]">May 12 · 10:00 AM</p>
            <p className="text-[8px] text-[#94A3B8] mt-0.5">Dr. Sarah Johnson</p>
            <p className="text-[8px] text-[#64748B] mt-1">Annual Check-up</p>
            <div className="flex gap-1 mt-2">
              <ToolbarButton>Reschedule</ToolbarButton>
              <ToolbarButton primary>View / Edit</ToolbarButton>
            </div>
          </SummaryCard>
          <SummaryCard title="Upcoming">
            <div className="space-y-1.5">
              <TimelineItem label="Bruno — Check-up" state="active" />
              <TimelineItem label="Luna — Surgery" state="pending" />
              <TimelineItem label="Max — Dental" state="pending" />
            </div>
          </SummaryCard>
        </div>
      </div>
      <KpiStrip
        items={[
          { label: "Today's Appointments", value: '28', icon: CalendarCheck },
          { label: 'New Bookings', value: '5', delta: '↑ today', icon: Users },
          { label: 'Confirmations Sent', value: '23', icon: Bell },
          { label: 'No-Shows', value: '1', delta: '↓ 80%', icon: Clock },
          { label: 'Utilization', value: '92%', icon: CheckCircle2 },
        ]}
      />
    </JourneyFrame>
  );
}
