'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { updateOrganizationFeaturesAction } from '@/lib/services/super-admin-actions';
import {
  SUPERADMIN_TOGGLEABLE_FEATURES,
  OPT_IN_FEATURES,
  FEATURE_LABELS,
  type Feature,
} from '@/lib/auth/features';

const FEATURE_DESCRIPTIONS: Partial<Record<Feature, string>> = {
  camera_feed: 'Allow clinic administrators to connect and view clinic cameras.',
  social_automation: 'Allow clinic administrators to connect social accounts, generate content and publish posts.',
  staff_tasks: 'Enable staff task management and ticket tracking.',
  staff_chat: 'Enable direct messaging between staff members.',
  branded_pdfs: 'Use clinic branding on PDF documents.',
  consult_tracking: 'Track consultation duration per visit.',
  clinic_benchmarking: 'Compare clinic metrics against industry benchmarks.',
};

type OrganizationFeatureTogglesProps = {
  organizationId: string;
  initialFeatures: Record<string, boolean> | null;
};

export default function OrganizationFeatureToggles({
  organizationId,
  initialFeatures,
}: OrganizationFeatureTogglesProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [state, setState] = useState<Record<Feature, boolean>>(() => {
    const out = {} as Record<Feature, boolean>;
    for (const f of SUPERADMIN_TOGGLEABLE_FEATURES) {
      // Opt-in features default OFF; standard features default ON.
      out[f] = OPT_IN_FEATURES.includes(f)
        ? initialFeatures?.[f] === true
        : initialFeatures?.[f] !== false;
    }
    return out;
  });

  const handleToggle = (feature: Feature) => {
    const next = { ...state, [feature]: !state[feature] };
    setState(next);
    startTransition(async () => {
      const res = await updateOrganizationFeaturesAction({
        organizationId,
        features: next,
      });
      if (res.success) {
        router.refresh();
      } else {
        alert(res.error || 'Failed to update features');
        setState(state);
      }
    });
  };

  return (
    <div className="w-full max-w-xs space-y-2 text-left">
      <p className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider">
        Feature access
      </p>
      <ul className="space-y-3">
        {SUPERADMIN_TOGGLEABLE_FEATURES.map((feature) => (
          <li key={feature} className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <span className="text-[10px] font-bold text-on-surface block">
                {FEATURE_LABELS[feature]}
              </span>
              {FEATURE_DESCRIPTIONS[feature] && (
                <span className="text-[9px] text-on-surface-variant leading-tight block mt-0.5">
                  {FEATURE_DESCRIPTIONS[feature]}
                </span>
              )}
            </div>
            <button
              type="button"
              disabled={isPending}
              onClick={() => handleToggle(feature)}
              className={`shrink-0 w-9 h-5 rounded-full p-0.5 transition-colors ${
                state[feature] ? 'bg-primary' : 'bg-outline-variant'
              }`}
              aria-pressed={state[feature]}
            >
              <span
                className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                  state[feature] ? 'translate-x-4' : ''
                }`}
              />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
