'use client';

import { useRef, useState } from 'react';
import { AnimatedNumber } from '@/components/ui/animated-number';
import ProblemFlowTimeline from '@/components/home/ProblemFlowTimeline';
import { PROBLEM_SECTION } from '@/lib/home-data';
import { useScrollReveal } from '@/lib/hooks/useScrollReveal';

const COUNTABLE_STAT_IDS = new Set(['systems', 'clicks']);

function StatValue({ statId, value, counted }: { statId: string; value: string; counted: boolean }) {
  if (COUNTABLE_STAT_IDS.has(statId)) {
    const numeric = parseInt(value.replace(/\D/g, ''), 10);
    const suffix = value.replace(/[\d]/g, '');
    return (
      <span className="inline-flex items-baseline justify-center gap-0.5">
        <AnimatedNumber value={counted ? numeric : 0} />
        {suffix && <span>{suffix}</span>}
      </span>
    );
  }

  return <span>{value}</span>;
}

export default function ProblemSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [statsCounted, setStatsCounted] = useState(false);

  useScrollReveal(sectionRef, { selector: '[data-problem-header]', staggerMs: 70, y: 20 });
  useScrollReveal(sectionRef, {
    selector: '[data-problem-stat]',
    staggerMs: 80,
    y: 16,
    onReveal: () => setStatsCounted(true),
  });

  return (
    <section ref={sectionRef} id="problem" className="phx-section relative overflow-hidden">
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
            Software shouldn&apos;t make it <span className="text-[#8B5CF6]">harder.</span>
          </h2>
          <p className="phx-subtext text-lg" data-problem-header>
            {PROBLEM_SECTION.subheadline}
          </p>
        </div>

        <ProblemFlowTimeline steps={PROBLEM_SECTION.flow} />

        <div className="mt-10 grid grid-cols-2 lg:grid-cols-4 gap-4">
          {PROBLEM_SECTION.stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.id} data-problem-stat className="text-center phx-card p-5">
                <Icon className="w-5 h-5 text-[#22D3EE] mx-auto mb-2" />
                <p className="text-2xl font-bold text-[#F8FAFC] font-[family-name:var(--font-display)]">
                  <StatValue statId={stat.id} value={stat.value} counted={statsCounted} />
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
