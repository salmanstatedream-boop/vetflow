import { redirect } from 'next/navigation';
import { resolveServerAuthContext } from '@/lib/auth/context';
import { guardRoute } from '@/lib/auth/page-guards';
import { createClient } from '@/lib/supabase/server';
import { isCameraFeedEnabled } from '@/lib/auth/features';
import PageHeader from '@/components/ui/premium/PageHeader';
import DeniedState from '@/components/ui/premium/DeniedState';
import CameraFeedClient from '@/components/camera/CameraFeedClient';
import { Video } from 'lucide-react';

export const metadata = {
  title: 'Cameras',
  description: 'Connect and monitor cameras installed at this clinic.',
};

export default async function CameraPage() {
  const ctx = await resolveServerAuthContext();
  if (!ctx) redirect('/login');

  const denied = guardRoute(ctx, '/dashboard/camera');
  if (denied) return denied;

  if (!ctx.activeBranchId) {
    return (
      <div className="bg-amber-500/10 border border-amber-500/30 text-amber-400 text-sm p-6 rounded-2xl">
        Select a branch to view camera feeds.
      </div>
    );
  }

  const supabase = await createClient();
  const { data: sub } = await supabase
    .from('subscription_status')
    .select('features')
    .eq('organization_id', ctx.organizationId || '')
    .maybeSingle();

  if (!isCameraFeedEnabled((sub?.features as Record<string, unknown>) || null)) {
    return (
      <DeniedState
        title="Camera feed not enabled"
        message="Live camera feeds are an opt-in feature. Ask your platform administrator to enable it for your organization."
      />
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Cameras"
        description="Connect and monitor cameras installed at this clinic."
        icon={Video}
      />
      <CameraFeedClient />
    </div>
  );
}
