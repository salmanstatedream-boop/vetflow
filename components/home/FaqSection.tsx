'use client';

import { useRef } from 'react';
import { FaqAccordion } from '@/components/ui/faq-accordion';
import { FAQS } from '@/lib/home-data';
import { useScrollReveal } from '@/lib/hooks/useScrollReveal';

export default function FaqSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useScrollReveal(sectionRef, { selector: '[data-faq-fade]', staggerMs: 90 });

  return (
    <section ref={sectionRef} id="faq" className="phx-section">
      <div className="phx-container">
        <p className="phx-eyebrow mb-4 text-center" data-faq-fade>
          08 / FAQ
        </p>
        <h2
          className="phx-heading text-3xl sm:text-4xl lg:text-5xl mb-10 text-center"
          data-faq-fade
        >
          Questions clinics ask us.
        </h2>

        <div data-faq-fade>
          <FaqAccordion items={[...FAQS]} title="" className="py-0" />
        </div>
      </div>
    </section>
  );
}
