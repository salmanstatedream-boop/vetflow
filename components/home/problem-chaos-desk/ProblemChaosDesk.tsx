'use client';

import {
  AlertTriangle,
  ArrowRightLeft,
  Bell,
  Calendar,
  Check,
  ClipboardList,
  Clock,
  DollarSign,
  FileText,
  FolderOpen,
  Mail,
  MessageCircle,
  Microscope,
  Phone,
  PhoneMissed,
  Syringe,
  Users,
  UserRound,
} from 'lucide-react';
import type { CSSProperties, ReactNode } from 'react';
import { cn } from '@/lib/utils';

function GlassCard({
  className,
  children,
  style,
}: {
  className?: string;
  children: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <div
      className={cn(
        'absolute rounded-xl border border-white/15 bg-[#0B1020]/75 backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.45)] p-2.5',
        className,
      )}
      style={style}
    >
      {children}
    </div>
  );
}

function StickyNote({
  className,
  color,
  children,
  rotate,
}: {
  className?: string;
  color: 'yellow' | 'pink' | 'purple' | 'green';
  children: ReactNode;
  rotate?: string;
}) {
  const bg =
    color === 'yellow'
      ? 'bg-[#FDE68A] text-[#78350F]'
      : color === 'pink'
        ? 'bg-[#FBCFE8] text-[#9D174D]'
        : color === 'green'
          ? 'bg-[#BBF7D0] text-[#14532D]'
          : 'bg-[#DDD6FE] text-[#5B21B6]';
  return (
    <div
      className={cn(
        'absolute w-[88px] h-[88px] p-2 text-[10px] font-medium leading-snug shadow-lg',
        bg,
        className,
      )}
      style={{ transform: rotate ?? 'rotate(-6deg)' }}
    >
      {children}
    </div>
  );
}

export default function ProblemChaosDesk() {
  return (
    <div className="relative w-full h-full min-h-[560px] lg:min-h-[780px] rounded-2xl overflow-hidden border border-white/10">
      {/* Desk surface */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 60% 40%, #1a1528 0%, #0a0a0f 55%, #050508 100%)',
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")',
        }}
      />

      {/* Dashed connectors */}
      <svg
        aria-hidden
        className="absolute inset-0 w-full h-full pointer-events-none opacity-30"
        viewBox="0 0 800 780"
        fill="none"
        preserveAspectRatio="none"
      >
        <path
          d="M120 80 C 220 120, 280 200, 360 240"
          stroke="rgba(148,163,184,0.5)"
          strokeWidth="1"
          strokeDasharray="4 6"
        />
        <path
          d="M400 120 C 480 180, 520 260, 580 300"
          stroke="rgba(148,163,184,0.45)"
          strokeWidth="1"
          strokeDasharray="4 6"
        />
        <path
          d="M180 320 C 280 360, 360 400, 480 420"
          stroke="rgba(148,163,184,0.4)"
          strokeWidth="1"
          strokeDasharray="4 6"
        />
        <path
          d="M520 160 C 560 280, 540 380, 420 480"
          stroke="rgba(148,163,184,0.35)"
          strokeWidth="1"
          strokeDasharray="4 6"
        />
        <path
          d="M260 520 C 340 540, 420 560, 560 540"
          stroke="rgba(148,163,184,0.35)"
          strokeWidth="1"
          strokeDasharray="4 6"
        />
        <path
          d="M100 560 C 220 600, 380 620, 520 600"
          stroke="rgba(148,163,184,0.3)"
          strokeWidth="1"
          strokeDasharray="4 6"
        />
      </svg>

      {/* Notification cards */}
      <GlassCard className="left-[4%] top-[5%] w-[178px] rotate-[-4deg] z-20">
        <div className="flex items-start gap-2">
          <span className="w-7 h-7 rounded-lg bg-[#22C55E]/20 flex items-center justify-center shrink-0">
            <MessageCircle className="w-3.5 h-3.5 text-[#22C55E]" />
          </span>
          <div className="min-w-0">
            <div className="flex items-center justify-between gap-1">
              <p className="text-[10px] font-semibold text-[#F8FAFC]">WhatsApp</p>
              <span className="text-[9px] text-[#64748B]">9:02 AM</span>
            </div>
            <p className="text-[10px] text-[#CBD5E1] mt-0.5 leading-snug">
              Can I reschedule to 11 AM?
            </p>
            <span className="inline-flex mt-1 w-4 h-4 rounded-full bg-[#22C55E] text-[8px] text-white items-center justify-center font-bold">
              2
            </span>
          </div>
        </div>
      </GlassCard>

      <GlassCard className="left-[28%] top-[2%] w-[176px] rotate-[3deg] z-10">
        <div className="flex items-start gap-2">
          <span className="w-7 h-7 rounded-lg bg-[#8B5CF6]/20 flex items-center justify-center shrink-0">
            <Phone className="w-3.5 h-3.5 text-[#A78BFA]" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-1">
              <p className="text-[10px] font-semibold text-[#F8FAFC]">Incoming Call</p>
              <span className="text-[9px] text-[#64748B]">9:01 AM</span>
            </div>
            <p className="text-[10px] text-[#94A3B8] mt-0.5">+91 98765 43210</p>
            <div className="flex gap-1.5 mt-1.5">
              <span className="w-5 h-5 rounded-full bg-[#22C55E]/30 flex items-center justify-center">
                <Phone className="w-2.5 h-2.5 text-[#22C55E]" />
              </span>
              <span className="w-5 h-5 rounded-full bg-[#EF4444]/30 flex items-center justify-center">
                <PhoneMissed className="w-2.5 h-2.5 text-[#EF4444]" />
              </span>
            </div>
          </div>
        </div>
      </GlassCard>

      <GlassCard className="right-[6%] top-[4%] w-[188px] rotate-[5deg] z-20 border-[#EF4444]/30">
        <div className="flex items-start gap-2">
          <span className="w-7 h-7 rounded-lg bg-[#EF4444]/20 flex items-center justify-center shrink-0">
            <Calendar className="w-3.5 h-3.5 text-[#F87171]" />
          </span>
          <div className="min-w-0">
            <div className="flex items-center justify-between gap-1">
              <p className="text-[10px] font-semibold text-[#F8FAFC]">Double Booking</p>
              <span className="text-[9px] text-[#64748B]">9:04 AM</span>
            </div>
            <p className="text-[10px] text-[#FCA5A5] mt-0.5 leading-snug">
              Dr. Sarah — 10:00 AM already booked
            </p>
          </div>
        </div>
      </GlassCard>

      <GlassCard className="left-[6%] top-[22%] w-[172px] rotate-[2deg] z-10">
        <div className="flex items-start gap-2">
          <span className="w-7 h-7 rounded-lg bg-[#8B5CF6]/20 flex items-center justify-center shrink-0">
            <UserRound className="w-3.5 h-3.5 text-[#A78BFA]" />
          </span>
          <div>
            <p className="text-[10px] font-semibold text-[#F8FAFC]">Patient Message</p>
            <p className="text-[9px] text-[#64748B]">9:05 AM</p>
            <p className="text-[10px] text-[#CBD5E1] mt-0.5">Is Max&apos;s lab ready?</p>
          </div>
        </div>
      </GlassCard>

      <GlassCard className="left-[34%] top-[18%] w-[182px] rotate-[-3deg] z-20 border-[#EF4444]/25">
        <div className="flex items-start gap-2">
          <span className="w-7 h-7 rounded-lg bg-[#EF4444]/20 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-3.5 h-3.5 text-[#F87171]" />
          </span>
          <div>
            <div className="flex items-center justify-between gap-1">
              <p className="text-[10px] font-semibold text-[#F8FAFC]">Inventory Low</p>
              <span className="text-[9px] text-[#64748B]">9:08 AM</span>
            </div>
            <p className="text-[10px] text-[#FCA5A5] mt-0.5 leading-snug">
              Metronidazole 250mg — Only 2 left in stock
            </p>
          </div>
        </div>
      </GlassCard>

      <GlassCard className="right-[3%] top-[22%] w-[176px] rotate-[-5deg] z-10">
        <div className="flex items-start gap-2">
          <span className="w-7 h-7 rounded-lg bg-[#3B82F6]/20 flex items-center justify-center shrink-0">
            <Mail className="w-3.5 h-3.5 text-[#93C5FD]" />
          </span>
          <div>
            <p className="text-[10px] font-semibold text-[#F8FAFC]">New Email</p>
            <p className="text-[9px] text-[#64748B]">9:07 AM</p>
            <p className="text-[10px] text-[#CBD5E1] mt-0.5">Lab invoice attached</p>
          </div>
        </div>
      </GlassCard>

      <GlassCard className="left-[50%] top-[8%] w-[164px] rotate-[7deg] z-10">
        <div className="flex items-start gap-2">
          <span className="w-7 h-7 rounded-lg bg-[#8B5CF6]/20 flex items-center justify-center shrink-0">
            <FolderOpen className="w-3.5 h-3.5 text-[#A78BFA]" />
          </span>
          <div>
            <p className="text-[10px] font-semibold text-[#F8FAFC]">Patient Records</p>
            <p className="text-[9px] text-[#64748B]">9:10 AM</p>
            <p className="text-[10px] text-[#CBD5E1] mt-0.5 leading-snug">
              Scattered across 3 different folders
            </p>
          </div>
        </div>
      </GlassCard>

      <GlassCard className="left-[22%] top-[30%] w-[158px] rotate-[6deg] z-10">
        <div className="flex items-start gap-2">
          <span className="w-7 h-7 rounded-lg bg-[#EF4444]/20 flex items-center justify-center shrink-0">
            <Clock className="w-3.5 h-3.5 text-[#F87171]" />
          </span>
          <div>
            <p className="text-[10px] font-semibold text-[#F8FAFC]">Room Conflict</p>
            <p className="text-[9px] text-[#64748B]">9:09 AM</p>
            <p className="text-[10px] text-[#FCA5A5] mt-0.5 leading-snug">Exam 2 double-booked</p>
          </div>
        </div>
      </GlassCard>

      <GlassCard className="right-[20%] top-[32%] w-[198px] rotate-[2deg] z-20">
        <div className="flex items-center gap-2 mb-1.5">
          <ClipboardList className="w-3.5 h-3.5 text-[#A78BFA]" />
          <p className="text-[10px] font-semibold text-[#F8FAFC]">Today&apos;s Schedule</p>
        </div>
        <ul className="space-y-1 text-[10px]">
          <li className="flex justify-between text-[#CBD5E1]">
            <span>09:00 Bella</span>
            <span className="text-[#64748B]">Check-up</span>
          </li>
          <li className="flex justify-between items-center rounded bg-[#EF4444]/15 px-1.5 py-0.5 text-[#FCA5A5] border border-[#EF4444]/25">
            <span>10:00 Dr. Sarah</span>
            <AlertTriangle className="w-3 h-3" />
          </li>
          <li className="flex justify-between text-[#CBD5E1]">
            <span>11:45 Luna</span>
            <span className="text-[#64748B]">Follow-up</span>
          </li>
        </ul>
      </GlassCard>

      <GlassCard className="left-[5%] top-[38%] w-[158px] rotate-[-2deg] z-10">
        <div className="flex items-start gap-2">
          <span className="w-7 h-7 rounded-lg bg-[#22C55E]/15 flex items-center justify-center shrink-0">
            <Microscope className="w-3.5 h-3.5 text-[#86EFAC]" />
          </span>
          <div>
            <p className="text-[10px] font-semibold text-[#F8FAFC]">Lab Report</p>
            <p className="text-[9px] text-[#64748B]">9:12 AM</p>
            <p className="text-[10px] text-[#CBD5E1] mt-0.5">Uploaded — Max</p>
          </div>
        </div>
      </GlassCard>

      <GlassCard className="left-[48%] top-[38%] w-[160px] rotate-[-6deg] z-10">
        <div className="flex items-start gap-2">
          <span className="w-7 h-7 rounded-lg bg-[#F97316]/20 flex items-center justify-center shrink-0">
            <Syringe className="w-3.5 h-3.5 text-[#FDBA74]" />
          </span>
          <div>
            <p className="text-[10px] font-semibold text-[#F8FAFC]">Rx Pending</p>
            <p className="text-[9px] text-[#64748B]">9:11 AM</p>
            <p className="text-[10px] text-[#CBD5E1] mt-0.5 leading-snug">3 scripts not dispensed</p>
          </div>
        </div>
      </GlassCard>

      <GlassCard className="left-[28%] top-[42%] w-[155px] rotate-[4deg] z-10">
        <div className="flex items-start gap-2">
          <span className="w-7 h-7 rounded-lg bg-[#F97316]/20 flex items-center justify-center shrink-0">
            <DollarSign className="w-3.5 h-3.5 text-[#FDBA74]" />
          </span>
          <div>
            <p className="text-[10px] font-semibold text-[#F8FAFC]">Payment Pending</p>
            <p className="text-[9px] text-[#64748B]">9:15 AM</p>
            <p className="text-[10px] text-[#FDBA74] mt-0.5">₹ 8,400 overdue</p>
          </div>
        </div>
      </GlassCard>

      <GlassCard className="right-[4%] top-[48%] w-[162px] rotate-[-3deg] z-10">
        <div className="flex items-start gap-2">
          <span className="w-7 h-7 rounded-lg bg-[#EC4899]/20 flex items-center justify-center shrink-0">
            <UserRound className="w-3.5 h-3.5 text-[#F9A8D4]" />
          </span>
          <div>
            <p className="text-[10px] font-semibold text-[#F8FAFC]">CRM</p>
            <p className="text-[9px] text-[#64748B]">Retention</p>
            <p className="text-[10px] text-[#F9A8D4] mt-0.5">Last seen: 45 days ago</p>
          </div>
        </div>
      </GlassCard>

      <GlassCard className="left-[14%] top-[54%] w-[168px] rotate-[3deg] z-20">
        <div className="flex items-start gap-2">
          <span className="w-7 h-7 rounded-lg bg-[#EF4444]/20 flex items-center justify-center shrink-0">
            <PhoneMissed className="w-3.5 h-3.5 text-[#F87171]" />
          </span>
          <div>
            <div className="flex items-center justify-between gap-1">
              <p className="text-[10px] font-semibold text-[#F8FAFC]">Missed Call</p>
              <span className="text-[9px] text-[#64748B]">9:16 AM</span>
            </div>
            <p className="text-[10px] text-[#FCA5A5] mt-0.5 leading-snug">3 missed — no callback yet</p>
          </div>
        </div>
      </GlassCard>

      <GlassCard className="left-[38%] top-[56%] w-[172px] rotate-[-3deg] z-20">
        <div className="flex items-start gap-2">
          <span className="w-7 h-7 rounded-lg bg-[#8B5CF6]/20 flex items-center justify-center shrink-0">
            <ArrowRightLeft className="w-3.5 h-3.5 text-[#A78BFA]" />
          </span>
          <div>
            <p className="text-[10px] font-semibold text-[#F8FAFC]">Staff Handoff</p>
            <p className="text-[9px] text-[#64748B]">9:18 AM</p>
            <p className="text-[10px] text-[#CBD5E1] mt-0.5 leading-snug">Who took Bella&apos;s vitals?</p>
          </div>
        </div>
      </GlassCard>

      <GlassCard className="right-[22%] top-[52%] w-[170px] rotate-[4deg] z-10">
        <div className="flex items-start gap-2">
          <span className="w-7 h-7 rounded-lg bg-[#F59E0B]/20 flex items-center justify-center shrink-0">
            <FileText className="w-3.5 h-3.5 text-[#FCD34D]" />
          </span>
          <div>
            <p className="text-[10px] font-semibold text-[#F8FAFC]">Paper Form Pending</p>
            <p className="text-[9px] text-[#64748B]">9:20 AM</p>
            <p className="text-[10px] text-[#CBD5E1] mt-0.5 leading-snug">Consent not scanned yet</p>
          </div>
        </div>
      </GlassCard>

      <GlassCard className="right-[5%] top-[62%] w-[164px] rotate-[-4deg] z-20">
        <div className="flex items-start gap-2">
          <span className="w-7 h-7 rounded-lg bg-[#22D3EE]/20 flex items-center justify-center shrink-0">
            <Users className="w-3.5 h-3.5 text-[#67E8F9]" />
          </span>
          <div>
            <p className="text-[10px] font-semibold text-[#F8FAFC]">Walk-in Queue</p>
            <p className="text-[9px] text-[#64748B]">9:22 AM</p>
            <p className="text-[10px] text-[#CBD5E1] mt-0.5 leading-snug">2 waiting, no room free</p>
          </div>
        </div>
      </GlassCard>

      <GlassCard className="left-[62%] top-[64%] w-[162px] rotate-[5deg] z-10">
        <div className="flex items-start gap-2">
          <span className="w-7 h-7 rounded-lg bg-[#A855F7]/20 flex items-center justify-center shrink-0">
            <Bell className="w-3.5 h-3.5 text-[#C4B5FD]" />
          </span>
          <div>
            <p className="text-[10px] font-semibold text-[#F8FAFC]">Reminder Overdue</p>
            <p className="text-[9px] text-[#64748B]">9:24 AM</p>
            <p className="text-[10px] text-[#CBD5E1] mt-0.5 leading-snug">Vaccine recall not sent</p>
          </div>
        </div>
      </GlassCard>

      <GlassCard className="left-[6%] top-[68%] w-[158px] rotate-[-5deg] z-10">
        <div className="flex items-start gap-2">
          <span className="w-7 h-7 rounded-lg bg-[#3B82F6]/20 flex items-center justify-center shrink-0">
            <Microscope className="w-3.5 h-3.5 text-[#93C5FD]" />
          </span>
          <div>
            <p className="text-[10px] font-semibold text-[#F8FAFC]">Lab Delay</p>
            <p className="text-[9px] text-[#64748B]">9:25 AM</p>
            <p className="text-[10px] text-[#CBD5E1] mt-0.5 leading-snug">Bloodwork still pending</p>
          </div>
        </div>
      </GlassCard>

      {/* Sticky notes — shared baseline row */}
      <StickyNote className="left-[20%] bottom-[5%] z-30" color="yellow" rotate="rotate(-6deg)">
        Owner arriving at 9:30 AM
      </StickyNote>
      <StickyNote className="left-[38%] bottom-[5%] z-30" color="pink" rotate="rotate(5deg)">
        Call back Mr. John !!
      </StickyNote>
      <StickyNote className="left-[56%] bottom-[5%] z-30" color="purple" rotate="rotate(-4deg)">
        Check Inventory!
      </StickyNote>
      <StickyNote className="left-[74%] bottom-[5%] z-30" color="green" rotate="rotate(4deg)">
        Refill vaccines today
      </StickyNote>

      {/* Clipboard */}
      <div className="absolute left-[56%] top-[42%] w-[138px] rotate-[8deg] z-20 rounded-lg bg-[#1e1b2e] border border-white/10 shadow-xl overflow-hidden">
        <div className="h-3 bg-[#374151]" />
        <div className="p-2 bg-[#f8fafc] text-[#0f172a]">
          <p className="text-[8px] font-bold uppercase tracking-wide mb-1">Today&apos;s Appointments</p>
          <ul className="space-y-0.5 text-[8px]">
            <li className="line-through text-slate-400">09:00 Bella</li>
            <li className="bg-red-100 text-red-700 px-0.5 font-semibold">10:00 DOUBLE BOOKED</li>
            <li>11:45 Luna</li>
            <li>02:00 Rocky</li>
          </ul>
        </div>
      </div>

      {/* Tasks notepad */}
      <div className="absolute left-[2%] bottom-[5%] w-[124px] rotate-[-3deg] z-20 rounded bg-[#fefce8] border border-[#eab308]/30 p-2 shadow-lg text-[#713f12]">
        <p className="text-[9px] font-bold uppercase mb-1">Today&apos;s Tasks</p>
        <ul className="space-y-0.5 text-[8px]">
          {['Confirm vaccines', 'Order meds', 'Call lab', 'Update chart'].map((t) => (
            <li key={t} className="flex items-center gap-1">
              <Check className="w-2.5 h-2.5 text-[#16a34a]" />
              {t}
            </li>
          ))}
        </ul>
      </div>

      {/* Keyboard hint strip */}
      <div
        aria-hidden
        className="absolute bottom-0 left-[35%] right-[20%] h-8 bg-gradient-to-t from-black/60 to-transparent pointer-events-none"
      />
    </div>
  );
}
