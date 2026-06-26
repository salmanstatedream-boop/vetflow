import {
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  type LucideIcon,
} from 'lucide-react';

export type AttendanceStatusKey =
  | 'present'
  | 'on_shift'
  | 'late'
  | 'absent'
  | 'off'
  | 'not_scheduled'
  | 'pending'
  | 'on_leave';

const STATUS_STYLES: Record<AttendanceStatusKey, string> = {
  present: 'bg-emerald-500/10 text-emerald-600',
  on_shift: 'bg-emerald-500/10 text-emerald-600',
  late: 'bg-amber-500/10 text-amber-600',
  absent: 'bg-destructive/10 text-destructive',
  off: 'bg-surface-container text-on-surface-variant',
  not_scheduled: 'bg-surface-container/60 text-on-surface-variant/70',
  pending: 'bg-primary/5 text-primary',
  on_leave: 'bg-surface-container text-on-surface-variant',
};

const STATUS_LABELS: Record<AttendanceStatusKey, string> = {
  present: 'Present',
  on_shift: 'On shift',
  late: 'Late',
  absent: 'Absent',
  off: 'Off day',
  not_scheduled: 'Not scheduled',
  pending: 'Scheduled',
  on_leave: 'On leave',
};

const STATUS_ICONS: Record<AttendanceStatusKey, LucideIcon> = {
  present: CheckCircle,
  on_shift: CheckCircle,
  late: AlertCircle,
  absent: XCircle,
  off: Clock,
  not_scheduled: Clock,
  pending: Clock,
  on_leave: Clock,
};

export function normalizeAttendanceStatus(
  status: string | null | undefined
): AttendanceStatusKey {
  if (!status) return 'not_scheduled';
  const key = status.toLowerCase().replace(/\s+/g, '_') as AttendanceStatusKey;
  if (key in STATUS_LABELS) return key;
  return 'not_scheduled';
}

export function formatAttendanceStatusLabel(status: string | null | undefined): string {
  return STATUS_LABELS[normalizeAttendanceStatus(status)];
}

interface AttendanceStatusBadgeProps {
  status: AttendanceStatusKey | string | null | undefined;
  className?: string;
}

export default function AttendanceStatusBadge({ status, className = '' }: AttendanceStatusBadgeProps) {
  const key = typeof status === 'string' && status in STATUS_LABELS
    ? (status as AttendanceStatusKey)
    : normalizeAttendanceStatus(status);
  const Icon = STATUS_ICONS[key] || Clock;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
        STATUS_STYLES[key] || STATUS_STYLES.not_scheduled
      } ${className}`}
    >
      <Icon className="w-3 h-3" />
      {STATUS_LABELS[key] || formatAttendanceStatusLabel(status)}
    </span>
  );
}
