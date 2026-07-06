'use client';

import Link from 'next/link';
import { useRef } from 'react';
import { Check } from 'lucide-react';
import PhoenixLogo from '@/components/brand/PhoenixLogo';
import { PRODUCT_NAME } from '@/lib/brand';
import { SOLUTION_SECTION } from '@/lib/home-data';
import { useScrollReveal } from '@/lib/hooks/useScrollReveal';
import { cn } from '@/lib/utils';

const toneAccent: Record<string, string> = {
  purple: 'text-[#C4B5FD]',
  orange: 'text-[#FDBA74]',
  blue: 'text-[#93C5FD]',
};

export default function SolutionSection() {
  const sectionRef = useRef<HTMLElement>(null);
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

        <div className="mt-12 space-y-10">
          {SOLUTION_SECTION.rows.map((row, index) => (
            <div
              key={row.id}
              data-solution-fade
              className={cn(
                'grid lg:grid-cols-2 gap-6 lg:gap-10 items-center',
                index % 2 === 1 && 'lg:[&>*:first-child]:order-2',
              )}
            >
              <div className="phx-card p-5 sm:p-6">
                <p className="text-xs text-[#64748B] mb-2">{row.problem}</p>
                <h3 className={cn('text-xl font-bold mb-2 font-[family-name:var(--font-display)]', toneAccent[row.tone])}>
                  {row.title}
                </h3>
                <p className="text-sm text-[#94A3B8] mb-4">{row.description}</p>
                <ul className="space-y-2">
                  {row.bullets.map((bullet) => (
                    <li key={bullet} className="flex items-start gap-2 text-sm text-[#F8FAFC]">
                      <Check className="w-4 h-4 text-[#22D3EE] shrink-0 mt-0.5" />
                      {bullet}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="phx-card p-4 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={row.preview} alt="" className="w-full h-auto rounded-lg" />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 phx-card p-8 lg:p-10" data-solution-fade>
          <div className="grid lg:grid-cols-2 gap-8 items-center">
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
          className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 phx-card p-6"
          data-solution-fade
        >
          <p className="text-sm text-[#94A3B8]">
            Stop managing software. Start{' '}
            <span className="text-[#F8FAFC] font-semibold">delivering better care.</span>
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/request-access"
              className="btn-sheen inline-flex items-center gap-2 bg-[#F97316] text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:opacity-90 transition-opacity"
            >
              Book a Demo →
            </Link>
            <Link
              href="#product"
              className="inline-flex items-center gap-2 border border-white/15 text-[#F8FAFC] px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-white/5 transition-colors"
            >
              See {PRODUCT_NAME} in Action
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
