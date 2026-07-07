'use client';

import type { SolutionVisualKey } from '@/lib/home-data';
import AppointmentsVisual from './AppointmentsVisual';
import BillingVisual from './BillingVisual';
import DischargeVisual from './DischargeVisual';
import FollowUpVisual from './FollowUpVisual';
import InventoryVisual from './InventoryVisual';
import LaboratoryVisual from './LaboratoryVisual';
import PatientRecordsVisual from './PatientRecordsVisual';

const VISUALS: Record<SolutionVisualKey, React.ComponentType> = {
  appointments: AppointmentsVisual,
  records: PatientRecordsVisual,
  labs: LaboratoryVisual,
  inventory: InventoryVisual,
  billing: BillingVisual,
  discharge: DischargeVisual,
  followup: FollowUpVisual,
};

export default function SolutionDashboardVisual({ visual }: { visual: SolutionVisualKey }) {
  const Component = VISUALS[visual];
  return <Component />;
}
