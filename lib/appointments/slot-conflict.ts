import type { SupabaseClient } from '@supabase/supabase-js';
import { UPCOMING_APPOINTMENT_STATUSES } from '@/lib/appointments/status';
import { formatAppointmentTime, parseAppointmentTimeToMinutes } from '@/lib/utils/time-parse';

export const DEFAULT_APPOINTMENT_DURATION_MINUTES = 30;

export interface TimeRangeMinutes {
  startMin: number;
  endMin: number;
}

export interface DoctorSlotConflict {
  id: string;
  patientName: string;
  preferredTime: string;
  durationMinutes: number;
  status: string;
}

export interface DoctorSlotCheckParams {
  organizationId: string;
  branchId: string;
  doctorId: string;
  preferredDate: string;
  preferredTime: string;
  durationMinutes?: number;
  excludeAppointmentId?: string;
}

type AppointmentRow = {
  id: string;
  patient_name: string | null;
  preferred_time: string;
  duration_minutes: number | null;
  status: string;
};

export function appointmentTimeRange(
  preferredTime: string,
  durationMinutes: number = DEFAULT_APPOINTMENT_DURATION_MINUTES
): TimeRangeMinutes | null {
  const startMin = parseAppointmentTimeToMinutes(preferredTime);
  if (startMin == null) return null;
  const duration = Math.max(durationMinutes, 1);
  return { startMin, endMin: startMin + duration };
}

export function rangesOverlap(a: TimeRangeMinutes, b: TimeRangeMinutes): boolean {
  return a.startMin < b.endMin && b.startMin < a.endMin;
}

function formatTimeRange(preferredTime: string, durationMinutes: number): string {
  const range = appointmentTimeRange(preferredTime, durationMinutes);
  if (!range) return formatAppointmentTime(preferredTime);
  const endH = Math.floor(range.endMin / 60);
  const endM = range.endMin % 60;
  const endLabel = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
  return `${formatAppointmentTime(preferredTime)}–${endLabel}`;
}

export async function findDoctorSlotConflict(
  supabase: SupabaseClient,
  params: DoctorSlotCheckParams
): Promise<DoctorSlotConflict | null> {
  const {
    organizationId,
    branchId,
    doctorId,
    preferredDate,
    preferredTime,
    durationMinutes = DEFAULT_APPOINTMENT_DURATION_MINUTES,
    excludeAppointmentId,
  } = params;

  const newRange = appointmentTimeRange(preferredTime, durationMinutes);
  if (!newRange) return null;

  const { data, error } = await supabase
    .from('appointments')
    .select('id, patient_name, preferred_time, duration_minutes, status')
    .eq('organization_id', organizationId)
    .eq('branch_id', branchId)
    .eq('doctor_id', doctorId)
    .eq('preferred_date', preferredDate)
    .in('status', [...UPCOMING_APPOINTMENT_STATUSES]);

  if (error) {
    throw new Error(error.message || 'Failed to check appointment availability.');
  }

  for (const row of (data ?? []) as AppointmentRow[]) {
    if (excludeAppointmentId && row.id === excludeAppointmentId) continue;

    const existingDuration = row.duration_minutes ?? DEFAULT_APPOINTMENT_DURATION_MINUTES;
    const existingRange = appointmentTimeRange(row.preferred_time, existingDuration);
    if (!existingRange) continue;

    if (rangesOverlap(newRange, existingRange)) {
      return {
        id: row.id,
        patientName: row.patient_name?.trim() || 'Unknown patient',
        preferredTime: row.preferred_time,
        durationMinutes: existingDuration,
        status: row.status,
      };
    }
  }

  return null;
}

export async function assertDoctorSlotAvailable(
  supabase: SupabaseClient,
  params: DoctorSlotCheckParams & { doctorLabel?: string }
): Promise<void> {
  const conflict = await findDoctorSlotConflict(supabase, params);
  if (!conflict) return;

  const doctorLabel = params.doctorLabel?.trim() || 'This doctor';
  const slotLabel = formatTimeRange(conflict.preferredTime, conflict.durationMinutes);

  throw new Error(
    `${doctorLabel} already has an appointment at this time (${conflict.patientName}, ${slotLabel}).`
  );
}
