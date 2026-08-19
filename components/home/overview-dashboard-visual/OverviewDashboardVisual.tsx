'use client';

import Image from 'next/image';
import {
  BarChart3,
  Bell,
  Calendar,
  CalendarCheck,
  Check,
  ChevronDown,
  ClipboardList,
  Clock,
  FlaskConical,
  FolderOpen,
  LayoutDashboard,
  MoreHorizontal,
  Package,
  DollarSign,
  Receipt,
  Search,
  Settings,
  Sparkles,
  TrendingUp,
  Users,
} from 'lucide-react';
import { OutlinedModuleIcon } from '@/components/home/marketing-visuals/shared';
import {
  DoctorStockAvatar,
  MiniStatCard,
  PanelHeader,
  PetStockAvatar,
  StatusPill,
} from '@/components/home/solution-dashboard-visuals/shared';
import { cn } from '@/lib/utils';

const NAV = [
  { label: 'Overview', icon: LayoutDashboard, active: true },
  { label: 'Appointments', icon: CalendarCheck },
  { label: 'Patient Records', icon: FolderOpen },
  { label: 'Laboratory', icon: FlaskConical },
  { label: 'Inventory', icon: Package },
  { label: 'Billing', icon: Receipt },
  { label: 'Discharge Notes', icon: ClipboardList },
  { label: 'Follow-up', icon: Bell },
  { label: 'Reports & Analytics', icon: BarChart3 },
  { label: 'Settings', icon: Settings },
];

const MODULES = [
  { title: 'Appointments', desc: 'Smart scheduling & reminders', tone: 'purple' as const, icon: CalendarCheck },
  { title: 'Patient Records', desc: 'Complete profiles & history', tone: 'blue' as const, icon: FolderOpen },
  { title: 'Laboratory', desc: 'Automated lab workflows', tone: 'orange' as const, icon: FlaskConical },
  { title: 'Inventory', desc: 'Real-time stock tracking', tone: 'green' as const, icon: Package },
  { title: 'Billing', desc: 'Invoices & payments', tone: 'purple' as const, icon: Receipt },
  { title: 'Discharge Notes', desc: 'Clear discharge summaries', tone: 'blue' as const, icon: ClipboardList },
  { title: 'Follow-up', desc: 'Automated reminders', tone: 'orange' as const, icon: Bell },
  { title: 'Reports & Analytics', desc: 'Analytics & insights', tone: 'green' as const, icon: BarChart3 },
];

const SCHEDULE = [
  { time: '09:00 AM', pet: 'bella' as const, name: 'Bella', type: 'Check-up', status: 'Confirmed', tone: 'green' as const },
  { time: '10:30 AM', pet: 'max' as const, name: 'Max', type: 'Vaccination', status: 'In Progress', tone: 'blue' as const },
  { time: '11:45 AM', pet: 'luna' as const, name: 'Luna', type: 'Follow-up', status: 'Scheduled', tone: 'purple' as const },
  { time: '02:00 PM', pet: 'rocky' as const, name: 'Rocky', type: 'Surgery prep', status: 'Confirmed', tone: 'green' as const },
  { time: '03:30 PM', pet: 'milo' as const, name: 'Milo', type: 'Dental', status: 'Scheduled', tone: 'purple' as const },
];

const ACTIVITY = [
  { text: 'Appointment scheduled for Bella', detail: 'Check-up on May 18', time: '10m ago', tone: 'purple' as const, icon: CalendarCheck },
  { text: 'Lab results uploaded for Max', detail: 'Blood Test', time: '25m ago', tone: 'blue' as const, icon: FlaskConical },
  { text: 'Payment received from Rocky', detail: '$3,450', time: '1h ago', tone: 'green' as const, icon: DollarSign },
  { text: 'Discharge note created for Luna', detail: 'Post-op care', time: '2h ago', tone: 'purple' as const, icon: ClipboardList },
  { text: 'Follow-up reminder sent — Charlie', detail: 'Reminder', time: '3h ago', tone: 'orange' as const, icon: Bell },
];

const BOTTOM_STATS = [
  { label: 'Total Appointments', value: '28', delta: '↑ 18% vs last week', tone: 'purple' as const, icon: CalendarCheck },
  { label: 'Patient Retention', value: '85%', delta: '↑ 9% vs last week', tone: 'green' as const, icon: Users },
  { label: 'Avg. Response Time', value: '2.3 hrs', delta: '↓ 8% vs last week', tone: 'blue' as const, icon: Clock },
  { label: 'Completion Rate', value: '92%', delta: '↑ 14% vs last week', tone: 'green' as const, icon: TrendingUp },
  { label: 'Total Revenue', value: '$456,780', delta: '↑ 16% vs last week', tone: 'purple' as const, icon: DollarSign },
];

const SYSTEM_STATUS = [
  { label: 'Server', status: 'Online' },
  { label: 'Database', status: 'Healthy' },
  { label: 'Backup', status: 'Up to date' },
  { label: 'Integrations', status: 'Connected' },
];

const REMINDERS = [
  { count: '3', title: 'Follow-ups Due', meta: 'Tomorrow', tone: 'orange' as const, icon: Bell },
  { count: '5', title: 'Appointments Tomorrow', meta: 'Tomorrow', tone: 'blue' as const, icon: Calendar },
  { count: '4', title: 'Lab Results Pending', meta: 'Review', tone: 'purple' as const, icon: FlaskConical },
];

const activityIconTone = {
  purple: 'bg-[#8B5CF6]/15 text-[#C4B5FD] border-[#8B5CF6]/25',
  blue: 'bg-[#3B82F6]/15 text-[#93C5FD] border-[#3B82F6]/25',
  green: 'bg-[#22C55E]/15 text-[#86EFAC] border-[#22C55E]/25',
  orange: 'bg-[#F97316]/15 text-[#FDBA74] border-[#F97316]/25',
};

const reminderTone = {
  orange: 'bg-[#F97316]/15 text-[#FDBA74] border-[#F97316]/25',
  blue: 'bg-[#3B82F6]/15 text-[#93C5FD] border-[#3B82F6]/25',
  purple: 'bg-[#8B5CF6]/15 text-[#C4B5FD] border-[#8B5CF6]/25',
};

const statIconTones = {
  purple: 'bg-[#8B5CF6]/15 text-[#C4B5FD] border-[#8B5CF6]/25 shadow-[0_0_12px_rgba(139,92,246,0.25)]',
  green: 'bg-[#22C55E]/15 text-[#86EFAC] border-[#22C55E]/25 shadow-[0_0_12px_rgba(34,197,94,0.2)]',
  blue: 'bg-[#3B82F6]/15 text-[#93C5FD] border-[#3B82F6]/25 shadow-[0_0_12px_rgba(59,130,246,0.2)]',
};

/** Fixed design-width canvas so photo-2 proportions never collapse. */
export const OVERVIEW_DASHBOARD_DESIGN_WIDTH = 1040;

export default function OverviewDashboardVisual() {
  return (
    <div
      className="text-left antialiased bg-[#0B1020]"
      style={{ width: OVERVIEW_DASHBOARD_DESIGN_WIDTH, minWidth: OVERVIEW_DASHBOARD_DESIGN_WIDTH }}
    >
      <div className="flex min-w-0">
        {/* Left sidebar */}
        <aside className="w-[168px] shrink-0 border-r border-white/10 p-3 flex flex-col min-h-[560px]">
          <div className="flex items-center gap-1 mb-3 pb-2.5 border-b border-white/10">
            <div className="relative w-8 h-8 shrink-0">
              <span
                aria-hidden
                className="pointer-events-none absolute left-1/2 top-1/2 w-10 h-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.5)_0%,transparent_68%)]"
              />
              <Image src="/phoenix-logo.png" alt="Phoenix OS" fill className="relative object-contain" />
            </div>
            <span className="text-[11px] font-bold text-[#F8FAFC] truncate leading-none">Phoenix OS</span>
          </div>

          <nav className="space-y-0.5 flex-1">
            {NAV.map((item) => (
              <div
                key={item.label}
                className={cn(
                  'relative flex items-center gap-2 px-2.5 py-2 rounded-md text-[10px]',
                  item.active
                    ? 'bg-[#8B5CF6]/20 text-[#E9D5FF]'
                    : 'text-[#94A3B8]',
                )}
              >
                {item.active && (
                  <span
                    aria-hidden
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 rounded-r-full bg-[#A78BFA] shadow-[0_0_8px_rgba(167,139,250,0.8)]"
                  />
                )}
                <item.icon className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{item.label}</span>
              </div>
            ))}
          </nav>

          <div className="mt-3 rounded-lg border border-[#8B5CF6]/30 bg-[#8B5CF6]/10 p-2.5 shadow-[0_0_20px_rgba(139,92,246,0.12)]">
            <div className="flex items-center gap-1.5 mb-0.5">
              <Sparkles className="w-3.5 h-3.5 text-[#C4B5FD]" />
              <span className="text-[10px] font-semibold text-[#F8FAFC]">AI Assistant</span>
            </div>
            <p className="text-[9px] text-[#94A3B8] leading-snug">Your smart clinic assistant</p>
            <p className="text-[9px] text-[#A78BFA] mt-1.5">Ask Phoenix AI →</p>
          </div>

          <div className="mt-2.5 flex items-center gap-2 pt-2.5 border-t border-white/10">
            <DoctorStockAvatar variant="sarah" size="sm" />
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-medium text-[#F8FAFC] truncate">Dr. Sarah</p>
              <p className="text-[9px] text-[#94A3B8]">Admin</p>
            </div>
            <ChevronDown className="w-3 h-3 text-[#64748B] shrink-0" />
          </div>
        </aside>

        {/* Main column */}
        <div className="flex-1 min-w-0 p-3.5">
          <div className="flex items-center gap-2 mb-3.5 pb-2.5 border-b border-white/10">
            <div className="flex-1 flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-2 min-w-0">
              <Search className="w-3.5 h-3.5 text-[#64748B] shrink-0" />
              <span className="text-[10px] text-[#94A3B8] truncate">Search patients, appointments…</span>
              <span className="ml-auto text-[9px] text-[#64748B] font-mono shrink-0">⌘K</span>
            </div>
            <span className="relative w-8 h-8 rounded-lg border border-white/10 flex items-center justify-center shrink-0">
              <Bell className="w-3.5 h-3.5 text-[#94A3B8]" />
              <span className="absolute -top-1 -right-1 min-w-4 h-4 px-0.5 rounded-full bg-[#EF4444] text-[8px] text-white flex items-center justify-center font-semibold">
                14
              </span>
            </span>
            <span className="w-8 h-8 rounded-lg border border-white/10 flex items-center justify-center shrink-0">
              <Settings className="w-3.5 h-3.5 text-[#94A3B8]" />
            </span>
            <span className="text-[10px] text-[#94A3B8] inline-flex items-center gap-1.5 shrink-0 rounded-lg border border-white/10 px-2.5 py-1.5">
              <Calendar className="w-3.5 h-3.5" />
              May 12 – May 18, 2024
              <ChevronDown className="w-3 h-3" />
            </span>
          </div>

          <div className="mb-3.5">
            <h3 className="text-[15px] font-semibold text-[#F8FAFC] leading-snug">
              Good morning, <span className="text-[#A78BFA]">Dr. Sarah</span> 👋
            </h3>
            <p className="text-[11px] text-[#94A3B8] mt-1 leading-snug">
              Here&apos;s what&apos;s happening at Phoenix Clinic today.
            </p>
          </div>

          <div className="grid grid-cols-4 gap-2.5 mb-3.5">
            <MiniStatCard label="Appointments" value="28" delta="↑ 18% vs last week" icon={CalendarCheck} iconTone="purple" />
            <MiniStatCard label="Active Patients" value="5" delta="↑ 12% vs last week" icon={FolderOpen} iconTone="blue" />
            <MiniStatCard label="Lab Tests" value="12" delta="↑ 20% vs last week" icon={FlaskConical} iconTone="orange" />
            <MiniStatCard label="Total Revenue" value="$456,780" delta="↑ 16% vs last week" icon={DollarSign} iconTone="green" />
          </div>

          <div className="mb-3.5">
            <PanelHeader title="All Modules" />
            <div className="grid grid-cols-4 gap-2.5">
              {MODULES.map((mod) => (
                <div
                  key={mod.title}
                  className="rounded-xl border border-white/10 bg-white/[0.03] p-3 min-h-[88px]"
                >
                  <div className="flex items-start gap-2.5">
                    <OutlinedModuleIcon icon={mod.icon} tone={mod.tone} className="w-8 h-8 shrink-0" />
                    <div className="min-w-0 flex flex-col gap-1">
                      <p className="text-[11px] font-semibold text-[#F8FAFC] truncate leading-snug">{mod.title}</p>
                      <p className="text-[10px] text-[#CBD5E1] line-clamp-2 leading-snug">{mod.desc}</p>
                      <p className="text-[10px] text-[#A78BFA] leading-snug mt-0.5">Go to Module →</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
            <PanelHeader
              title="Recent Activity"
              actions={
                <span className="text-[10px] text-[#A78BFA] font-medium cursor-default">View all</span>
              }
            />
            <ul className="space-y-2.5 mt-1">
              {ACTIVITY.map((a) => (
                <li key={a.text} className="flex items-center gap-2.5">
                  <span
                    className={cn(
                      'w-7 h-7 rounded-lg border flex items-center justify-center shrink-0',
                      activityIconTone[a.tone],
                    )}
                  >
                    <a.icon className="w-3.5 h-3.5" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-[#E2E8F0] truncate leading-snug">{a.text}</p>
                    <p className="text-[10px] text-[#94A3B8] truncate leading-snug">{a.detail}</p>
                  </div>
                  <span className="text-[10px] text-[#64748B] shrink-0">{a.time}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right sidebar */}
        <aside className="w-[220px] shrink-0 border-l border-white/10 p-3 flex flex-col gap-2.5 self-stretch">
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 w-full shrink-0">
            <div className="flex items-center gap-2 mb-2.5">
              <span className="w-2 h-2 rounded-full bg-[#22C55E] shadow-[0_0_8px_rgba(34,197,94,0.7)]" />
              <p className="text-[11px] font-semibold text-[#F8FAFC]">All Systems Operational</p>
            </div>
            <ul className="space-y-2">
              {SYSTEM_STATUS.map((s) => (
                <li key={s.label} className="flex items-center justify-between gap-2 text-[10px]">
                  <span className="flex items-center gap-1.5 text-[#CBD5E1]">
                    <Check className="w-3 h-3 text-[#22C55E] shrink-0" />
                    {s.label}
                  </span>
                  <span className="text-[#86EFAC]">{s.status}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 w-full flex-1 min-h-0">
            <PanelHeader title="Today's Schedule" />
            <div className="space-y-2.5 mt-1">
              {SCHEDULE.map((row) => (
                <div key={row.name} className="flex items-center gap-1.5">
                  <span className="text-[9px] font-mono text-[#94A3B8] w-[54px] shrink-0">{row.time}</span>
                  <PetStockAvatar pet={row.pet} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-[#F8FAFC] truncate leading-snug">{row.name}</p>
                    <p className="text-[9px] text-[#94A3B8] truncate">{row.type}</p>
                  </div>
                  <StatusPill label={row.status} tone={row.tone} />
                  <MoreHorizontal className="w-3.5 h-3.5 text-[#64748B] shrink-0" />
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 w-full shrink-0">
            <PanelHeader title="Upcoming Reminders" />
            <ul className="space-y-2 mt-1">
              {REMINDERS.map((r) => (
                <li
                  key={r.title}
                  className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] px-2 py-2"
                >
                  <span
                    className={cn(
                      'w-8 h-8 rounded-lg border flex items-center justify-center shrink-0',
                      reminderTone[r.tone],
                    )}
                  >
                    <r.icon className="w-3.5 h-3.5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] text-[#F8FAFC] leading-snug">
                      <span className="font-semibold">{r.count}</span> {r.title}
                    </p>
                    <p className="text-[9px] text-[#94A3B8]">{r.meta}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>

      {/* Bottom metrics */}
      <div className="grid grid-cols-5 gap-3 border-t border-white/10 px-3.5 py-3.5 bg-[#0B1020]/90">
        {BOTTOM_STATS.map((stat) => (
          <div key={stat.label} className="flex items-start gap-2.5 min-w-0">
            <span
              className={cn(
                'w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 mt-0.5',
                statIconTones[stat.tone],
              )}
            >
              <stat.icon className="w-3.5 h-3.5" />
            </span>
            <div className="min-w-0 flex flex-col gap-1.5">
              <p className="text-xs font-bold text-[#F8FAFC] leading-snug">{stat.value}</p>
              <p className="text-[9px] text-[#94A3B8] leading-snug truncate">{stat.label}</p>
              <p className="text-[9px] text-[#86EFAC] leading-snug">{stat.delta}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
