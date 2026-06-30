import { redirect } from 'next/navigation';
import { resolveServerAuthContext } from '@/lib/auth/context';
import { hasCapability } from '@/lib/auth/capabilities';
import DashboardShellClient from '@/components/layout/DashboardShellClient';
import { NavigationLoadingProvider } from '@/components/layout/NavigationLoadingProvider';
import FaviconLoadingIndicator from '@/components/layout/FaviconLoadingIndicator';
import { createClient } from '@/lib/supabase/server';
import { EMPTY_ATTENDANCE, loadMyAttendanceForToday } from '@/lib/dashboard/load-my-attendance';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const ctx = await resolveServerAuthContext();

  if (!ctx) {
    redirect('/login');
  }

  if (ctx.isSuperAdmin && !ctx.isImpersonating) {
    redirect('/super-admin/dashboard');
  }

  if (!ctx.isImpersonating && (!ctx.role || ctx.branches.length === 0)) {
    redirect('/account-setup');
  }

  let initialAttendance = EMPTY_ATTENDANCE;
  const showAttendance =
    ctx.role !== 'clinic_admin' && hasCapability(ctx.role, 'mark_attendance');

  if (
    showAttendance &&
    ctx.organizationId &&
    (ctx.role === 'receptionist' || ctx.role === 'doctor')
  ) {
    const supabase = await createClient();
    const today = new Date().toISOString().slice(0, 10);
    initialAttendance = await loadMyAttendanceForToday(
      supabase,
      ctx.organizationId,
      ctx.userId,
      today
    );
  }

  return (
    <NavigationLoadingProvider>
      <FaviconLoadingIndicator />
      <DashboardShellClient
        session={ctx}
        activeBranchId={ctx.activeBranchId ?? undefined}
        initialAttendance={initialAttendance}
      >
        {children}
      </DashboardShellClient>
    </NavigationLoadingProvider>
  );
}
