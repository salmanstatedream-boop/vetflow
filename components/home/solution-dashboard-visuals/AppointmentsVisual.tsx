'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DashboardShell, PanelHeader, ScheduleGrid, ToolbarButton } from './shared';

const TIMES = ['09:00', '10:00', '11:00', '12:00', '01:00', '02:00', '03:00', '04:00', '05:00'];

const DOCTORS = [
  { name: 'Dr. Sarah', role: 'Consultation', variant: 'sarah' as const, color: '#3B82F6' },
  { name: 'Dr. Taylor', role: 'Surgery', variant: 'taylor' as const, color: '#F97316' },
  { name: 'Dr. Morgan', role: 'Dentistry', variant: 'morgan' as const, color: '#6366F1' },
  { name: 'Dr. Lee', role: 'Cardiology', variant: 'lee' as const, color: '#22C55E' },
  { name: 'Dr. James', role: 'Dermatology', variant: 'james' as const, color: '#EC4899' },
];

const BLOCKS = [
  { col: 0, rowStart: 0, rowSpan: 2, label: 'Bella', sub: 'Check-up', color: '#3B82F6' },
  { col: 1, rowStart: 0, rowSpan: 3, label: 'Bruno', sub: 'Knee Surgery', color: '#F97316' },
  { col: 2, rowStart: 1, rowSpan: 2, label: 'Lucy', sub: 'Teeth Cleaning', color: '#6366F1' },
  { col: 3, rowStart: 1, rowSpan: 2, label: 'Molly', sub: 'Heart Check-up', color: '#22C55E' },
  { col: 4, rowStart: 2, rowSpan: 2, label: 'Oscar', sub: 'Skin Allergy', color: '#EC4899' },
  { col: 0, rowStart: 2, rowSpan: 1, label: 'Max', sub: 'Vaccination', color: '#3B82F6' },
  { col: 1, rowStart: 4, rowSpan: 2, label: 'Luna', sub: 'Follow-up', color: '#F97316' },
  { col: 2, rowStart: 4, rowSpan: 2, label: 'Rocky', sub: 'Dental', color: '#6366F1' },
  { col: 3, rowStart: 5, rowSpan: 2, label: 'Charlie', sub: 'Consultation', color: '#22C55E' },
  { col: 4, rowStart: 6, rowSpan: 1, label: 'Daisy', sub: 'Grooming', color: '#EC4899' },
  { col: 0, rowStart: 6, rowSpan: 2, label: 'Cooper', sub: 'X-Ray', color: '#3B82F6' },
  { col: 1, rowStart: 7, rowSpan: 2, label: 'Milo', sub: 'Check-up', color: '#F97316' },
];

export default function AppointmentsVisual() {
  return (
    <DashboardShell>
      <PanelHeader
        title="Appointments"
        actions={
          <div className="flex items-center gap-1.5 flex-wrap justify-end">
            <ToolbarButton>All Doctors ▾</ToolbarButton>
            <ToolbarButton>Today</ToolbarButton>
            <span className="flex items-center gap-0.5 text-[#64748B]">
              <ChevronLeft className="w-3 h-3" />
              <ChevronRight className="w-3 h-3" />
            </span>
            <span className="text-[8px] text-[#64748B] hidden sm:inline">May 12 – May 18, 2024</span>
            <ToolbarButton primary>+ New Appointment</ToolbarButton>
          </div>
        }
      />
      <ScheduleGrid times={TIMES} doctors={DOCTORS} blocks={BLOCKS} />
    </DashboardShell>
  );
}
