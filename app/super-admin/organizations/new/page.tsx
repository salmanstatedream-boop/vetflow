import { createAdminClient } from '@/lib/supabase/server';
import PageHeader from '@/components/ui/premium/PageHeader';
import ProvisionClinicForm from '@/components/super-admin/ProvisionClinicForm';
import { Building2 } from 'lucide-react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { loadSuperAdminPlans } from '@/lib/super-admin/plans';

export const metadata = {
  title: 'Provision Clinic',
  description: 'Create a new clinic tenant and its initial administrator.',
};

export default async function ProvisionClinicPage() {
  const adminClient = await createAdminClient();
  const [typeRowsRes, plans] = await Promise.all([
    adminClient.from('clinic_types').select('id, label').eq('is_active', true).order('label'),
    loadSuperAdminPlans(),
  ]);

  const clinicTypes =
    (typeRowsRes.data as { id: string; label: string }[] | null)?.map((t) => ({
      id: t.id,
      label: t.label,
    })) ?? [{ id: 'vet', label: 'Veterinary Clinic' }];

  return (
    <div className="space-y-8">
      <Link
        href="/super-admin/organizations"
        className="inline-flex items-center gap-1.5 text-xs text-on-surface-variant/60 hover:text-primary font-semibold transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to tenant registry
      </Link>
      <PageHeader
        title="Provision a clinic"
        description="Create a tenant, pick a plan, enable features, and set up the first admin and branch."
        icon={Building2}
      />
      <ProvisionClinicForm clinicTypes={clinicTypes} plans={plans} />
    </div>
  );
}
