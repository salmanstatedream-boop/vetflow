'use client';

import Link from 'next/link';
import { useRef } from 'react';
import { EARLY_ACCESS } from '@/lib/home-data';
import { useScrollReveal } from '@/lib/hooks/useScrollReveal';

export default function EarlyAccessSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useScrollReveal(sectionRef, { selector: '[data-early-fade]', staggerMs: 90 });

  return (
    <section ref={sectionRef} id="early-access" className="phx-stats-band relative">
      <div aria-hidden className="phx-section-divider" />
      <div className="phx-container">
        <div className="max-w-3xl mx-auto text-center">
          <p className="phx-eyebrow mb-4" data-early-fade>
            {EARLY_ACCESS.eyebrow}
          </p>
          <h2
            className="phx-heading text-2xl sm:text-3xl lg:text-4xl mb-4"
            data-early-fade
          >
            {EARLY_ACCESS.headline}
          </h2>
          <p className="phx-subtext text-base sm:text-lg mb-6 max-w-2xl mx-auto" data-early-fade>
            {EARLY_ACCESS.subtext}
          </p>
          <div data-early-fade>
            <Link
              href="/request-access"
              className="phx-btn-primary text-sm sm:text-base px-6 py-3 inline-flex phx-focus-ring transition-colors duration-200 cursor-pointer"
            >
              {EARLY_ACCESS.cta}
            </Link>
          </div>
          <p className="text-xs font-mono uppercase tracking-[0.18em] text-[#64748B] mt-4" data-early-fade>
            {EARLY_ACCESS.note}
          </p>
        </div>
      </div>
    </section>
  );
}
