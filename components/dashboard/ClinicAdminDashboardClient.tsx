'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import {
  Calendar,
  DollarSign,
  Wallet,
  HeartPulse,
  AlertTriangle,
  Users,
  Sparkles,
  Plus,
} from 'lucide-react';
import { useVisibilityPolling } from '@/lib/hooks/useVisibilityPolling';
import { formatMoney } from '@/lib/utils/currency';
import { DASHBOARD_GRID, KPI_ACCENTS } from '@/lib/ui/dashboard-tokens';
import DashboardKpiStatCard from '@/components/dashboard/premium/DashboardKpiStatCard';
import DashboardSectionCard from '@/components/dashboard/premium/DashboardSectionCard';
import DashboardListRow from '@/components/dashboard/premium/DashboardListRow';
import DashboardMiniTable, { stockStatusBadge } from '@/components/dashboard/premium/DashboardMiniTable';
import {
  RevenueTrendChart,
  UtilizationDonut,
  SpeciesDonut,
  VisitReasonsChart,
} from '@/components/dashboard/premium/DashboardCharts';
import LiveOperationsPanel from '@/components/dashboard/LiveOperationsPanel';
import MedicalRecordActivityPanel from '@/components/dashboard/MedicalRecordActivityPanel';
import StaffAttendanceOverviewPanel from '@/components/dashboard/StaffAttendanceOverviewPanel';
import DashboardQabShell from '@/components/dashboard/DashboardQabShell';
import type { AdminOverviewBundle } from '@/lib/dashboard/admin-overview.types';
import type { UserSessionDetails } from '@/lib/services/auth';
import type { Feature } from '@/lib/auth/features';
import { cn } from '@/lib/utils';
import { useDashboardShell } from '@/lib/context/DashboardShellContext';

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

const ACTION_VARIANTS = {
  warning: 'border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10',
  danger: 'border-red-500/30 bg-red-500/5 hover:bg-red-500/10',
  info: 'border-cyan-500/30 bg-cyan-500/5 hover:bg-cyan-500/10',
  purple: 'border-violet-500/30 bg-violet-500/5 hover:bg-violet-500/10',
};

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
  notificationCount,
}: ClinicAdminDashboardClientProps) {
  const shell = useDashboardShell();
  useVisibilityPolling(30_000);

  useEffect(() => {
    shell?.setNotificationCount(notificationCount);
    return () => shell?.setNotificationCount(0);
  }, [shell, notificationCount]);

  return (
    <div className="space-y-5 md:space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 md:gap-4">
        <DashboardKpiStatCard
          label="Today's Appointments"
          value={kpis.todayAppointments}
          icon={Calendar}
          accentClass={KPI_ACCENTS.appointments.bg}
          iconTextClass={KPI_ACCENTS.appointments.text}
          sparklineStroke={KPI_ACCENTS.appointments.stroke}
          sparkline={sparklines.appointments}
          deltaPercent={kpiTrends.todayAppointments}
          deltaLabel="vs yesterday"
        />
        <DashboardKpiStatCard
          label="Today's Revenue"
          value={formatMoney(kpis.todayRevenue, currency)}
          icon={DollarSign}
          accentClass={KPI_ACCENTS.revenue.bg}
          iconTextClass={KPI_ACCENTS.revenue.text}
          sparklineStroke={KPI_ACCENTS.revenue.stroke}
          sparkline={sparklines.revenue}
          deltaPercent={kpiTrends.todayRevenue}
          deltaLabel="vs yesterday"
        />
        <DashboardKpiStatCard
          label="Outstanding Receivables"
          value={formatMoney(kpis.outstandingReceivables, currency)}
          icon={Wallet}
          accentClass={KPI_ACCENTS.receivables.bg}
          iconTextClass={KPI_ACCENTS.receivables.text}
        />
        <DashboardKpiStatCard
          label="In Clinic Now"
          value={kpis.inClinicNow}
          icon={HeartPulse}
          accentClass={KPI_ACCENTS.inClinic.bg}
          iconTextClass={KPI_ACCENTS.inClinic.text}
          deltaLabel="Waiting + consulting"
        />
        <DashboardKpiStatCard
          label="Inventory Alerts"
          value={kpis.inventoryAlerts}
          icon={AlertTriangle}
          accentClass={KPI_ACCENTS.inventory.bg}
          iconTextClass={KPI_ACCENTS.inventory.text}
        />
        <DashboardKpiStatCard
          label="New Clients (MTD)"
          value={kpis.newClientsMtd}
          icon={Users}
          accentClass={KPI_ACCENTS.clients.bg}
          iconTextClass={KPI_ACCENTS.clients.text}
          deltaPercent={kpiTrends.newClientsMtd}
          deltaLabel="vs last month"
        />
      </div>

      <DashboardSectionCard
        title="Quick Actions"
        subtitle="Shortcuts to daily clinic workflows"
        className="w-full"
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
      </DashboardSectionCard>

      <div className={DASHBOARD_GRID}>
        <DashboardSectionCard
          title="Today's Schedule"
          subtitle="Appointments and walk-ins for today"
          href="/dashboard/schedule"
          className="xl:col-span-8"
          action={
            <Link
              href="/dashboard/appointments"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold bg-primary/15 text-primary border border-primary/25 hover:bg-primary/20"
            >
              <Plus className="w-3 h-3" />
              New
            </Link>
          }
        >
          <div className="space-y-0.5 max-h-[320px] overflow-y-auto pr-1">
            {todaySchedule.length === 0 ? (
              <p className="text-xs text-on-surface-variant italic py-8 text-center">No items scheduled today.</p>
            ) : (
              todaySchedule.map((item) => (
                <DashboardListRow
                  key={`${item.type}-${item.id}`}
                  href={item.href}
                  title={item.petName}
                  subtitle={`${item.customerName} · ${item.reason}`}
                  meta={item.time}
                  species={item.species}
                  status={item.status}
                />
              ))
            )}
          </div>
        </DashboardSectionCard>

        <DashboardSectionCard title="Action Center" subtitle="Items needing attention" className="xl:col-span-4">
          <div className="space-y-2">
            {actionCenter.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className={cn(
                  'flex items-center justify-between px-3 py-2.5 rounded-xl border transition-colors',
                  ACTION_VARIANTS[item.variant]
                )}
              >
                <span className="text-xs font-semibold text-on-surface">{item.label}</span>
                <span className="text-sm font-bold text-on-surface">{item.count}</span>
              </Link>
            ))}
          </div>
        </DashboardSectionCard>

        <DashboardSectionCard
          title="AI Insights"
          subtitle="Operational highlights"
          href="/dashboard/reports/ai"
          className="xl:col-span-4"
        >
          <div className="rounded-xl bg-gradient-to-br from-violet-500/10 to-purple-900/10 border border-violet-500/20 p-4 space-y-2">
            <div className="flex items-center gap-2 text-violet-400 mb-2">
              <Sparkles className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Smart summary</span>
            </div>
            <ul className="space-y-2">
              {aiInsights.length === 0 ? (
                <li className="text-xs text-on-surface-variant">No insights for today.</li>
              ) : (
                aiInsights.map((line, i) => (
                  <li key={i} className="text-xs text-on-surface-variant leading-relaxed flex gap-2">
                    <span className="text-primary shrink-0">•</span>
                    {line}
                  </li>
                ))
              )}
            </ul>
          </div>
        </DashboardSectionCard>

        <DashboardSectionCard
          title="Revenue Trend"
          subtitle="Last 7 days"
          href="/dashboard/revenue"
          className="xl:col-span-8"
        >
          <RevenueTrendChart data={revenueTrend7d} currency={currency} />
        </DashboardSectionCard>

        <DashboardSectionCard title="Appointment Utilization" subtitle="Today's booking rate" className="xl:col-span-4">
          <UtilizationDonut booked={utilization.booked} total={utilization.total} />
          <p className="text-[10px] text-center text-on-surface-variant mt-2">
            {utilization.booked} of {utilization.total} slots booked
          </p>
        </DashboardSectionCard>

        <DashboardSectionCard title="Visit Reasons" subtitle="Last 7 days" className="xl:col-span-4">
          {visitReasons.length > 0 ? (
            <VisitReasonsChart data={visitReasons} />
          ) : (
            <p className="text-xs text-on-surface-variant italic py-12 text-center">No visit data yet.</p>
          )}
        </DashboardSectionCard>

        <DashboardSectionCard title="Species Breakdown" subtitle="Active patients" className="xl:col-span-4">
          {speciesBreakdown.length > 0 ? (
            <>
              <SpeciesDonut data={speciesBreakdown} />
              <div className="flex flex-wrap gap-2 justify-center mt-2">
                {speciesBreakdown.map((s, i) => (
                  <span key={s.name} className="text-[9px] text-on-surface-variant">
                    <span className="inline-block w-2 h-2 rounded-full mr-1 align-middle" style={{ background: ['#A855F7', '#06B6D4', '#10B981', '#F59E0B', '#EC4899'][i % 5] }} />
                    {s.name} ({s.value})
                  </span>
                ))}
              </div>
            </>
          ) : (
            <p className="text-xs text-on-surface-variant italic py-12 text-center">No patient data.</p>
          )}
        </DashboardSectionCard>

        <DashboardSectionCard title="Top Low Stock" href="/dashboard/inventory" className="xl:col-span-6">
          <DashboardMiniTable
            rows={lowStockItems}
            getRowKey={(r) => r.id}
            emptyMessage="No low stock alerts."
            columns={[
              { key: 'name', header: 'Item', render: (r) => <span className="font-semibold text-on-surface">{r.name}</span> },
              { key: 'cat', header: 'Category', render: (r) => r.category },
              { key: 'stock', header: 'Stock', render: (r) => r.stock },
              { key: 'status', header: 'Status', className: 'text-right', render: (r) => stockStatusBadge(r.stock, r.reorderLevel) },
            ]}
          />
        </DashboardSectionCard>

        <DashboardSectionCard title="Expiring Soon" subtitle="Within 60 days" className="xl:col-span-6">
          <DashboardMiniTable
            rows={expiringSoon}
            getRowKey={(r) => r.id}
            emptyMessage="No batches expiring soon."
            columns={[
              { key: 'product', header: 'Product', render: (r) => <span className="font-semibold">{r.productName}</span> },
              { key: 'exp', header: 'Expires', render: (r) => r.expiryDate },
              { key: 'qty', header: 'Qty', className: 'text-right', render: (r) => r.quantity },
            ]}
          />
        </DashboardSectionCard>

        <DashboardSectionCard title="Follow-ups Due" href="/dashboard/appointments" className="xl:col-span-4">
          <ListColumn items={followUpsDue} empty="No follow-ups due." />
        </DashboardSectionCard>

        <DashboardSectionCard title="Vaccinations Due" href="/dashboard/appointments" className="xl:col-span-4">
          <ListColumn items={vaccinationsDue} empty="No vaccinations due soon." />
        </DashboardSectionCard>

        <DashboardSectionCard title="Missed Appointments" href="/dashboard/appointments" className="xl:col-span-4">
          <ListColumn items={missedAppointments} empty="No recent no-shows." status="no_show" />
        </DashboardSectionCard>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <LiveOperationsPanel
          activeConsults={liveActiveConsults}
          readyForCheckout={liveCheckoutQueue}
          showConsultTimer={showConsultTimer}
        />
        <MedicalRecordActivityPanel activities={medicalActivities} />
      </div>

      <StaffAttendanceOverviewPanel
        rows={staffAttendanceRows}
        attendanceDate={new Date().toISOString().slice(0, 10)}
      />
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
    return <p className="text-xs text-on-surface-variant italic py-6 text-center">{empty}</p>;
  }
  return (
    <div className="space-y-0.5 max-h-48 overflow-y-auto">
      {items.map((item) => (
        <DashboardListRow
          key={item.id}
          title={item.petName}
          subtitle={`${item.customerName} · ${item.reason}`}
          meta={item.date}
          status={status}
        />
      ))}
    </div>
  );
}
