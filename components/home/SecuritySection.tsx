'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  Cloud,
  FileCheck,
  Globe,
  Headphones,
  Lock,
  RefreshCw,
  Shield,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { useRef, useState } from 'react';
import { motionSpring } from '@/components/home/marketing-visuals/animations';
import { HubConnectorOverlay } from '@/components/home/marketing-visuals/shared';
import { SECURITY_TRUST } from '@/lib/home-data';
import { useScrollReveal } from '@/lib/hooks/useScrollReveal';
import { cn } from '@/lib/utils';

const FEATURE_ICONS = [Shield, Cloud, Users, RefreshCw, ShieldCheck, Lock];

const COMPLIANCE_ICONS = [ShieldCheck, Globe, Lock, FileCheck, Shield];
const COMPLIANCE_TONES = [
  'border-[#8B5CF6]/40 bg-[#8B5CF6]/10 text-[#C4B5FD] shadow-[0_0_16px_rgba(139,92,246,0.15)]',
  'border-[#3B82F6]/40 bg-[#3B82F6]/10 text-[#93C5FD] shadow-[0_0_16px_rgba(59,130,246,0.15)]',
  'border-[#22D3EE]/40 bg-[#22D3EE]/10 text-[#67E8F9] shadow-[0_0_16px_rgba(34,211,238,0.15)]',
  'border-[#22C55E]/40 bg-[#22C55E]/10 text-[#86EFAC] shadow-[0_0_16px_rgba(34,197,94,0.15)]',
  'border-[#F97316]/40 bg-[#F97316]/10 text-[#FDBA74] shadow-[0_0_16px_rgba(249,115,22,0.15)]',
];

export default function SecuritySection() {
  const sectionRef = useRef<HTMLElement>(null);
  const hubContainerRef = useRef<HTMLDivElement>(null);
  const hubRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLElement | null)[]>([]);
  const [hubRevealed, setHubRevealed] = useState(false);

  useScrollReveal(sectionRef, {
    selector: '[data-security-fade], [data-security-card], [data-security-compliance]',
    staggerMs: 70,
    y: 16,
    onReveal: () => setHubRevealed(true),
  });

  const left = SECURITY_TRUST.features.filter((f) => f.side === 'left');
  const right = SECURITY_TRUST.features.filter((f) => f.side === 'right');

  return (
    <section ref={sectionRef} id="security" className="phx-section phx-section-alt relative overflow-hidden">
      <div aria-hidden className="phx-section-divider" />
      <div className="phx-container">
        <div className="text-center max-w-3xl mx-auto phx-section-header mb-12">
          <span
            className="inline-flex items-center px-4 py-1.5 rounded-full border border-[#8B5CF6]/30 bg-[#8B5CF6]/10 text-[#C4B5FD] text-[11px] font-mono uppercase tracking-[0.2em] mb-6"
            data-security-fade
          >
            {SECURITY_TRUST.eyebrow}
          </span>
          <h2 className="phx-heading text-3xl sm:text-4xl lg:text-5xl mb-4" data-security-fade>
            <span className="bg-gradient-to-r from-[#22D3EE] to-[#3B82F6] bg-clip-text text-transparent">
              Security
            </span>{' '}
            You Can Count On.{' '}
            <span className="bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] bg-clip-text text-transparent">
              Trust
            </span>{' '}
            You Can Feel.
          </h2>
          <p className="phx-subtext text-lg" data-security-fade>
            {SECURITY_TRUST.subheadline}
          </p>
        </div>

        <div ref={hubContainerRef} className="relative mb-12">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -m-8 bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.1)_0%,transparent_65%)]"
          />
          <HubConnectorOverlay
            containerRef={hubContainerRef}
            hubRef={hubRef}
            cardRefs={cardRefs}
            anchor="edge"
            revealed={hubRevealed}
          />
          <div className="grid lg:grid-cols-[1fr_auto_1fr] gap-6 lg:gap-10 items-center relative z-10">
            <div className="space-y-4">
              {left.map((feat, i) => (
                <SecurityCard
                  key={feat.id}
                  feat={feat}
                  icon={FEATURE_ICONS[i]}
                  align="right"
                  cardRef={(el) => {
                    cardRefs.current[i] = el;
                  }}
                />
              ))}
            </div>

            <div className="flex flex-col items-center text-center px-4 py-6" data-security-fade>
              <motion.div
                ref={hubRef}
                initial={{ scale: 0.94, opacity: 0.85 }}
                animate={hubRevealed ? { scale: 1, opacity: 1 } : undefined}
                transition={motionSpring}
                className="relative w-44 h-44 xl:w-52 xl:h-52 mb-2 phx-animate-hub-pulse rounded-full"
              >
                <div
                  aria-hidden
                  className="absolute inset-0 rounded-full border-2 border-dashed border-[#8B5CF6]/45"
                />
                <div
                  aria-hidden
                  className="absolute inset-1 rounded-full p-[2px] bg-gradient-to-br from-[#8B5CF6]/60 via-[#6366F1]/40 to-[#3B82F6]/60"
                >
                  <div className="w-full h-full rounded-full bg-[#030712]/90" />
                </div>
                <Image
                  src="/phoenix-logo.png"
                  alt="Phoenix OS"
                  fill
                  className="object-contain p-4 xl:p-5 object-[center_52%]"
                />
              </motion.div>
              <p className="text-sm font-bold text-[#F8FAFC] tracking-wide">PHOENIX OS</p>
              <p className="text-xs mt-1 font-medium bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] bg-clip-text text-transparent">
                Secure. Reliable. Always.
              </p>
            </div>

            <div className="space-y-4">
              {right.map((feat, i) => (
                <SecurityCard
                  key={feat.id}
                  feat={feat}
                  icon={FEATURE_ICONS[i + 3]}
                  align="left"
                  cardRef={(el) => {
                    cardRefs.current[i + 3] = el;
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="mb-10" data-security-fade>
          <p className="text-center text-xs font-mono uppercase tracking-[0.2em] text-[#94A3B8] mb-4">
            Built to Meet Global Standards
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {SECURITY_TRUST.compliance.map((badge, i) => {
              const Icon = COMPLIANCE_ICONS[i];
              return (
                <span
                  key={badge}
                  data-security-compliance
                  className={cn(
                    'inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border text-xs font-medium leading-none transition-transform hover:scale-[1.03]',
                    COMPLIANCE_TONES[i],
                  )}
                >
                  <Icon className="w-3 h-3 shrink-0" />
                  {badge}
                </span>
              );
            })}
          </div>
        </div>

        <div
          className="rounded-2xl border border-white/10 bg-[#0B1020]/80 p-5 sm:p-6 grid lg:grid-cols-[minmax(0,1fr)_minmax(0,2.2fr)] gap-6 items-center shadow-[0_12px_40px_rgba(0,0,0,0.25)]"
          data-security-fade
        >
          <div className="flex items-start gap-4">
            <span className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#8B5CF6] to-[#6366F1] flex items-center justify-center shrink-0 shadow-[0_0_24px_rgba(139,92,246,0.25)]">
              <ShieldCheck className="w-6 h-6 text-white" />
            </span>
            <div>
              <p className="text-base font-semibold text-[#F8FAFC]">{SECURITY_TRUST.summary.headline}</p>
              <p className="text-sm text-[#64748B] mt-1">{SECURITY_TRUST.summary.sub}</p>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {SECURITY_TRUST.summary.items.map((item, i) => {
              const icons = [Lock, Cloud, Headphones, Shield];
              const Icon = icons[i];
              return (
                <div key={item.label}>
                  <Icon className="w-4 h-4 text-[#22D3EE] mb-2 drop-shadow-[0_0_6px_rgba(34,211,238,0.35)]" />
                  <p className="text-sm font-semibold text-[#F8FAFC]">{item.label}</p>
                  <p className="text-xs text-[#CBD5E1] mt-0.5 leading-snug">{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function SecurityCard({
  feat,
  icon: Icon,
  align,
  cardRef,
}: {
  feat: (typeof SECURITY_TRUST.features)[number];
  icon: typeof Shield;
  align: 'left' | 'right';
  cardRef?: (el: HTMLDivElement | null) => void;
}) {
  return (
    <div
      ref={cardRef}
      data-security-card
      className={cn(
        'rounded-xl border border-white/10 bg-[#0B1020]/85 backdrop-blur-sm p-4 transition-[transform,border-color,box-shadow] duration-300 hover:-translate-y-1 hover:border-[#8B5CF6]/35 hover:shadow-[0_0_28px_rgba(139,92,246,0.12)]',
        align === 'right' && 'lg:text-right lg:ml-auto lg:max-w-[320px]',
        align === 'left' && 'lg:max-w-[320px]',
      )}
    >
      <div className={cn('flex items-start gap-2.5 mb-2', align === 'right' && 'lg:flex-row-reverse')}>
        <span className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#8B5CF6] to-[#6366F1] flex items-center justify-center shrink-0 shadow-[0_0_16px_rgba(139,92,246,0.2)]">
          <Icon className="w-4 h-4 text-white" />
        </span>
        <p className="text-base font-semibold text-[#F8FAFC] pt-1.5 leading-snug">{feat.title}</p>
      </div>
      <p className={cn('text-sm text-[#CBD5E1] leading-relaxed', align === 'right' && 'lg:text-right')}>
        {feat.description}
      </p>
    </div>
  );
}
