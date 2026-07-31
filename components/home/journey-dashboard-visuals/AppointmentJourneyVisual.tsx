'use client';

import {
  Bell,
  CalendarCheck,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  RefreshCw,
  Smartphone,
  Sparkles,
  TrendingDown,
  Users,
  Zap,
} from 'lucide-react';
import { PetStockAvatar, ToolbarButton } from '@/components/home/solution-dashboard-visuals/shared';
import {
  AutomationRow,
  FeatureRail,
  JourneyFrame,
  JourneyScreenMotion,
  KpiStrip,
  MotionSlot,
  StatusBadge,
  SummaryCard,
  TimelineItem,
  WeekScheduleGrid,
  type WeekBlock,
} from './shared';

const TIMES = ['8:00', '9:00', '10:00', '11:00', '12:00', '1:00', '2:00', '3:00', '4:00', '5:00'];

const DAYS = [
  { label: 'Mon', date: 12, active: true },
  { label: 'Tue', date: 13 },
  { label: 'Wed', date: 14 },
  { label: 'Thu', date: 15 },
  { label: 'Fri', date: 16 },
  { label: 'Sat', date: 17 },
  { label: 'Sun', date: 18 },
];

const PURPLE = '#8B5CF6';
const ORANGE = '#F97316';
const BLUE = '#3B82F6';
const GREEN = '#22C55E';
const PINK = '#EC4899';

const BLOCKS: WeekBlock[] = [
  { day: 0, rowStart: 0, rowSpan: 2, pet: 'bruno', label: 'Bruno', breed: 'Golden Retriever', time: '8:00 – 9:30 AM', color: PURPLE },
  { day: 1, rowStart: 1, rowSpan: 1, pet: 'luna', label: 'Luna', breed: 'Persian Cat', time: '9:30 – 10:00', color: ORANGE },
  { day: 2, rowStart: 0, rowSpan: 2, pet: 'max', label: 'Max', breed: 'Labrador', time: '8:30 – 9:15', color: BLUE },
  { day: 3, rowStart: 1, rowSpan: 1, pet: 'bella', label: 'Bella', breed: 'Poodle', time: '9:00 – 9:30', color: GREEN },
  { day: 4, rowStart: 1, rowSpan: 1, pet: 'charlie', label: 'Charlie', breed: 'Beagle', time: '9:15 – 9:45', color: GREEN },
  { day: 5, rowStart: 2, rowSpan: 1, pet: 'milo', label: 'Milo', breed: 'Pug', time: '10:00 – 10:30', color: PINK },
  { day: 0, rowStart: 3, rowSpan: 1, pet: 'rocky', label: 'Rocky', breed: 'German Shepherd', time: '11:00 – 11:45', color: PURPLE },
  { day: 1, rowStart: 3, rowSpan: 1, pet: 'cooper', label: 'Coco', breed: 'British Shorthair', time: '11:00 – 11:30', color: BLUE },
  { day: 2, rowStart: 3, rowSpan: 1, pet: 'daisy', label: 'Daisy', breed: 'Siamese Cat', time: '11:00 – 11:45', color: GREEN },
  { day: 3, rowStart: 3, rowSpan: 1, pet: 'luna', label: 'Lucy', breed: 'Rabbit', time: '11:15 – 11:45', color: BLUE },
  { day: 1, rowStart: 5, rowSpan: 1, pet: 'bruno', label: 'Simba', breed: 'Golden Retriever', time: '1:00 – 1:45 PM', color: ORANGE },
  { day: 3, rowStart: 5, rowSpan: 1, pet: 'max', label: 'Buddy', breed: 'Labrador', time: '1:00 – 1:45 PM', color: GREEN },
  { day: 5, rowStart: 5, rowSpan: 1, pet: 'charlie', label: 'Chloe', breed: 'Persian Cat', time: '1:00 – 1:30 PM', color: PINK },
  { day: 0, rowStart: 7, rowSpan: 1, pet: 'cooper', label: 'Oliver', breed: 'Cocker Spaniel', time: '3:00 – 3:45 PM', color: PURPLE },
  { day: 2, rowStart: 7, rowSpan: 1, pet: 'milo', label: 'Molly', breed: 'Poodle', time: '3:00 – 3:30 PM', color: ORANGE },
  { day: 3, rowStart: 7, rowSpan: 1, pet: 'rocky', label: 'Cooper', breed: 'Bulldog', time: '3:00 – 3:45 PM', color: GREEN },
];

const LEGEND = [
  { label: 'Veterinarian', color: PURPLE },
  { label: 'Surgery', color: ORANGE },
  { label: 'Dentistry', color: BLUE },
  { label: 'Cardiology', color: GREEN },
  { label: 'Dermatology', color: PINK },
];

const AUTOMATIONS = [
  { icon: CheckCircle2, label: 'Instant Availability Check', desc: 'AI checks doctor, room & resources in real-time.' },
  { icon: Bell, label: 'Auto Confirmation', desc: 'Sends SMS/Email instantly to clients.' },
  { icon: Clock, label: 'Smart Reminders', desc: 'Reduces no-shows with timely reminders.' },
  { icon: Zap, label: 'Schedule Optimization', desc: 'Fills gaps and balances doctor workload.' },
  { icon: RefreshCw, label: 'Cross-Department Sync', desc: 'Updates patients, inventory & billing.' },
];

const UPCOMING = [
  { name: 'Milo', breed: 'Pug', time: '10:30 AM' },
  { name: 'Lucy', breed: 'Rabbit', time: '11:15 AM' },
  { name: 'Chloe', breed: 'Persian Cat', time: '1:00 PM' },
];

const WEEK_DAYS = [12, 13, 14, 15, 16, 17, 18];

export default function AppointmentJourneyVisual({
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
              badge="SMART SCHEDULING"
              title="Zero Confusion."
              titleAccent="Full Control."
              features={[
                { icon: Smartphone, label: 'Online Booking', desc: 'Clients book 24/7 from your website or social media.' },
                { icon: CalendarCheck, label: 'Smart Calendar', desc: 'View all appointments, doctors and rooms in one place.' },
                { icon: Bell, label: 'Automated Reminders', desc: 'SMS, WhatsApp & Email reminders reduce no-shows.' },
                { icon: CheckCircle2, label: 'Easy Check-in', desc: 'One-click check-in with instant patient records.' },
                { icon: Users, label: 'Real-time Updates', desc: 'Changes reflect across all departments instantly.' },
              ]}
              stat={{ label: 'No-shows reduced', value: '35%', delta: '↑ with smart scheduling & reminders', sparkline: true }}
            />
          </MotionSlot>

          <MotionSlot slot="main" className="flex-1 min-w-0 p-3 sm:p-4">
            <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-[#F8FAFC]">Appointments</p>
                <span className="text-[10px] text-[#64748B] flex items-center gap-1">
                  <ChevronLeft className="w-3 h-3" />
                  May 12–18, 2026
                  <ChevronRight className="w-3 h-3" />
                </span>
              </div>
              <div className="flex gap-2 flex-wrap items-center">
                <div className="flex items-center gap-0.5 rounded-lg border border-[#8B5CF6]/25 bg-[#8B5CF6]/[0.04] p-0.5">
                  <ToolbarButton>Today</ToolbarButton>
                  <ToolbarButton>Day</ToolbarButton>
                  <ToolbarButton primary>Week</ToolbarButton>
                  <ToolbarButton>Month</ToolbarButton>
                </div>
                <ToolbarButton primary>+ New Appointment</ToolbarButton>
              </div>
            </div>

            <WeekScheduleGrid days={DAYS} times={TIMES} blocks={BLOCKS} nowRow={2.5} nowLabel="10:30 AM" />

            <div className="flex flex-wrap gap-3 mt-2.5 justify-center">
              {LEGEND.map((l) => (
                <span key={l.label} className="flex items-center gap-1.5 text-[8px] text-[#94A3B8]">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: l.color }} />
                  {l.label}
                </span>
              ))}
            </div>

            <AutomationRow title="Phoenix OS Automates So You Don't Have To" items={AUTOMATIONS} />
          </MotionSlot>

          <MotionSlot slot="aside" className="hidden lg:flex flex-col w-[210px] xl:w-[232px] shrink-0 border-l border-white/10 p-3 gap-3">
            <SummaryCard>
              <div className="flex items-center gap-2.5 mb-2.5">
                <PetStockAvatar pet="bruno" size="lg" />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-[11px] font-semibold text-[#F8FAFC]">Bruno</p>
                    <StatusBadge label="Confirmed" tone="green" />
                  </div>
                  <p className="text-[8px] text-[#64748B]">Golden Retriever · 3Y · Male · 32kg</p>
                </div>
              </div>
              <div className="space-y-1.5 text-[8px] text-[#94A3B8]">
                <p>
                  <span className="text-[#64748B]">Date &amp; Time </span>May 12, 2026 · 8:00 – 9:30 AM
                </p>
                <p>
                  <span className="text-[#64748B]">Doctor </span>Dr. Sarah Johnson
                </p>
                <p>
                  <span className="text-[#64748B]">Purpose </span>Annual Check-up
                </p>
                <p>
                  <span className="text-[#64748B]">Status </span>
                  <span className="text-[#86EFAC]">Confirmed</span>
                </p>
                <p>
                  <span className="text-[#64748B]">Source </span>Website Booking
                </p>
                <p>
                  <span className="text-[#64748B]">Client </span>Sarah Johnson · +1 (555) 123-4567
                </p>
              </div>
              <div className="flex gap-1.5 mt-3">
                <ToolbarButton>Reschedule</ToolbarButton>
                <ToolbarButton primary>View / Edit</ToolbarButton>
              </div>
            </SummaryCard>

            <SummaryCard title="May 2026">
              <div className="grid grid-cols-7 gap-0.5 text-[7px] text-center text-[#64748B]">
                {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((d) => (
                  <span key={d} className="py-0.5 font-medium">
                    {d}
                  </span>
                ))}
                {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => {
                  const inWeek = WEEK_DAYS.includes(d);
                  return (
                    <span
                      key={d}
                      className={
                        d === 12
                          ? 'py-0.5 rounded bg-[#8B5CF6] text-white font-semibold'
                          : inWeek
                            ? 'py-0.5 rounded bg-[#8B5CF6]/15 text-[#C4B5FD]'
                            : 'py-0.5 text-[#94A3B8]'
                      }
                    >
                      {d}
                    </span>
                  );
                })}
              </div>
            </SummaryCard>

            <SummaryCard title="Upcoming (3)">
              <div className="space-y-2">
                {UPCOMING.map((u, i) => (
                  <div key={u.name} className="flex items-center gap-2">
                    <span className="text-[8px] text-[#64748B] w-14 shrink-0 tabular-nums">{u.time}</span>
                    <span className="text-[9px] font-medium text-[#E2E8F0]">{u.name}</span>
                    <span className="text-[8px] text-[#64748B] ml-auto truncate">{u.breed}</span>
                    <span className={i === 0 ? 'w-1.5 h-1.5 rounded-full bg-[#8B5CF6]' : 'w-1.5 h-1.5 rounded-full bg-white/20'} />
                  </div>
                ))}
                <p className="text-[8px] text-[#C4B5FD] pt-1">View All →</p>
              </div>
            </SummaryCard>
          </MotionSlot>
        </div>

        <MotionSlot slot="footer">
          <KpiStrip
            items={[
              { icon: CalendarCheck, label: "Today's Appointments", value: '28' },
              { icon: Users, label: 'New Bookings', value: '5' },
              { icon: Bell, label: 'Confirmations Sent', value: '23' },
              { icon: TrendingDown, label: 'No-Shows (This Week)', value: '1', delta: '↓ 80%' },
              { icon: Sparkles, label: 'Utilization', value: '92%' },
            ]}
          />
        </MotionSlot>
      </JourneyFrame>
    </JourneyScreenMotion>
  );
}
