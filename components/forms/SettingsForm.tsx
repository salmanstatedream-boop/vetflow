'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { updateSettingsAction, uploadClinicLogoAction } from '@/lib/services/settings-actions';
import { applyProductMarkupAction } from '@/lib/services/inventory-actions';
import { SettingsSchema, type SettingsInput } from '@/lib/validations/schemas';
import { normalizeCurrencyCode } from '@/lib/utils/currency';
import {
  CLINIC_TIMEZONES,
} from '@/lib/utils/timezones';
import { Loader2, Save, Upload } from 'lucide-react';
import { clinicLogoApiUrl, isStorageLogoPath, isValidLogoPasteUrl, resolveClinicLogoSrc } from '@/lib/branding/clinic-logo';
import { PRODUCT_NAME } from '@/lib/brand';

const PRESET_CURRENCIES = ['USD', 'PKR', 'EUR', 'GBP', 'AED', 'SAR', 'INR'] as const;

function isPresetCurrency(code: string): boolean {
  return PRESET_CURRENCIES.includes(normalizeCurrencyCode(code) as (typeof PRESET_CURRENCIES)[number]);
}

interface SettingsFormProps {
  defaultValues: SettingsInput;
  brandedPdfsAllowed?: boolean;
}

export default function SettingsForm({ defaultValues, brandedPdfsAllowed = false }: SettingsFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const [markupApplying, setMarkupApplying] = useState(false);
  const [logoUrlHint, setLogoUrlHint] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(() =>
    resolveClinicLogoSrc(defaultValues.clinicLogoUrl)
  );
  const [currencyMode, setCurrencyMode] = useState<'preset' | 'other'>(() =>
    isPresetCurrency(defaultValues.currency) ? 'preset' : 'other'
  );
  const [otherCurrency, setOtherCurrency] = useState(() =>
    isPresetCurrency(defaultValues.currency) ? '' : normalizeCurrencyCode(defaultValues.currency)
  );
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SettingsInput>({
    resolver: zodResolver(SettingsSchema),
    defaultValues,
  });

  const currencyValue = watch('currency');
  const markupPercentValue = watch('productMarkupPercent');
  const clinicLogoUrlValue = watch('clinicLogoUrl');

  const onSubmit = async (data: SettingsInput) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const res = await updateSettingsAction(data);
      if (res.success) {
        setSuccess(true);
        router.refresh();
      } else {
        setError(res.error || 'Failed to save settings');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {error && (
        <div className="p-4 bg-destructive/5 border border-destructive/20 text-destructive text-xs rounded-2xl">
          {error}
        </div>
      )}
      {success && (
        <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 text-emerald-700 text-xs rounded-2xl">
          {infoMessage || 'Settings saved successfully.'}
        </div>
      )}

      <div className="glass-panel rounded-2xl border border-outline-variant/40 p-6 shadow-premium space-y-5">
        <h3 className="text-xs font-bold text-on-surface uppercase tracking-wider">Clinic Preferences</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-semibold text-on-surface/80 uppercase tracking-wider mb-1.5">
              Timezone
            </label>
            <select
              {...register('timezone')}
              className="w-full px-4 py-2.5 bg-surface-container/30 border border-outline-variant/80 rounded-xl text-sm text-on-surface outline-none focus:border-primary"
            >
              {CLINIC_TIMEZONES.map((tz) => (
                <option key={tz.value} value={tz.value}>
                  {tz.label}
                </option>
              ))}
            </select>
            <p className="text-[10px] text-on-surface-variant mt-1">
              Appointment times on the schedule calendar use this timezone.
            </p>
            {errors.timezone && (
              <span className="text-xs text-destructive mt-1 block">{errors.timezone.message}</span>
            )}
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-on-surface/80 uppercase tracking-wider mb-1.5">
              Currency
            </label>
            <select
              value={currencyMode === 'other' ? 'OTHER' : normalizeCurrencyCode(currencyValue)}
              onChange={(e) => {
                const next = e.target.value;
                if (next === 'OTHER') {
                  setCurrencyMode('other');
                  setValue('currency', normalizeCurrencyCode(otherCurrency || 'USD'), {
                    shouldValidate: true,
                  });
                } else {
                  setCurrencyMode('preset');
                  setValue('currency', next, { shouldValidate: true });
                }
              }}
              className="w-full px-4 py-2.5 bg-surface-container/30 border border-outline-variant/80 rounded-xl text-sm text-on-surface outline-none focus:border-primary"
            >
              {PRESET_CURRENCIES.map((code) => (
                <option key={code} value={code}>
                  {code}
                </option>
              ))}
              <option value="OTHER">Other (ISO code)</option>
            </select>
            {currencyMode === 'other' && (
              <input
                type="text"
                maxLength={3}
                value={otherCurrency}
                onChange={(e) => {
                  const next = e.target.value.toUpperCase().replace(/[^A-Z]/g, '');
                  setOtherCurrency(next);
                  if (next.length === 3) {
                    setValue('currency', next, { shouldValidate: true });
                  }
                }}
                placeholder="e.g. JPY"
                className="mt-2 w-full px-4 py-2.5 bg-surface-container/30 border border-outline-variant/80 rounded-xl text-sm text-on-surface outline-none focus:border-primary uppercase"
              />
            )}
            <input type="hidden" {...register('currency')} />
            {errors.currency && (
              <span className="text-xs text-destructive mt-1 block">{errors.currency.message}</span>
            )}
          </div>
        </div>
        <div>
          <label className="block text-[10px] font-semibold text-on-surface/80 uppercase tracking-wider mb-1.5">
            Default product markup %
          </label>
          <input
            type="number"
            step="0.1"
            min={0}
            max={500}
            {...register('productMarkupPercent', { valueAsNumber: true })}
            className="w-full max-w-xs px-4 py-2.5 bg-surface-container/30 border border-outline-variant/80 rounded-xl text-sm text-on-surface outline-none focus:border-primary"
          />
          <p className="text-[10px] text-on-surface-variant mt-1">
            Used when creating new catalog items from cost price, when applying markup to existing
            products, and on invoice intake for new lines.
          </p>
          <div className="mt-3">
            <button
              type="button"
              disabled={markupApplying}
              onClick={async () => {
                if (!confirm('Recalculate selling prices for all catalog products with a cost price?')) return;
                setMarkupApplying(true);
                setError(null);
                setInfoMessage(null);
                try {
                  const pct = Number(markupPercentValue);
                  const res = await applyProductMarkupAction({
                    scope: 'all',
                    markupPercent: Number.isFinite(pct) ? pct : undefined,
                  });
                  if (res.success) {
                    setSuccess(true);
                    if (res.updated === 0) {
                      setInfoMessage(
                        'No products updated. Set a purchase/cost price on inventory items first, then try again.'
                      );
                    } else {
                      setInfoMessage(`Updated selling prices on ${res.updated} product(s).`);
                    }
                    router.refresh();
                  } else {
                    setError(res.error || 'Failed to apply markup');
                  }
                } finally {
                  setMarkupApplying(false);
                }
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border border-outline-variant hover:bg-surface-container-high disabled:opacity-60"
            >
              {markupApplying ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
              Apply to all products
            </button>
          </div>
          {errors.productMarkupPercent && (
            <span className="text-xs text-destructive mt-1 block">{errors.productMarkupPercent.message}</span>
          )}
        </div>
      </div>

      <div className="glass-panel rounded-2xl border border-outline-variant/40 p-6 shadow-premium space-y-5">
        <h3 className="text-xs font-bold text-on-surface uppercase tracking-wider">Tax Configuration</h3>
        <label className="flex items-center gap-2 text-xs text-on-surface">
          <input type="checkbox" {...register('isTaxEnabled')} className="rounded border-outline-variant/60" />
          Enable tax on invoices
        </label>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-semibold text-on-surface/80 uppercase tracking-wider mb-1.5">
              Tax Name
            </label>
            <input
              {...register('taxName')}
              className="w-full px-4 py-2.5 bg-surface-container/30 border border-outline-variant/80 rounded-xl text-sm text-on-surface outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-on-surface/80 uppercase tracking-wider mb-1.5">
              Tax Percentage (%)
            </label>
            <input
              type="number"
              step="0.01"
              {...register('taxPercentage', { valueAsNumber: true })}
              className="w-full px-4 py-2.5 bg-surface-container/30 border border-outline-variant/80 rounded-xl text-sm text-on-surface outline-none focus:border-primary"
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-6 text-xs text-on-surface">
          <label className="flex items-center gap-2">
            <input type="checkbox" {...register('appliesToProducts')} className="rounded border-outline-variant/60" />
            Apply to products
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" {...register('appliesToServices')} className="rounded border-outline-variant/60" />
            Apply to services
          </label>
        </div>
      </div>

      <div className="glass-panel rounded-2xl border border-outline-variant/40 p-6 shadow-premium space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-on-surface uppercase tracking-wider">Clinic Branding & PDF</h3>
          {!brandedPdfsAllowed && (
            <span className="text-[9px] font-bold text-amber-500 uppercase tracking-wider">
              Branded PDFs not enabled by platform
            </span>
          )}
        </div>
        <p className="text-[11px] text-on-surface-variant/70 leading-relaxed">
          These details appear on invoice and prescription PDFs. Branded PDFs must be enabled for
          your clinic by the {PRODUCT_NAME} platform team before custom branding renders on documents.
        </p>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-semibold text-on-surface/80 uppercase tracking-wider mb-1.5">
              Clinic Logo
            </label>
            {logoPreview && (
              <img
                src={logoPreview}
                alt="Clinic logo preview"
                className="h-12 w-auto mb-2 rounded-lg border border-outline-variant/40 bg-white/10 object-contain"
              />
            )}
            <div className="flex flex-wrap gap-2 mb-2">
              <label className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border border-outline-variant cursor-pointer hover:bg-surface-container-high">
                <Upload className="w-3.5 h-3.5" />
                {logoUploading ? 'Uploading…' : 'Upload file'}
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  className="hidden"
                  disabled={logoUploading}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setLogoUploading(true);
                    setError(null);
                    setInfoMessage(null);
                    try {
                      const fd = new FormData();
                      fd.append('file', file);
                      const res = await uploadClinicLogoAction(fd);
                      if (res.success) {
                        const bust = Date.now();
                        setLogoPreview(clinicLogoApiUrl(bust));
                        setValue('clinicLogoUrl', res.storagePath);
                        setSuccess(true);
                        setInfoMessage('Logo uploaded. It will appear in the dashboard header.');
                        router.refresh();
                      } else {
                        setError(res.error || 'Logo upload failed');
                      }
                    } catch (err: unknown) {
                      setError(err instanceof Error ? err.message : 'Logo upload failed');
                    } finally {
                      setLogoUploading(false);
                      e.target.value = '';
                    }
                  }}
                />
              </label>
            </div>
            <label className="block text-[10px] font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">
              Or paste logo URL
            </label>
            <input
              {...register('clinicLogoUrl')}
              placeholder="https://example.com/logo.png or leave blank after upload"
              onBlur={(e) => {
                const val = e.target.value.trim();
                if (!val) {
                  setLogoUrlHint(null);
                  setLogoPreview(null);
                  return;
                }
                if (!isValidLogoPasteUrl(val)) {
                  setLogoUrlHint('Use a direct image URL (https://…). Share links from Google Drive will not work.');
                  setLogoPreview(null);
                  return;
                }
                setLogoUrlHint(null);
                setLogoPreview(val);
              }}
              className="w-full px-4 py-2.5 bg-surface-container/30 border border-outline-variant/80 rounded-xl text-sm text-on-surface outline-none focus:border-primary"
            />
            {logoUrlHint && (
              <span className="text-xs text-amber-500 mt-1 block">{logoUrlHint}</span>
            )}
            {clinicLogoUrlValue && isStorageLogoPath(clinicLogoUrlValue) && (
              <p className="text-[10px] text-on-surface-variant mt-1">Stored in clinic storage. Upload replaces this file.</p>
            )}
            {errors.clinicLogoUrl && (
              <span className="text-xs text-destructive mt-1 block">{errors.clinicLogoUrl.message}</span>
            )}
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-on-surface/80 uppercase tracking-wider mb-1.5">
              Clinic Phone
            </label>
            <input
              {...register('clinicPhone')}
              className="w-full px-4 py-2.5 bg-surface-container/30 border border-outline-variant/80 rounded-xl text-sm text-on-surface outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-on-surface/80 uppercase tracking-wider mb-1.5">
              Clinic Email
            </label>
            <input
              {...register('clinicEmail')}
              className="w-full px-4 py-2.5 bg-surface-container/30 border border-outline-variant/80 rounded-xl text-sm text-on-surface outline-none focus:border-primary"
            />
            {errors.clinicEmail && (
              <span className="text-xs text-destructive mt-1 block">{errors.clinicEmail.message}</span>
            )}
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-on-surface/80 uppercase tracking-wider mb-1.5">
              PDF Accent Color
            </label>
            <input
              {...register('pdfAccentColor')}
              placeholder="#0b132b"
              className="w-full px-4 py-2.5 bg-surface-container/30 border border-outline-variant/80 rounded-xl text-sm text-on-surface outline-none focus:border-primary"
            />
            {errors.pdfAccentColor && (
              <span className="text-xs text-destructive mt-1 block">{errors.pdfAccentColor.message}</span>
            )}
          </div>
        </div>
        <div>
          <label className="block text-[10px] font-semibold text-on-surface/80 uppercase tracking-wider mb-1.5">
            Clinic Address
          </label>
          <input
            {...register('clinicAddress')}
            className="w-full px-4 py-2.5 bg-surface-container/30 border border-outline-variant/80 rounded-xl text-sm text-on-surface outline-none focus:border-primary"
          />
        </div>
        <div>
          <label className="block text-[10px] font-semibold text-on-surface/80 uppercase tracking-wider mb-1.5">
            PDF Footer Text
          </label>
          <input
            {...register('pdfFooterText')}
            placeholder="e.g. Thank you for trusting us with your pet's care."
            className="w-full px-4 py-2.5 bg-surface-container/30 border border-outline-variant/80 rounded-xl text-sm text-on-surface outline-none focus:border-primary"
          />
        </div>
        <label className="flex items-center gap-2 text-xs text-on-surface">
          <input
            type="checkbox"
            {...register('pdfBrandingEnabled')}
            disabled={!brandedPdfsAllowed}
            className="rounded border-outline-variant/60 disabled:opacity-50"
          />
          Use clinic branding on PDF documents
        </label>
      </div>

      <div className="glass-panel rounded-2xl border border-outline-variant/40 p-6 shadow-premium space-y-5">
        <div>
          <h3 className="text-xs font-bold text-on-surface uppercase tracking-wider">
            Dashboard notifications
          </h3>
          <p className="text-[11px] text-on-surface-variant mt-1">
            Control which alerts appear in the notification bell and top status bars.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          {(
            [
              ['notifyCheckout', 'Ready for checkout (green bar)'],
              ['notifyAssignedToMe', 'Patient assigned / waiting for you (blue bar)'],
              ['notifyAssignedInClinic', 'Assigned consultations in clinic'],
              ['notifyUnpaidInvoice', 'Unpaid invoices'],
              ['notifyLowStock', 'Low stock alerts'],
              ['notifyEmergencyQueue', 'Emergency queue'],
              ['notifyStaffChatMessage', 'Staff chat messages'],
              ['notifyStaffTaskUpdate', 'Staff task updates'],
            ] as const
          ).map(([name, label]) => (
            <label
              key={name}
              className="flex items-start gap-2.5 text-xs text-on-surface p-3 rounded-xl bg-surface-container/30 border border-outline-variant/40"
            >
              <input
                type="checkbox"
                {...register(name)}
                className="mt-0.5 rounded border-outline-variant/60"
              />
              <span>{label}</span>
            </label>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="bg-primary hover:bg-primary/95 text-white px-5 py-2.5 rounded-xl text-xs font-semibold shadow-sm flex items-center gap-2 transition-all disabled:opacity-75"
      >
        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        Save Settings
      </button>
    </form>
  );
}

