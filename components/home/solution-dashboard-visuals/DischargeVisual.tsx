'use client';

import { AlertTriangle, CheckCircle2, Clock, ClipboardList } from 'lucide-react';
import {
  AvatarChip,
  DashboardShell,
  InsightRing,
  MiniStatCard,
  PanelHeader,
  SearchRow,
  StatusPill,
  TabBar,
  ToolbarButton,
} from './shared';

const NOTES = [
  { patient: 'Bella', id: 'PID-7821', admit: 'May 10', discharge: 'May 12', diagnosis: 'Acute Tonsillitis', status: 'Completed', tone: 'green' as const },
  { patient: 'Max', id: 'PID-7819', admit: 'May 09', discharge: 'May 11', diagnosis: 'Post-op Recovery', status: 'In Progress', tone: 'blue' as const },
  { patient: 'Luna', id: 'PID-7815', admit: 'May 08', discharge: '—', diagnosis: 'Dental Procedure', status: 'Pending Review', tone: 'orange' as const },
  { patient: 'Rocky', id: 'PID-7812', admit: 'May 07', discharge: 'May 09', diagnosis: 'Fracture Repair', status: 'Completed', tone: 'green' as const },
];

export default function DischargeVisual() {
  return (
    <DashboardShell className="p-2 sm:p-3">
      <div className="grid lg:grid-cols-[1fr_160px] gap-3">
        <div className="space-y-2 min-w-0">
          <PanelHeader
            title="Discharge Overview"
            actions={
              <div className="flex gap-1">
                <ToolbarButton>All Locations ▾</ToolbarButton>
                <ToolbarButton>This Month 📅</ToolbarButton>
              </div>
            }
          />

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            <MiniStatCard label="Discharges" value="48" delta="↑ 22% vs last month" icon={ClipboardList} iconTone="purple" />
            <MiniStatCard label="Completed" value="43" delta="↑ 18% vs last month" icon={CheckCircle2} iconTone="blue" />
            <MiniStatCard label="In Progress" value="3" delta="↓ 25% vs last month" deltaTone="orange" icon={Clock} iconTone="orange" />
            <MiniStatCard label="Pending Review" value="2" delta="↓ 33% vs last month" deltaTone="red" icon={AlertTriangle} iconTone="red" />
          </div>

          <TabBar tabs={['Recent Notes', 'In Progress', 'Pending Review', 'All Notes']} active="Recent Notes" />
          <SearchRow placeholder="Search notes..." />

          <div className="rounded-lg border border-white/10 overflow-hidden">
            <div className="grid grid-cols-[1fr_0.65fr_0.65fr_1fr_0.75fr] gap-1 px-2 py-1.5 bg-white/[0.04] text-[7px] font-medium text-[#64748B] uppercase">
              <span>Patient</span>
              <span>Admitted</span>
              <span>Discharged</span>
              <span>Diagnosis</span>
              <span>Status</span>
            </div>
            {NOTES.map((row) => (
              <div
                key={row.id}
                className="grid grid-cols-[1fr_0.65fr_0.65fr_1fr_0.75fr] gap-1 px-2 py-1.5 border-t border-white/5 text-[8px] items-center even:bg-white/[0.02]"
              >
                <span className="flex items-center gap-1.5 min-w-0">
                  <AvatarChip name={row.patient} color="#8B5CF6" />
                  <span className="min-w-0">
                    <span className="text-[#F8FAFC] block truncate">{row.patient}</span>
                    <span className="text-[#64748B]">{row.id}</span>
                  </span>
                </span>
                <span className="text-[#94A3B8]">{row.admit}</span>
                <span className="text-[#94A3B8]">{row.discharge}</span>
                <span className="text-[#94A3B8] truncate">{row.diagnosis}</span>
                <StatusPill label={row.status} tone={row.tone} />
              </div>
            ))}
          </div>
          <p className="text-[8px] text-[#8B5CF6] font-medium">View all notes →</p>
        </div>

        <div className="space-y-2 hidden lg:block">
          <div className="rounded-lg border border-white/10 bg-white/[0.02] p-2.5">
            <div className="flex items-center justify-between mb-2 gap-1">
              <p className="text-[9px] font-semibold text-[#F8FAFC]">Note Preview</p>
              <ToolbarButton primary>Create New</ToolbarButton>
            </div>
            <div className="rounded-md border border-white/10 bg-[#0B1020] p-2 text-[7px] space-y-1.5">
              <div className="flex items-center gap-1.5 pb-1 border-b border-white/10">
                <span className="w-4 h-4 rounded bg-[#8B5CF6]/30" />
                <p className="font-semibold text-[#F8FAFC]">Phoenix Clinic</p>
              </div>
              <p className="text-[#64748B]">Discharge Summary</p>
              <p className="font-medium text-[#F8FAFC]">Bella · Golden Retriever</p>
              <p className="text-[#94A3B8]"><span className="text-[#64748B]">Diagnosis:</span> Acute Tonsillitis</p>
              <p className="text-[#94A3B8] leading-relaxed">Patient responded well to treatment. Rest recommended for 5 days with follow-up in 1 week.</p>
              <p className="text-[#64748B] font-medium">Medications:</p>
              <ul className="text-[#94A3B8] list-disc pl-3 space-y-0.5">
                <li>Amoxicillin 250mg — 7 days</li>
                <li>Meloxicam 1.5mg — 5 days</li>
              </ul>
            </div>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/[0.02] p-2.5">
            <PanelHeader title="Discharge Insights" />
            <div className="space-y-2">
              <InsightRing value="2.1d" label="Avg. Length of Stay" tone="purple" />
              <InsightRing value="92%" label="Notes Completed on Time" tone="green" />
              <InsightRing value="18%" label="Readmission Rate" tone="red" />
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
