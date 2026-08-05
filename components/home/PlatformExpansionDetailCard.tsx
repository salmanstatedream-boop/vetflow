'use client';

import type { Ref } from 'react';
import { OutlinedPillButton } from '@/components/home/marketing-visuals/shared';
import {
  CLINIC_ICONS,
  TONE_COLORS,
  type ClinicId,
} from '@/components/home/PlatformExpansionOrbitMap';
import { CLINIC_TYPES } from '@/lib/home-data';
import { cn } from '@/lib/utils';

type Props = {
  selectedId: ClinicId;
  onAction: (id: ClinicId) => void;
  cardRef?: Ref<HTMLElement | null>;
  className?: string;
};

export default function PlatformExpansionDetailCard({
  selectedId,
  onAction,
  cardRef,
  className,
}: Props) {
  const clinic = CLINIC_TYPES.find((c) => c.id === selectedId) ?? CLINIC_TYPES[0];
  const Icon = CLINIC_ICONS[clinic.id];
  const color = TONE_COLORS[clinic.tone];
  const isLive = clinic.status === 'Live Now';

  return (
    <article
      ref={cardRef}
      aria-live="polite"
      className={cn(
        'relative flex h-full min-h-[360px] flex-col rounded-[20px] border bg-[#080E1C]/90 p-5 backdrop-blur-md sm:p-7',
        className,
      )}
      style={{
        borderColor: `${color}66`,
        boxShadow: `0 0 0 1px ${color}14, 0 0 48px ${color}18, 0 24px 48px rgba(0,0,0,0.35)`,
      }}
    >
      <span
        aria-hidden
        className="absolute left-0 top-1/2 z-10 hidden h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full lg:block"
        style={{
          backgroundColor: color,
          boxShadow: `0 0 12px ${color}`,
        }}
      />

      <div className="mb-5 flex items-center justify-between gap-3">
        <span
          className="flex h-11 w-11 items-center justify-center rounded-full border"
          style={{
            borderColor: `${color}55`,
            backgroundColor: `${color}16`,
            color,
            boxShadow: `0 0 20px ${color}33`,
          }}
        >
          <Icon className="h-5 w-5" strokeWidth={2.25} />
        </span>
        <span
          className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[9px] font-mono uppercase tracking-wider"
          style={{
            borderColor: `${color}55`,
            backgroundColor: `${color}14`,
            color,
          }}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-current shadow-[0_0_6px_currentColor]" />
          {clinic.statusBadge}
        </span>
      </div>

      <h3 className="mb-2 text-2xl font-bold tracking-tight text-[#F8FAFC]">{clinic.title}</h3>
      <p className="mb-6 text-sm leading-relaxed text-[#94A3B8]">{clinic.description}</p>

      <ul className="mb-6 grid flex-1 grid-cols-1 gap-x-6 gap-y-2.5 sm:grid-cols-2">
        {clinic.details.map((detail) => (
          <li key={detail} className="flex items-start gap-2 text-[12px] text-[#94A3B8]">
            <span
              className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
              style={{ color, backgroundColor: `${color}18` }}
            >
              ✓
            </span>
            <span className="leading-snug">{detail}</span>
          </li>
        ))}
      </ul>

      <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.06] pt-4">
        <div className="flex flex-col gap-0.5">
          <p className="flex items-center gap-2 text-xs text-[#94A3B8]">
            <span
              className={cn('h-2 w-2 rounded-full', isLive && 'bg-[#22C55E]')}
              style={
                isLive
                  ? { boxShadow: '0 0 8px #22C55E' }
                  : { backgroundColor: color, boxShadow: `0 0 8px ${color}` }
              }
            />
            Status: {clinic.statusShort}
          </p>
          {clinic.liveSince ? (
            <p className="pl-4 text-[10px] text-[#64748B]">{clinic.liveSince}</p>
          ) : null}
        </div>

        <OutlinedPillButton onClick={() => onAction(clinic.id)} tone={clinic.tone}>
          {clinic.cta} →
        </OutlinedPillButton>
      </div>
    </article>
  );
}
