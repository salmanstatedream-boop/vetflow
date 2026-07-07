'use client';

import { Download, FileText } from 'lucide-react';
import {
  DashboardShell,
  FileCountCard,
  MetricTile,
  PanelHeader,
  PetAvatar,
  SearchRow,
  StatusPill,
  TabBar,
} from './shared';

const PATIENTS = [
  { name: 'Bella', id: 'P-2026-00010', date: 'May 12, 2024', variant: 'golden' as const },
  { name: 'Max', id: 'P-2026-00008', date: 'May 11, 2024', variant: 'husky' as const },
  { name: 'Luna', id: 'P-2026-00007', date: 'May 10, 2024', variant: 'tabby' as const },
  { name: 'Rocky', id: 'P-2026-00006', date: 'May 09, 2024', variant: 'beagle' as const },
  { name: 'Milo', id: 'P-2026-00005', date: 'May 08, 2024', variant: 'poodle' as const },
];

const TIMELINE = [
  { title: 'Wellness / Check-up', date: 'May 12, 2024', doctor: 'Dr. Sarah' },
  { title: 'Vaccination', date: 'Apr 28, 2024', doctor: 'Dr. Taylor' },
  { title: 'Skin Allergy Consult', date: 'Mar 15, 2024', doctor: 'Dr. James' },
];

const DOCS = [
  { name: 'Blood Work Report.pdf', tag: 'Lab Reports', date: 'May 12, 2024' },
  { name: 'Vaccination Certificate.pdf', tag: 'Records', date: 'Apr 28, 2024' },
  { name: 'X-Ray Results.pdf', tag: 'Reports', date: 'Mar 15, 2024' },
];

export default function PatientRecordsVisual() {
  return (
    <DashboardShell className="p-2 sm:p-3">
      <div className="grid lg:grid-cols-[130px_1fr] gap-2.5 h-full min-h-[380px]">
        <div className="space-y-2">
          <PanelHeader title="Patients" />
          <SearchRow placeholder="Search by name, ID or phone..." />
          <div className="space-y-1.5">
            {PATIENTS.map((p, i) => (
              <div
                key={p.id}
                className={`rounded-lg border p-2 ${i === 0 ? 'border-[#8B5CF6]/50 bg-[#8B5CF6]/10' : 'border-white/10 bg-white/[0.02]'}`}
              >
                <div className="flex items-center gap-2">
                  <PetAvatar variant={p.variant} size="sm" />
                  <div className="min-w-0">
                    <p className="text-[9px] font-semibold text-[#F8FAFC] truncate">{p.name}</p>
                    <p className="text-[7px] text-[#64748B]">{p.id}</p>
                  </div>
                </div>
                <p className="text-[7px] text-[#64748B] mt-1">{p.date}</p>
              </div>
            ))}
          </div>
          <p className="text-[7px] text-[#64748B] text-center">&lt; 1 2 3 … 12 &gt;</p>
        </div>

        <div className="rounded-lg border border-white/10 bg-white/[0.02] p-2.5 space-y-2.5 overflow-hidden">
          <div className="flex items-start gap-3">
            <PetAvatar variant="golden" size="lg" showCamera />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-sm font-bold text-[#F8FAFC]">Bella</h4>
                <StatusPill label="STABLE" tone="green" />
              </div>
              <p className="text-[8px] text-[#64748B]">Golden Retriever</p>
              <div className="flex flex-wrap gap-1.5 mt-2">
                <MetricTile label="Age" value="3 yr 2 mo" />
                <MetricTile label="Weight" value="28.4 kg" />
                <MetricTile label="Condition" value="4/9" />
                <MetricTile label="Sex" value="Female" />
                <MetricTile label="Patient ID" value="P-2026-00010" />
              </div>
            </div>
          </div>

          <TabBar tabs={['Medical History', 'Timeline', 'Vaccination', 'Files', 'Billing', 'More ▾']} active="Medical History" />

          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <PanelHeader title="Treatment Timeline" />
              <div className="space-y-2.5 pl-2 border-l-2 border-[#8B5CF6]/40">
                {TIMELINE.map((item) => (
                  <div key={item.title} className="relative pl-3">
                    <span className="absolute -left-[6px] top-1 w-2.5 h-2.5 rounded-full bg-[#8B5CF6] ring-2 ring-[#0B1020]" />
                    <p className="text-[8px] font-medium text-[#F8FAFC]">{item.title}</p>
                    <p className="text-[7px] text-[#64748B]">{item.date}</p>
                    <p className="text-[7px] text-[#64748B]">{item.doctor}</p>
                  </div>
                ))}
              </div>
              <p className="text-[8px] text-[#8B5CF6] mt-2 font-medium">View Timeline →</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <PanelHeader title="Medical File Overview" />
                <span className="text-[8px] text-[#8B5CF6] -mt-3">View All</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                <FileCountCard label="Lab Reports" count={8} tone="purple" />
                <FileCountCard label="Vaccinations" count={5} tone="blue" />
                <FileCountCard label="Medications" count={3} tone="green" />
                <FileCountCard label="Clinical Notes" count={6} tone="orange" />
              </div>
              <PanelHeader title="Recent Documents" />
              <div className="space-y-1">
                {DOCS.map((doc) => (
                  <div key={doc.name} className="flex items-center gap-2 rounded-md border border-white/10 px-2 py-1.5">
                    <FileText className="w-3 h-3 text-[#C4B5FD] shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[8px] text-[#F8FAFC] truncate">{doc.name}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <StatusPill label={doc.tag} tone="purple" />
                        <span className="text-[7px] text-[#64748B]">{doc.date}</span>
                      </div>
                    </div>
                    <Download className="w-3 h-3 text-[#64748B] shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
