import type { PatientMedicalProfileData, PatientVisitRow } from '@/lib/types/patient-medical';

export type HealthEventType =
  | 'visit'
  | 'vaccination'
  | 'deworming'
  | 'surgery'
  | 'treatment';

export type HealthWeightPoint = {
  date: string;
  weightKg: number;
  visitId?: string;
};

export type HealthEventMarker = {
  date: string;
  type: HealthEventType;
  label: string;
  visitId: string;
};

export type HealthTimelineData = {
  weightPoints: HealthWeightPoint[];
  events: HealthEventMarker[];
};

function matchesKeyword(text: string, keywords: string[]): boolean {
  const lower = text.toLowerCase();
  return keywords.some((k) => lower.includes(k));
}

function classifyVisitEvents(visit: PatientVisitRow): HealthEventMarker[] {
  const date = visit.checked_in_at || visit.completed_at;
  if (!date) return [];

  const markers: HealthEventMarker[] = [];
  const note = visit.notes;
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

export function buildHealthTimeline(profile: PatientMedicalProfileData): HealthTimelineData {
  const weightPoints: HealthWeightPoint[] = [];
  const events: HealthEventMarker[] = [];

  const sortedVisits = [...profile.visits].sort((a, b) => {
    const da = a.checked_in_at || a.completed_at || '';
    const db = b.checked_in_at || b.completed_at || '';
    return da.localeCompare(db);
  });

  for (const visit of sortedVisits) {
    events.push(...classifyVisitEvents(visit));
    const date = visit.checked_in_at || visit.completed_at;
    const weight = visit.notes?.weight_kg;
    if (date && weight != null && Number(weight) > 0) {
      weightPoints.push({
        date,
        weightKg: Number(weight),
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
    }
  }

  return {
    weightPoints: weightPoints.sort((a, b) => a.date.localeCompare(b.date)),
    events: events.sort((a, b) => a.date.localeCompare(b.date)),
  };
}

export const HEALTH_EVENT_COLORS: Record<HealthEventType, string> = {
  visit: '#74f5ff',
  vaccination: '#22c55e',
  deworming: '#a78bfa',
  surgery: '#f97316',
  treatment: '#3b82f6',
};

export const HEALTH_EVENT_LABELS: Record<HealthEventType, string> = {
  visit: 'Visit',
  vaccination: 'Vaccination',
  deworming: 'Deworming',
  surgery: 'Surgery',
  treatment: 'Treatment',
};
