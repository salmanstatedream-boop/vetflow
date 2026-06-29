'use client';

import { useMemo, useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import DateRangeQuickFilter from '@/components/dashboard/DateRangeQuickFilter';
import NewAppointmentWizard from '@/components/reception/NewAppointmentWizard';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
} from 'lucide-react';
import {
  addDaysToDate,
  formatDateYmd,
  formatDisplayDate,
  parseDateYmd,
  startOfToday,
} from '@/lib/utils/date-filters';
import {
  formatAppointmentTime,
  normalizeDateYmd,
  parseAppointmentTimeToMinutes,
} from '@/lib/utils/time-parse';
import { getClinicTimezoneShortLabel } from '@/lib/utils/timezones';
import {
  appointmentTimeRange,
  rangesOverlap,
  DEFAULT_APPOINTMENT_DURATION_MINUTES,
} from '@/lib/appointments/slot-conflict';
import { isUpcomingAppointment } from '@/lib/appointments/status';
import { cn } from '@/lib/utils';

const START_HOUR = 0;
const END_HOUR = 24;
const SLOT_MINUTES = 15;
const ROW_HEIGHT = 28;
const DEFAULT_SCROLL_HOUR = 7;

export interface ScheduleDoctor {
  id: string;
  firstName: string;
  lastName: string;
}

export interface ScheduleAppointment {
  id: string;
  patientName: string;
  customerName: string;
  reason: string;
  status: string;
  preferredDate: string;
  preferredTime: string;
  durationMinutes: number;
  doctorId: string | null;
  isEmergency: boolean;
  visitId?: string | null;
}

interface ScheduleDayCalendarClientProps {
  doctors: ScheduleDoctor[];
  appointments: ScheduleAppointment[];
  selectedDate: string;
  currentUserId: string;
  currentRole: string | null;
  activeBranchId: string;
  clinicTimezone?: string;
}

const STATUS_COLORS: Record<string, string> = {
  confirmed: 'bg-blue-500/20 border-blue-500/40 text-blue-200',
  requested: 'bg-amber-500/20 border-amber-500/40 text-amber-200',
  checked_in: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-200',
  rescheduled: 'bg-violet-500/20 border-violet-500/40 text-violet-200',
};

function appointmentHref(appt: ScheduleAppointment): string {
  if (appt.status === 'checked_in' && appt.visitId) {
    return `/dashboard/doctors/${appt.visitId}`;
  }
  return '/dashboard/appointments';
}

function minutesToLabel(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hr = h % 12 || 12;
  return `${hr}:${m.toString().padStart(2, '0')} ${ampm}`;
}

function appointmentLayout(
  preferredTime: string,
  durationMinutes: number
): { top: number; height: number } | null {
  const start = parseAppointmentTimeToMinutes(preferredTime);
  if (start == null) return null;

  const gridStart = START_HOUR * 60;
  const gridEnd = END_HOUR * 60;

  // Clamp to visible grid instead of hiding out-of-range appointments
  const clampedStart = Math.max(gridStart, Math.min(start, gridEnd - SLOT_MINUTES));
  const startOffset = clampedStart - gridStart;
  const top = (startOffset / SLOT_MINUTES) * ROW_HEIGHT;
  const rawHeight = (Math.max(durationMinutes, SLOT_MINUTES) / SLOT_MINUTES) * ROW_HEIGHT - 2;
  const maxHeight = gridHeightFromSlots() - top;
  const height = Math.max(ROW_HEIGHT - 2, Math.min(rawHeight, maxHeight));

  return { top: top + 1, height };
}

function gridHeightFromSlots(): number {
  return ((END_HOUR - START_HOUR) * 60) / SLOT_MINUTES * ROW_HEIGHT;
}

interface ApptBlockLayout {
  appt: ScheduleAppointment;
  top: number;
  height: number;
  columnIndex: number;
  columnCount: number;
}

function minutesToTimeInput(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function buildOverlapGroups(appts: ScheduleAppointment[]): ScheduleAppointment[][] {
  const upcoming = appts.filter((a) => isUpcomingAppointment(a.status));
  const n = upcoming.length;
  if (n === 0) return [];

  const parent = upcoming.map((_, i) => i);
  const find = (i: number): number => {
    if (parent[i] !== i) parent[i] = find(parent[i]);
    return parent[i];
  };
  const union = (a: number, b: number) => {
    const ra = find(a);
    const rb = find(b);
    if (ra !== rb) parent[rb] = ra;
  };

  for (let i = 0; i < n; i++) {
    const ri = appointmentTimeRange(upcoming[i].preferredTime, upcoming[i].durationMinutes);
    if (!ri) continue;
    for (let j = i + 1; j < n; j++) {
      const rj = appointmentTimeRange(upcoming[j].preferredTime, upcoming[j].durationMinutes);
      if (rj && rangesOverlap(ri, rj)) union(i, j);
    }
  }

  const map = new Map<number, ScheduleAppointment[]>();
  for (let i = 0; i < n; i++) {
    const root = find(i);
    const list = map.get(root) ?? [];
    list.push(upcoming[i]);
    map.set(root, list);
  }

  return Array.from(map.values()).map((group) =>
    group.sort((a, b) => {
      const am = parseAppointmentTimeToMinutes(a.preferredTime) ?? 0;
      const bm = parseAppointmentTimeToMinutes(b.preferredTime) ?? 0;
      return am - bm;
    })
  );
}

function buildApptBlockLayouts(appts: ScheduleAppointment[]): ApptBlockLayout[] {
  const groups = buildOverlapGroups(appts);
  const layouts: ApptBlockLayout[] = [];

  for (const group of groups) {
    const columnCount = group.length;
    group.forEach((appt, columnIndex) => {
      const layout = appointmentLayout(appt.preferredTime, appt.durationMinutes);
      if (!layout) return;
      layouts.push({ appt, ...layout, columnIndex, columnCount });
    });
  }

  return layouts;
}

function isSlotBlockedForDoctor(
  slotMinutes: number,
  colAppts: ScheduleAppointment[]
): boolean {
  const newRange = appointmentTimeRange(
    minutesToTimeInput(slotMinutes),
    DEFAULT_APPOINTMENT_DURATION_MINUTES
  );
  if (!newRange) return false;

  for (const appt of colAppts) {
    if (!isUpcomingAppointment(appt.status)) continue;
    const existing = appointmentTimeRange(appt.preferredTime, appt.durationMinutes);
    if (existing && rangesOverlap(newRange, existing)) return true;
  }
  return false;
}

export default function ScheduleDayCalendarClient({
  doctors,
  appointments,
  selectedDate,
  currentUserId,
  currentRole,
  activeBranchId,
  clinicTimezone = 'UTC',
}: ScheduleDayCalendarClientProps) {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [doctorFilter, setDoctorFilter] = useState<string>(
    currentRole === 'doctor' ? currentUserId : 'all'
  );
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardPrefill, setWizardPrefill] = useState<{
    date?: string;
    time?: string;
    doctorId?: string;
  }>({});

  const slots = useMemo(() => {
    const list: number[] = [];
    for (let m = START_HOUR * 60; m < END_HOUR * 60; m += SLOT_MINUTES) {
      list.push(m);
    }
    return list;
  }, []);

  const columns = useMemo(() => {
    const cols: { id: string; label: string }[] = [];
    if (doctorFilter === 'all') {
      cols.push({ id: 'unassigned', label: 'Unassigned' });
      for (const d of doctors) {
        cols.push({ id: d.id, label: `Dr. ${d.firstName} ${d.lastName}` });
      }
    } else {
      const d = doctors.find((x) => x.id === doctorFilter);
      cols.push({
        id: doctorFilter,
        label: d ? `Dr. ${d.firstName} ${d.lastName}` : 'Doctor',
      });
    }
    return cols;
  }, [doctors, doctorFilter]);

  const dayAppointments = useMemo(
    () =>
      appointments.filter(
        (a) => normalizeDateYmd(a.preferredDate) === normalizeDateYmd(selectedDate)
      ),
    [appointments, selectedDate]
  );

  const navigateDate = (delta: number) => {
    const base = parseDateYmd(selectedDate) ?? startOfToday();
    const next = formatDateYmd(addDaysToDate(base, delta));
    router.push(`/dashboard/schedule?date=${next}`);
  };

  const openSlot = (minutes: number, doctorId: string | null) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    setWizardPrefill({
      date: selectedDate,
      time: `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`,
      doctorId: doctorId || undefined,
    });
    setWizardOpen(true);
  };

  const gridHeight = slots.length * ROW_HEIGHT;

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const todayYmd = formatDateYmd(startOfToday());
    const isToday = normalizeDateYmd(selectedDate) === todayYmd;
    const scrollHour = isToday
      ? Math.max(START_HOUR, Math.min(new Date().getHours() - 1, END_HOUR - 2))
      : DEFAULT_SCROLL_HOUR;
    const scrollTop = ((scrollHour - START_HOUR) * 60) / SLOT_MINUTES * ROW_HEIGHT;
    el.scrollTop = scrollTop;
  }, [selectedDate]);

  const timezoneLabel = getClinicTimezoneShortLabel(clinicTimezone);

  return (
    <div className="flex flex-col gap-6 min-h-0 flex-1">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigateDate(-1)}
            className="p-2 rounded-lg border border-outline-variant/50 hover:bg-surface-container-high"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="text-center min-w-[180px]">
            <p className="text-sm font-black text-on-surface">{formatDisplayDate(selectedDate)}</p>
            <p className="text-[10px] text-on-surface-variant">
              {dayAppointments.length} appointment{dayAppointments.length !== 1 ? 's' : ''}
              <span className="mx-1.5 text-outline-variant">·</span>
              {timezoneLabel}
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigateDate(1)}
            className="p-2 rounded-lg border border-outline-variant/50 hover:bg-surface-container-high"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <DateRangeQuickFilter showWeek={false} />

        <div className="flex items-center gap-2 flex-wrap">
          {currentRole !== 'doctor' && (
            <select
              value={doctorFilter}
              onChange={(e) => setDoctorFilter(e.target.value)}
              className="px-3 py-2 rounded-xl text-xs font-bold bg-surface-container/30 border border-outline-variant/50"
            >
              <option value="all">All providers</option>
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>
                  Dr. {d.firstName} {d.lastName}
                </option>
              ))}
            </select>
          )}
          <button
            type="button"
            onClick={() => {
              setWizardPrefill({ date: selectedDate });
              setWizardOpen(true);
            }}
            className="inline-flex items-center gap-1.5 bg-primary text-white px-4 py-2 rounded-xl text-xs font-bold"
          >
            <Plus className="w-3.5 h-3.5" />
            New appointment
          </button>
        </div>
      </div>

      <div className="glass-panel rounded-2xl border border-outline-variant/40 overflow-hidden shadow-premium flex flex-col min-h-0 max-h-[calc(100vh-14rem)]">
        <div
          className="grid min-w-[720px] shrink-0 border-b border-outline-variant/30"
          style={{
            gridTemplateColumns: `64px repeat(${columns.length}, minmax(140px, 1fr))`,
          }}
        >
          <div className="bg-surface-container/40 border-r border-outline-variant/30" />
          {columns.map((col) => (
            <div
              key={col.id}
              className="px-3 py-3 border-r border-outline-variant/30 bg-surface-container/30 text-[10px] font-bold text-on-surface uppercase tracking-wider"
            >
              {col.label}
              <span className="block text-[9px] font-semibold text-primary normal-case mt-0.5">
                {
                  dayAppointments.filter((a) =>
                    col.id === 'unassigned' ? !a.doctorId : a.doctorId === col.id
                  ).length
                }{' '}
                appts
              </span>
            </div>
          ))}
        </div>

        <div ref={scrollRef} className="overflow-y-auto overflow-x-auto flex-1 min-h-0">
          <div
            className="grid min-w-[720px]"
            style={{
              gridTemplateColumns: `64px repeat(${columns.length}, minmax(140px, 1fr))`,
            }}
          >
            <div
              className="relative border-r border-outline-variant/20 sticky left-0 z-10 bg-surface-container/95"
              style={{ height: gridHeight }}
            >
              {slots.map((m, i) => (
                <div
                  key={m}
                  className="absolute left-0 right-0 text-[9px] text-on-surface-variant/60 pr-2 text-right border-t border-outline-variant/15"
                  style={{ top: i * ROW_HEIGHT, height: ROW_HEIGHT, lineHeight: `${ROW_HEIGHT}px` }}
                >
                  {m % 60 === 0 ? minutesToLabel(m) : ''}
                </div>
              ))}
            </div>

            {columns.map((col) => {
              const colAppts = dayAppointments.filter((a) =>
                col.id === 'unassigned' ? !a.doctorId : a.doctorId === col.id
              );
              const apptLayouts = buildApptBlockLayouts(colAppts);
              const isDoctorCol = col.id !== 'unassigned';
              return (
                <div
                  key={col.id}
                  className="relative border-r border-outline-variant/20 bg-surface/30"
                  style={{ height: gridHeight }}
                >
                  {slots.map((m, i) => {
                    const occupied = isDoctorCol && isSlotBlockedForDoctor(m, colAppts);
                    return (
                      <button
                        key={m}
                        type="button"
                        disabled={occupied}
                        className={cn(
                          'absolute left-0 right-0 z-[1] border-t border-outline-variant/10 transition-colors',
                          occupied
                            ? 'bg-destructive/5 cursor-not-allowed'
                            : 'hover:bg-primary/5'
                        )}
                        style={{ top: i * ROW_HEIGHT, height: ROW_HEIGHT }}
                        onClick={() => {
                          if (occupied) return;
                          openSlot(m, col.id === 'unassigned' ? null : col.id);
                        }}
                        aria-label={
                          occupied
                            ? `Slot ${minutesToLabel(m)} occupied`
                            : `Book slot ${minutesToLabel(m)}`
                        }
                      />
                    );
                  })}
                  {apptLayouts.map(({ appt, top, height, columnIndex, columnCount }) => {
                    const color =
                      STATUS_COLORS[appt.status] ??
                      'bg-surface-container-high border-outline-variant/40 text-on-surface';
                    const widthPercent = 100 / columnCount;
                    const leftPercent = columnIndex * widthPercent;
                    return (
                      <Link
                        key={appt.id}
                        href={appointmentHref(appt)}
                        className={cn(
                          'absolute z-[2] rounded-lg border px-1.5 py-1 overflow-hidden text-left shadow-sm pointer-events-auto',
                          color
                        )}
                        title={`${appt.durationMinutes} min`}
                        style={{
                          top,
                          height,
                          left: `calc(${leftPercent}% + 4px)`,
                          width: `calc(${widthPercent}% - 6px)`,
                        }}
                      >
                        <p className="text-[10px] font-bold truncate">
                          {formatAppointmentTime(appt.preferredTime)} · {appt.durationMinutes}m · {appt.patientName}
                        </p>
                        <p className="text-[9px] opacity-80 truncate">{appt.reason}</p>
                        {columnCount > 1 && (
                          <span className="text-[8px] font-bold opacity-70">
                            {columnCount} appts
                          </span>
                        )}
                        {appt.isEmergency && (
                          <span className="text-[8px] font-black text-destructive">ER</span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <NewAppointmentWizard
        doctors={doctors}
        activeBranchId={activeBranchId}
        isOpen={wizardOpen}
        onClose={() => {
          setWizardOpen(false);
          router.refresh();
        }}
        initialPreferredDate={wizardPrefill.date}
        initialPreferredTime={wizardPrefill.time}
        initialDoctorId={wizardPrefill.doctorId}
      />
    </div>
  );
}
