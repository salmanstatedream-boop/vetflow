'use client';

import {
  BarChart3,
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
} from 'lucide-react';
import {
  MiniStatCard,
  PanelHeader,
  PetStockAvatar,
  StatusPill,
} from '@/components/home/solution-dashboard-visuals/shared';

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
  { title: 'Appointments', desc: 'Smart scheduling & reminders', tone: 'purple' as const },
  { title: 'Patient Records', desc: 'Complete profiles & history', tone: 'blue' as const },
  { title: 'Laboratory', desc: 'Automated lab workflows', tone: 'orange' as const },
  { title: 'Inventory', desc: 'Real-time stock tracking', tone: 'green' as const },
  { title: 'Billing', desc: 'Invoices & payments', tone: 'purple' as const },
  { title: 'Discharge Notes', desc: 'Clear discharge summaries', tone: 'blue' as const },
  { title: 'Follow-up', desc: 'Automated reminders', tone: 'orange' as const },
  { title: 'Reports', desc: 'Analytics & insights', tone: 'green' as const },
];

const SCHEDULE = [
  { pet: 'bella' as const, name: 'Bella', type: 'Check-up', status: 'Confirmed', tone: 'green' as const },
  { pet: 'max' as const, name: 'Max', type: 'Vaccination', status: 'In Progress', tone: 'blue' as const },
  { pet: 'luna' as const, name: 'Luna', type: 'Follow-up', status: 'Scheduled', tone: 'purple' as const },
  { pet: 'rocky' as const, name: 'Rocky', type: 'Surgery prep', status: 'Confirmed', tone: 'green' as const },
];

const ACTIVITY = [
  { text: 'Appointments scheduled for Bella', time: '10m ago' },
  { text: 'Payment received from Rocky', time: '25m ago' },
  { text: 'Lab results uploaded for Max', time: '42m ago' },
];

const BOTTOM_STATS = [
  { label: 'Total Appointments', value: '28', delta: '↑ 18%', tone: 'purple' as const },
  { label: 'Patient Retention', value: '85%', delta: '↑ 9%', tone: 'green' as const },
  { label: 'Avg Response Time', value: '2.3 hrs', delta: '↓ 8%', tone: 'blue' as const },
  { label: 'Completion Rate', value: '92%', delta: '↑ 14%', tone: 'green' as const },
  { label: 'Total Revenue', value: '$124,830', delta: '↑ 16%', tone: 'purple' as const },
];

export default function OverviewDashboardVisual() {
  return (
    <div className="min-w-[720px] text-left antialiased bg-[#0B1020]">
      <div className="flex">
        <aside className="w-[140px] shrink-0 border-r border-white/10 p-3 hidden sm:block">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/10">
            <span className="w-7 h-7 rounded-lg bg-[#22D3EE]/15 border border-[#22D3EE]/25" />
            <span className="text-[10px] font-bold text-[#F8FAFC]">Phoenix OS</span>
          </div>
          <nav className="space-y-0.5">
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
          <div className="mt-4 rounded-lg border border-[#8B5CF6]/25 bg-[#8B5CF6]/10 p-2">
            <div className="flex items-center gap-1.5 mb-1">
              <Sparkles className="w-3 h-3 text-[#C4B5FD]" />
              <span className="text-[9px] font-semibold text-[#F8FAFC]">AI Assistant</span>
            </div>
            <p className="text-[8px] text-[#64748B]">Your smart clinic assistant</p>
            <p className="text-[8px] text-[#8B5CF6] mt-1">Ask Phoenix AI →</p>
          </div>
          <div className="mt-4 flex items-center gap-2 pt-3 border-t border-white/10">
            <span className="w-7 h-7 rounded-full bg-[#8B5CF6]/30 text-[8px] font-bold text-[#F8FAFC] flex items-center justify-center">DR</span>
            <div>
              <p className="text-[9px] font-medium text-[#F8FAFC]">Dr. Sarah</p>
              <p className="text-[8px] text-[#64748B]">Admin</p>
            </div>
          </div>
        </aside>

        <div className="flex-1 min-w-0 p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/10">
            <div className="flex-1 flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1.5 max-w-md">
              <Search className="w-3 h-3 text-[#64748B]" />
              <span className="text-[9px] text-[#64748B]">Search patients, appointments…</span>
              <span className="ml-auto text-[8px] text-[#64748B] font-mono">⌘K</span>
            </div>
            <span className="relative w-7 h-7 rounded-lg border border-white/10 flex items-center justify-center">
              <Bell className="w-3.5 h-3.5 text-[#64748B]" />
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#EF4444] text-[7px] text-white flex items-center justify-center">14</span>
            </span>
            <span className="text-[8px] text-[#64748B] hidden md:inline">May 12 – May 18, 2024</span>
          </div>

          <div className="mb-4">
            <h3 className="text-sm font-semibold text-[#F8FAFC]">Good morning, Dr. Sarah 👋</h3>
            <p className="text-[10px] text-[#64748B]">Here&apos;s what&apos;s happening at Phoenix Clinic today.</p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-4">
            <MiniStatCard label="Appointments" value="28" delta="↑ 18% vs last week" icon={CalendarCheck} iconTone="purple" />
            <MiniStatCard label="Active Patients" value="5" delta="↑ 12% vs last week" icon={FolderOpen} iconTone="blue" />
            <MiniStatCard label="Lab Tests" value="12" delta="↑ 20% vs last week" icon={FlaskConical} iconTone="orange" />
            <MiniStatCard label="Total Revenue" value="$124,830" delta="↑ 16% vs last week" icon={Receipt} iconTone="green" />
          </div>

          <div className="grid lg:grid-cols-[1fr_180px] gap-3 mb-3">
            <div>
              <PanelHeader title="All Modules" />
              <div className="grid grid-cols-2 gap-2">
                {MODULES.map((mod) => (
                  <div key={mod.title} className="rounded-lg border border-white/10 bg-white/[0.03] p-2.5">
                    <p className="text-[10px] font-semibold text-[#F8FAFC]">{mod.title}</p>
                    <p className="text-[8px] text-[#64748B] mt-0.5">{mod.desc}</p>
                    <p className="text-[8px] text-[#8B5CF6] mt-1.5">Go to Module →</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div className="rounded-lg border border-white/10 bg-white/[0.03] p-2.5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 rounded-full bg-[#22C55E]" />
                  <p className="text-[9px] font-semibold text-[#F8FAFC]">All Systems Operational</p>
                </div>
                {['Server — Online', 'Database — Healthy', 'Backup — Up to date', 'Integrations — Connected'].map((s) => (
                  <p key={s} className="text-[8px] text-[#86EFAC] py-0.5">{s}</p>
                ))}
              </div>
              <div className="rounded-lg border border-white/10 bg-white/[0.03] p-2.5">
                <PanelHeader title="Today's Schedule" />
                <div className="space-y-2">
                  {SCHEDULE.map((row) => (
                    <div key={row.name} className="flex items-center gap-2">
                      <PetStockAvatar pet={row.pet} size="sm" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[9px] text-[#F8FAFC] truncate">{row.name} · {row.type}</p>
                      </div>
                      <StatusPill label={row.status} tone={row.tone} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-3">
            <div className="rounded-lg border border-white/10 bg-white/[0.03] p-2.5">
              <PanelHeader title="Recent Activity" />
              <ul className="space-y-2">
                {ACTIVITY.map((a) => (
                  <li key={a.text} className="flex justify-between gap-2 text-[9px]">
                    <span className="text-[#CBD5E1]">{a.text}</span>
                    <span className="text-[#64748B] shrink-0">{a.time}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/[0.03] p-2.5">
              <PanelHeader title="Upcoming Reminders" />
              <ul className="space-y-1.5 text-[9px] text-[#94A3B8]">
                <li>3 Follow-ups Due — Tomorrow</li>
                <li>5 Appointments Tomorrow</li>
                <li>4 Lab Results Pending — Review</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 border-t border-white/10 px-4 py-3 bg-[#0B1020]/80">
        {BOTTOM_STATS.map((stat) => (
          <div key={stat.label} className="text-center">
            <p className="text-sm font-bold text-[#F8FAFC]">{stat.value}</p>
            <p className="text-[8px] text-[#64748B]">{stat.label}</p>
            <p className="text-[8px] text-[#86EFAC]">{stat.delta}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
