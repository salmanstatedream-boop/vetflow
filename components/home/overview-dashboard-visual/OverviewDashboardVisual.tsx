'use client';

import Image from 'next/image';
import {
  Bell,
  CalendarCheck,
  ClipboardList,
  FlaskConical,
  FolderOpen,
  LayoutDashboard,
  Package,
  Receipt,
  Search,
  Settings,
  Sparkles,
  Users,
} from 'lucide-react';
import {
  DoctorStockAvatar,
  MiniStatCard,
  PanelHeader,
  PetStockAvatar,
  StatusPill,
} from '@/components/home/solution-dashboard-visuals/shared';

const NAV = [
  { label: 'Overview', icon: LayoutDashboard, active: true },
  { label: 'Appointments', icon: CalendarCheck },
  { label: 'Patients', icon: FolderOpen },
  { label: 'Laboratory', icon: FlaskConical },
  { label: 'Inventory', icon: Package },
  { label: 'Billing', icon: Receipt },
  { label: 'Discharge', icon: ClipboardList },
  { label: 'Settings', icon: Settings },
];

const SCHEDULE = [
  { time: '09:00', pet: 'bella' as const, name: 'Bella', type: 'Check-up', status: 'Confirmed', tone: 'green' as const },
  { time: '10:30', pet: 'max' as const, name: 'Max', type: 'Vaccination', status: 'In Progress', tone: 'blue' as const },
  { time: '11:45', pet: 'luna' as const, name: 'Luna', type: 'Follow-up', status: 'Scheduled', tone: 'purple' as const },
  { time: '14:00', pet: 'rocky' as const, name: 'Rocky', type: 'Surgery prep', status: 'Confirmed', tone: 'green' as const },
];

const ACTIVITY = [
  { text: 'Payment received — Rocky', time: '10m', amount: '$3,450', dot: 'green' as const },
  { text: 'Lab results uploaded — Max', time: '25m', amount: '$890', dot: 'blue' as const },
  { text: 'Appointment booked — Bella', time: '42m', dot: 'purple' as const },
  { text: 'Inventory restocked — IV fluids', time: '1h', dot: 'green' as const },
];

const BOTTOM_STATS = [
  { label: 'Appointments', value: '28', delta: '↑ 18%', tone: 'purple' as const, icon: CalendarCheck },
  { label: 'Retention', value: '85%', delta: '↑ 9%', tone: 'green' as const, icon: Users },
  { label: 'Revenue', value: '$124.8k', delta: '↑ 16%', tone: 'blue' as const, icon: Receipt },
];

const dotColors = {
  green: 'bg-[#22C55E]',
  blue: 'bg-[#3B82F6]',
  purple: 'bg-[#8B5CF6]',
};

const statIconTones = {
  purple: 'bg-[#8B5CF6]/15 text-[#C4B5FD] border-[#8B5CF6]/25',
  green: 'bg-[#22C55E]/15 text-[#86EFAC] border-[#22C55E]/25',
  blue: 'bg-[#3B82F6]/15 text-[#93C5FD] border-[#3B82F6]/25',
};

export default function OverviewDashboardVisual() {
  return (
    <div className="w-full text-left antialiased bg-[#0B1020]">
      <div className="flex">
        <aside className="w-[132px] xl:w-[148px] shrink-0 border-r border-white/10 p-2.5 sm:p-3 hidden sm:flex sm:flex-col">
          <div className="flex items-center gap-2 mb-3 pb-2.5 border-b border-white/10">
            <div className="relative w-7 h-7 shrink-0">
              <Image src="/phoenix-logo.png" alt="Phoenix OS" fill className="object-contain" />
            </div>
            <span className="text-[10px] font-bold text-[#F8FAFC] truncate">Phoenix OS</span>
          </div>
          <nav className="space-y-0.5 flex-1">
            {NAV.map((item) => (
              <div
                key={item.label}
                className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-[9px] ${
                  item.active
                    ? 'bg-[#8B5CF6]/15 text-[#C4B5FD] border border-[#8B5CF6]/25'
                    : 'text-[#64748B]'
                }`}
              >
                <item.icon className="w-3 h-3 shrink-0" />
                <span className="truncate">{item.label}</span>
              </div>
            ))}
          </nav>
          <div className="mt-3 rounded-lg border border-[#8B5CF6]/25 bg-[#8B5CF6]/10 p-2">
            <div className="flex items-center gap-1.5 mb-0.5">
              <Sparkles className="w-3 h-3 text-[#C4B5FD]" />
              <span className="text-[9px] font-semibold text-[#F8FAFC]">AI Assistant</span>
            </div>
            <p className="text-[8px] text-[#8B5CF6]">Ask Phoenix AI →</p>
          </div>
          <div className="mt-2.5 flex items-center gap-2 pt-2.5 border-t border-white/10">
            <DoctorStockAvatar variant="sarah" size="sm" />
            <div className="min-w-0">
              <p className="text-[9px] font-medium text-[#F8FAFC] truncate">Dr. Sarah</p>
              <p className="text-[8px] text-[#64748B]">Admin</p>
            </div>
          </div>
        </aside>

        <div className="flex-1 min-w-0 p-3 sm:p-3.5">
          <div className="flex items-center gap-2 mb-3 pb-2.5 border-b border-white/10">
            <div className="flex-1 flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1.5 min-w-0">
              <Search className="w-3 h-3 text-[#64748B] shrink-0" />
              <span className="text-[9px] text-[#64748B] truncate">Search patients, appointments…</span>
              <span className="ml-auto text-[8px] text-[#64748B] font-mono shrink-0">⌘K</span>
            </div>
            <span className="relative w-7 h-7 rounded-lg border border-white/10 flex items-center justify-center shrink-0">
              <Bell className="w-3.5 h-3.5 text-[#64748B]" />
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#EF4444] text-[7px] text-white flex items-center justify-center">
                3
              </span>
            </span>
          </div>

          <div className="mb-3">
            <h3 className="text-sm font-semibold text-[#F8FAFC]">Good morning, Dr. Sarah</h3>
            <p className="text-[10px] text-[#64748B]">Here&apos;s what&apos;s happening at Phoenix Clinic today.</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
            <MiniStatCard label="Appointments" value="28" delta="↑ 18%" icon={CalendarCheck} iconTone="purple" />
            <MiniStatCard label="Patients" value="5" delta="↑ 12%" icon={FolderOpen} iconTone="blue" />
            <MiniStatCard label="Lab Tests" value="12" delta="↑ 20%" icon={FlaskConical} iconTone="orange" />
            <MiniStatCard label="Revenue" value="$124k" delta="↑ 16%" icon={Receipt} iconTone="green" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="rounded-lg border border-white/10 bg-white/[0.03] p-2.5 sm:p-3">
              <PanelHeader title="Today's Schedule" />
              <div className="space-y-2 mt-1">
                {SCHEDULE.map((row) => (
                  <div key={row.name} className="flex items-center gap-1.5">
                    <span className="text-[8px] font-mono text-[#64748B] w-9 shrink-0">{row.time}</span>
                    <PetStockAvatar pet={row.pet} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[9px] text-[#F8FAFC] truncate">{row.name}</p>
                      <p className="text-[7px] text-[#64748B] truncate">{row.type}</p>
                    </div>
                    <StatusPill label={row.status} tone={row.tone} />
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-white/10 bg-white/[0.03] p-2.5 sm:p-3">
              <PanelHeader title="Recent Activity" />
              <ul className="space-y-2 mt-1">
                {ACTIVITY.map((a) => (
                  <li key={a.text} className="flex items-center gap-2 text-[9px]">
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColors[a.dot]}`} />
                    <span className="text-[#CBD5E1] flex-1 min-w-0 truncate">{a.text}</span>
                    {'amount' in a && a.amount ? (
                      <span className="text-[#86EFAC] font-mono shrink-0">{a.amount}</span>
                    ) : null}
                    <span className="text-[#64748B] shrink-0">{a.time}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:gap-3 border-t border-white/10 px-3 sm:px-4 py-3 bg-[#0B1020]/80">
        {BOTTOM_STATS.map((stat) => (
          <div key={stat.label} className="flex items-center gap-2 min-w-0">
            <span
              className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg border flex items-center justify-center shrink-0 ${statIconTones[stat.tone]}`}
            >
              <stat.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </span>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-bold text-[#F8FAFC] leading-none">{stat.value}</p>
              <p className="text-[7px] sm:text-[8px] text-[#64748B] mt-0.5 truncate">{stat.label}</p>
              <p className="text-[7px] sm:text-[8px] text-[#86EFAC]">{stat.delta}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
