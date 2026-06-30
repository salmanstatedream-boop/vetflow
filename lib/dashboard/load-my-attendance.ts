import type { MyAttendance } from '@/components/dashboard/AttendanceWidgetClient';
import type { SupabaseClient } from '@supabase/supabase-js';

export const EMPTY_ATTENDANCE: MyAttendance = {
  checkedIn: false,
  checkedOut: false,
  status: null,
  checkInAt: null,
  checkOutAt: null,
};

export async function loadMyAttendanceForToday(
  supabase: SupabaseClient,
  organizationId: string,
  userId: string,
  workDate: string
): Promise<MyAttendance> {
  const { data: rec } = await supabase
    .from('attendance_records')
    .select('status, check_in_at, check_out_at')
    .eq('organization_id', organizationId)
    .eq('user_id', userId)
    .eq('work_date', workDate)
    .maybeSingle();

  if (!rec) return EMPTY_ATTENDANCE;

  return {
    checkedIn: Boolean(rec.check_in_at),
    checkedOut: Boolean(rec.check_out_at),
    status: rec.status,
    checkInAt: rec.check_in_at,
    checkOutAt: rec.check_out_at,
  };
}
