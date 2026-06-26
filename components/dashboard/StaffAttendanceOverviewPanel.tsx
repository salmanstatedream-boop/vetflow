import { tableHeadClass, tableRowClass } from '@/lib/ui/dashboard-classes';
import AttendanceStatusBadge from '@/components/dashboard/AttendanceStatusBadge';

export type StaffAttendanceOverviewRow = {
  userId: string;
  staffName: string;
  role: string;
  checkInAt: string | null;
  checkOutAt: string | null;
  rosterStatus: 'present' | 'late' | 'absent' | 'off' | 'not_scheduled' | 'pending' | 'on_shift';
};

function fmtTime(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

interface StaffAttendanceOverviewPanelProps {
  rows: StaffAttendanceOverviewRow[];
  attendanceDate: string;
}

export default function StaffAttendanceOverviewPanel({
  rows,
  attendanceDate,
}: StaffAttendanceOverviewPanelProps) {
  const onSite = rows.filter(
    (r) => r.rosterStatus === 'present' || r.rosterStatus === 'late' || r.rosterStatus === 'on_shift'
  ).length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-on-surface uppercase tracking-wider">
          Staff attendance · today
        </h3>
        <span className="text-[10px] text-on-surface-variant">
          {onSite}/{rows.length} on site · {new Date(attendanceDate).toLocaleDateString()}
        </span>
      </div>
      <div className="glass-panel rounded-2xl border border-outline-variant/40 overflow-hidden shadow-premium">
        {rows.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className={tableHeadClass}>
                  <th className="px-4 py-3">Staff</th>
                  <th className="px-4 py-3">Check in</th>
                  <th className="px-4 py-3">Check out</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((a) => (
                  <tr key={a.userId} className={tableRowClass}>
                    <td className="px-4 py-3">
                      <span className="font-semibold text-on-surface block">{a.staffName}</span>
                      <span className="text-[10px] text-on-surface-variant capitalize">
                        {a.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-on-surface-variant">{fmtTime(a.checkInAt)}</td>
                    <td className="px-4 py-3 text-on-surface-variant">{fmtTime(a.checkOutAt)}</td>
                    <td className="px-4 py-3">
                      <AttendanceStatusBadge status={a.rosterStatus} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-on-surface-variant text-center py-10">No staff to show.</p>
        )}
      </div>
    </div>
  );
}
