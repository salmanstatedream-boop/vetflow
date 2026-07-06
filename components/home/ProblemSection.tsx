'use client';

import { useRef } from 'react';
import { PROBLEM_SECTION } from '@/lib/home-data';
import { useScrollReveal } from '@/lib/hooks/useScrollReveal';
import { cn } from '@/lib/utils';

const toneRing: Record<string, string> = {
  purple: 'border-[#8B5CF6]/40 bg-[#8B5CF6]/10 text-[#C4B5FD]',
  orange: 'border-[#F97316]/40 bg-[#F97316]/10 text-[#FDBA74]',
  blue: 'border-[#3B82F6]/40 bg-[#3B82F6]/10 text-[#93C5FD]',
};

export default function ProblemSection() {
  const sectionRef = useRef<HTMLElement>(null);
  useScrollReveal(sectionRef, { selector: '[data-problem-fade]', staggerMs: 70, y: 20 });

  return (
    <section ref={sectionRef} id="problem" className="phx-section relative overflow-hidden">
      <div aria-hidden className="phx-section-divider" />
      <div className="phx-container relative">
        <div className="text-center max-w-3xl mx-auto phx-section-header">
          <span
            className="inline-flex items-center px-4 py-1.5 rounded-full border border-[#F97316]/30 bg-[#F97316]/10 text-[#FDBA74] text-[11px] font-mono uppercase tracking-[0.2em] mb-6"
            data-problem-fade
          >
            {PROBLEM_SECTION.eyebrow}
          </span>
          <h2 className="phx-heading text-3xl sm:text-4xl lg:text-5xl mb-4" data-problem-fade>
            Running a clinic is <span className="text-[#F97316]">hard enough.</span>
            <br />
            Software shouldn&apos;t make it <span className="text-[#8B5CF6]">harder.</span>
          </h2>
          <p className="phx-subtext text-lg" data-problem-fade>
            {PROBLEM_SECTION.subheadline}
          </p>
        </div>

        <div className="mt-12 lg:mt-16 space-y-6 max-w-4xl mx-auto">
          {PROBLEM_SECTION.flow.map((step) => {
            const Icon = step.icon;
            return (
              <div key={step.id} data-problem-fade className="grid lg:grid-cols-[auto_1fr_auto_1fr] gap-4 items-center">
                <div
                  className={cn(
                    'w-12 h-12 rounded-full border flex items-center justify-center shrink-0',
                    toneRing[step.tone],
                  )}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div className="phx-card p-4">
                  <p className="text-[10px] font-mono uppercase tracking-wider text-[#64748B] mb-1">{step.label}</p>
                  <p className="text-sm text-[#F8FAFC]">{step.problem}</p>
                </div>
                <div className="hidden lg:flex items-center justify-center text-[#64748B] text-xl" aria-hidden>
                  →
                </div>
                <div className="phx-card p-4 border-dashed border-[#F97316]/25">
                  <p className="text-sm text-[#94A3B8]">{step.outcome}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {PROBLEM_SECTION.summary.map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.id} data-problem-fade className="phx-card p-4 h-full">
                <Icon className="w-5 h-5 text-[#8B5CF6] mb-3" />
                <h3 className="text-sm font-semibold text-[#F8FAFC] mb-1">{card.title}</h3>
                <p className="text-xs text-[#64748B] leading-relaxed">{card.description}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-10 grid grid-cols-2 lg:grid-cols-4 gap-4">
          {PROBLEM_SECTION.stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.id} data-problem-fade className="text-center phx-card p-5">
                <Icon className="w-5 h-5 text-[#22D3EE] mx-auto mb-2" />
                <p className="text-2xl font-bold text-[#F8FAFC] font-[family-name:var(--font-display)]">
                  {stat.value}
                </p>
                <p className="text-[11px] text-[#64748B] mt-1">{stat.label}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
