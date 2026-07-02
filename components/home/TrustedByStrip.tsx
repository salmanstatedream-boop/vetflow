'use client';

import { useRef } from 'react';
import { LogoSlider } from '@/components/ui/logo-slider';
import { TRUSTED_MODULES } from '@/lib/home-data';
import { useScrollReveal } from '@/lib/hooks/useScrollReveal';

export default function TrustedByStrip() {
  const sectionRef = useRef<HTMLElement>(null);

  useScrollReveal(sectionRef, { selector: '[data-trusted-fade]', staggerMs: 80 });

  const marks = TRUSTED_MODULES.map((module) => {
    const Icon = module.icon;
    return (
      <div
        key={module.id}
        className="flex items-center gap-2.5 px-2 text-[#94A3B8] select-none cursor-default"
      >
        <span className="w-8 h-8 rounded-lg bg-[#22D3EE]/8 border border-[#22D3EE]/15 flex items-center justify-center shrink-0">
          <Icon size={16} className="text-[#22D3EE]" />
        </span>
        <span className="text-sm font-medium whitespace-nowrap">{module.label}</span>
      </div>
    );
  });

  return (
    <section ref={sectionRef} className="relative py-12 sm:py-14 overflow-hidden">
      <div className="phx-container mb-8" data-trusted-fade>
        <p className="text-center text-xs font-mono uppercase tracking-[0.24em] text-[#64748B]">
          One OS running every part of your clinic
        </p>
      </div>
      <div data-trusted-fade>
        {/* Logos duplicated once so the -50% marquee loop is seamless */}
        <LogoSlider logos={[...marks, ...marks]} speed={36} showBlur={false} />
      </div>
    </section>
  );
}
