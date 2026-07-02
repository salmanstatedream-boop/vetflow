'use client';

import { useRef, useState } from 'react';
import { AnimatedNumber } from '@/components/ui/animated-number';
import { STATS } from '@/lib/home-data';
import { useScrollReveal } from '@/lib/hooks/useScrollReveal';

export default function StatsStrip() {
  const sectionRef = useRef<HTMLElement>(null);
  const [counted, setCounted] = useState(false);

  useScrollReveal(sectionRef, {
    selector: '[data-stat-fade]',
    staggerMs: 100,
    onReveal: () => setCounted(true),
  });

  return (
    <section ref={sectionRef} className="relative border-y border-white/5 bg-[#05070f] py-10 sm:py-12">
      <div className="phx-container">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {STATS.map((stat) => (
            <div key={stat.id} className="text-center" data-stat-fade>
              <div className="flex items-baseline justify-center gap-0.5 text-4xl sm:text-5xl font-bold text-[#F8FAFC] tabular-nums">
                <AnimatedNumber value={counted ? stat.value : 0} />
                {stat.suffix && <span className="phx-gradient-text">{stat.suffix}</span>}
              </div>
              <p className="mt-2 text-xs sm:text-sm text-[#64748B]">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
