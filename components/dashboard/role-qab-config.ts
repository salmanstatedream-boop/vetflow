import type { LucideIcon } from 'lucide-react';
import {
  Users,
  UserCog,
  Layers,
  Calendar,
  Heart,
  Receipt,
  TrendingUp,
  Stethoscope,
  FileText,
  Share2,
  Video,
  MapPin,
  BarChart3,
  Bot,
  ClipboardList,
  BriefcaseMedical,
  FileCheck2,
  ShoppingBag,
  Store,
} from 'lucide-react';
import type { Capability } from '@/lib/auth/capabilities';
import type { Feature } from '@/lib/auth/features';
import type { UserSessionDetails } from '@/lib/services/auth';

export type QabLauncherType = 'modal' | 'page' | 'slideover';

export type QabGroup = 'clinical' | 'operations' | 'financial' | 'insights' | 'organization';

export type QabModalId =
  | 'role_creation'
  | 'staff_management'
  | 'inventory_control'
  | 'appointment'
  | 'patient_profile'
  | 'invoices'
  | 'ai_analytic_reports'
  | 'consultation_status'
  | 'prescriptions'
  | 'social_media'
  | 'live_camera'
  | 'multi_branch'
  | 'ai_assistant'
  | 'treatment_record'
  | 'next_appointment_checkin';

export interface QabItem {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
  launcher: QabLauncherType;
  href?: string;
  modalId?: QabModalId;
  capability?: Capability;
  feature?: Feature;
  optInFeature?: Feature;
  adminOnly?: boolean;
  group: QabGroup;
  priority?: number;
}

export const QAB_GROUP_LABELS: Record<QabGroup, string> = {
  clinical: 'Clinical',
  operations: 'Operations',
  financial: 'Financial',
  insights: 'Insights & AI',
  organization: 'Organization',
};

export const QAB_GROUP_ORDER: QabGroup[] = [
  'clinical',
  'operations',
  'financial',
  'insights',
  'organization',
];

const ADMIN_QABS: QabItem[] = [
  { id: 'role_creation', label: 'Role Creation', description: 'Roles & permissions', icon: UserCog, launcher: 'modal', modalId: 'role_creation', group: 'organization', priority: 1 },
  { id: 'staff', label: 'Staff Management', description: 'Invite & schedule team', icon: Users, launcher: 'modal', modalId: 'staff_management', capability: 'manage_staff', group: 'operations', priority: 3 },
  { id: 'inventory', label: 'Inventory Control', description: 'Stock alerts & add items', icon: Layers, launcher: 'modal', modalId: 'inventory_control', capability: 'manage_inventory', feature: 'inventory', group: 'operations', priority: 1 },
  { id: 'appointment', label: 'Appointment', description: 'Book & walk-ins', icon: Calendar, launcher: 'modal', modalId: 'appointment', capability: 'manage_appointments', feature: 'appointments', group: 'clinical', priority: 1 },
  { id: 'patient', label: 'Patient Profile', description: 'Search medical files', icon: Heart, launcher: 'modal', modalId: 'patient_profile', capability: 'manage_pets', group: 'clinical', priority: 2 },
  { id: 'invoices', label: 'Invoices', description: 'Billing & checkout', icon: Receipt, launcher: 'modal', modalId: 'invoices', capability: 'billing_checkout', feature: 'sales', group: 'financial', priority: 1 },
  { id: 'retail_sale', label: 'Retail Sale', description: 'Counter POS checkout', icon: ShoppingBag, launcher: 'page', href: '/dashboard/sales/new', capability: 'billing_checkout', feature: 'sales', group: 'operations', priority: 2 },
  { id: 'sales_monitor', label: 'Sales Monitor', description: 'Retail revenue deck', icon: Store, launcher: 'page', href: '/dashboard/sales', capability: 'billing_checkout', feature: 'sales', adminOnly: true, group: 'financial', priority: 2 },
  { id: 'ai_reports', label: 'AI Analytic Reports', description: 'Business insights', icon: TrendingUp, launcher: 'slideover', modalId: 'ai_analytic_reports', capability: 'view_reports', feature: 'reports', group: 'insights', priority: 1 },
  { id: 'consultations', label: 'Consultations', description: 'Live clinic status', icon: Stethoscope, launcher: 'modal', modalId: 'consultation_status', capability: 'view_consultation_status', group: 'clinical', priority: 3 },
  { id: 'prescriptions', label: 'Prescriptions', description: 'Treatment records', icon: FileText, launcher: 'page', href: '/dashboard/prescriptions', capability: 'manage_prescriptions', group: 'clinical', priority: 4 },
  { id: 'social', label: 'Social Media', description: 'Post & publish', icon: Share2, launcher: 'slideover', modalId: 'social_media', capability: 'manage_social', feature: 'social_automation', group: 'organization', priority: 3 },
  { id: 'camera', label: 'Live Camera Feed', description: 'Clinic cameras', icon: Video, launcher: 'modal', modalId: 'live_camera', capability: 'view_camera_feed', optInFeature: 'camera_feed', group: 'organization', priority: 4 },
  { id: 'branches', label: 'Multi Branch Control', description: 'Branch operations', icon: MapPin, launcher: 'modal', modalId: 'multi_branch', capability: 'manage_branches', feature: 'multi_branch', group: 'organization', priority: 2 },
  { id: 'benchmarking', label: 'Clinic Benchmarking', description: 'Compare performance', icon: BarChart3, launcher: 'page', href: '/dashboard/benchmarking', capability: 'view_reports', optInFeature: 'clinic_benchmarking', group: 'insights', priority: 2 },
  { id: 'ai_assistant', label: 'AI Assistant', description: 'Clinic chatbot', icon: Bot, launcher: 'slideover', modalId: 'ai_assistant', capability: 'use_ai_assistant', feature: 'ai_assistant', group: 'insights', priority: 3 },
];

const RECEPTION_QABS: QabItem[] = [
  { id: 'appointment', label: 'Appointment', description: 'Book & check-in', icon: Calendar, launcher: 'modal', modalId: 'appointment', capability: 'manage_appointments', feature: 'appointments', group: 'clinical', priority: 1 },
  { id: 'invoices', label: 'Invoices', description: 'Billing & checkout', icon: Receipt, launcher: 'modal', modalId: 'invoices', capability: 'billing_checkout', feature: 'sales', group: 'financial', priority: 1 },
  { id: 'retail_sale', label: 'Retail Sale', description: 'Counter POS checkout', icon: ShoppingBag, launcher: 'page', href: '/dashboard/sales/new', capability: 'billing_checkout', feature: 'sales', group: 'operations', priority: 1 },
  { id: 'consultations', label: 'Consultations', description: 'Live queue status', icon: Stethoscope, launcher: 'modal', modalId: 'consultation_status', capability: 'view_consultation_status', group: 'clinical', priority: 2 },
  { id: 'inventory', label: 'Inventory Control', description: 'Stock updates', icon: Layers, launcher: 'modal', modalId: 'inventory_control', capability: 'manage_inventory', feature: 'inventory', group: 'operations', priority: 2 },
  { id: 'ai_assistant', label: 'AI Assistant', description: 'Front desk help', icon: Bot, launcher: 'slideover', modalId: 'ai_assistant', capability: 'use_ai_assistant', feature: 'ai_assistant', group: 'insights', priority: 1 },
  { id: 'camera', label: 'Live Camera Feed', description: 'View clinic cameras', icon: Video, launcher: 'modal', modalId: 'live_camera', capability: 'view_camera_feed', optInFeature: 'camera_feed', group: 'organization', priority: 1 },
];

const DOCTOR_QABS: QabItem[] = [
  { id: 'queue', label: 'Queue', description: 'Today\'s patient queue', icon: ClipboardList, launcher: 'page', href: '/dashboard/doctors', capability: 'clinical_queue', group: 'clinical', priority: 1 },
  { id: 'appointments', label: 'Appointments', description: 'Schedule & follow-ups', icon: Calendar, launcher: 'page', href: '/dashboard/appointments', capability: 'manage_appointments', feature: 'appointments', group: 'clinical', priority: 2 },
  { id: 'prescriptions', label: 'Prescriptions', description: 'Treatment records', icon: FileText, launcher: 'page', href: '/dashboard/prescriptions', capability: 'manage_prescriptions', group: 'clinical', priority: 3 },
  { id: 'patient', label: 'Pet Patient Profile', description: 'Search patient history', icon: Heart, launcher: 'modal', modalId: 'patient_profile', capability: 'view_patient_history', group: 'clinical', priority: 4 },
  { id: 'treatment', label: 'Treatment Record', description: 'Today\'s treatments', icon: FileCheck2, launcher: 'modal', modalId: 'treatment_record', capability: 'clinical_queue', group: 'clinical', priority: 5 },
  { id: 'consultation', label: 'Consultation', description: 'Open clinical queue', icon: BriefcaseMedical, launcher: 'page', href: '/dashboard/doctors', capability: 'clinical_queue', group: 'clinical', priority: 6 },
];

export function getQabsForRole(role: UserSessionDetails['role']): QabItem[] {
  switch (role) {
    case 'clinic_admin':
      return ADMIN_QABS;
    case 'receptionist':
      return RECEPTION_QABS;
    case 'doctor':
      return DOCTOR_QABS;
    default:
      return [];
  }
}

export function filterQabs(
  items: QabItem[],
  opts: {
    role: UserSessionDetails['role'];
    capabilities: string[];
    features: Feature[];
    featuresJson?: Record<string, unknown> | null;
  }
): QabItem[] {
  const { capabilities, features, featuresJson, role } = opts;
  return items.filter((item) => {
    if (item.adminOnly && role !== 'clinic_admin') return false;
    if (item.capability && !capabilities.includes(item.capability)) return false;
    if (item.feature && !features.includes(item.feature)) return false;
    if (item.optInFeature && featuresJson?.[item.optInFeature] !== true) return false;
    return true;
  });
}

export function groupQabItems(
  items: QabItem[]
): { group: QabGroup; label: string; items: QabItem[] }[] {
  const byGroup = new Map<QabGroup, QabItem[]>();

  for (const item of items) {
    const list = byGroup.get(item.group) ?? [];
    list.push(item);
    byGroup.set(item.group, list);
  }

  return QAB_GROUP_ORDER.filter((group) => byGroup.has(group)).map((group) => ({
    group,
    label: QAB_GROUP_LABELS[group],
    items: (byGroup.get(group) ?? []).sort(
      (a, b) => (a.priority ?? 99) - (b.priority ?? 99)
    ),
  }));
}
