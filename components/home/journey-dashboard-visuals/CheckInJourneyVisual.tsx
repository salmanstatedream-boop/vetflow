'use client';

import {
  CheckCircle2,
  Clock,
  FileText,
  FolderOpen,
  Mail,
  Phone,
  Search,
  ShieldCheck,
  UserCheck,
  Users,
  XCircle,
} from 'lucide-react';
import {
  DoctorStockAvatar,
  PetStockAvatar,
  ToolbarButton,
} from '@/components/home/solution-dashboard-visuals/shared';
import {
  FeatureRail,
  JourneyFrame,
  JourneyScreenMotion,
  KpiStrip,
  MotionSlot,
  StatusBadge,
  SummaryCard,
} from './shared';

const QUEUE = [
  {
    status: 'CHECKED-IN',
    tone: 'green' as const,
    pet: 'bruno' as const,
    name: 'Bruno',
    breed: 'Golden Retriever · 2Y · Male',
    appt: '8:00 – 8:30 AM',
    apptDate: 'May 12, 2026',
    doctor: 'sarah' as const,
    doctorName: 'Dr. Sarah Johnson',
    doctorRole: 'Veterinarian',
    arrival: '8:02 AM',
    wait: '—',
    warn: false,
    action: 'View',
  },
  {
    status: 'CHECKED-IN',
    tone: 'green' as const,
    pet: 'luna' as const,
    name: 'Luna',
    breed: 'Persian Cat · 2Y · Female',
    appt: '9:30 – 10:00 AM',
    apptDate: 'May 12, 2026',
    doctor: 'taylor' as const,
    doctorName: 'Dr. Taylor Smith',
    doctorRole: 'Surgery',
    arrival: '9:28 AM',
    wait: '—',
    warn: false,
    action: 'View',
  },
  {
    status: 'WAITING',
    tone: 'orange' as const,
    pet: 'milo' as const,
    name: 'Milo',
    breed: 'Pug · 4Y · Male',
    appt: '10:00 – 10:30 AM',
    apptDate: 'May 12, 2026',
    doctor: 'morgan' as const,
    doctorName: 'Dr. Morgan Lee',
    doctorRole: 'Dentistry',
    arrival: '9:55 AM',
    wait: '5 min',
    warn: true,
    action: 'Check-in',
  },
  {
    status: 'WAITING',
    tone: 'orange' as const,
    pet: 'rocky' as const,
    name: 'Rocky',
    breed: 'German Shepherd · 5Y · Male',
    appt: '11:00 – 11:45 AM',
    apptDate: 'May 12, 2026',
    doctor: 'sarah' as const,
    doctorName: 'Dr. Sarah Johnson',
    doctorRole: 'Veterinarian',
    arrival: '10:52 AM',
    wait: '8 min',
    warn: true,
    action: 'Check-in',
  },
  {
    status: 'WAITING',
    tone: 'orange' as const,
    pet: 'cooper' as const,
    name: 'Coco',
    breed: 'British Shorthair · 1Y · Female',
    appt: '11:00 – 11:30 AM',
    apptDate: 'May 12, 2026',
    doctor: 'lee' as const,
    doctorName: 'Dr. Lee Kim',
    doctorRole: 'Cardiology',
    arrival: '10:50 AM',
    wait: '10 min',
    warn: true,
    action: 'Check-in',
  },
];

const STEPS = [
  { title: 'Verify Appointment', sub: 'Confirm booking details' },
  { title: 'Patient Verification', sub: 'Check client & patient info' },
  { title: 'Forms & Consent', sub: 'Update or collect forms' },
  { title: 'Check-in Complete', sub: "Add to doctor's queue" },
];

export default function CheckInJourneyVisual({
  reducedMotion = false,
}: {
  reducedMotion?: boolean;
}) {
  return (
    <JourneyScreenMotion reducedMotion={reducedMotion}>
      <JourneyFrame>
        <div className="flex min-w-0">
          <MotionSlot slot="rail">
            <FeatureRail
              badge="SMART CHECK-IN"
              title="Faster Check-in."
              titleAccent="Happier Clients."
              features={[
                { icon: FolderOpen, label: 'Instant Access', desc: 'Pull up complete patient records in seconds.' },
                { icon: ShieldCheck, label: 'Insurance & Docs', desc: 'Verify insurance and capture documents instantly.' },
                { icon: FileText, label: 'Digital Forms', desc: 'Let clients update forms before or at arrival.' },
                { icon: Clock, label: 'Queue Management', desc: 'See live queue and expected wait time.' },
                { icon: UserCheck, label: 'Seamless Handoff', desc: 'Checked-in patients move to the doctor.' },
              ]}
              stat={{ label: 'Check-ins Today', value: '18', delta: '+20% vs yesterday', sparkline: true }}
            />
          </MotionSlot>

          <MotionSlot slot="main" className="flex-1 min-w-0 p-3 sm:p-4">
            <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
              <p className="text-sm font-semibold text-[#F8FAFC]">Today&apos;s Check-in Queue</p>
              <div className="flex gap-1 text-[9px]">
                <span className="px-2.5 py-1 rounded-lg bg-[#8B5CF6] text-white font-medium">All (18)</span>
                <span className="px-2.5 py-1 rounded-lg border border-white/10 text-[#94A3B8]">Checked-in (9)</span>
                <span className="px-2.5 py-1 rounded-lg border border-white/10 text-[#94A3B8]">Waiting (9)</span>
              </div>
            </div>

            <div className="rounded-xl border border-white/10 overflow-hidden overflow-x-auto">
              <table className="w-full min-w-[660px] text-left">
                <thead>
                  <tr className="bg-white/[0.04] text-[8px] uppercase tracking-wider text-[#64748B]">
                    <th className="px-2.5 py-2 font-medium">Status</th>
                    <th className="px-2.5 py-2 font-medium">Patient</th>
                    <th className="px-2.5 py-2 font-medium">Appointment</th>
                    <th className="px-2.5 py-2 font-medium">Doctor</th>
                    <th className="px-2.5 py-2 font-medium">Arrival</th>
                    <th className="px-2.5 py-2 font-medium">Wait</th>
                    <th className="px-2.5 py-2 font-medium" />
                  </tr>
                </thead>
                <tbody>
                  {QUEUE.map((row) => (
                    <tr key={row.name} className="border-t border-white/5 text-[9px]">
                      <td className="px-2.5 py-2 align-middle">
                        <StatusBadge label={row.status} tone={row.tone} />
                      </td>
                      <td className="px-2.5 py-2">
                        <div className="flex items-center gap-2">
                          <PetStockAvatar pet={row.pet} size="md" />
                          <div className="min-w-0">
                            <p className="font-medium text-[#F8FAFC]">{row.name}</p>
                            <p className="text-[8px] text-[#64748B] truncate">{row.breed}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-2.5 py-2">
                        <p className="text-[#CBD5E1]">{row.appt}</p>
                        <p className="text-[8px] text-[#64748B]">{row.apptDate}</p>
                      </td>
                      <td className="px-2.5 py-2">
                        <div className="flex items-center gap-1.5">
                          <DoctorStockAvatar variant={row.doctor} size="sm" />
                          <div className="min-w-0">
                            <p className="text-[#CBD5E1] truncate">{row.doctorName}</p>
                            <p className="text-[8px] text-[#64748B]">{row.doctorRole}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-2.5 py-2 text-[#94A3B8] align-middle">{row.arrival}</td>
                      <td className="px-2.5 py-2 align-middle">
                        <span className={row.warn ? 'text-[#FDBA74]' : 'text-[#64748B]'}>{row.wait}</span>
                      </td>
                      <td className="px-2.5 py-2 align-middle">
                        <ToolbarButton primary={row.action === 'Check-in'}>{row.action}</ToolbarButton>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-3 rounded-xl border border-white/10 bg-white/[0.02] p-3">
              <p className="text-[10px] font-semibold text-[#F8FAFC] mb-2.5">Quick Check-in</p>
              <div className="flex items-start gap-1.5 overflow-x-auto scrollbar-none">
                {STEPS.map((s, i) => (
                  <div key={s.title} className="flex items-start gap-1.5 shrink-0">
                    <div className="flex items-start gap-1.5">
                      <span
                        className={
                          i === 0
                            ? 'w-5 h-5 rounded-full bg-[#8B5CF6] text-white text-[9px] font-bold flex items-center justify-center shrink-0'
                            : 'w-5 h-5 rounded-full border border-white/20 text-[#64748B] text-[9px] flex items-center justify-center shrink-0'
                        }
                      >
                        {i + 1}
                      </span>
                      <div className="min-w-0">
                        <p className={i === 0 ? 'text-[9px] font-medium text-[#E2E8F0]' : 'text-[9px] font-medium text-[#94A3B8]'}>
                          {s.title}
                        </p>
                        <p className="text-[8px] text-[#64748B] leading-snug">{s.sub}</p>
                      </div>
                    </div>
                    {i < STEPS.length - 1 ? <span className="w-6 h-px bg-white/15 mt-2.5 mx-1" /> : null}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-3 flex gap-2">
              <div className="flex-1 flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-2">
                <Search className="w-3.5 h-3.5 text-[#64748B]" />
                <span className="text-[9px] text-[#64748B]">Search by patient name, phone, or appointment ID</span>
              </div>
              <ToolbarButton primary>Start Check-in</ToolbarButton>
            </div>
          </MotionSlot>

          <MotionSlot slot="aside" className="hidden lg:flex flex-col w-[210px] xl:w-[232px] shrink-0 border-l border-white/10 p-3 gap-3">
            <SummaryCard>
              <div className="flex items-center gap-2.5 mb-3">
                <PetStockAvatar pet="milo" size="lg" />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-[11px] font-semibold text-[#F8FAFC]">Milo</p>
                    <StatusBadge label="Waiting" tone="orange" />
                  </div>
                  <p className="text-[8px] text-[#64748B]">Pug · 4Y · Male · 10kg</p>
                </div>
              </div>
              <div className="space-y-2.5 text-[8px]">
                <div>
                  <p className="text-[8px] font-mono uppercase tracking-wider text-[#C4B5FD] mb-1">Appointment</p>
                  <p className="text-[#CBD5E1]">May 12, 2026 · 10:00 – 10:30 AM</p>
                  <p className="text-[#94A3B8]">Dr. Morgan Lee · Dentistry</p>
                </div>
                <div>
                  <p className="text-[8px] font-mono uppercase tracking-wider text-[#C4B5FD] mb-1">Client</p>
                  <p className="text-[#CBD5E1]">Sarah Johnson</p>
                  <p className="text-[#94A3B8] flex items-center gap-1">
                    <Phone className="w-2.5 h-2.5" /> +1 (555) 123-4567
                  </p>
                  <p className="text-[#94A3B8] flex items-center gap-1">
                    <Mail className="w-2.5 h-2.5" /> sarah.johnson@email.com
                  </p>
                </div>
                <div>
                  <p className="text-[8px] font-mono uppercase tracking-wider text-[#C4B5FD] mb-1">Arrival</p>
                  <p className="text-[#CBD5E1]">9:55 AM · May 12, 2026</p>
                  <p className="text-[#86EFAC]">Early by 5 min</p>
                </div>
                <div>
                  <p className="text-[8px] font-mono uppercase tracking-wider text-[#C4B5FD] mb-1">Visit Reason</p>
                  <p className="text-[#CBD5E1]">Dental cleaning & check-up</p>
                  <p className="text-[#94A3B8]">Bad breath, tartar buildup</p>
                </div>
                <div>
                  <p className="text-[8px] font-mono uppercase tracking-wider text-[#C4B5FD] mb-1">Notes</p>
                  <p className="text-[#94A3B8]">Nervous around other dogs. Prefers gentle handling.</p>
                </div>
              </div>
              <div className="flex gap-1.5 mt-3">
                <ToolbarButton>View History</ToolbarButton>
                <ToolbarButton primary>Edit Info</ToolbarButton>
              </div>
            </SummaryCard>
          </MotionSlot>
        </div>

        <MotionSlot slot="footer">
          <KpiStrip
            items={[
              { icon: Users, label: 'Total Check-ins Today', value: '18', tone: 'purple' },
              { icon: CheckCircle2, label: 'Checked-in', value: '9', delta: '50%', tone: 'green' },
              { icon: Clock, label: 'Waiting', value: '9', delta: 'Avg wait: 12 min', tone: 'red' },
              { icon: XCircle, label: 'No-Shows', value: '0', delta: '0%', tone: 'amber' },
              { icon: UserCheck, label: 'On-Time Appointments', value: '95%', tone: 'green' },
            ]}
          />
        </MotionSlot>
      </JourneyFrame>
    </JourneyScreenMotion>
  );
}
