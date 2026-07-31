'use client';

import Image from 'next/image';
import {
  BarChart3,
  Bell,
  CalendarCheck,
  FolderOpen,
  Mic,
  Package,
  Receipt,
  Shield,
  Sparkles,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';
import { AnimatedWaveform } from '@/components/home/marketing-visuals/animations';
import {
  AvatarChip,
  PetStockAvatar,
  StatusPill,
  ToolbarButton,
} from '@/components/home/solution-dashboard-visuals/shared';
import {
  JourneyFrame,
  JourneyScreenMotion,
  MotionSlot,
  ProgressBar,
} from './shared';

const LEFT_CARDS = [
  { icon: CalendarCheck, title: 'Smart Scheduling', desc: 'Conflict-free booking' },
  { icon: FolderOpen, title: 'Unified Patient Records', desc: 'One chart, every visit' },
  { icon: Sparkles, title: 'AI Clinical Assistant', desc: 'SOAP & suggestions' },
];

const RIGHT_CARDS = [
  { icon: Package, title: 'Inventory Sync', desc: 'Stock updates live' },
  { icon: Receipt, title: 'Auto Invoicing', desc: 'Bill from treatment' },
  { icon: Bell, title: 'Smart Follow-ups', desc: 'Never miss a recheck' },
];

const VALUE_PROPS = [
  { icon: Zap, label: 'Save Hours Daily' },
  { icon: Shield, label: 'Zero Data Loss' },
  { icon: BarChart3, label: 'Better Outcomes' },
  { icon: Users, label: 'Happier Clients' },
  { icon: TrendingUp, label: 'Clinic Growth' },
];

const NAV = [
  'Dashboard',
  'Appointments',
  'Patients',
  'Consultations',
  'Inventory',
  'Laboratory',
  'Billing',
  'Messages',
  'Reports',
  'Settings',
];

const PATIENT_NAV = ['Overview', 'History', 'Examination', 'Diagnostics', 'Medications', 'Notes', 'Follow-ups'];

function FloatCard({
  icon: Icon,
  title,
  desc,
}: {
  icon: typeof Zap;
  title: string;
  desc: string;
}) {
  return (
    <div className="rounded-xl border border-[#8B5CF6]/30 bg-[#0B0B0F]/95 backdrop-blur px-3 py-2.5 shadow-[0_0_20px_rgba(139,92,246,0.12)]">
      <div className="flex items-center gap-2">
        <span className="w-7 h-7 rounded-lg bg-[#8B5CF6]/20 border border-[#8B5CF6]/35 flex items-center justify-center shrink-0">
          <Icon className="w-3.5 h-3.5 text-[#C4B5FD]" />
        </span>
        <div className="min-w-0">
          <p className="text-[10px] font-semibold text-[#F8FAFC] leading-tight">{title}</p>
          <p className="text-[8px] text-[#64748B]">{desc}</p>
        </div>
      </div>
    </div>
  );
}

export default function ConsultationJourneyVisual({
  reducedMotion = false,
}: {
  reducedMotion?: boolean;
}) {
  return (
    <JourneyScreenMotion reducedMotion={reducedMotion}>
      <JourneyFrame className="bg-transparent border-0">
        <div className="relative px-2 sm:px-4 py-4">
          <div className="flex gap-3 xl:gap-5 items-stretch">
            <MotionSlot slot="rail" className="hidden xl:flex flex-col gap-3 w-[150px] shrink-0 justify-center">
              {LEFT_CARDS.map((c) => (
                <FloatCard key={c.title} {...c} />
              ))}
            </MotionSlot>

            <MotionSlot slot="main" className="flex-1 min-w-0">
              <div className="rounded-2xl border border-white/10 bg-[#0B0B0F] overflow-hidden shadow-[0_0_40px_rgba(139,92,246,0.12)]">
                <div className="flex min-h-[420px]">
                  {/* App sidebar */}
                  <div className="hidden md:flex flex-col w-[132px] shrink-0 border-r border-white/10 bg-white/[0.02] p-2.5">
                    <div className="flex items-center gap-1.5 mb-4 px-1">
                      <div className="relative w-6 h-6">
                        <Image src="/phoenix-logo.png" alt="" fill className="object-contain" />
                      </div>
                      <span className="text-[10px] font-semibold text-[#F8FAFC]">Phoenix OS</span>
                    </div>
                    <nav className="space-y-0.5 flex-1">
                      {NAV.map((item) => (
                        <div
                          key={item}
                          className={
                            item === 'Consultations'
                              ? 'relative text-[9px] font-medium text-white bg-[#8B5CF6]/25 rounded-md px-2 py-1.5 border-l-2 border-[#8B5CF6]'
                              : 'text-[9px] text-[#64748B] px-2 py-1.5'
                          }
                        >
                          {item}
                        </div>
                      ))}
                    </nav>
                    <div className="mt-2 pt-2 border-t border-white/10 px-1 flex items-center gap-1.5">
                      <AvatarChip name="Ahmed R" color="#8B5CF6" />
                      <div className="min-w-0">
                        <p className="text-[8px] font-medium text-[#F8FAFC]">Dr. Ahmed R.</p>
                        <p className="text-[7px] text-[#64748B]">Veterinarian</p>
                      </div>
                    </div>
                  </div>

                  {/* Patient column */}
                  <div className="hidden sm:flex flex-col w-[140px] shrink-0 border-r border-white/10 p-2.5">
                    <p className="text-[8px] font-mono uppercase tracking-wider text-[#C4B5FD] mb-2">
                      Consultation in Progress
                    </p>
                    <div className="flex flex-col items-center text-center mb-3">
                      <PetStockAvatar pet="bruno" size="xl" />
                      <p className="text-[10px] font-semibold text-[#F8FAFC] mt-1.5">Bruno</p>
                      <p className="text-[7px] text-[#64748B]">Golden · 3Y · 32kg</p>
                      <div className="mt-1">
                        <StatusPill label="Active" tone="green" />
                      </div>
                    </div>
                    <div className="space-y-0.5">
                      {PATIENT_NAV.map((n) => (
                        <div
                          key={n}
                          className={
                            n === 'Notes'
                              ? 'text-[8px] text-[#C4B5FD] bg-[#8B5CF6]/15 rounded px-1.5 py-1 font-medium'
                              : 'text-[8px] text-[#64748B] px-1.5 py-1'
                          }
                        >
                          {n}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* SOAP center */}
                  <div className="flex-1 min-w-0 p-3 flex flex-col">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[10px] font-semibold text-[#F8FAFC]">SOAP Notes</p>
                      <span className="inline-flex items-center gap-1 text-[8px] font-medium text-[#86EFAC]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" /> Live
                      </span>
                    </div>
                    <div className="flex gap-1 mb-2">
                      {['S', 'O', 'A', 'P'].map((tab, i) => (
                        <span
                          key={tab}
                          className={
                            i === 0
                              ? 'w-7 h-7 rounded-md bg-[#8B5CF6] text-white text-[10px] font-bold flex items-center justify-center'
                              : 'w-7 h-7 rounded-md border border-white/10 text-[#64748B] text-[10px] font-semibold flex items-center justify-center'
                          }
                          title={['Subjective', 'Objective', 'Assessment', 'Plan'][i]}
                        >
                          {tab}
                        </span>
                      ))}
                      <span className="ml-2 text-[9px] text-[#94A3B8] self-center">Subjective</span>
                    </div>

                    <div className="rounded-xl border border-[#8B5CF6]/30 bg-[#8B5CF6]/10 p-2.5 mb-2 flex items-center gap-2">
                      <span className="w-8 h-8 rounded-full bg-[#8B5CF6] flex items-center justify-center shrink-0">
                        <Mic className="w-4 h-4 text-white" />
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[9px] text-[#C4B5FD] font-medium">AI is listening…</p>
                        <AnimatedWaveform barCount={18} className="h-5 mt-1" minHeight={20} maxHeight={90} />
                      </div>
                    </div>

                    <div className="flex-1 space-y-2 overflow-hidden mb-2">
                      <div className="rounded-lg rounded-tl-none border border-white/10 bg-white/[0.04] p-2 max-w-[90%]">
                        <p className="text-[8px] text-[#64748B] mb-0.5">Dr. Smith</p>
                        <p className="text-[9px] text-[#E2E8F0]">
                          Owner reports vomiting for 2 days, soft stool, and reduced appetite after scavenging.
                        </p>
                      </div>
                      <div className="rounded-lg rounded-tr-none border border-[#8B5CF6]/25 bg-[#8B5CF6]/10 p-2 max-w-[90%] ml-auto">
                        <p className="text-[8px] text-[#C4B5FD] mb-0.5 flex items-center gap-1">
                          <Sparkles className="w-3 h-3" /> AI Assistant
                        </p>
                        <p className="text-[9px] text-[#E2E8F0]">
                          Captured: vomiting ×2d, diarrhea, anorexia. Suggest CBC and GI panel. Top match: Acute
                          Gastroenteritis (82%).
                        </p>
                      </div>
                    </div>

                    <div className="rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-2 text-[9px] text-[#64748B]">
                      Ask AI or type your note…
                    </div>
                  </div>

                  {/* Right insights */}
                  <div className="hidden lg:flex flex-col w-[180px] shrink-0 border-l border-white/10 p-2.5 gap-2">
                    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-2.5">
                      <p className="text-[9px] font-semibold text-[#F8FAFC] mb-2">AI Suggestions</p>
                      <p className="text-[8px] text-[#64748B] mb-1.5">Top Possible Diagnoses</p>
                      <div className="space-y-1.5 mb-2">
                        <ProgressBar label="Acute Gastroenteritis" value={82} />
                        <ProgressBar label="Dietary Indiscretion" value={61} color="#A78BFA" />
                        <ProgressBar label="Parasites" value={28} color="#64748B" />
                      </div>
                      <p className="text-[8px] text-[#64748B] mb-1">Suggested Plan</p>
                      <ul className="text-[8px] text-[#86EFAC] space-y-0.5 mb-2">
                        <li>✓ IV fluid therapy</li>
                        <li>✓ Antiemetic Rx</li>
                        <li>✓ Bland diet 48h</li>
                      </ul>
                      <ToolbarButton primary>Create Prescription</ToolbarButton>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-2">
                      <p className="text-[8px] font-semibold text-[#F8FAFC] mb-1.5">Patient Summary</p>
                      <div className="grid grid-cols-2 gap-1 text-[7px] text-[#94A3B8]">
                        <span>Temp 38.6°C</span>
                        <span>HR 96</span>
                        <span>RR 24</span>
                        <span>Wt 32kg</span>
                      </div>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-2">
                      <p className="text-[8px] font-semibold text-[#F8FAFC]">Next Follow-up</p>
                      <p className="text-[9px] text-[#C4B5FD] mt-0.5">May 22, 2026</p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-2">
                      <p className="text-[8px] font-semibold text-[#F8FAFC] mb-1.5">Attached Files</p>
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5">
                          <span className="w-6 h-6 rounded bg-[#F43F5E]/15 border border-[#F43F5E]/30 flex items-center justify-center text-[6px] font-bold text-[#FDA4AF] shrink-0">
                            PDF
                          </span>
                          <span className="text-[8px] text-[#94A3B8] truncate">Lab_Result.pdf</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="w-6 h-6 rounded bg-[#3B82F6]/15 border border-[#3B82F6]/30 flex items-center justify-center text-[6px] font-bold text-[#93C5FD] shrink-0">
                            IMG
                          </span>
                          <span className="text-[8px] text-[#94A3B8] truncate">Xray_Abdomen.jpg</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </MotionSlot>

            <MotionSlot slot="aside" className="hidden xl:flex flex-col gap-3 w-[150px] shrink-0 justify-center">
              {RIGHT_CARDS.map((c) => (
                <FloatCard key={c.title} {...c} />
              ))}
            </MotionSlot>
          </div>

          <MotionSlot slot="footer" className="mt-4">
            <div className="rounded-2xl border border-white/10 bg-[#0B0B0F]/90 px-3 py-3">
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-3">
                {VALUE_PROPS.map((v) => (
                  <div key={v.label} className="flex items-center gap-2 px-2 py-1.5">
                    <span className="w-7 h-7 rounded-lg bg-[#8B5CF6]/15 border border-[#8B5CF6]/25 flex items-center justify-center">
                      <v.icon className="w-3.5 h-3.5 text-[#C4B5FD]" />
                    </span>
                    <span className="text-[9px] font-medium text-[#E2E8F0]">{v.label}</span>
                  </div>
                ))}
              </div>
              <div className="pt-2 border-t border-white/10">
                <p className="text-[10px] text-[#94A3B8] text-center sm:text-left">
                  Experience the Power of an Intelligent Workflow. Phoenix OS brings every step together.
                </p>
              </div>
            </div>
          </MotionSlot>
        </div>
      </JourneyFrame>
    </JourneyScreenMotion>
  );
}
