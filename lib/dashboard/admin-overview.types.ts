import type { LiveConsultRow } from '@/components/dashboard/LiveOperationsPanel';
import type { MedicalActivityRow } from '@/components/dashboard/MedicalRecordActivityPanel';
import type { StaffAttendanceOverviewRow } from '@/components/dashboard/StaffAttendanceOverviewPanel';

export type AdminScheduleItem = {
  id: string;
  type: 'appointment' | 'visit';
  time: string;
  petName: string;
  species: string | null;
  customerName: string;
  reason: string;
  status: string;
  doctorName?: string;
  href: string;
};

export type AdminActionItem = {
  id: string;
  label: string;
  count: number;
  href: string;
  variant: 'warning' | 'danger' | 'info' | 'purple';
};

export type AdminListItem = {
  id: string;
  petName: string;
  customerName: string;
  date: string;
  reason: string;
};

export type AdminLowStockRow = {
  id: string;
  name: string;
  category: string;
  stock: number;
  reorderLevel: number;
};

export type AdminExpiringRow = {
  id: string;
  productName: string;
  expiryDate: string;
  quantity: number;
};

export type ChartPoint = { name: string; value: number };

export type AdminAssignedConsultation = {
  id: string;
  petName: string;
  customerName: string;
  doctorName: string;
  status: string;
  href: string;
};

export type AdminOverviewData = {
  currency: string;
  today: string;
  kpis: {
    todayAppointments: number;
    todayRevenue: number;
    outstandingReceivables: number;
    inClinicNow: number;
    inventoryAlerts: number;
    newClientsMtd: number;
    vaccinationsToday: number;
  };
  kpiTrends: Record<keyof AdminOverviewData['kpis'], number | null>;
  sparklines: {
    appointments: number[];
    revenue: number[];
  };
  todaySchedule: AdminScheduleItem[];
  assignedConsultations: AdminAssignedConsultation[];
  actionCenter: AdminActionItem[];
  revenueTrend7d: ChartPoint[];
  utilization: { booked: number; total: number };
  visitReasons: ChartPoint[];
  speciesBreakdown: ChartPoint[];
  lowStockItems: AdminLowStockRow[];
  expiringSoon: AdminExpiringRow[];
  followUpsDue: AdminListItem[];
  vaccinationsDue: AdminListItem[];
  missedAppointments: AdminListItem[];
  aiInsights: string[];
  notificationCount: number;
};

export type AdminOverviewPanels = {
  liveActiveConsults: LiveConsultRow[];
  liveCheckoutQueue: LiveConsultRow[];
  showConsultTimer: boolean;
  medicalActivities: MedicalActivityRow[];
  staffAttendanceRows: StaffAttendanceOverviewRow[];
};

export type AdminOverviewBundle = AdminOverviewData & AdminOverviewPanels;
