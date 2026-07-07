'use client';

import { AlertTriangle, Clock, Droplets, FlaskConical, TestTube2 } from 'lucide-react';
import {
  AvatarChip,
  CategoryBar,
  DashboardShell,
  DonutRing,
  MiniStatCard,
  PanelHeader,
  SearchRow,
  StatusPill,
  TabBar,
  ToolbarButton,
} from './shared';

const TESTS = [
  { test: 'Complete Blood Count (CBC)', patient: 'Bella', status: 'Completed', priority: 'Normal', tat: '1.2 hrs', Icon: TestTube2 },
  { test: 'Biochemistry Panel', patient: 'Max', status: 'In Progress', priority: 'Normal', tat: '0.8 hrs', Icon: FlaskConical },
  { test: 'Urinalysis', patient: 'Luna', status: 'Pending', priority: 'Normal', tat: '—', Icon: Droplets },
  { test: 'Thyroid Panel', patient: 'Rocky', status: 'In Progress', priority: 'Critical', tat: '1.5 hrs', Icon: TestTube2 },
];

export default function LaboratoryVisual() {
  return (
    <DashboardShell className="p-2 sm:p-3">
      <div className="grid lg:grid-cols-[1fr_170px] gap-3">
        <div className="space-y-2 min-w-0">
          <PanelHeader
            title="Lab Overview"
            actions={
              <div className="flex gap-1">
                <ToolbarButton>All Locations ▾</ToolbarButton>
                <ToolbarButton>Today 📅</ToolbarButton>
              </div>
            }
          />

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            <MiniStatCard label="Tests Conducted" value="125" delta="↑ 12% vs yesterday" icon={FlaskConical} iconTone="purple" />
            <MiniStatCard label="Pending Samples" value="8" delta="↓ 2 vs yesterday" deltaTone="orange" icon={Clock} iconTone="orange" />
            <MiniStatCard label="Critical Results" value="3" delta="View & Notify" deltaTone="red" icon={AlertTriangle} iconTone="red" />
            <MiniStatCard label="Reports Completed" value="112" delta="↑ 18% vs yesterday" icon={FlaskConical} iconTone="green" />
          </div>

          <TabBar
            tabs={['Recent Tests', 'Critical Alerts', 'Turnaround Time', 'Test Trends']}
            active="Recent Tests"
            badge={{ 'Critical Alerts': 3 }}
          />
          <SearchRow placeholder="Search tests..." />

          <div className="rounded-lg border border-white/10 overflow-hidden">
            <div className="grid grid-cols-[1.4fr_0.9fr_0.8fr_0.7fr_0.5fr] gap-1 px-2 py-1.5 bg-white/[0.04] text-[7px] font-medium text-[#64748B] uppercase">
              <span>Test</span>
              <span>Patient</span>
              <span>Status</span>
              <span>Priority</span>
              <span>TAT</span>
            </div>
            {TESTS.map((row) => (
              <div
                key={row.test}
                className="grid grid-cols-[1.4fr_0.9fr_0.8fr_0.7fr_0.5fr] gap-1 px-2 py-1.5 border-t border-white/5 text-[8px] items-center even:bg-white/[0.02]"
              >
                <span className="flex items-center gap-1 text-[#F8FAFC] truncate">
                  <row.Icon className="w-3 h-3 text-[#C4B5FD] shrink-0" />
                  {row.test}
                </span>
                <span className="flex items-center gap-1">
                  <AvatarChip name={row.patient} color="#8B5CF6" />
                  <span className="text-[#94A3B8]">{row.patient}</span>
                </span>
                <StatusPill
                  label={row.status}
                  tone={row.status === 'Completed' ? 'green' : row.status === 'Pending' ? 'orange' : 'blue'}
                />
                <StatusPill label={row.priority} tone={row.priority === 'Critical' ? 'red' : 'purple'} />
                <span className="text-[#64748B]">{row.tat}</span>
              </div>
            ))}
          </div>
          <p className="text-[8px] text-[#8B5CF6] font-medium">View all tests →</p>
        </div>

        <div className="space-y-3 hidden lg:block">
          <div className="rounded-lg border border-white/10 bg-white/[0.02] p-2.5">
            <PanelHeader title="Sample Status" />
            <DonutRing
              centerValue="136"
              centerLabel="Total Samples"
              segments={[
                { pct: 60, color: '#22C55E', label: 'Completed' },
                { pct: 21, color: '#3B82F6', label: 'In Progress' },
                { pct: 13, color: '#F97316', label: 'Pending' },
                { pct: 6, color: '#64748B', label: 'Cancelled' },
              ]}
            />
          </div>
          <div className="rounded-lg border border-white/10 bg-white/[0.02] p-2.5">
            <PanelHeader title="Top Test Categories" />
            <div className="space-y-2">
              <CategoryBar label="Hematology" pct={38} tone="purple" />
              <CategoryBar label="Biochemistry" pct={28} tone="blue" />
              <CategoryBar label="Microbiology" pct={17} tone="orange" />
              <CategoryBar label="Immunology" pct={9} tone="green" />
              <CategoryBar label="Others" pct={8} tone="purple" />
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
