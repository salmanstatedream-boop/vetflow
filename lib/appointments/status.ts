export const UPCOMING_APPOINTMENT_STATUSES = [
  'requested',
  'confirmed',
  'rescheduled',
  'checked_in',
] as const;

export const TERMINAL_APPOINTMENT_STATUSES = [
  'completed',
  'cancelled',
  'no_show',
] as const;

export const CHECK_IN_ELIGIBLE_STATUSES = ['confirmed', 'rescheduled'] as const;

export type UpcomingAppointmentStatus = (typeof UPCOMING_APPOINTMENT_STATUSES)[number];
export type TerminalAppointmentStatus = (typeof TERMINAL_APPOINTMENT_STATUSES)[number];

export function isUpcomingAppointment(status: string): boolean {
  return (UPCOMING_APPOINTMENT_STATUSES as readonly string[]).includes(status);
}

export function isTerminalAppointment(status: string): boolean {
  return (TERMINAL_APPOINTMENT_STATUSES as readonly string[]).includes(status);
}

export function isEmergencyAppointmentActive(
  isEmergency: boolean | undefined,
  status: string
): boolean {
  return Boolean(isEmergency) && !isTerminalAppointment(status);
}

export function isFollowUpAppointment(
  followUpOfVisitId: string | null | undefined
): boolean {
  return Boolean(followUpOfVisitId);
}

/** Local calendar date YYYY-MM-DD */
export function clinicLocalDateString(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Future follow-ups stay in the Follow-up tab only.
 * On their preferred_date (today), they also appear under Upcoming.
 */
export function isFollowUpVisibleInUpcoming(
  appt: { follow_up_of_visit_id?: string | null; preferred_date: string; status: string },
  today = clinicLocalDateString()
): boolean {
  if (!isUpcomingAppointment(appt.status)) return false;
  if (!isFollowUpAppointment(appt.follow_up_of_visit_id)) return true;
  return appt.preferred_date <= today;
}

export function isOpenFollowUpAppointment(
  appt: { follow_up_of_visit_id?: string | null; status: string }
): boolean {
  return (
    isFollowUpAppointment(appt.follow_up_of_visit_id) &&
    !isTerminalAppointment(appt.status)
  );
}

