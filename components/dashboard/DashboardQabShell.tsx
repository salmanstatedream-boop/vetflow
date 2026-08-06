'use client';

import { useState, useMemo, useCallback, useTransition } from 'react';
import RoleQuickActionsGrid, { type QabLayout } from '@/components/dashboard/RoleQuickActionsGrid';
import ReceptionistPrimaryActions from '@/components/dashboard/ReceptionistPrimaryActions';
import DashboardWorkflowLauncher from '@/components/dashboard/DashboardWorkflowLauncher';
import MyTasksCard from '@/components/tasks/MyTasksCard';
import {
  getQabsForRole,
  filterQabs,
  type QabItem,
  type QabModalId,
} from '@/components/dashboard/role-qab-config';
import type { LiveConsultRow } from '@/components/dashboard/LiveOperationsPanel';
import type { UserSessionDetails } from '@/lib/services/auth';
import type { Feature } from '@/lib/auth/features';
import type { StaffTaskRow } from '@/lib/services/staff-task-actions';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useGlobalLoadingOptional } from '@/components/layout/NavigationLoadingProvider';
import { routePathsMatch } from '@/lib/utils/route-path';

interface Doctor {
  id: string;
  firstName: string;
  lastName: string;
}

interface DashboardQabShellProps {
  role: UserSessionDetails['role'];
  capabilities: string[];
  features: Feature[];
  featuresJson?: Record<string, unknown> | null;
  doctors: Doctor[];
  activeBranchId: string;
  organizationId: string;
  clinicName: string;
  liveActiveConsults?: LiveConsultRow[];
  liveCheckoutQueue?: LiveConsultRow[];
  showConsultTimer?: boolean;
  branches: { id: string; name: string }[];
  categories: { id: string; name: string }[];
  layout?: QabLayout;
  showHeading?: boolean;
  myTasks?: StaffTaskRow[];
}

export default function DashboardQabShell({
  role,
  capabilities,
  features,
  featuresJson,
  doctors,
  activeBranchId,
  organizationId,
  clinicName,
  liveActiveConsults = [],
  liveCheckoutQueue = [],
  showConsultTimer = false,
  branches,
  categories,
  layout = 'compact',
  showHeading = true,
  myTasks,
}: DashboardQabShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const navLoading = useGlobalLoadingOptional();
  const [activeModal, setActiveModal] = useState<QabModalId | null>(null);
  const [pendingQabId, setPendingQabId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const qabItems = useMemo(
    () => filterQabs(getQabsForRole(role), { role, capabilities, features, featuresJson }),
    [role, capabilities, features, featuresJson]
  );

  useEffect(() => {
    if (!navLoading?.isNavigating) {
      setPendingQabId(null);
    }
  }, [navLoading?.isNavigating]);

  const handleAction = useCallback(
    (item: QabItem) => {
      if (item.launcher === 'page' && item.href) {
        if (routePathsMatch(item.href, pathname)) return;
        setPendingQabId(item.id);
        navLoading?.startNavigation(item.href);
        startTransition(() => {
          router.push(item.href!);
        });
        return;
      }
      if (item.modalId) {
        setActiveModal(item.modalId);
      }
    },
    [router, pathname, navLoading]
  );

  const closeModal = useCallback(() => setActiveModal(null), []);

  return (
    <>
      {role === 'receptionist' ? (
        <div className="space-y-3">
          {showHeading && (
            <h3 className="text-xs font-bold text-on-surface uppercase tracking-wider">
              Quick Actions
            </h3>
          )}
          <ReceptionistPrimaryActions
            activeBranchId={activeBranchId}
            branches={branches}
            doctors={doctors}
          />
          {myTasks !== undefined && <MyTasksCard tasks={myTasks} />}
          <RoleQuickActionsGrid
            layout={layout}
            showHeading={false}
            items={qabItems}
            onAction={handleAction}
            pendingId={pendingQabId}
          />
        </div>
      ) : (
        <RoleQuickActionsGrid
          layout={layout}
          showHeading={showHeading}
          items={qabItems}
          onAction={handleAction}
          pendingId={pendingQabId}
        />
      )}
      <DashboardWorkflowLauncher
        activeModal={activeModal}
        onClose={closeModal}
        doctors={doctors}
        activeBranchId={activeBranchId}
        liveActiveConsults={liveActiveConsults}
        liveCheckoutQueue={liveCheckoutQueue}
        showConsultTimer={showConsultTimer}
        organizationId={organizationId}
        clinicName={clinicName}
        branches={branches}
        categories={categories}
      />
    </>
  );
}
