'use client';

import { useRef } from 'react';
import ExpandableBentoGrid from '@/components/ui/expandable-bento-grid';
import { FEATURES } from '@/lib/home-data';
import { useScrollReveal } from '@/lib/hooks/useScrollReveal';

export default function FeatureToolbox() {
  const sectionRef = useRef<HTMLElement>(null);

  useScrollReveal(sectionRef, {
    selector: '[data-feature-fade], [data-bento-item]',
    staggerMs: 80,
  });

  const bentoItems = FEATURES.map((feature) => {
    const Icon = feature.icon;
    return {
      id: feature.id,
      title: feature.title,
      subtitle: feature.description.slice(0, 72) + (feature.description.length > 72 ? '…' : ''),
      description: 'Phoenix OS module',
      image: feature.previewImage,
      icon: <Icon size={22} />,
      content: <p className="leading-relaxed">{feature.description}</p>,
    };
  });

  return (
    <section ref={sectionRef} className="phx-section phx-section-alt">
      <div aria-hidden className="phx-section-divider" />
      <div className="phx-container">
        <div className="phx-section-header max-w-3xl">
          <p className="phx-eyebrow" data-feature-fade>
            03 / TOOLBOX
          </p>
          <h2 className="phx-heading text-3xl sm:text-4xl lg:text-5xl" data-feature-fade>
            The complete clinic operating toolbox.
          </h2>
          <p className="phx-subtext text-lg max-w-2xl" data-feature-fade>
            Pick the module you need — each one stands alone and connects when it matters.
          </p>
        </div>

        <div>
          <ExpandableBentoGrid items={bentoItems} />
        </div>
      </div>
    </section>
  );
}
