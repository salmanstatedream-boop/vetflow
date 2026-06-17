/** Single customer-facing concern line for treatment summary PDFs. */
export function resolvePrimaryConcern(reason: string, chiefComplaint: string): string {
  const r = reason.trim();
  const c = chiefComplaint.trim();
  if (!r && !c) return '';
  if (!c || c === r) return r || c;
  if (!r) return c;
  return c;
}
