/** Approximate date of birth from age at registration (years + optional months). */
export function approximateDateOfBirthFromAge(years: number, months = 0): string {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setFullYear(d.getFullYear() - years);
  d.setMonth(d.getMonth() - months);
  return d.toISOString().slice(0, 10);
}

export function resolvePetDateOfBirthFromAgeInput(
  ageYears: number | undefined,
  ageMonths: number | undefined
): string | null {
  const years = ageYears ?? 0;
  const months = ageMonths ?? 0;
  if (years <= 0 && months <= 0) return null;
  return approximateDateOfBirthFromAge(years, months);
}

export function formatAgeInputLabel(years: number | null | undefined, months: number | null | undefined): string {
  const y = years ?? 0;
  const m = months ?? 0;
  if (y <= 0 && m <= 0) return '';
  if (m <= 0) return `${y} yr${y === 1 ? '' : 's'}`;
  if (y <= 0) return `${m} mo`;
  return `${y} yr${y === 1 ? '' : 's'}, ${m} mo`;
}
