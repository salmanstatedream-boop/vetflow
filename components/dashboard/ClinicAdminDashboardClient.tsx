'use client';

import Link from 'next/link';
import {
  Calendar,
  DollarSign,
  Wallet,
  HeartPulse,
  AlertTriangle,
  Users,
  Plus,
  Syringe,
} from 'lucide-react';
import { useVisibilityPolling } from '@/lib/hooks/useVisibilityPolling';
import { formatMoney } from '@/lib/utils/currency';
import { DASHBOARD_DENSITY, DASHBOARD_GRID, KPI_ACCENTS } from '@/lib/ui/dashboard-tokens';
import DashboardKpiStatCard from '@/components/dashboard/premium/DashboardKpiStatCard';
import DashboardSectionCard from '@/components/dashboard/premium/DashboardSectionCard';
import DashboardListRow from '@/components/dashboard/premium/DashboardListRow';
import DashboardMiniTable, { stockStatusBadge } from '@/components/dashboard/premium/DashboardMiniTable';
import DashboardActionCenterList from '@/components/dashboard/premium/DashboardActionCenterList';
import DashboardAiInsightList from '@/components/dashboard/premium/DashboardAiInsightList';
import DashboardRankedBarList from '@/components/dashboard/premium/DashboardRankedBarList';
import DashboardCollapsibleSection from '@/components/dashboard/premium/DashboardCollapsibleSection';
import {
  RevenueTrendChart,
  UtilizationDonut,
  SpeciesDonut,
} from '@/components/dashboard/premium/DashboardCharts';
import LiveOperationsPanel from '@/components/dashboard/LiveOperationsPanel';
import MedicalRecordActivityPanel from '@/components/dashboard/MedicalRecordActivityPanel';
import StaffAttendanceOverviewPanel from '@/components/dashboard/StaffAttendanceOverviewPanel';
import DashboardQabShell from '@/components/dashboard/DashboardQabShell';
import type { AdminOverviewBundle } from '@/lib/dashboard/admin-overview.types';
import type { UserSessionDetails } from '@/lib/services/auth';
import type { Feature } from '@/lib/auth/features';
import { cn } from '@/lib/utils';

interface ClinicAdminDashboardClientProps extends AdminOverviewBundle {
  role: UserSessionDetails['role'];
  capabilities: string[];
  features: Feature[];
  featuresJson?: Record<string, unknown> | null;
  doctors: { id: string; firstName: string; lastName: string }[];
  activeBranchId: string;
  organizationId: string;
  clinicName: string;
  branches: { id: string; name: string }[];
  categories: { id: string; name: string }[];
}

export default function ClinicAdminDashboardClient({
  currency,
  kpis,
  kpiTrends,
  sparklines,
  todaySchedule,
  actionCenter,
  revenueTrend7d,
  utilization,
  visitReasons,
  speciesBreakdown,
  lowStockItems,
  expiringSoon,
  followUpsDue,
  vaccinationsDue,
  missedAppointments,
  aiInsights,
  liveActiveConsults,
  liveCheckoutQueue,
  showConsultTimer,
  medicalActivities,
  staffAttendanceRows,
  role,
  capabilities,
  features,
  featuresJson,
  doctors,
  activeBranchId,
  organizationId,
  clinicName,
  branches,
  categories,
}: ClinicAdminDashboardClientProps) {
  useVisibilityPolling(30_000);

  const scheduleItems = todaySchedule.slice(0, 8);

  return (
    <div className={DASHBOARD_DENSITY.pageGap}>
      {/* Row A — KPIs */}
      <div className={cn('grid grid-cols-2 md:grid-cols-3 xl:grid-cols-7', DASHBOARD_DENSITY.gridGap)}>
        <DashboardKpiStatCard
          density="compact"
          label="Today's Appointments"
          value={kpis.todayAppointments}
          icon={Calendar}
          accentClass={KPI_ACCENTS.appointments.bg}
          iconTextClass={KPI_ACCENTS.appointments.text}
          sparklineStroke={KPI_ACCENTS.appointments.stroke}
          sparkline={sparklines.appointments}
          deltaPercent={kpiTrends.todayAppointments}
          deltaLabel="vs yesterday"
          href="/dashboard/appointments"
        />
        <DashboardKpiStatCard
          density="compact"
          label="Today's Revenue"
          value={formatMoney(kpis.todayRevenue, currency)}
          icon={DollarSign}
          accentClass={KPI_ACCENTS.revenue.bg}
          iconTextClass={KPI_ACCENTS.revenue.text}
          sparklineStroke={KPI_ACCENTS.revenue.stroke}
          sparkline={sparklines.revenue}
          deltaPercent={kpiTrends.todayRevenue}
          deltaLabel="vs yesterday"
          href="/dashboard/revenue"
        />
        <DashboardKpiStatCard
          density="compact"
          label="Outstanding Receivables"
          value={formatMoney(kpis.outstandingReceivables, currency)}
          icon={Wallet}
          accentClass={KPI_ACCENTS.receivables.bg}
          iconTextClass={KPI_ACCENTS.receivables.text}
          href="/dashboard/invoices?status=unpaid"
        />
        <DashboardKpiStatCard
          density="compact"
          label="In Clinic Now"
          value={kpis.inClinicNow}
          icon={HeartPulse}
          accentClass={KPI_ACCENTS.inClinic.bg}
          iconTextClass={KPI_ACCENTS.inClinic.text}
          deltaLabel="Waiting + consulting"
          href="/dashboard/walk-ins"
        />
        <DashboardKpiStatCard
          density="compact"
          label="Inventory Alerts"
          value={kpis.inventoryAlerts}
          icon={AlertTriangle}
          accentClass={KPI_ACCENTS.inventory.bg}
          iconTextClass={KPI_ACCENTS.inventory.text}
          href="/dashboard/inventory?lowStock=1"
        />
        <DashboardKpiStatCard
          density="compact"
          label="New Clients (MTD)"
          value={kpis.newClientsMtd}
          icon={Users}
          accentClass={KPI_ACCENTS.clients.bg}
          iconTextClass={KPI_ACCENTS.clients.text}
          deltaPercent={kpiTrends.newClientsMtd}
          deltaLabel="vs last month"
          href="/dashboard/customers"
        />
        <DashboardKpiStatCard
          density="compact"
          label="Vaccinations Today"
          value={kpis.vaccinationsToday}
          icon={Syringe}
          accentClass={KPI_ACCENTS.vaccinations.bg}
          iconTextClass={KPI_ACCENTS.vaccinations.text}
          deltaPercent={kpiTrends.vaccinationsToday}
          deltaLabel="vs yesterday"
          href="/dashboard/appointments"
        />
      </div>

      {/* Row B — Schedule + Action Center + AI Insights */}
      <div className={DASHBOARD_GRID}>
        <DashboardSectionCard
          density="compact"
          title="Today's Schedule"
          subtitle="Appointments and walk-ins for today"
          className="xl:col-span-6"
          footer={
            <div className="flex items-center justify-between gap-2">
              <Link
                href="/dashboard/schedule"
                className="text-[10px] font-bold text-primary hover:text-primary/80"
              >
                View calendar
              </Link>
              <Link
                href="/dashboard/appointments"
                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold bg-primary/15 text-primary border border-primary/25 hover:bg-primary/20"
              >
                <Plus className="w-3 h-3" />
                New appointment
              </Link>
            </div>
          }
        >
          <div className={cn('space-y-0.5 overflow-y-auto pr-1', DASHBOARD_DENSITY.listMaxH)}>
            {scheduleItems.length === 0 ? (
              <p className="text-[10px] text-on-surface-variant italic py-6 text-center">No items scheduled today.</p>
            ) : (
              scheduleItems.map((item) => (
                <DashboardListRow
                  key={`${item.type}-${item.id}`}
                  density="compact"
                  href={item.href}
                  title={item.petName}
                  subtitle={[
                    item.species || 'Pet',
                    item.doctorName || item.customerName,
                  ].join(' · ')}
                  meta={item.time}
                  species={item.species}
                  status={item.status}
                />
              ))
            )}
          </div>
        </DashboardSectionCard>

        <DashboardSectionCard
          density="compact"
          title="Action Center"
          subtitle="Items needing attention"
          className="xl:col-span-3"
        >
          <DashboardActionCenterList items={actionCenter} />
        </DashboardSectionCard>

        <DashboardSectionCard
          density="compact"
          title="AI Insights"
          subtitle="Operational highlights"
          className="xl:col-span-3"
        >
          <DashboardAiInsightList insights={aiInsights} />
        </DashboardSectionCard>
      </div>

      {/* Row C — Analytics quad */}
      <div className={DASHBOARD_GRID}>
        <DashboardSectionCard
          density="compact"
          title="Revenue Trend"
          subtitle="Last 7 days"
          href="/dashboard/revenue"
          className="xl:col-span-5"
        >
          <RevenueTrendChart data={revenueTrend7d} currency={currency} compact />
        </DashboardSectionCard>

        <DashboardSectionCard
          density="compact"
          title="Utilization"
          subtitle="Today's booking rate"
          className="xl:col-span-2"
        >
          <UtilizationDonut booked={utilization.booked} total={utilization.total} compact />
          <p className="text-[9px] text-center text-on-surface-variant mt-1">
            {utilization.booked}/{utilization.total} slots
          </p>
        </DashboardSectionCard>

        <DashboardSectionCard
          density="compact"
          title="Visit Reasons"
          subtitle="Last 7 days"
          className="xl:col-span-3"
        >
          <DashboardRankedBarList data={visitReasons} />
        </DashboardSectionCard>

        <DashboardSectionCard
          density="compact"
          title="Species"
          subtitle="Active patients"
          className="xl:col-span-2"
        >
          {speciesBreakdown.length > 0 ? (
            <SpeciesDonut data={speciesBreakdown} compact inlineLegend />
          ) : (
            <p className="text-[10px] text-on-surface-variant italic py-8 text-center">No patient data.</p>
          )}
        </DashboardSectionCard>
      </div>

      {/* Row D — Five equal bottom widgets */}
      <div className={cn('grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5', DASHBOARD_DENSITY.gridGap)}>
        <DashboardSectionCard density="compact" title="Low Stock" href="/dashboard/inventory">
          <DashboardMiniTable
            density="compact"
            rows={lowStockItems}
            getRowKey={(r) => r.id}
            emptyMessage="No low stock alerts."
            columns={[
              { key: 'name', header: 'Item', render: (r) => <span className="font-semibold text-on-surface truncate block max-w-[80px]">{r.name}</span> },
              { key: 'stock', header: 'Qty', render: (r) => r.stock },
              { key: 'status', header: '', className: 'text-right', render: (r) => stockStatusBadge(r.stock, r.reorderLevel) },
            ]}
          />
        </DashboardSectionCard>

        <DashboardSectionCard density="compact" title="Expiring Soon" subtitle="60 days">
          <DashboardMiniTable
            density="compact"
            rows={expiringSoon}
            getRowKey={(r) => r.id}
            emptyMessage="None expiring soon."
            columns={[
              { key: 'product', header: 'Product', render: (r) => <span className="font-semibold truncate block max-w-[80px]">{r.productName}</span> },
              { key: 'exp', header: 'Exp', render: (r) => r.expiryDate },
              { key: 'qty', header: 'Qty', className: 'text-right', render: (r) => r.quantity },
            ]}
          />
        </DashboardSectionCard>

        <DashboardSectionCard density="compact" title="Follow-ups" href="/dashboard/appointments">
          <ListColumn items={followUpsDue} empty="No follow-ups due." />
        </DashboardSectionCard>

        <DashboardSectionCard
          density="compact"
          title="Vaccinations"
          subtitle="Upcoming in the next 14 days"
          href="/dashboard/appointments"
        >
          <ListColumn items={vaccinationsDue} empty="None due soon." />
        </DashboardSectionCard>

        <DashboardSectionCard density="compact" title="Missed" href="/dashboard/appointments">
          <ListColumn items={missedAppointments} empty="No recent no-shows." status="no_show" />
        </DashboardSectionCard>
      </div>

      {/* Row E — Collapsed accordions */}
      <div className="space-y-2">
        <DashboardCollapsibleSection
          title="Quick Actions"
          subtitle="Shortcuts to daily clinic workflows"
        >
          <DashboardQabShell
            layout="dashboard"
            showHeading={false}
            role={role}
            capabilities={capabilities}
            features={features}
            featuresJson={featuresJson}
            doctors={doctors}
            activeBranchId={activeBranchId}
            organizationId={organizationId}
            clinicName={clinicName}
            liveActiveConsults={liveActiveConsults}
            liveCheckoutQueue={liveCheckoutQueue}
            showConsultTimer={showConsultTimer}
            branches={branches}
            categories={categories}
          />
        </DashboardCollapsibleSection>

        <DashboardCollapsibleSection title="Live Operations" subtitle="Active consults and checkout queue">
          <LiveOperationsPanel
            activeConsults={liveActiveConsults}
            readyForCheckout={liveCheckoutQueue}
            showConsultTimer={showConsultTimer}
          />
        </DashboardCollapsibleSection>

        <DashboardCollapsibleSection title="Medical Record Activity" subtitle="Recent clinical updates">
          <MedicalRecordActivityPanel activities={medicalActivities} />
        </DashboardCollapsibleSection>

        <DashboardCollapsibleSection title="Staff Attendance" subtitle="Today's roster status">
          <StaffAttendanceOverviewPanel
            rows={staffAttendanceRows}
            attendanceDate={new Date().toISOString().slice(0, 10)}
          />
        </DashboardCollapsibleSection>
      </div>
    </div>
  );
}

function ListColumn({
  items,
  empty,
  status = 'confirmed',
}: {
  items: { id: string; petName: string; customerName: string; date: string; reason: string }[];
  empty: string;
  status?: string;
}) {
  if (items.length === 0) {
    return <p className="text-[10px] text-on-surface-variant italic py-4 text-center">{empty}</p>;
  }
  return (
    <div className={cn('space-y-0.5 overflow-y-auto', DASHBOARD_DENSITY.listMaxH)}>
      {items.slice(0, 5).map((item) => (
        <DashboardListRow
          key={item.id}
          density="compact"
          title={item.petName}
          subtitle={`${item.customerName} · ${item.reason}`}
          meta={item.date}
          status={status}
        />
      ))}
    </div>
  );
}
