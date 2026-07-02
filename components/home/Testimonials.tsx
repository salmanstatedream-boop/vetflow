'use client';

import { useRef } from 'react';
import { TestimonialsCard } from '@/components/ui/testimonials-card';
import { TESTIMONIALS } from '@/lib/home-data';
import { useScrollReveal } from '@/lib/hooks/useScrollReveal';

const PALETTE = [
  ['#22D3EE', '#3B82F6'],
  ['#3B82F6', '#8B5CF6'],
  ['#8B5CF6', '#A855F7'],
  ['#22D3EE', '#8B5CF6'],
] as const;

function personaImage(title: string, index: number) {
  const [from, to] = PALETTE[index % PALETTE.length];
  const initials = title
    .split(' ')
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  return (
    'data:image/svg+xml,' +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${from}"/><stop offset="1" stop-color="${to}"/></linearGradient><pattern id="d" width="28" height="28" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.2" fill="#22D3EE" opacity="0.14"/></pattern></defs><rect width="400" height="400" fill="#0B1020"/><rect width="400" height="400" fill="url(#d)"/><circle cx="340" cy="48" r="150" fill="url(#g)" opacity="0.14"/><text x="36" y="150" fill="url(#g)" font-size="150" font-weight="700" font-family="Georgia,serif">\u201C</text><circle cx="70" cy="308" r="32" fill="url(#g)"/><text x="70" y="318" text-anchor="middle" fill="#03040A" font-size="26" font-weight="700" font-family="sans-serif">${initials}</text><text x="118" y="302" fill="#F8FAFC" font-size="19" font-weight="600" font-family="sans-serif">${title}</text><text x="118" y="326" fill="#64748B" font-size="14" font-family="sans-serif">Phoenix OS early access</text><rect x="36" y="356" width="120" height="5" rx="2.5" fill="url(#g)" opacity="0.6"/></svg>`,
    )
  );
}

export default function Testimonials() {
  const sectionRef = useRef<HTMLElement>(null);

  useScrollReveal(sectionRef, { selector: '[data-testimonial-fade]', staggerMs: 100 });

  const items = TESTIMONIALS.map((testimonial, index) => ({
    id: testimonial.id,
    title: testimonial.title,
    description: testimonial.description,
    image: personaImage(testimonial.title, index),
  }));

  return (
    <section ref={sectionRef} id="testimonials" className="phx-section bg-[#070A12]">
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#3B82F6]/30 to-transparent"
      />
      <div className="phx-container">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div>
            <p className="phx-eyebrow mb-4" data-testimonial-fade>
              06 / TEAMS
            </p>
            <h2
              className="phx-heading text-3xl sm:text-4xl lg:text-5xl mb-4"
              data-testimonial-fade
            >
              Every role, one workspace.
            </h2>
            <p className="phx-subtext text-lg max-w-xl" data-testimonial-fade>
              Front desk, doctors, managers, and owners all work in the same operating system —
              each with dashboards, permissions, and workflows shaped to their role.
            </p>
          </div>

          <div data-testimonial-fade className="max-w-md lg:max-w-xl mx-auto w-full">
            <TestimonialsCard
              items={items}
              width={560}
              autoPlay
              autoPlayInterval={4200}
              className="!p-0"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
