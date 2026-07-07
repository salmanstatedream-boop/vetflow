'use client';

import { AlertTriangle, Clock, FlaskConical, TestTube2 } from 'lucide-react';
import type { SolutionPetKey } from '@/lib/solution-mockup-assets';
import {
  CategoryBar,
  DashboardShell,
  DonutRing,
  MiniStatCard,
  PanelHeader,
  PetStockAvatar,
  SearchRow,
  StatusPill,
  TabBar,
  ToolbarButton,
} from './shared';

const TESTS: {
  test: string;
  pet: SolutionPetKey;
  status: string;
  priority: string;
  tat: string;
  Icon: typeof TestTube2;
}[] = [
  { test: 'Complete Blood Count (CBC)', pet: 'bella', status: 'Completed', priority: 'Normal', tat: '1h 20m', Icon: TestTube2 },
  { test: 'Biochemistry Panel', pet: 'max', status: 'In Progress', priority: 'Normal', tat: '0h 48m', Icon: FlaskConical },
  { test: 'Liver Function Test (LFT)', pet: 'luna', status: 'In Progress', priority: 'Normal', tat: '1h 05m', Icon: TestTube2 },
  { test: 'Kidney Function Test (KFT)', pet: 'rocky', status: 'Pending', priority: 'Normal', tat: '—', Icon: FlaskConical },
  { test: 'Thyroid Profile', pet: 'milo', status: 'Completed', priority: 'Critical', tat: '1h 35m', Icon: TestTube2 },
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
                <span className="flex items-center gap-1 min-w-0">
                  <PetStockAvatar pet={row.pet} size="sm" />
                  <span className="text-[#94A3B8] truncate capitalize">{row.pet}</span>
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
