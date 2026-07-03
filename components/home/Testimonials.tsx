'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRef, useState } from 'react';
import TestimonialCard from '@/components/home/TestimonialCard';
import { TESTIMONIALS } from '@/lib/home-data';
import { useScrollReveal } from '@/lib/hooks/useScrollReveal';
import { cn } from '@/lib/utils';

export default function Testimonials() {
  const sectionRef = useRef<HTMLElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useScrollReveal(sectionRef, { selector: '[data-testimonial-fade]', staggerMs: 100 });

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? TESTIMONIALS.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev === TESTIMONIALS.length - 1 ? 0 : prev + 1));
  };

  const activeTestimonial = TESTIMONIALS[activeIndex];

  return (
    <section ref={sectionRef} id="testimonials" className="phx-section phx-section-alt">
      <div aria-hidden className="phx-section-divider" />
      <div className="phx-container">
        <div className="text-center max-w-2xl mx-auto phx-section-header">
          <p className="phx-eyebrow mb-4" data-testimonial-fade>
            06 / TEAMS
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

        {/* Mobile: Phoenix carousel */}
        <div data-testimonial-fade className="lg:hidden max-w-lg mx-auto w-full">
          <p
            className="text-center text-[11px] font-mono uppercase tracking-[0.2em] text-[#64748B] mb-4"
            aria-live="polite"
          >
            {activeIndex + 1} / {TESTIMONIALS.length}
          </p>

          <TestimonialCard
            key={activeTestimonial.id}
            id={activeTestimonial.id}
            title={activeTestimonial.title}
            description={activeTestimonial.description}
            index={activeIndex}
          />

          <div className="flex items-center justify-center gap-3 mt-5">
            <button
              type="button"
              onClick={handlePrev}
              className="flex items-center justify-center w-10 h-10 rounded-full border border-white/10 bg-[var(--phx-panel)] text-[#94A3B8] hover:text-[#F8FAFC] hover:border-[#22D3EE]/30 transition-colors duration-200 cursor-pointer phx-focus-ring"
              aria-label="Previous testimonial"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="flex items-center justify-center w-10 h-10 rounded-full border border-white/10 bg-[var(--phx-panel)] text-[#94A3B8] hover:text-[#F8FAFC] hover:border-[#22D3EE]/30 transition-colors duration-200 cursor-pointer phx-focus-ring"
              aria-label="Next testimonial"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          <div className="flex justify-center gap-2 mt-4" role="tablist" aria-label="Testimonial slides">
            {TESTIMONIALS.map((testimonial, index) => (
              <button
                key={testimonial.id}
                type="button"
                role="tab"
                aria-selected={index === activeIndex}
                aria-label={`Show testimonial ${index + 1}: ${testimonial.title}`}
                onClick={() => setActiveIndex(index)}
                className={cn(
                  'h-1.5 rounded-full transition-colors duration-200 cursor-pointer phx-focus-ring',
                  index === activeIndex
                    ? 'w-6 bg-[#22D3EE]'
                    : 'w-1.5 bg-white/20 hover:bg-white/35',
                )}
              />
            ))}
          </div>
        </div>

        {/* Desktop: 2×2 grid */}
        <div className="hidden lg:grid grid-cols-2 gap-5">
          {TESTIMONIALS.map((testimonial, index) => (
            <div key={testimonial.id} data-testimonial-fade>
              <TestimonialCard
                id={testimonial.id}
                title={testimonial.title}
                description={testimonial.description}
                index={index}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
