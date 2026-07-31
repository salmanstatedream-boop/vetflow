'use client';

import {
  ClipboardList,
  Clock,
  FileText,
  FolderOpen,
  ShieldCheck,
  UserCheck,
  Users,
} from 'lucide-react';
import {
  PetStockAvatar,
  StatusPill,
  ToolbarButton,
} from '@/components/home/solution-dashboard-visuals/shared';
import { FeatureRail, JourneyFrame, KpiStrip, SummaryCard } from './shared';

const QUEUE = [
  { pet: 'milo' as const, name: 'Milo', breed: 'Pug', time: '09:00', doctor: 'Dr. Morgan', status: 'Waiting', tone: 'orange' as const },
  { pet: 'bella' as const, name: 'Bella', breed: 'Beagle', time: '09:15', doctor: 'Dr. Sarah', status: 'Checked-in', tone: 'green' as const },
  { pet: 'max' as const, name: 'Max', breed: 'Husky', time: '09:30', doctor: 'Dr. Lee', status: 'Waiting', tone: 'orange' as const },
  { pet: 'luna' as const, name: 'Luna', breed: 'Cat', time: '09:45', doctor: 'Dr. Taylor', status: 'Checked-in', tone: 'green' as const },
  { pet: 'rocky' as const, name: 'Rocky', breed: 'Lab', time: '10:00', doctor: 'Dr. Sarah', status: 'Waiting', tone: 'orange' as const },
];

export default function CheckInJourneyVisual() {
  return (
    <JourneyFrame>
      <div className="flex min-w-0">
        <FeatureRail
          badge="SMART CHECK-IN"
          title="Faster Check-in. Happier Clients."
          features={[
            { icon: FolderOpen, label: 'Instant Access', desc: 'Records in seconds' },
            { icon: ShieldCheck, label: 'Insurance & Docs', desc: 'Verify on arrival' },
            { icon: FileText, label: 'Digital Forms', desc: 'Update before visit' },
            { icon: Clock, label: 'Queue Management', desc: 'Live wait times' },
            { icon: UserCheck, label: 'Seamless Handoff', desc: 'Straight to doctor' },
          ]}
          stat={{ label: 'Check-ins Today', value: '18', delta: '+28% vs yesterday' }}
        />
        <div className="flex-1 min-w-0 p-2.5 sm:p-3">
          <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
            <p className="text-xs font-semibold text-[#F8FAFC]">Today&apos;s Check-in Queue</p>
            <div className="flex gap-1 text-[8px]">
              <span className="px-2 py-1 rounded-full bg-[#8B5CF6]/20 text-[#C4B5FD] border border-[#8B5CF6]/30">All (18)</span>
              <span className="px-2 py-1 rounded-full border border-white/10 text-[#94A3B8]">Checked-in (9)</span>
              <span className="px-2 py-1 rounded-full border border-white/10 text-[#94A3B8]">Waiting (9)</span>
            </div>
          </div>
          <div className="rounded-lg border border-white/10 overflow-hidden mb-2">
            <div className="grid grid-cols-[0.7fr_1.2fr_0.7fr_1fr_0.7fr] gap-1 px-2 py-1.5 bg-white/[0.04] text-[7px] uppercase text-[#64748B]">
              <span>Status</span>
              <span>Patient</span>
              <span>Appt</span>
              <span>Doctor</span>
              <span>Action</span>
            </div>
            {QUEUE.map((row) => (
              <div
                key={row.name}
                className="grid grid-cols-[0.7fr_1.2fr_0.7fr_1fr_0.7fr] gap-1 px-2 py-1.5 border-t border-white/5 text-[8px] items-center"
              >
                <StatusPill label={row.status} tone={row.tone} />
                <span className="flex items-center gap-1.5 min-w-0">
                  <PetStockAvatar pet={row.pet} size="sm" />
                  <span className="truncate">
                    <span className="text-[#F8FAFC] block">{row.name}</span>
                    <span className="text-[#64748B]">{row.breed}</span>
                  </span>
                </span>
                <span className="text-[#94A3B8] font-mono">{row.time}</span>
                <span className="text-[#94A3B8] truncate">{row.doctor}</span>
                <ToolbarButton primary={row.status === 'Waiting'}>
                  {row.status === 'Waiting' ? 'Check-in' : 'View'}
                </ToolbarButton>
              </div>
            ))}
          </div>
          <div className="flex gap-1.5 text-[8px] flex-wrap">
            {['1 Verify Appointment', '2 Patient Verification', '3 Forms & Consent', '4 Check-in Complete'].map((s, i) => (
              <span
                key={s}
                className={`px-2 py-1 rounded-full border ${
                  i === 0
                    ? 'border-[#8B5CF6]/40 bg-[#8B5CF6]/15 text-[#C4B5FD]'
                    : 'border-white/10 text-[#64748B]'
                }`}
              >
                {s}
              </span>
            ))}
          </div>
        </div>
        <div className="hidden lg:block w-[168px] shrink-0 border-l border-white/10 p-2.5">
          <SummaryCard title="Milo · Waiting">
            <div className="flex items-center gap-2 mb-2">
              <PetStockAvatar pet="milo" size="md" />
              <div>
                <p className="text-[9px] text-[#F8FAFC]">Pug · Dentistry</p>
                <StatusPill label="Waiting" tone="orange" />
              </div>
            </div>
            <p className="text-[8px] text-[#94A3B8]">May 12 · Dr. Morgan Lee</p>
            <p className="text-[8px] text-[#64748B] mt-1">Owner: Sarah Johnson</p>
            <p className="text-[8px] text-[#86EFAC] mt-1">Early by 5 min</p>
            <p className="text-[8px] text-[#94A3B8] mt-2">Dental cleaning & check-up</p>
            <div className="flex gap-1 mt-2">
              <ToolbarButton>History</ToolbarButton>
              <ToolbarButton primary>Edit Info</ToolbarButton>
            </div>
          </SummaryCard>
        </div>
      </div>
      <KpiStrip
        items={[
          { label: 'Total Check-ins', value: '18', icon: ClipboardList },
          { label: 'Checked-in', value: '9', delta: '50%', icon: UserCheck },
          { label: 'Waiting', value: '9', delta: 'Avg 12 min', icon: Clock },
          { label: 'On-Time', value: '95%', icon: Users },
        ]}
      />
    </JourneyFrame>
  );
}
