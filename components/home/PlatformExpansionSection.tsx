'use client';

import Image from 'next/image';
import {
  Bell,
  Calendar,
  Cloud,
  FileText,
  HeartPulse,
  Shield,
  Smile,
  Sparkles,
  Stethoscope,
  Users,
} from 'lucide-react';
import { useRef } from 'react';
import { GradientPillButton, OutlinedPillButton } from '@/components/home/marketing-visuals/shared';
import { CLINIC_TYPES, PLATFORM_EXPANSION } from '@/lib/home-data';
import { useScrollReveal } from '@/lib/hooks/useScrollReveal';
import { cn } from '@/lib/utils';

const ICONS = {
  vet: Stethoscope,
  dental: Smile,
  general: HeartPulse,
  specialty: Sparkles,
} as const;

const TONE_STYLES = {
  cyan: { border: 'border-[#22D3EE]/50', glow: 'shadow-[0_0_32px_rgba(34,211,238,0.15)]', badge: 'text-[#22D3EE] bg-[#22D3EE]/10 border-[#22D3EE]/30', accent: '#22D3EE', ctaTone: 'cyan' as const },
  purple: { border: 'border-[#8B5CF6]/40', glow: '', badge: 'text-[#C4B5FD] bg-[#8B5CF6]/10 border-[#8B5CF6]/30', accent: '#8B5CF6', ctaTone: 'purple' as const },
  blue: { border: 'border-[#3B82F6]/40', glow: '', badge: 'text-[#93C5FD] bg-[#3B82F6]/10 border-[#3B82F6]/30', accent: '#3B82F6', ctaTone: 'blue' as const },
  orange: { border: 'border-[#F97316]/40', glow: '', badge: 'text-[#FDBA74] bg-[#F97316]/10 border-[#F97316]/30', accent: '#F97316', ctaTone: 'orange' as const },
};

const TRUST_ICONS = [Shield, Cloud, Shield, Users];

const OTHER_CLINIC_ICONS = [
  [Calendar, FileText, Sparkles],
  [HeartPulse, Bell, FileText],
  [Sparkles, Stethoscope, Users],
];

export default function PlatformExpansionSection() {
  const sectionRef = useRef<HTMLElement>(null);
  useScrollReveal(sectionRef, { selector: '[data-platform-fade]', staggerMs: 80, y: 18 });

  return (
    <section ref={sectionRef} id="roadmap" className="phx-section relative overflow-hidden">
      <div aria-hidden className="phx-section-divider" />
      <div className="phx-container">
        <div className="grid lg:grid-cols-[1fr_auto] gap-8 items-start mb-10">
          <div className="phx-section-header max-w-2xl">
            <span
              className="inline-flex items-center px-4 py-1.5 rounded-full border border-[#22D3EE]/30 bg-[#22D3EE]/10 text-[#22D3EE] text-[11px] font-mono uppercase tracking-[0.2em] mb-6"
              data-platform-fade
            >
              {PLATFORM_EXPANSION.eyebrow}
            </span>
            <h2 className="phx-heading text-3xl sm:text-4xl lg:text-5xl" data-platform-fade>
              {PLATFORM_EXPANSION.headline[0]}{' '}
              {PLATFORM_EXPANSION.headline[1]}{' '}
              <span className="bg-gradient-to-r from-[#22D3EE] to-[#8B5CF6] bg-clip-text text-transparent">
                {PLATFORM_EXPANSION.headline[2]}
              </span>
            </h2>
            <p className="phx-subtext text-lg max-w-xl" data-platform-fade>
              {PLATFORM_EXPANSION.subheadline}
            </p>
          </div>
          <div className="relative w-36 h-36 shrink-0 hidden lg:block" data-platform-fade>
            <div
              aria-hidden
              className="pointer-events-none absolute left-1/2 top-1/2 w-[90%] h-[90%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(34,211,238,0.22)_0%,transparent_70%)]"
            />
            <div aria-hidden className="absolute inset-0 rounded-full border border-dashed border-[#22D3EE]/40 animate-spin" style={{ animationDuration: '24s' }} />
            <div aria-hidden className="absolute inset-3 rounded-full border border-[#8B5CF6]/25" />
            <div aria-hidden className="absolute inset-6 rounded-full border border-[#F97316]/15" />
            <Image src="/phoenix-logo.png" alt="" fill className="object-contain p-5 object-[center_52%]" />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-10 items-stretch" data-platform-fade>
          {CLINIC_TYPES.map((clinic, clinicIndex) => {
            const Icon = ICONS[clinic.id];
            const styles = TONE_STYLES[clinic.tone];
            const isLive = clinic.status === 'Live Now';
            const isComing = clinic.statusBadge.includes('COMING');

            return (
              <article
                key={clinic.id}
                className={cn(
                  'rounded-2xl border bg-[#0B1020]/80 p-5 flex flex-col h-full min-h-[360px]',
                  styles.border,
                  isLive && styles.glow,
                )}
              >
                <div className="flex items-center gap-2 mb-3">
                  <span
                    className="w-9 h-9 rounded-lg border flex items-center justify-center"
                    style={{ borderColor: `${styles.accent}40`, backgroundColor: `${styles.accent}14` }}
                  >
                    <Icon size={18} style={{ color: styles.accent }} />
                  </span>
                  <span className={cn('text-[9px] font-mono uppercase px-2 py-0.5 rounded-full border', styles.badge)}>
                    ● {clinic.statusBadge}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-[#F8FAFC] mb-2">{clinic.title}</h3>
                <p className="text-sm text-[#64748B] leading-relaxed mb-4">{clinic.description}</p>

                {clinic.id === 'vet' ? (
                  <ul className="grid grid-cols-2 gap-x-3 gap-y-1.5 flex-1">
                    {clinic.details.map((detail, i) => (
                      <li key={detail} className="flex items-start gap-1.5 text-[10px] text-[#94A3B8]">
                        <span className="text-[#22D3EE] mt-0.5 shrink-0">✓</span>
                        <span className="leading-snug">{detail}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <ul className="space-y-2 flex-1">
                    {clinic.details.map((detail, i) => {
                      const rowIcons = OTHER_CLINIC_ICONS[clinicIndex - 1] ?? OTHER_CLINIC_ICONS[0];
                      const FeatIcon = rowIcons[i % rowIcons.length];
                      return (
                        <li key={detail} className="flex items-start gap-2 text-[11px] text-[#94A3B8]">
                          <FeatIcon className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: styles.accent }} />
                          {detail}
                        </li>
                      );
                    })}
                  </ul>
                )}

                <div className="mt-4">
                  <OutlinedPillButton href="/request-access" tone={styles.ctaTone}>
                    {isLive && '→ '}
                    {isComing && '🔔 '}
                    {clinic.cta}
                    {!isComing && ' →'}
                  </OutlinedPillButton>
                </div>
              </article>
            );
          })}
        </div>

        <div className="relative mb-10 hidden sm:block px-2 lg:px-4" data-platform-fade>
          <div className="grid grid-cols-4 gap-4">
            {PLATFORM_EXPANSION.timeline.map((node, i) => {
              const colors = ['#22D3EE', '#8B5CF6', '#3B82F6', '#F97316'];
              return (
                <div key={node.clinic} className="text-center flex flex-col items-center relative">
                  <p className="text-[10px] font-mono uppercase tracking-wide text-[#94A3B8] mb-3 min-h-[20px] flex items-end justify-center leading-none">
                    {node.label}
                  </p>
                  <div className="relative w-full flex items-center justify-center h-4 mb-3">
                    {i === 0 && (
                      <div
                        aria-hidden
                        className="absolute left-1/2 right-[-50%] top-1/2 -translate-y-1/2 h-0.5 bg-gradient-to-r from-[#22D3EE] via-[#8B5CF6] to-[#3B82F6]"
                      />
                    )}
                    {i === 1 && (
                      <div
                        aria-hidden
                        className="absolute left-[-50%] right-[-50%] top-1/2 -translate-y-1/2 h-0.5 bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6]"
                      />
                    )}
                    {i === 2 && (
                      <div
                        aria-hidden
                        className="absolute left-[-50%] right-[-50%] top-1/2 -translate-y-1/2 h-0.5 bg-gradient-to-r from-[#3B82F6] to-[#F97316]"
                      />
                    )}
                    {i === 3 && (
                      <>
                        <div
                          aria-hidden
                          className="absolute left-[-50%] right-1/2 top-1/2 -translate-y-1/2 h-0.5 bg-[#F97316]"
                        />
                        <div
                          aria-hidden
                          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 w-0 h-0 border-t-[5px] border-b-[5px] border-l-[9px] border-t-transparent border-b-transparent border-l-[#F97316]"
                        />
                      </>
                    )}
                    <span
                      className="relative z-10 inline-block w-4 h-4 rounded-full ring-4 ring-[#030712] shadow-[0_0_20px_currentColor]"
                      style={{ backgroundColor: colors[i], color: colors[i] }}
                    />
                  </div>
                  <p className="text-xs font-semibold text-[#F8FAFC]">{node.clinic}</p>
                  <p className="text-[10px] text-[#94A3B8] mt-1">{node.note}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div
          className="rounded-2xl border border-white/10 bg-[#0B1020]/80 p-5 sm:p-6 flex flex-col lg:flex-row gap-6 items-stretch lg:items-center justify-between w-full"
          data-platform-fade
        >
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 flex-1 lg:flex-[1_1_auto]">
            {PLATFORM_EXPANSION.trustBar.map((item, i) => {
              const Icon = TRUST_ICONS[i];
              return (
                <div key={item.label} className="flex items-start gap-2">
                  <Icon className="w-4 h-4 text-[#22D3EE] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[11px] font-semibold text-[#F8FAFC]">{item.label}</p>
                    <p className="text-[10px] text-[#64748B] mt-0.5">{item.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
          <GradientPillButton href="/request-access">
            {PLATFORM_EXPANSION.cta} →
          </GradientPillButton>
        </div>
      </div>
    </section>
  );
}
