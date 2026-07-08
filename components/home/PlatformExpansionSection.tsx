'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Cloud, HeartPulse, Shield, Smile, Sparkles, Stethoscope, Users } from 'lucide-react';
import { useRef } from 'react';
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
  cyan: { border: 'border-[#22D3EE]/50', glow: 'shadow-[0_0_32px_rgba(34,211,238,0.15)]', badge: 'text-[#22D3EE] bg-[#22D3EE]/10 border-[#22D3EE]/30', accent: '#22D3EE' },
  purple: { border: 'border-[#8B5CF6]/40', glow: '', badge: 'text-[#C4B5FD] bg-[#8B5CF6]/10 border-[#8B5CF6]/30', accent: '#8B5CF6' },
  blue: { border: 'border-[#3B82F6]/40', glow: '', badge: 'text-[#93C5FD] bg-[#3B82F6]/10 border-[#3B82F6]/30', accent: '#3B82F6' },
  orange: { border: 'border-[#F97316]/40', glow: '', badge: 'text-[#FDBA74] bg-[#F97316]/10 border-[#F97316]/30', accent: '#F97316' },
};

const TRUST_ICONS = [Shield, Cloud, Shield, Users];

export default function PlatformExpansionSection() {
  const sectionRef = useRef<HTMLElement>(null);
  useScrollReveal(sectionRef, { selector: '[data-platform-fade]', staggerMs: 80, y: 18 });

  return (
    <section ref={sectionRef} id="roadmap" className="phx-section relative overflow-hidden">
      <div aria-hidden className="phx-section-divider" />
      <div className="phx-container">
        <div className="grid lg:grid-cols-[1fr_auto] gap-8 items-start mb-10">
          <div className="phx-section-header max-w-2xl">
            <p className="phx-eyebrow" data-platform-fade>
              {PLATFORM_EXPANSION.eyebrow}
            </p>
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
          <div className="relative w-32 h-32 shrink-0 hidden lg:block" data-platform-fade>
            <div aria-hidden className="absolute inset-0 rounded-full border border-dashed border-[#22D3EE]/30 animate-spin" style={{ animationDuration: '24s' }} />
            <div aria-hidden className="absolute inset-3 rounded-full border border-[#8B5CF6]/20" />
            <Image src="/phoenix-logo.png" alt="" fill className="object-contain p-4" />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-10" data-platform-fade>
          {CLINIC_TYPES.map((clinic) => {
            const Icon = ICONS[clinic.id];
            const styles = TONE_STYLES[clinic.tone];
            const isLive = clinic.status === 'Live Now';

            return (
              <article
                key={clinic.id}
                className={cn(
                  'rounded-2xl border bg-[#0B1020]/80 p-5 flex flex-col min-h-[320px]',
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
                <ul className="space-y-1.5 flex-1">
                  {clinic.details.map((detail) => (
                    <li key={detail} className="flex items-start gap-2 text-[11px] text-[#94A3B8]">
                      <span className="text-[#22D3EE] mt-0.5">✓</span>
                      {detail}
                    </li>
                  ))}
                </ul>
                <p className="text-[11px] font-medium mt-4 flex items-center gap-1" style={{ color: styles.accent }}>
                  {isLive ? '→' : clinic.statusBadge.includes('COMING') ? '🔔' : ''} {clinic.cta}
                  {!clinic.statusBadge.includes('COMING') && <ArrowRight className="w-3 h-3" />}
                </p>
              </article>
            );
          })}
        </div>

        <div className="relative mb-10 hidden sm:block" data-platform-fade>
          <div className="absolute top-4 left-[12%] right-[12%] h-px bg-gradient-to-r from-[#22D3EE] via-[#8B5CF6] to-[#F97316]" />
          <div className="grid grid-cols-4 gap-4">
            {PLATFORM_EXPANSION.timeline.map((node, i) => {
              const colors = ['#22D3EE', '#8B5CF6', '#3B82F6', '#F97316'];
              return (
                <div key={node.clinic} className="text-center pt-0">
                  <span
                    className="inline-block w-3 h-3 rounded-full mb-3 ring-4 ring-[#0B1020]"
                    style={{ backgroundColor: colors[i] }}
                  />
                  <p className="text-[10px] font-mono uppercase text-[#64748B]">{node.label}</p>
                  <p className="text-xs font-semibold text-[#F8FAFC] mt-1">{node.clinic}</p>
                  <p className="text-[10px] text-[#64748B]">{node.note}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div
          className="rounded-2xl border border-white/10 bg-[#0B1020]/80 p-5 grid lg:grid-cols-[1fr_auto] gap-6 items-center"
          data-platform-fade
        >
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
          <Link
            href="/request-access"
            className="phx-btn-primary text-sm px-6 py-3 shrink-0 text-center phx-focus-ring bg-gradient-to-r from-[#22D3EE] to-[#8B5CF6]"
          >
            {PLATFORM_EXPANSION.cta} →
          </Link>
        </div>
      </div>
    </section>
  );
}
