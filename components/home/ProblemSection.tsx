'use client';

import { useRef } from 'react';
import ProblemExplorer from '@/components/home/ProblemExplorer';
import { PROBLEM_SECTION } from '@/lib/home-data';
import { useScrollReveal } from '@/lib/hooks/useScrollReveal';

export default function ProblemSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useScrollReveal(sectionRef, { selector: '[data-problem-header]', staggerMs: 70, y: 20 });

  return (
    <section ref={sectionRef} id="problem" className="phx-section phx-section-alt relative overflow-hidden">
      <div aria-hidden className="phx-section-divider" />
      <div className="phx-container relative">
        <div className="text-center max-w-3xl mx-auto phx-section-header">
          <span
            className="inline-flex items-center px-4 py-1.5 rounded-full border border-[#F97316]/30 bg-[#F97316]/10 text-[#FDBA74] text-[11px] font-mono uppercase tracking-[0.2em] mb-6"
            data-problem-header
          >
            {PROBLEM_SECTION.eyebrow}
          </span>
          <h2 className="phx-heading text-3xl sm:text-4xl lg:text-5xl mb-4" data-problem-header>
            Running a clinic is <span className="text-[#F97316]">hard enough.</span>
            <br />
            Software shouldn&apos;t make it{' '}
            <span className="bg-gradient-to-r from-[#F97316] to-[#8B5CF6] bg-clip-text text-transparent">harder.</span>
          </h2>
          <p className="phx-subtext text-lg" data-problem-header>
            {PROBLEM_SECTION.subheadline}
          </p>
        </div>

        <ProblemExplorer />
      </div>
    </section>
  );
}
