'use client';

import type { ComponentType } from 'react';
import type { JourneyVisualKey } from '@/lib/home-data';
import AppointmentJourneyVisual from './AppointmentJourneyVisual';
import CheckInJourneyVisual from './CheckInJourneyVisual';
import AiAnalysisJourneyVisual from './AiAnalysisJourneyVisual';
import ConsultationJourneyVisual from './ConsultationJourneyVisual';
import TreatmentJourneyVisual from './TreatmentJourneyVisual';
import BillingJourneyVisual from './BillingJourneyVisual';
import FollowUpJourneyVisual from './FollowUpJourneyVisual';

const MAP: Record<JourneyVisualKey, ComponentType> = {
  appointment: AppointmentJourneyVisual,
  checkin: CheckInJourneyVisual,
  aiAnalysis: AiAnalysisJourneyVisual,
  consultation: ConsultationJourneyVisual,
  treatment: TreatmentJourneyVisual,
  billing: BillingJourneyVisual,
  followup: FollowUpJourneyVisual,
};

export default function JourneyDashboardVisual({ visual }: { visual: JourneyVisualKey }) {
  const Comp = MAP[visual];
  return <Comp />;
}
