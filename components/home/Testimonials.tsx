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
          <p className="phx-eyebrow mb-4" data-testimonial-fade>
            10 / TESTIMONIALS
          </p>
          <h2
            className="phx-heading text-3xl sm:text-4xl lg:text-5xl mb-4"
            data-testimonial-fade
          >
            Real teams. Calmer mornings.
          </h2>
          <p className="phx-subtext text-lg" data-testimonial-fade>
            Early-access clinics share what changed when everyone finally worked from the same screen.
          </p>
        </div>

        <div data-testimonial-fade className="mt-10 flex justify-center">
          <AnimatedTestimonials width={640} autoPlay autoPlayInterval={4500} />
        </div>
      </div>
    </section>
  );
}
