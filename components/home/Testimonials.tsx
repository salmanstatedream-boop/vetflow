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

const WORK_PREVIEWS: Record<string, string> = {
  reception:
    '<rect x="36" y="36" width="150" height="10" rx="5" fill="#F8FAFC" opacity="0.85"/>' +
    '<rect x="36" y="64" width="328" height="42" rx="10" fill="#101A33" stroke="#22D3EE" stroke-opacity="0.4"/><rect x="50" y="76" width="52" height="18" rx="9" fill="#22D3EE" opacity="0.25"/><text x="76" y="89" text-anchor="middle" fill="#22D3EE" font-size="12" font-family="monospace">09:00</text><rect x="116" y="79" width="110" height="12" rx="6" fill="#F8FAFC" opacity="0.7"/><circle cx="344" cy="85" r="6" fill="#22C55E"/>' +
    '<rect x="36" y="116" width="328" height="42" rx="10" fill="#101A33" stroke="#3B82F6" stroke-opacity="0.35"/><rect x="50" y="128" width="52" height="18" rx="9" fill="#3B82F6" opacity="0.25"/><text x="76" y="141" text-anchor="middle" fill="#3B82F6" font-size="12" font-family="monospace">09:30</text><rect x="116" y="131" width="132" height="12" rx="6" fill="#F8FAFC" opacity="0.6"/><circle cx="344" cy="137" r="6" fill="#EAB308"/>' +
    '<rect x="36" y="168" width="328" height="42" rx="10" fill="#101A33" stroke="#8B5CF6" stroke-opacity="0.3"/><rect x="50" y="180" width="52" height="18" rx="9" fill="#8B5CF6" opacity="0.25"/><text x="76" y="193" text-anchor="middle" fill="#8B5CF6" font-size="12" font-family="monospace">10:00</text><rect x="116" y="183" width="92" height="12" rx="6" fill="#F8FAFC" opacity="0.5"/><circle cx="344" cy="189" r="6" fill="#64748B"/>',
  vet:
    '<rect x="36" y="30" width="328" height="196" rx="12" fill="#101A33" stroke="#22D3EE" stroke-opacity="0.35"/>' +
    '<text x="56" y="70" fill="#22D3EE" font-size="34" font-weight="700" font-family="Georgia,serif">Rx</text>' +
    '<rect x="110" y="48" width="140" height="10" rx="5" fill="#F8FAFC" opacity="0.8"/><rect x="110" y="64" width="90" height="8" rx="4" fill="#94A3B8" opacity="0.5"/>' +
    '<line x1="56" y1="94" x2="344" y2="94" stroke="#22D3EE" stroke-opacity="0.25"/>' +
    '<circle cx="64" cy="116" r="4" fill="#22D3EE"/><rect x="78" y="110" width="180" height="10" rx="5" fill="#94A3B8" opacity="0.6"/><rect x="290" y="110" width="54" height="10" rx="5" fill="#22D3EE" opacity="0.3"/>' +
    '<circle cx="64" cy="144" r="4" fill="#3B82F6"/><rect x="78" y="138" width="150" height="10" rx="5" fill="#94A3B8" opacity="0.55"/><rect x="290" y="138" width="54" height="10" rx="5" fill="#3B82F6" opacity="0.3"/>' +
    '<circle cx="64" cy="172" r="4" fill="#8B5CF6"/><rect x="78" y="166" width="196" height="10" rx="5" fill="#94A3B8" opacity="0.5"/>' +
    '<path d="M250 205 q14 -14 28 0 q14 14 28 0" fill="none" stroke="#22D3EE" stroke-width="2.5" stroke-linecap="round" opacity="0.8"/>',
  owner:
    '<rect x="36" y="36" width="120" height="10" rx="5" fill="#F8FAFC" opacity="0.85"/><rect x="36" y="54" width="70" height="8" rx="4" fill="#22C55E" opacity="0.6"/>' +
    '<line x1="44" y1="216" x2="364" y2="216" stroke="#94A3B8" stroke-opacity="0.3"/>' +
    '<rect x="60" y="168" width="34" height="48" rx="5" fill="#164E63"/><rect x="112" y="148" width="34" height="68" rx="5" fill="#155E75"/><rect x="164" y="156" width="34" height="60" rx="5" fill="#164E63"/><rect x="216" y="120" width="34" height="96" rx="5" fill="#0E7490"/><rect x="268" y="100" width="34" height="116" rx="5" fill="#0891B2"/><rect x="320" y="80" width="34" height="136" rx="5" fill="#22D3EE"/>' +
    '<path d="M77 160 L129 138 L181 146 L233 108 L285 88 L337 66" fill="none" stroke="#22C55E" stroke-width="3" stroke-linecap="round"/>' +
    '<circle cx="337" cy="66" r="6" fill="#22C55E"/><rect x="296" y="40" width="84" height="22" rx="11" fill="#22C55E" opacity="0.15"/><text x="338" y="55" text-anchor="middle" fill="#22C55E" font-size="12" font-weight="700" font-family="sans-serif">+32%</text>',
  manager:
    '<rect x="36" y="36" width="150" height="10" rx="5" fill="#F8FAFC" opacity="0.85"/>' +
    '<rect x="36" y="64" width="156" height="74" rx="10" fill="#101A33" stroke="#22D3EE" stroke-opacity="0.4"/><circle cx="62" cy="94" r="13" fill="#22D3EE" opacity="0.85"/><rect x="84" y="84" width="72" height="9" rx="4.5" fill="#F8FAFC" opacity="0.7"/><rect x="84" y="99" width="50" height="7" rx="3.5" fill="#22D3EE" opacity="0.4"/>' +
    '<rect x="208" y="64" width="156" height="74" rx="10" fill="#101A33" stroke="#3B82F6" stroke-opacity="0.4"/><circle cx="234" cy="94" r="13" fill="#3B82F6" opacity="0.85"/><rect x="256" y="84" width="72" height="9" rx="4.5" fill="#F8FAFC" opacity="0.7"/><rect x="256" y="99" width="50" height="7" rx="3.5" fill="#3B82F6" opacity="0.4"/>' +
    '<rect x="36" y="150" width="156" height="74" rx="10" fill="#101A33" stroke="#8B5CF6" stroke-opacity="0.4"/><circle cx="62" cy="180" r="13" fill="#8B5CF6" opacity="0.85"/><rect x="84" y="170" width="72" height="9" rx="4.5" fill="#F8FAFC" opacity="0.7"/><rect x="84" y="185" width="50" height="7" rx="3.5" fill="#8B5CF6" opacity="0.4"/>' +
    '<rect x="208" y="150" width="156" height="74" rx="10" fill="#101A33" stroke="#22C55E" stroke-opacity="0.4"/><circle cx="234" cy="180" r="13" fill="#22C55E" opacity="0.85"/><rect x="256" y="170" width="72" height="9" rx="4.5" fill="#F8FAFC" opacity="0.7"/><rect x="256" y="185" width="50" height="7" rx="3.5" fill="#22C55E" opacity="0.4"/>',
};

function personaImage(id: string, title: string, index: number) {
  const [from, to] = PALETTE[index % PALETTE.length];
  const initials = title
    .split(' ')
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  const preview = WORK_PREVIEWS[id] ?? '';
  return (
    'data:image/svg+xml,' +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${from}"/><stop offset="1" stop-color="${to}"/></linearGradient><pattern id="d" width="28" height="28" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.2" fill="#22D3EE" opacity="0.1"/></pattern></defs><rect width="400" height="400" fill="#0B1020"/><rect width="400" height="400" fill="url(#d)"/>${preview}<rect x="0" y="248" width="400" height="152" fill="#0B1020" opacity="0.55"/><circle cx="70" cy="308" r="32" fill="url(#g)"/><text x="70" y="318" text-anchor="middle" fill="#03040A" font-size="26" font-weight="700" font-family="sans-serif">${initials}</text><text x="118" y="302" fill="#F8FAFC" font-size="19" font-weight="600" font-family="sans-serif">${title}</text><text x="118" y="326" fill="#64748B" font-size="14" font-family="sans-serif">Phoenix OS early access</text><rect x="36" y="356" width="120" height="5" rx="2.5" fill="url(#g)" opacity="0.6"/></svg>`,
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
    image: personaImage(testimonial.id, testimonial.title, index),
  }));

  return (
    <section ref={sectionRef} id="testimonials" className="phx-section phx-section-alt">
      <div aria-hidden className="phx-section-divider" />
      <div className="phx-container">
        <div className="text-center max-w-2xl mx-auto mb-10 lg:mb-12">
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

        {/* Mobile: carousel */}
        <div data-testimonial-fade className="lg:hidden max-w-md mx-auto w-full cursor-default">
          <TestimonialsCard
            items={items}
            width={560}
            autoPlay
            autoPlayInterval={4200}
            className="!p-0"
          />
        </div>

        {/* Desktop: 2×2 grid */}
        <div className="hidden lg:grid grid-cols-2 gap-5">
          {TESTIMONIALS.map((testimonial, index) => (
            <article
              key={testimonial.id}
              data-testimonial-fade
              className="phx-card overflow-hidden cursor-default transition-colors duration-200 hover:border-[#22D3EE]/25"
            >
              <div
                className="h-36 bg-cover bg-center border-b border-white/10"
                style={{ backgroundImage: `url("${personaImage(testimonial.id, testimonial.title, index)}")` }}
                role="img"
                aria-label={testimonial.title}
              />
              <div className="p-5">
                <p className="text-sm text-[#94A3B8] leading-relaxed mb-4">{testimonial.description}</p>
                <p className="text-sm font-semibold text-[#F8FAFC]">{testimonial.title}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
