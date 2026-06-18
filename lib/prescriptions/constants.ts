/** Stored in prescriptions.notes when the doctor marks no prescription for the visit. */
export const NO_PRESCRIPTION_MARKED_NOTES = 'No prescription needed for this visit.';

export function isNoPrescriptionMarked(
  notes: string | null | undefined,
  itemCount: number
): boolean {
  return itemCount === 0 && notes === NO_PRESCRIPTION_MARKED_NOTES;
}
