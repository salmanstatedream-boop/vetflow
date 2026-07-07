'use client';

import { useRef } from 'react';
import SolutionExplorer from '@/components/home/SolutionExplorer';
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
            <span className="bg-gradient-to-r from-[#F97316] to-[#8B5CF6] bg-clip-text text-transparent">
              {SOLUTION_SECTION.headline[1]} {SOLUTION_SECTION.headline[2]}
            </span>
          </h2>
          <p className="phx-subtext text-lg" data-solution-fade>
            {SOLUTION_SECTION.subheadline}
          </p>
        </div>

        <div data-solution-fade>
          <SolutionExplorer reducedMotion={reducedMotion} />
        </div>
      </div>
    </section>
  );
}
