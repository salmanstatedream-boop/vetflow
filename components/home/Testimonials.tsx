'use client';

import { useRef } from 'react';
import AnimatedTestimonials from '@/components/home/AnimatedTestimonials';
import { useScrollReveal } from '@/lib/hooks/useScrollReveal';

export default function Testimonials() {
  const sectionRef = useRef<HTMLElement>(null);
  useScrollReveal(sectionRef, { selector: '[data-testimonial-fade]', staggerMs: 100 });

  return (
    <section ref={sectionRef} id="testimonials" className="phx-section phx-section-alt">
      <div aria-hidden className="phx-section-divider" />
      <div className="phx-container">
        <div className="text-center max-w-2xl mx-auto phx-section-header">
          <span
            className="inline-flex items-center px-4 py-1.5 rounded-full border border-[#8B5CF6]/30 bg-[#8B5CF6]/10 text-[#C4B5FD] text-[11px] font-mono uppercase tracking-[0.2em] mb-6"
            data-testimonial-fade
          >
            TESTIMONIALS
          </span>
          <h2
            className="phx-heading text-3xl sm:text-4xl lg:text-5xl mb-4"
            data-testimonial-fade
          >
            Real teams. Calmer mornings.
          </h2>
          <p className="phx-subtext text-lg" data-testimonial-fade>
            Early-access members share what changed when everyone finally worked from the same screen.
          </p>
        </div>

        <div data-testimonial-fade className="mt-10 flex justify-center">
          <AnimatedTestimonials width={640} autoPlay autoPlayInterval={4500} />
        </div>
      </div>
    </section>
  );
}
