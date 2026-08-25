'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { updateOrganizationFeaturesAction } from '@/lib/services/super-admin-actions';
import {
  SUPERADMIN_TOGGLEABLE_FEATURES,
  ALL_FEATURES,
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
  ai_assistant: 'Clinic AI assistant for workflows and drafts.',
  multi_branch: 'Manage and switch between multiple branches.',
  reports: 'Advanced reporting and analytics.',
};

type OrganizationFeatureTogglesProps = {
  organizationId: string;
  initialFeatures: Record<string, boolean> | null;
  /** Grouped layout for detail page; compact is a denser single list. */
  layout?: 'compact' | 'grouped';
};

export default function OrganizationFeatureToggles({
  organizationId,
  initialFeatures,
  layout = 'grouped',
}: OrganizationFeatureTogglesProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [state, setState] = useState<Record<Feature, boolean>>(() => {
    const out = {} as Record<Feature, boolean>;
    for (const f of SUPERADMIN_TOGGLEABLE_FEATURES) {
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

  const renderRow = (feature: Feature) => (
    <li key={feature} className="flex items-start justify-between gap-3 py-1.5">
      <div className="min-w-0">
        <span className="text-xs font-bold text-on-surface block">{FEATURE_LABELS[feature]}</span>
        {FEATURE_DESCRIPTIONS[feature] && (
          <span className="text-[10px] text-on-surface-variant leading-snug block mt-0.5">
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
  );

  if (layout === 'compact') {
    return (
      <div className="w-full space-y-2 text-left">
        <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
          Feature access
        </p>
        <ul className="space-y-1">{SUPERADMIN_TOGGLEABLE_FEATURES.map(renderRow)}</ul>
      </div>
    );
  }

  return (
    <div className="w-full space-y-5 text-left">
      <div>
        <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">
          Plan features
        </p>
        <ul className="divide-y divide-outline-variant/25">{ALL_FEATURES.map(renderRow)}</ul>
      </div>
      <div>
        <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">
          Add-ons
        </p>
        <ul className="divide-y divide-outline-variant/25">{OPT_IN_FEATURES.map(renderRow)}</ul>
      </div>
    </div>
  );
}
