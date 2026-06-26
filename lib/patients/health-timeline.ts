import type { PatientMedicalProfileData, PatientVisitRow } from '@/lib/types/patient-medical';

export type HealthEventType =
  | 'visit'
  | 'vaccination'
  | 'deworming'
  | 'grooming'
  | 'surgery'
  | 'treatment';

export type HealthWeightPoint = {
  date: string;
  weightKg: number;
  visitId?: string;
};

export type HealthMetricPoint = {
  date: string;
  visitId: string;
  weightKg: number | null;
  bodyConditionScore: number | null;
  temperatureC: number | null;
  heartRateBpm: number | null;
  respiratoryRate: number | null;
  ageYears: number | null;
};

export type HealthEventMarker = {
  date: string;
  type: HealthEventType;
  label: string;
  visitId: string;
};

export type HealthTimelineData = {
  weightPoints: HealthWeightPoint[];
  metricPoints: HealthMetricPoint[];
  events: HealthEventMarker[];
};

function matchesKeyword(text: string, keywords: string[]): boolean {
  const lower = text.toLowerCase();
  return keywords.some((k) => lower.includes(k));
}

/** Pet age in fractional years at a visit date. */
export function computeAgeYearsAtDate(
  dateOfBirth: string | null | undefined,
  atIso: string
): number | null {
  if (!dateOfBirth) return null;
  const dob = new Date(`${dateOfBirth.slice(0, 10)}T12:00:00`);
  const at = new Date(atIso);
  if (Number.isNaN(dob.getTime()) || Number.isNaN(at.getTime())) return null;
  const ms = at.getTime() - dob.getTime();
  if (ms < 0) return null;
  return Math.round((ms / (365.25 * 24 * 60 * 60 * 1000)) * 10) / 10;
}

function classifyVisitEvents(visit: PatientVisitRow): HealthEventMarker[] {
  const date = visit.checked_in_at || visit.completed_at;
  if (!date) return [];

  const markers: HealthEventMarker[] = [];
  const note = visit.notes;

  if (visit.visit_purpose === 'vaccination') {
    markers.push({ date, type: 'vaccination', label: 'Vaccination', visitId: visit.id });
    return markers;
  }
  if (visit.visit_purpose === 'deworming') {
    markers.push({ date, type: 'deworming', label: 'Deworming', visitId: visit.id });
    return markers;
  }
  if (visit.visit_purpose === 'grooming') {
    markers.push({ date, type: 'grooming', label: 'Grooming', visitId: visit.id });
    return markers;
  }

  const textBlob = [
    visit.reason,
    note?.treatment_plan,
    note?.diagnosis,
    note?.chief_complaint,
    ...visit.services.map((s) => s.name),
  ]
    .filter(Boolean)
    .join(' ');

  if (note?.visit_type === 'surgery') {
    markers.push({
      date,
      type: 'surgery',
      label: visit.reason || 'Surgery',
      visitId: visit.id,
    });
  }

  const hasVaccineDoc = visit.documents.some((d) => d.category === 'vaccine');
  if (
    hasVaccineDoc ||
    matchesKeyword(textBlob, ['vaccin', 'booster', 'rabies', 'dhpp', 'fvrcp'])
  ) {
    markers.push({
      date,
      type: 'vaccination',
      label: 'Vaccination',
      visitId: visit.id,
    });
  }

  if (matchesKeyword(textBlob, ['deworm', 'worm', 'anthelmintic', 'panacur', 'drontal'])) {
    markers.push({
      date,
      type: 'deworming',
      label: 'Deworming',
      visitId: visit.id,
    });
  }

  if (visit.prescriptions?.is_finalized && visit.prescriptions.items.length > 0) {
    markers.push({
      date,
      type: 'treatment',
      label: `Treatment (${visit.prescriptions.items.length} Rx)`,
      visitId: visit.id,
    });
  }

  if (markers.length === 0) {
    markers.push({
      date,
      type: 'visit',
      label: visit.reason || 'Visit',
      visitId: visit.id,
    });
  }

  return markers;
}

function numOrNull(value: unknown): number | null {
  if (value == null || value === '') return null;
  const n = Number(value);
  return Number.isNaN(n) ? null : n;
}

export function buildHealthTimeline(profile: PatientMedicalProfileData): HealthTimelineData {
  const weightPoints: HealthWeightPoint[] = [];
  const metricPoints: HealthMetricPoint[] = [];
  const events: HealthEventMarker[] = [];

  const sortedVisits = [...profile.visits].sort((a, b) => {
    const da = a.checked_in_at || a.completed_at || '';
    const db = b.checked_in_at || b.completed_at || '';
    return da.localeCompare(db);
  });

  for (const visit of sortedVisits) {
    events.push(...classifyVisitEvents(visit));
    const date = visit.checked_in_at || visit.completed_at;
    if (!date) continue;

    const note = visit.notes;
    const weight = numOrNull(note?.weight_kg);
    const bcs = numOrNull(note?.body_condition_score);
    const temp = numOrNull(note?.temperature_c);
    const hr = numOrNull(note?.heart_rate_bpm);
    const rr = numOrNull(note?.respiratory_rate);

    const hasMetric =
      (weight != null && weight > 0) ||
      (bcs != null && bcs >= 1) ||
      temp != null ||
      hr != null ||
      rr != null;

    if (hasMetric) {
      metricPoints.push({
        date,
        visitId: visit.id,
        weightKg: weight != null && weight > 0 ? weight : null,
        bodyConditionScore: bcs != null && bcs >= 1 && bcs <= 9 ? bcs : null,
        temperatureC: temp,
        heartRateBpm: hr,
        respiratoryRate: rr,
        ageYears: computeAgeYearsAtDate(profile.dateOfBirth, date),
      });
    }

    if (weight != null && weight > 0) {
      weightPoints.push({
        date,
        weightKg: weight,
        visitId: visit.id,
      });
    }
  }

  if (profile.weightKg != null && profile.weightKg > 0) {
    const earliest =
      weightPoints[0]?.date ||
      sortedVisits[0]?.checked_in_at ||
      new Date().toISOString().slice(0, 10);
    const hasProfileWeight = weightPoints.some(
      (p) => Math.abs(p.weightKg - profile.weightKg!) < 0.01
    );
    if (!hasProfileWeight) {
      weightPoints.unshift({
        date: earliest,
        weightKg: profile.weightKg,
      });
      const dateKey = earliest.slice(0, 10);
      const existing = metricPoints.find((m) => m.date.slice(0, 10) === dateKey);
      if (existing) {
        existing.weightKg = profile.weightKg;
      } else {
        metricPoints.unshift({
          date: earliest,
          visitId: 'profile',
          weightKg: profile.weightKg,
          bodyConditionScore:
            profile.bodyConditionScore != null ? profile.bodyConditionScore : null,
          temperatureC: null,
          heartRateBpm: null,
          respiratoryRate: null,
          ageYears: computeAgeYearsAtDate(profile.dateOfBirth, earliest),
        });
      }
    }
  }

  if (profile.bodyConditionScore != null && profile.bodyConditionScore >= 1) {
    const earliest =
      metricPoints[0]?.date ||
      sortedVisits[0]?.checked_in_at ||
      new Date().toISOString();
    const dateKey = earliest.slice(0, 10);
    const row = metricPoints.find((m) => m.date.slice(0, 10) === dateKey);
    if (row && row.bodyConditionScore == null) {
      row.bodyConditionScore = profile.bodyConditionScore;
    }
  }

  return {
    weightPoints: weightPoints.sort((a, b) => a.date.localeCompare(b.date)),
    metricPoints: metricPoints.sort((a, b) => a.date.localeCompare(b.date)),
    events: events.sort((a, b) => a.date.localeCompare(b.date)),
  };
}

export const HEALTH_EVENT_COLORS: Record<HealthEventType, string> = {
  visit: '#74f5ff',
  vaccination: '#22c55e',
  deworming: '#a78bfa',
  grooming: '#c084fc',
  surgery: '#f97316',
  treatment: '#3b82f6',
};

export const HEALTH_EVENT_LABELS: Record<HealthEventType, string> = {
  visit: 'Visit',
  vaccination: 'Vaccination',
  deworming: 'Deworming',
  grooming: 'Grooming',
  surgery: 'Surgery',
  treatment: 'Treatment',
};

export type HealthChartMetric =
  | 'weight'
  | 'bodyCondition'
  | 'temperature'
  | 'heartRate'
  | 'respiration'
  | 'ageWeight';

export const HEALTH_CHART_METRICS: {
  id: HealthChartMetric;
  label: string;
  unit: string;
  color: string;
  field: keyof Pick<
    HealthMetricPoint,
    'weightKg' | 'bodyConditionScore' | 'temperatureC' | 'heartRateBpm' | 'respiratoryRate'
  >;
}[] = [
  { id: 'weight', label: 'Weight', unit: 'kg', color: '#74f5ff', field: 'weightKg' },
  { id: 'bodyCondition', label: 'Body condition', unit: '/9', color: '#a78bfa', field: 'bodyConditionScore' },
  { id: 'temperature', label: 'Temperature', unit: '°C', color: '#f97316', field: 'temperatureC' },
  { id: 'heartRate', label: 'Heart rate', unit: 'bpm', color: '#ef4444', field: 'heartRateBpm' },
  { id: 'respiration', label: 'Respiration', unit: 'rpm', color: '#22c55e', field: 'respiratoryRate' },
];
