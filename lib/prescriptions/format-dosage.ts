/** Append unit when dosage is numeric-only. */
export function combineDosageWithUnit(dosage: string, unit: string): string {
  const raw = (dosage ?? '').trim();
  if (!raw || !unit) return raw;
  if (!/^\d+(\.\d+)?$/.test(raw)) return raw;
  return `${raw} ${unit}`;
}

const LIQUID_PATTERNS = /\b(syp|syrup|suspension|solution|drops|ml)\b/i;
const DROP_PATTERNS = /\bdrops?\b/i;

/** Append a sensible unit when dosage is numeric-only and medicine type implies it. */
export function formatPrescriptionDosage(
  dosage: string | null | undefined,
  medicineName: string | null | undefined
): string {
  const raw = (dosage ?? '').trim();
  if (!raw) return '—';
  if (!/^\d+(\.\d+)?$/.test(raw)) return raw;

  const name = (medicineName ?? '').toLowerCase();
  if (DROP_PATTERNS.test(name)) return `${raw} drops`;
  if (LIQUID_PATTERNS.test(name)) return `${raw} ml`;

  return raw;
}
