'use client';

import Link from 'next/link';
import { useRef } from 'react';
import PhoenixLogo from '@/components/brand/PhoenixLogo';
import SolutionCarousel from '@/components/home/SolutionCarousel';
import { PRODUCT_NAME } from '@/lib/brand';
import { SOLUTION_SECTION } from '@/lib/home-data';
import { useScrollReveal } from '@/lib/hooks/useScrollReveal';
import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion';

export default function SolutionSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const reducedMotion = usePrefersReducedMotion();
  useScrollReveal(sectionRef, { selector: '[data-solution-fade]', staggerMs: 65, y: 18 });

  return (
    <section ref={sectionRef} id="solution" className="phx-section phx-section-alt relative overflow-hidden">
      <div aria-hidden className="phx-section-divider" />
      <div className="phx-container relative">
        <div className="text-center max-w-3xl mx-auto phx-section-header">
          <span
            className="inline-flex items-center px-4 py-1.5 rounded-full border border-[#F97316]/30 bg-[#F97316]/10 text-[#FDBA74] text-[11px] font-mono uppercase tracking-[0.2em] mb-6"
            data-solution-fade
          >
            {SOLUTION_SECTION.eyebrow}
          </span>
          <h2 className="phx-heading text-3xl sm:text-4xl lg:text-5xl mb-4" data-solution-fade>
            {SOLUTION_SECTION.headline[0]}{' '}
            <span className="text-[#F97316]">{SOLUTION_SECTION.headline[1]}</span>{' '}
            <span className="text-[#8B5CF6]">{SOLUTION_SECTION.headline[2]}</span>
          </h2>
          <p className="phx-subtext text-lg" data-solution-fade>
            {SOLUTION_SECTION.subheadline}
          </p>
        </div>

        <div data-solution-fade>
          <SolutionCarousel reducedMotion={reducedMotion} />
        </div>

        <div className="mt-10 phx-card p-6 lg:p-8" data-solution-fade>
          <div className="grid lg:grid-cols-2 gap-6 items-center">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <PhoenixLogo size={40} />
                <span className="font-bold text-lg text-[#F8FAFC]">{PRODUCT_NAME}</span>
              </div>
              <h3 className="text-2xl font-bold text-[#F8FAFC] font-[family-name:var(--font-display)]">
                {SOLUTION_SECTION.connected.title}
              </h3>
              <p className="text-[#8B5CF6] font-semibold mt-1">{SOLUTION_SECTION.connected.subtitle}</p>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {SOLUTION_SECTION.connected.pillars.map((pillar) => (
                <div key={pillar.id} className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <h4 className="text-sm font-semibold text-[#F8FAFC] mb-1">{pillar.title}</h4>
                  <p className="text-xs text-[#64748B]">{pillar.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div
          className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 phx-card p-6"
          data-solution-fade
        >
          <p className="text-sm text-[#94A3B8]">
            Stop managing software. Start{' '}
            <span className="text-[#F8FAFC] font-semibold">delivering better care.</span>
          </p>
          <Link
            href="/request-access"
            className="btn-sheen inline-flex items-center gap-2 bg-[#F97316] text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:opacity-90 transition-opacity shrink-0"
          >
            Book a Demo →
          </Link>
        </div>
      </div>
    </section>
  );
}
