import { redirect } from 'next/navigation';
import { resolveServerAuthContext } from '@/lib/auth/context';
import { guardRoute } from '@/lib/auth/page-guards';
import { cookies } from 'next/headers';
import Link from 'next/link';
import PageHeader from '@/components/ui/premium/PageHeader';
import PrescriptionsListClient from '@/components/prescriptions/PrescriptionsListClient';
import { listBranchPrescriptionsAction } from '@/lib/services/prescription-actions';
import { FileText } from 'lucide-react';

export const metadata = {
  title: 'Prescriptions',
  description: 'View and manage clinic prescriptions across your branch.',
};

export default async function PrescriptionsPage() {
  const ctx = await resolveServerAuthContext();
  if (!ctx) redirect('/login');

  const denied = guardRoute(ctx, '/dashboard/prescriptions');
  if (denied) return denied;

  const session = ctx;

  const cookieStore = await cookies();
  const activeBranchCookie = cookieStore.get('clinix_branch_id')?.value;
  let activeBranchId = activeBranchCookie;

  if (!activeBranchId && session.branches.length > 0) {
    activeBranchId = session.branches[0].id;
  } else if (activeBranchId && !session.branches.some((b) => b.id === activeBranchId)) {
    activeBranchId = session.branches[0]?.id;
  }

  if (!activeBranchId) {
    return (
      <div className="bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs p-6 rounded-2xl">
        You must be assigned to a clinic branch to view prescriptions.
      </div>
    );
  }

  const result = await listBranchPrescriptionsAction(activeBranchId);

  if (!result.success) {
    return (
      <div className="bg-destructive/5 border border-destructive/20 text-destructive text-sm p-6 rounded-2xl">
        Failed to load prescriptions: {result.error}
      </div>
    );
  }

  const rows = result.prescriptions;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Prescriptions"
        description="Review finalized prescriptions; filter by draft or visits with no prescription."
        icon={FileText}
      />

      <div className="glass-panel rounded-2xl border border-outline-variant/40 shadow-premium overflow-hidden">
        {rows.length > 0 ? (
          <PrescriptionsListClient prescriptions={rows} userRole={session.role} />
        ) : (
          <div className="p-10 text-center">
            <FileText className="w-8 h-8 text-on-surface-variant/20 mx-auto mb-3" />
            <p className="text-xs text-on-surface-variant/40">
              No prescriptions recorded for this branch yet.
            </p>
            <Link
              href="/dashboard/doctors"
              className="text-xs text-primary font-semibold mt-2 inline-block hover:underline"
            >
              Open doctor queue →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
