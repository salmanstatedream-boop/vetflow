import { redirect } from 'next/navigation';
import { resolveServerAuthContext } from '@/lib/auth/context';
import { guardRoute, guardFeature } from '@/lib/auth/page-guards';
import PageHeader from '@/components/ui/premium/PageHeader';
import AiAnalyticsClient from '@/components/dashboard/AiAnalyticsClient';
import { Sparkles } from 'lucide-react';

export const metadata = {
  title: 'AI Analytics',
  description: 'AI-generated business insights for your clinic.',
};

export default async function AiAnalyticsPage() {
  const ctx = await resolveServerAuthContext();
  if (!ctx) redirect('/login');

  const denied = guardRoute(ctx, '/dashboard/reports/ai');
  if (denied) return denied;

  const featureDenied = guardFeature(ctx, 'reports');
  if (featureDenied) return featureDenied;

  return (
    <div className="space-y-8">
      <PageHeader
        title="AI Analytics"
        description="Executive narrative and key metrics powered by ClinixDev AI."
        icon={Sparkles}
      />
      <AiAnalyticsClient showChartsLink />
    </div>
  );
}
