'use client';

import { useMemo, useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import {
  assignShiftAction,
  deleteShiftAction,
  saveScheduleTemplateAction,
  bulkAssignScheduleTemplateAction,
  generateShiftsFromTemplatesAction,
} from '@/lib/services/attendance-actions';
import Select from '@/components/ui/premium/Select';
import DashboardSectionCard from '@/components/dashboard/premium/DashboardSectionCard';
import AttendanceStatusBadge from '@/components/dashboard/AttendanceStatusBadge';
import { tableHeadClass, tableRowClass } from '@/lib/ui/dashboard-classes';
import {
  CalendarPlus,
  Loader2,
  Trash2,
  Users,
  CalendarDays,
  Clock,
  CalendarClock,
} from 'lucide-react';

type StaffOption = { id: string; name: string };
type BranchOption = { id: string; name: string };

export type ShiftRow = {
  id: string;
  staffName: string;
  branchName: string;
  shiftDate: string;
  startTime: string;
  endTime: string;
  notes: string | null;
};

export type AttendanceRow = {
  userId: string;
  staffName: string;
  role: string;
  status: string | null;
  rosterStatus: 'present' | 'late' | 'absent' | 'off' | 'not_scheduled' | 'pending';
  checkInAt: string | null;
  checkOutAt: string | null;
};

export type AttendanceHistoryRow = {
  userId: string;
  staffName: string;
  workDate: string;
  status: string | null;
  checkInAt: string | null;
  checkOutAt: string | null;
};

export type DayTemplate = {
  weekday: number;
  startTime: string;
  endTime: string;
  isOffDay: boolean;
};

type FormValues = {
  userId: string;
  branchId: string;
  shiftDate: string;
  startTime: string;
  endTime: string;
  notes: string;
};

const WEEKDAYS: { weekday: number; label: string }[] = [
  { weekday: 1, label: 'Mon' },
  { weekday: 2, label: 'Tue' },
  { weekday: 3, label: 'Wed' },
  { weekday: 4, label: 'Thu' },
  { weekday: 5, label: 'Fri' },
  { weekday: 6, label: 'Sat' },
  { weekday: 0, label: 'Sun' },
];

const TH = 'px-4 py-3';
const TD = 'px-4 py-3';

function defaultWeek(): DayTemplate[] {
  return WEEKDAYS.map(({ weekday }) => ({
    weekday,
    startTime: '09:00',
    endTime: '17:00',
    isOffDay: weekday === 0,
  }));
}

function fmtTime(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
      {children}
    </h2>
  );
}

function EmptyTableState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center min-h-[200px]">
      <Clock className="w-10 h-10 text-on-surface-variant/30 mb-3" />
      <p className="text-xs text-on-surface-variant">{message}</p>
    </div>
  );
}

export default function StaffScheduleClient({
  staff,
  branches,
  shifts,
  attendance,
  attendanceHistory,
  attendanceDate,
  initialTemplate,
  templateUserId,
  templateBranchId,
}: {
  staff: StaffOption[];
  branches: BranchOption[];
  shifts: ShiftRow[];
  attendance: AttendanceRow[];
  attendanceHistory: AttendanceHistoryRow[];
  attendanceDate: string;
  initialTemplate?: DayTemplate[];
  templateUserId?: string;
  templateBranchId?: string;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const [selectedStaffId, setSelectedStaffId] = useState(templateUserId || staff[0]?.id || '');
  const [selectedBranchId, setSelectedBranchId] = useState(
    templateBranchId || branches[0]?.id || ''
  );
  const [weekDays, setWeekDays] = useState<DayTemplate[]>(
    initialTemplate?.length === 7 ? initialTemplate : defaultWeek()
  );
  const [bulkUserIds, setBulkUserIds] = useState<string[]>([]);
  const [savingTemplate, setSavingTemplate] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [historyStaffFilter, setHistoryStaffFilter] = useState('all');

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: { startTime: '09:00', endTime: '17:00', userId: '', branchId: '' },
  });

  const present = attendance.filter(
    (a) => a.rosterStatus === 'present' || a.rosterStatus === 'late'
  ).length;

  const rosterDateLabel = new Date(`${attendanceDate}T12:00:00`).toLocaleDateString();

  const filteredHistory = useMemo(() => {
    if (historyStaffFilter === 'all') return attendanceHistory;
    return attendanceHistory.filter((row) => row.userId === historyStaffFilter);
  }, [attendanceHistory, historyStaffFilter]);

  const toggleBulkUser = (id: string) => {
    setBulkUserIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const updateDay = (weekday: number, patch: Partial<DayTemplate>) => {
    setWeekDays((prev) =>
      prev.map((d) => (d.weekday === weekday ? { ...d, ...patch } : d))
    );
  };

  const onSaveTemplate = async () => {
    if (!selectedStaffId || !selectedBranchId) {
      setError('Select a staff member and branch.');
      return;
    }
    setSavingTemplate(true);
    setError(null);
    setSuccess(null);
    const res = await saveScheduleTemplateAction({
      userId: selectedStaffId,
      branchId: selectedBranchId,
      days: weekDays,
    });
    setSavingTemplate(false);
    if (res.success) {
      setSuccess('Weekly schedule saved.');
      router.refresh();
    } else {
      setError(res.error || 'Failed to save template.');
    }
  };

  const onBulkAssign = async () => {
    if (!bulkUserIds.length || !selectedBranchId) {
      setError('Select at least one staff member for bulk assign.');
      return;
    }
    setSavingTemplate(true);
    setError(null);
    setSuccess(null);
    const res = await bulkAssignScheduleTemplateAction({
      userIds: bulkUserIds,
      branchId: selectedBranchId,
      days: weekDays,
    });
    setSavingTemplate(false);
    if (res.success) {
      setSuccess(`Schedule applied to ${res.count} staff.`);
      setBulkUserIds([]);
      router.refresh();
    } else {
      setError(res.error || 'Bulk assign failed.');
    }
  };

  const onGenerateShifts = async () => {
    setGenerating(true);
    setError(null);
    const res = await generateShiftsFromTemplatesAction({ weeksAhead: 2 });
    setGenerating(false);
    if (res.success) {
      setSuccess(`Generated ${res.created} shift(s) for the next 2 weeks.`);
      router.refresh();
    } else {
      setError(res.error || 'Failed to generate shifts.');
    }
  };

  const onAssign = handleSubmit(async (data) => {
    setError(null);
    if (!data.userId) {
      setError('Select a staff member.');
      return;
    }
    if (!data.branchId) {
      setError('Select a branch.');
      return;
    }
    const res = await assignShiftAction(data);
    if (res.success) {
      reset({ ...data, userId: '', notes: '' });
      router.refresh();
    } else {
      setError(res.error || 'Failed to assign shift.');
    }
  });

  const onDelete = (id: string) => {
    if (!window.confirm('Remove this shift?')) return;
    setDeletingId(id);
    startTransition(async () => {
      const res = await deleteShiftAction(id);
      setDeletingId(null);
      if (res.success) router.refresh();
      else setError(res.error || 'Failed to remove shift.');
    });
  };

  return (
    <div className="space-y-6">
      {(error || success) && (
        <div
          className={`text-xs p-3 rounded-xl border ${
            error
              ? 'bg-destructive/5 border-destructive/20 text-destructive'
              : 'bg-emerald-500/5 border-emerald-500/20 text-emerald-600'
          }`}
        >
          {error || success}
        </div>
      )}

      {/* Zone 1 — Attendance */}
      <section className="space-y-4">
        <SectionLabel>Attendance</SectionLabel>
        <div className="grid lg:grid-cols-2 gap-5 items-stretch">
          <DashboardSectionCard
            className="h-full overflow-hidden"
            title="Today roster"
            subtitle={rosterDateLabel}
            action={
              <span className="text-[10px] font-semibold text-on-surface-variant whitespace-nowrap">
                {present}/{attendance.length} on site
              </span>
            }
          >
            <div className="min-h-[280px] flex flex-col -mx-5 md:-mx-6 -mb-5 md:-mb-6">
              {attendance.length > 0 ? (
                <div className="overflow-x-auto flex-1">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className={tableHeadClass}>
                        <th className={TH}>Staff</th>
                        <th className={TH}>Check in</th>
                        <th className={TH}>Check out</th>
                        <th className={TH}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attendance.map((a) => (
                        <tr key={a.userId} className={tableRowClass}>
                          <td className={TD}>
                            <span className="font-semibold text-on-surface block">{a.staffName}</span>
                            <span className="text-[10px] text-on-surface-variant capitalize">
                              {a.role.replace('_', ' ')}
                            </span>
                          </td>
                          <td className={`${TD} text-on-surface-variant`}>{fmtTime(a.checkInAt)}</td>
                          <td className={`${TD} text-on-surface-variant`}>{fmtTime(a.checkOutAt)}</td>
                          <td className={TD}>
                            <AttendanceStatusBadge status={a.rosterStatus} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <EmptyTableState message="No staff to show." />
              )}
            </div>
          </DashboardSectionCard>

          <DashboardSectionCard
            className="h-full overflow-hidden"
            title="Attendance history"
            subtitle="Last 30 days"
            action={
              <Select
                value={historyStaffFilter}
                onChange={setHistoryStaffFilter}
                options={[
                  { value: 'all', label: 'All staff' },
                  ...staff.map((s) => ({ value: s.id, label: s.name })),
                ]}
                className="min-w-[140px]"
              />
            }
          >
            <div className="min-h-[280px] flex flex-col -mx-5 md:-mx-6 -mb-5 md:-mb-6">
              {filteredHistory.length > 0 ? (
                <div className="overflow-x-auto overflow-y-auto flex-1 max-h-[360px]">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="sticky top-0 z-10">
                      <tr className={tableHeadClass}>
                        <th className={TH}>Date</th>
                        <th className={TH}>Staff</th>
                        <th className={TH}>Check in</th>
                        <th className={TH}>Check out</th>
                        <th className={TH}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredHistory.map((row) => (
                        <tr key={`${row.userId}-${row.workDate}`} className={tableRowClass}>
                          <td className={`${TD} text-on-surface-variant whitespace-nowrap`}>
                            {new Date(`${row.workDate}T12:00:00`).toLocaleDateString()}
                          </td>
                          <td className={`${TD} font-semibold text-on-surface`}>{row.staffName}</td>
                          <td className={`${TD} text-on-surface-variant`}>{fmtTime(row.checkInAt)}</td>
                          <td className={`${TD} text-on-surface-variant`}>{fmtTime(row.checkOutAt)}</td>
                          <td className={TD}>
                            <AttendanceStatusBadge status={row.status} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <EmptyTableState message="No attendance records yet." />
              )}
            </div>
          </DashboardSectionCard>
        </div>
      </section>

      {/* Zone 2 — Weekly template (full width) */}
      <section className="space-y-4">
        <SectionLabel>Schedule templates</SectionLabel>
        <DashboardSectionCard
          title="Weekly schedule template"
          subtitle="Set default hours per weekday, then generate shifts"
          action={
            <button
              type="button"
              onClick={onGenerateShifts}
              disabled={generating}
              className="text-[10px] font-bold text-primary border border-primary/20 px-3 py-1.5 rounded-lg disabled:opacity-60 whitespace-nowrap"
            >
              {generating ? (
                <Loader2 className="w-3 h-3 animate-spin inline" />
              ) : (
                'Generate 2 weeks of shifts'
              )}
            </button>
          }
        >
          <div className="space-y-5 text-xs">
            <div className="grid sm:grid-cols-2 gap-3">
              <Select
                label="Staff member"
                value={selectedStaffId}
                onChange={setSelectedStaffId}
                options={staff.map((s) => ({ value: s.id, label: s.name }))}
                onAddNew={() => router.push('/dashboard/staff')}
                addNewLabel="Add staff member"
              />
              <Select
                label="Branch"
                value={selectedBranchId}
                onChange={setSelectedBranchId}
                options={branches.map((b) => ({ value: b.id, label: b.name }))}
                onAddNew={() => router.push('/dashboard/branches')}
                addNewLabel="Add branch"
              />
            </div>

            <div className="overflow-x-auto rounded-xl border border-outline-variant/30">
              <table className="w-full text-left border-collapse text-xs min-w-[480px]">
                <thead>
                  <tr className={tableHeadClass}>
                    <th className={TH}>Day</th>
                    <th className={TH}>Start</th>
                    <th className={TH}>End</th>
                    <th className={`${TH} text-center`}>Off</th>
                  </tr>
                </thead>
                <tbody>
                  {WEEKDAYS.map(({ weekday, label }) => {
                    const day = weekDays.find((d) => d.weekday === weekday)!;
                    return (
                      <tr key={weekday} className={tableRowClass}>
                        <td className={`${TD} font-semibold text-on-surface`}>{label}</td>
                        <td className={TD}>
                          <input
                            type="time"
                            disabled={day.isOffDay}
                            value={day.startTime}
                            onChange={(e) => updateDay(weekday, { startTime: e.target.value })}
                            className="px-2 py-1.5 bg-surface-container/30 border border-outline-variant rounded-lg text-xs disabled:opacity-40 w-full max-w-[120px]"
                          />
                        </td>
                        <td className={TD}>
                          <input
                            type="time"
                            disabled={day.isOffDay}
                            value={day.endTime}
                            onChange={(e) => updateDay(weekday, { endTime: e.target.value })}
                            className="px-2 py-1.5 bg-surface-container/30 border border-outline-variant rounded-lg text-xs disabled:opacity-40 w-full max-w-[120px]"
                          />
                        </td>
                        <td className={`${TD} text-center`}>
                          <input
                            type="checkbox"
                            checked={day.isOffDay}
                            onChange={(e) => updateDay(weekday, { isOffDay: e.target.checked })}
                            className="rounded border-outline-variant"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={onSaveTemplate}
                disabled={savingTemplate}
                className="bg-primary hover:opacity-90 text-white px-4 py-2 rounded-xl text-xs font-semibold disabled:opacity-70"
              >
                {savingTemplate ? 'Saving…' : 'Save weekly template'}
              </button>
            </div>

            <div className="pt-4 border-t border-outline-variant/30 space-y-3">
              <h4 className="text-[10px] font-bold text-on-surface uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-primary" />
                Bulk apply to selected staff
              </h4>
              <div className="flex flex-wrap gap-2">
                {staff.map((s) => (
                  <label
                    key={s.id}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-semibold border cursor-pointer ${
                      bulkUserIds.includes(s.id)
                        ? 'bg-primary/10 border-primary/30 text-primary'
                        : 'border-outline-variant text-on-surface-variant'
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={bulkUserIds.includes(s.id)}
                      onChange={() => toggleBulkUser(s.id)}
                    />
                    {s.name}
                  </label>
                ))}
              </div>
              <button
                type="button"
                onClick={onBulkAssign}
                disabled={savingTemplate || bulkUserIds.length === 0}
                className="border border-primary/30 text-primary px-4 py-2 rounded-xl text-xs font-semibold disabled:opacity-50"
              >
                Apply to selected ({bulkUserIds.length})
              </button>
            </div>
          </div>
        </DashboardSectionCard>
      </section>

      {/* Zone 3 — Shift management */}
      <section className="space-y-4">
        <SectionLabel>Shift management</SectionLabel>
        <div className="grid lg:grid-cols-2 gap-5 items-stretch">
          <DashboardSectionCard
            className="h-full flex flex-col"
            title="One-off shift override"
            subtitle="Assign a single shift outside the weekly template"
          >
            <form onSubmit={onAssign} className="flex flex-col flex-1 space-y-3 text-xs">
              <Select
                label="Staff member"
                value={watch('userId') || ''}
                onChange={(v) => setValue('userId', v, { shouldValidate: true })}
                options={[
                  { value: '', label: 'Select staff…' },
                  ...staff.map((s) => ({ value: s.id, label: s.name })),
                ]}
                onAddNew={() => router.push('/dashboard/staff')}
                addNewLabel="Add staff member"
              />
              {errors.userId && (
                <span className="text-[10px] text-destructive -mt-2 block">{errors.userId.message}</span>
              )}
              <Select
                label="Branch"
                value={watch('branchId') || ''}
                onChange={(v) => setValue('branchId', v, { shouldValidate: true })}
                options={[
                  { value: '', label: 'Select branch…' },
                  ...branches.map((b) => ({ value: b.id, label: b.name })),
                ]}
                onAddNew={() => router.push('/dashboard/branches')}
                addNewLabel="Add branch"
              />
              <div>
                <label className="block text-[10px] font-semibold text-on-surface/80 uppercase tracking-wider mb-1.5">
                  Date
                </label>
                <input
                  type="date"
                  {...register('shiftDate', { required: 'Pick a date' })}
                  className="w-full px-3 py-2 bg-surface-container/30 border border-outline-variant focus:border-primary rounded-xl text-xs text-on-surface outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-semibold text-on-surface/80 uppercase tracking-wider mb-1.5">
                    Start
                  </label>
                  <input
                    type="time"
                    {...register('startTime', { required: true })}
                    className="w-full px-3 py-2 bg-surface-container/30 border border-outline-variant rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-on-surface/80 uppercase tracking-wider mb-1.5">
                    End
                  </label>
                  <input
                    type="time"
                    {...register('endTime', { required: true })}
                    className="w-full px-3 py-2 bg-surface-container/30 border border-outline-variant rounded-xl text-xs"
                  />
                </div>
              </div>
              <input
                {...register('notes')}
                placeholder="Notes (optional)"
                className="w-full px-3 py-2 bg-surface-container/30 border border-outline-variant rounded-xl text-xs"
              />
              <div className="flex-1 min-h-[1rem]" />
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary hover:opacity-90 text-white py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 disabled:opacity-70 mt-auto"
              >
                {isSubmitting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <CalendarPlus className="w-3.5 h-3.5" />
                )}
                Assign shift
              </button>
            </form>
          </DashboardSectionCard>

          <DashboardSectionCard
            className="h-full overflow-hidden flex flex-col"
            title="Upcoming shifts"
            subtitle={`${shifts.length} scheduled`}
          >
            <div className="min-h-[280px] flex flex-col flex-1 -mx-5 md:-mx-6 -mb-5 md:-mb-6">
              {shifts.length > 0 ? (
                <div className="overflow-x-auto flex-1">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className={tableHeadClass}>
                        <th className={TH}>Staff</th>
                        <th className={TH}>Date</th>
                        <th className={TH}>Time</th>
                        <th className={`${TH} text-right`}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {shifts.map((s) => (
                        <tr key={s.id} className={tableRowClass}>
                          <td className={`${TD} font-semibold text-on-surface`}>{s.staffName}</td>
                          <td className={`${TD} text-on-surface-variant`}>
                            {new Date(s.shiftDate).toLocaleDateString()}
                          </td>
                          <td className={`${TD} text-on-surface-variant`}>
                            {s.startTime.slice(0, 5)}–{s.endTime.slice(0, 5)}
                          </td>
                          <td className={`${TD} text-right`}>
                            <button
                              type="button"
                              disabled={isPending}
                              onClick={() => onDelete(s.id)}
                              className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg border border-destructive/30 text-destructive disabled:opacity-60"
                            >
                              {deletingId === s.id ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <Trash2 className="w-3 h-3" />
                              )}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <EmptyTableState message="No upcoming shifts scheduled." />
              )}
            </div>
          </DashboardSectionCard>
        </div>
      </section>
    </div>
  );
}
