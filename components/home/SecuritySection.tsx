'use client';

import Image from 'next/image';
import {
  Cloud,
  Headphones,
  Lock,
  RefreshCw,
  Shield,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { useRef } from 'react';
import { SECURITY_TRUST } from '@/lib/home-data';
import { useScrollReveal } from '@/lib/hooks/useScrollReveal';
import { cn } from '@/lib/utils';

const FEATURE_ICONS = [Shield, Cloud, Users, RefreshCw, ShieldCheck, Lock];

export default function SecuritySection() {
  const sectionRef = useRef<HTMLElement>(null);
  useScrollReveal(sectionRef, { selector: '[data-security-fade]', staggerMs: 65, y: 18 });

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
            <span className="bg-gradient-to-r from-[#22D3EE] to-[#8B5CF6] bg-clip-text text-transparent">
              {SECURITY_TRUST.headline[0]}
            </span>{' '}
            {SECURITY_TRUST.headline[1]}
          </h2>
          <p className="phx-subtext text-lg" data-security-fade>
            {SECURITY_TRUST.subheadline}
          </p>
        </div>

        <div className="grid lg:grid-cols-[1fr_auto_1fr] gap-6 items-center mb-10" data-security-fade>
          <div className="space-y-4">
            {left.map((feat, i) => (
              <SecurityCard key={feat.id} feat={feat} icon={FEATURE_ICONS[i]} align="right" />
            ))}
          </div>

          <div className="flex flex-col items-center text-center px-6 py-8">
            <div className="relative w-28 h-28 mb-3">
              <div aria-hidden className="absolute inset-0 rounded-full border-2 border-dashed border-[#8B5CF6]/40" />
              <Image src="/phoenix-logo.png" alt="Phoenix OS" fill className="object-contain p-3" />
            </div>
            <p className="text-sm font-bold text-[#F8FAFC]">PHOENIX OS</p>
            <p className="text-[10px] text-[#8B5CF6] mt-1">Secure. Reliable. Always.</p>
          </div>

          <div className="space-y-4">
            {right.map((feat, i) => (
              <SecurityCard key={feat.id} feat={feat} icon={FEATURE_ICONS[i + 3]} align="left" />
            ))}
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-3 mb-8" data-security-fade>
          <p className="w-full text-center text-[10px] font-mono uppercase tracking-wider text-[#64748B] mb-2">
            Built to Meet Global Standards
          </p>
          {SECURITY_TRUST.compliance.map((badge) => (
            <span
              key={badge}
              className="px-3 py-1.5 rounded-full border border-white/10 bg-white/[0.03] text-[10px] text-[#94A3B8]"
            >
              {badge}
            </span>
          ))}
        </div>

        <div
          className="rounded-2xl border border-white/10 bg-[#0B1020]/80 p-5 sm:p-6 grid lg:grid-cols-[1fr_2fr] gap-6 items-center"
          data-security-fade
        >
          <div className="flex items-start gap-4">
            <span className="w-12 h-12 rounded-xl bg-[#8B5CF6]/15 border border-[#8B5CF6]/30 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6 text-[#C4B5FD]" />
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
                  <Icon className="w-4 h-4 text-[#8B5CF6] mb-2" />
                  <p className="text-[11px] font-semibold text-[#F8FAFC]">{item.label}</p>
                  <p className="text-[10px] text-[#64748B] mt-0.5">{item.description}</p>
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
}: {
  feat: (typeof SECURITY_TRUST.features)[number];
  icon: typeof Shield;
  align: 'left' | 'right';
}) {
  return (
    <div className={cn('rounded-xl border border-white/10 bg-[#0B1020]/80 p-4', align === 'right' && 'lg:text-right lg:ml-auto lg:max-w-sm', align === 'left' && 'lg:max-w-sm')}>
      <div className={cn('flex items-center gap-2 mb-2', align === 'right' && 'lg:flex-row-reverse')}>
        <span className="w-8 h-8 rounded-lg bg-[#8B5CF6]/10 border border-[#8B5CF6]/25 flex items-center justify-center shrink-0">
          <Icon className="w-4 h-4 text-[#C4B5FD]" />
        </span>
        <p className="text-[11px] font-semibold text-[#93C5FD]">{feat.title}</p>
      </div>
      <p className="text-[10px] text-[#64748B] leading-relaxed">{feat.description}</p>
    </div>
  );
}
