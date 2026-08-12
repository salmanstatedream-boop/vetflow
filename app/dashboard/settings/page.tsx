import { redirect } from 'next/navigation';
import {
  assertCapability,
  resolveServerAuthContext,
} from '@/lib/auth/context';
import DeniedState from '@/components/ui/premium/DeniedState';
import { createClient } from '@/lib/supabase/server';
import SettingsForm from '@/components/forms/SettingsForm';
import ServicesCatalogClient from '@/components/forms/ServicesCatalogClient';
import CameraDevicesClient from '@/components/settings/CameraDevicesClient';
import ClinicResetPanel from '@/components/settings/ClinicResetPanel';
import { listServicesAction } from '@/lib/services/service-catalog-actions';
import PageHeader from '@/components/ui/premium/PageHeader';
import { isBrandedPdfsEnabled, isCameraFeedEnabled } from '@/lib/auth/features';
import { Settings } from 'lucide-react';
import { normalizeClinicTimezone } from '@/lib/utils/timezones';
import { normalizeNotificationPrefs } from '@/lib/dashboard/notification-prefs';

export const metadata = {
  title: 'Clinic Settings',
  description: 'Configure clinic preferences, timezone, currency, and tax settings.',
};

export default async function SettingsPage() {
  const ctx = await resolveServerAuthContext();
  if (!ctx) redirect('/login');

  try {
    assertCapability(ctx, 'manage_settings');
  } catch {
    return (
      <DeniedState
        title="Settings restricted"
        message="Only clinic administrators can manage organization settings."
      />
    );
  }

  const session = ctx;

  if (!session.organizationId) {
    return (
      <div className="bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs p-6 rounded-2xl">
        No organization is linked to your account. Contact your platform administrator.
      </div>
    );
  }

  const supabase = await createClient();

  const [{ data: appSettings }, { data: taxSettings }, { data: sub }] = await Promise.all([
    supabase
      .from('app_settings')
      .select(
        'timezone, currency, clinic_logo_url, clinic_address, clinic_phone, clinic_email, pdf_branding_enabled, pdf_accent_color, pdf_footer_text, product_markup_percent, notification_prefs'
      )
      .eq('organization_id', session.organizationId)
      .maybeSingle(),
    supabase
      .from('tax_settings')
      .select('is_enabled, tax_name, tax_percentage, applies_to_products, applies_to_services')
      .eq('organization_id', session.organizationId)
      .maybeSingle(),
    supabase
      .from('subscription_status')
      .select('features')
      .eq('organization_id', session.organizationId)
      .maybeSingle(),
  ]);

  const brandedPdfsAllowed = isBrandedPdfsEnabled(
    (sub?.features as Record<string, unknown>) || null
  );
  const cameraFeedEnabled = isCameraFeedEnabled(
    (sub?.features as Record<string, unknown>) || null
  );

  const servicesRes = await listServicesAction();
  const services = (servicesRes.success ? servicesRes.services : []) as Array<{
    id: string;
    name: string;
    description: string | null;
    price: number;
    is_active: boolean;
  }>;

  const notifyPrefs = normalizeNotificationPrefs(appSettings?.notification_prefs);

  const defaultValues = {
    timezone: normalizeClinicTimezone(appSettings?.timezone),
    currency: appSettings?.currency || 'USD',
    isTaxEnabled: taxSettings?.is_enabled ?? true,
    taxName: taxSettings?.tax_name || 'VAT',
    taxPercentage: Number(taxSettings?.tax_percentage ?? 15),
    appliesToProducts: taxSettings?.applies_to_products ?? true,
    appliesToServices: taxSettings?.applies_to_services ?? true,
    clinicLogoUrl: appSettings?.clinic_logo_url || '',
    clinicAddress: appSettings?.clinic_address || '',
    clinicPhone: appSettings?.clinic_phone || '',
    clinicEmail: appSettings?.clinic_email || '',
    emergencyCallPrompt: appSettings?.emergency_call_prompt || '',
    afterHoursNote: appSettings?.after_hours_note || '',
    pdfBrandingEnabled: appSettings?.pdf_branding_enabled ?? false,
    pdfAccentColor: appSettings?.pdf_accent_color || '#0b132b',
    pdfFooterText: appSettings?.pdf_footer_text || '',
    productMarkupPercent: Number(appSettings?.product_markup_percent ?? 20),
    notifyCheckout: notifyPrefs.checkout,
    notifyAssignedToMe: notifyPrefs.assigned_to_me,
    notifyAssignedInClinic: notifyPrefs.assigned_in_clinic,
    notifyUnpaidInvoice: notifyPrefs.unpaid_invoice,
    notifyLowStock: notifyPrefs.low_stock,
    notifyEmergencyQueue: notifyPrefs.emergency_queue,
    notifyStaffChatMessage: notifyPrefs.staff_chat_message,
    notifyStaffTaskUpdate: notifyPrefs.staff_task_update,
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Clinic Settings"
        description={`Manage preferences for ${session.organizationName || 'your clinic'}.`}
        icon={Settings}
      />

      <SettingsForm defaultValues={defaultValues} brandedPdfsAllowed={brandedPdfsAllowed} />

      {cameraFeedEnabled && <CameraDevicesClient />}

      <ServicesCatalogClient initialServices={services} />

      {session.role === 'clinic_admin' && (
        <ClinicResetPanel organizationName={session.organizationName || 'Clinic'} />
      )}
    </div>
  );
}

