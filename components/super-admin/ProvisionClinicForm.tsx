'use client';

import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { ProvisionClinicSchema, type ProvisionClinicInput } from '@/lib/validations/auth';
import { provisionClinicAction } from '@/lib/services/super-admin-actions';
import type { PlanOption } from '@/components/forms/SubscriptionForm';
import {
  ALL_FEATURES,
  OPT_IN_FEATURES,
  FEATURE_LABELS,
  type Feature,
} from '@/lib/auth/features';
import { Loader2, Building2, CheckCircle2 } from 'lucide-react';
import Select from '@/components/ui/premium/Select';

interface ClinicTypeOption {
  id: string;
  label: string;
}

interface Props {
  clinicTypes: ClinicTypeOption[];
  plans: PlanOption[];
}

const inputCls =
  'w-full px-3 py-2.5 bg-surface/30 border border-outline-variant/85 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl outline-none text-sm text-on-surface';
const labelCls =
  'block text-[10px] font-semibold text-on-surface/80 uppercase tracking-wider mb-1.5';

function featuresFromPlan(plan: PlanOption | undefined): Record<Feature, boolean> {
  const out = {} as Record<Feature, boolean>;
  for (const f of ALL_FEATURES) {
    out[f] = plan?.default_features?.[f] !== false;
  }
  for (const f of OPT_IN_FEATURES) {
    out[f] = plan?.default_features?.[f] === true;
  }
  return out;
}

export default function ProvisionClinicForm({ clinicTypes, plans }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [featureState, setFeatureState] = useState<Record<Feature, boolean>>(() =>
    featuresFromPlan(plans.find((p) => p.id === 'trial') || plans[0])
  );

  const defaultPlanId = (plans.find((p) => p.id === 'trial')?.id ||
    plans[0]?.id ||
    'trial') as ProvisionClinicInput['planId'];

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProvisionClinicInput>({
    resolver: zodResolver(ProvisionClinicSchema),
    defaultValues: { clinicTypeId: 'vet', planId: defaultPlanId },
  });

  const orgName = watch('orgName');
  const clinicTypeId = watch('clinicTypeId');
  const planId = watch('planId');

  const selectedPlan = useMemo(
    () => plans.find((p) => p.id === planId) || plans[0],
    [plans, planId]
  );

  useEffect(() => {
    setFeatureState(featuresFromPlan(selectedPlan));
  }, [selectedPlan]);

  const autoSlug = () => {
    if (orgName) {
      setValue(
        'orgSlug',
        orgName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
        { shouldValidate: true }
      );
    }
  };

  const onSubmit = async (data: ProvisionClinicInput) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await provisionClinicAction({
        ...data,
        features: featureState,
      });
      if (res.success && res.organizationId) {
        setSuccess(true);
        setTimeout(() => {
          router.push(`/super-admin/organizations/${res.organizationId}`);
          router.refresh();
        }, 1200);
      } else if (res.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/super-admin/organizations');
          router.refresh();
        }, 1200);
      } else {
        setError(res.error || 'Failed to provision clinic.');
        setIsLoading(false);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="glass-panel border border-outline-variant/40 p-8 text-center rounded-2xl">
        <div className="w-14 h-14 bg-emerald-500/10 flex items-center justify-center rounded-full mx-auto mb-4">
          <CheckCircle2 className="w-7 h-7 text-emerald-600" />
        </div>
        <h3 className="text-lg font-bold text-on-surface">Clinic provisioned</h3>
        <p className="text-sm text-on-surface-variant/70 mt-2">
          Opening clinic detail so you can review plan and features…
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="glass-panel border border-outline-variant/40 p-6 md:p-8 rounded-2xl space-y-8"
    >
      {error && (
        <div className="p-4 bg-destructive/5 border border-destructive/20 text-destructive text-sm rounded-2xl">
          {error}
        </div>
      )}

      <section className="space-y-4">
        <h3 className="text-sm font-bold text-on-surface uppercase tracking-wider flex items-center gap-1.5">
          <Building2 className="w-4 h-4 text-primary" />
          Clinic tenant
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Clinic name</label>
            <input {...register('orgName')} className={inputCls} placeholder="e.g. VetCare Center" />
            {errors.orgName && <span className="text-xs text-destructive mt-1 block">{errors.orgName.message}</span>}
          </div>
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-[10px] font-semibold text-on-surface/80 uppercase tracking-wider">Web slug</label>
              <button type="button" onClick={autoSlug} className="text-[10px] text-primary font-semibold hover:underline">
                Auto-fill
              </button>
            </div>
            <input {...register('orgSlug')} className={inputCls} placeholder="e.g. vetcare-center" />
            {errors.orgSlug && <span className="text-xs text-destructive mt-1 block">{errors.orgSlug.message}</span>}
          </div>
          <div className="md:col-span-2">
            <label className={labelCls}>Clinic type</label>
            <Select
              value={clinicTypeId}
              onChange={(v) => setValue('clinicTypeId', v, { shouldValidate: true })}
              options={clinicTypes.map((t) => ({ value: t.id, label: t.label }))}
            />
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-bold text-on-surface uppercase tracking-wider">Plan</h3>
        <p className="text-xs text-on-surface-variant">
          Choose a plan. Included features load below — adjust before provisioning.
        </p>
        <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-3">
          {plans.map((plan) => {
            const selected = planId === plan.id;
            const included = ALL_FEATURES.filter((f) => plan.default_features?.[f] !== false).slice(0, 4);
            return (
              <button
                key={plan.id}
                type="button"
                onClick={() =>
                  setValue('planId', plan.id as ProvisionClinicInput['planId'], {
                    shouldValidate: true,
                  })
                }
                className={`text-left rounded-2xl border p-4 transition-all ${
                  selected
                    ? 'border-primary bg-primary/10 ring-1 ring-primary'
                    : 'border-outline-variant/50 bg-surface/20 hover:border-primary/40'
                }`}
              >
                <p className="text-sm font-bold text-on-surface">{plan.name}</p>
                <p className="text-lg font-bold text-primary mt-1">
                  {plan.price > 0 ? `$${plan.price}` : 'Free'}
                  {plan.price > 0 && (
                    <span className="text-[10px] font-semibold text-on-surface-variant">/mo</span>
                  )}
                </p>
                <ul className="mt-3 space-y-1">
                  {included.map((f) => (
                    <li key={f} className="text-[10px] text-on-surface-variant truncate">
                      {FEATURE_LABELS[f]}
                    </li>
                  ))}
                </ul>
              </button>
            );
          })}
        </div>
        {errors.planId && (
          <span className="text-xs text-destructive block">{errors.planId.message}</span>
        )}
      </section>

      <section className="space-y-4">
        <h3 className="text-sm font-bold text-on-surface uppercase tracking-wider">Features</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
              Plan features
            </p>
            <ul className="space-y-2">
              {ALL_FEATURES.map((feature) => (
                <li key={feature} className="flex items-center justify-between gap-3">
                  <span className="text-xs font-semibold text-on-surface">{FEATURE_LABELS[feature]}</span>
                  <button
                    type="button"
                    onClick={() =>
                      setFeatureState((prev) => ({ ...prev, [feature]: !prev[feature] }))
                    }
                    className={`shrink-0 w-9 h-5 rounded-full p-0.5 transition-colors ${
                      featureState[feature] ? 'bg-primary' : 'bg-outline-variant'
                    }`}
                    aria-pressed={featureState[feature]}
                  >
                    <span
                      className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                        featureState[feature] ? 'translate-x-4' : ''
                      }`}
                    />
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-2">
            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
              Add-ons (opt-in)
            </p>
            <ul className="space-y-2">
              {OPT_IN_FEATURES.map((feature) => (
                <li key={feature} className="flex items-center justify-between gap-3">
                  <span className="text-xs font-semibold text-on-surface">{FEATURE_LABELS[feature]}</span>
                  <button
                    type="button"
                    onClick={() =>
                      setFeatureState((prev) => ({ ...prev, [feature]: !prev[feature] }))
                    }
                    className={`shrink-0 w-9 h-5 rounded-full p-0.5 transition-colors ${
                      featureState[feature] ? 'bg-primary' : 'bg-outline-variant'
                    }`}
                    aria-pressed={featureState[feature]}
                  >
                    <span
                      className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                        featureState[feature] ? 'translate-x-4' : ''
                      }`}
                    />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-sm font-bold text-on-surface uppercase tracking-wider">Clinic administrator</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>First name</label>
            <input {...register('firstName')} className={inputCls} placeholder="John" />
            {errors.firstName && <span className="text-xs text-destructive mt-1 block">{errors.firstName.message}</span>}
          </div>
          <div>
            <label className={labelCls}>Last name</label>
            <input {...register('lastName')} className={inputCls} placeholder="Doe" />
            {errors.lastName && <span className="text-xs text-destructive mt-1 block">{errors.lastName.message}</span>}
          </div>
          <div>
            <label className={labelCls}>Admin email</label>
            <input type="email" {...register('email')} className={inputCls} placeholder="admin@vetcare.com" />
            {errors.email && <span className="text-xs text-destructive mt-1 block">{errors.email.message}</span>}
          </div>
          <div>
            <label className={labelCls}>Temporary password</label>
            <input type="password" {...register('password')} className={inputCls} placeholder="Min 6 characters" autoComplete="new-password" />
            {errors.password && <span className="text-xs text-destructive mt-1 block">{errors.password.message}</span>}
          </div>
          <div>
            <label className={labelCls}>Phone (optional)</label>
            <input {...register('phone')} className={inputCls} placeholder="+1 555 123 4567" />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-sm font-bold text-on-surface uppercase tracking-wider">Initial branch</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Branch name</label>
            <input {...register('branchName')} className={inputCls} placeholder="Downtown Branch" />
            {errors.branchName && <span className="text-xs text-destructive mt-1 block">{errors.branchName.message}</span>}
          </div>
          <div>
            <label className={labelCls}>Branch phone</label>
            <input {...register('branchPhone')} className={inputCls} placeholder="+1 555 987 6543" />
            {errors.branchPhone && <span className="text-xs text-destructive mt-1 block">{errors.branchPhone.message}</span>}
          </div>
          <div className="md:col-span-2">
            <label className={labelCls}>Branch address</label>
            <input {...register('branchAddress')} className={inputCls} placeholder="123 Main St, Uptown" />
            {errors.branchAddress && <span className="text-xs text-destructive mt-1 block">{errors.branchAddress.message}</span>}
          </div>
        </div>
      </section>

      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={isLoading}
          className="bg-primary hover:opacity-90 text-white py-3 px-8 rounded-2xl font-bold text-sm shadow-premium flex items-center gap-2 transition-all disabled:opacity-75"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Provisioning…
            </>
          ) : (
            'Provision clinic'
          )}
        </button>
      </div>
    </form>
  );
}
