'use client';

import { useRouter } from 'next/navigation';
import { useRef } from 'react';
import { AnimatedRays } from '@/components/ui/animated-rays';
import { RadialGlowButton } from '@/components/ui/radial-glow-button';
import { SharedTooltipAvatars } from '@/components/ui/shared-tooltip-avatars';
import { CTA_AVATARS } from '@/lib/home-data';
import { useScrollReveal } from '@/lib/hooks/useScrollReveal';

function avatarImage(initials: string, color: string) {
  return (
    'data:image/svg+xml,' +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="112" height="112"><rect width="112" height="112" fill="#0B1020"/><circle cx="56" cy="56" r="52" fill="${color}" opacity="0.9"/><text x="56" y="70" text-anchor="middle" fill="#03040A" font-size="38" font-weight="700" font-family="sans-serif">${initials}</text></svg>`,
    )
  );
}

export default function FinalCTA() {
  const sectionRef = useRef<HTMLElement>(null);
  const router = useRouter();

  useScrollReveal(sectionRef, {
    selector: '[data-cta-fade]',
    staggerMs: 110,
  });

  return (
    <section
      ref={sectionRef}
      id="get-started"
      className="phx-section relative overflow-hidden min-h-[60vh] flex items-center"
    >
      <div className="absolute inset-0 pointer-events-none phx-cta-rays" aria-hidden>
        <AnimatedRays
          className="absolute inset-0 opacity-40 sm:opacity-50"
          colors={['#22D3EE', '#8B5CF6', '#3B82F6']}
        />
      </div>
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_0%,#05070D_78%)]"
      />

      <div className="phx-container relative text-center z-10 w-full">
        <p className="phx-eyebrow mb-4" data-cta-fade>
          13 / GET STARTED
        </p>
        <h2
          className="phx-heading text-3xl sm:text-4xl lg:text-5xl mb-4 max-w-3xl mx-auto"
          data-cta-fade
        >
          Launch your clinic on Phoenix OS.
        </h2>
        <p className="phx-subtext text-lg mb-6 max-w-2xl mx-auto" data-cta-fade>
          Join early-access vet clinics on Phoenix OS.
        </p>
        <div data-cta-fade>
          <SharedTooltipAvatars
            items={CTA_AVATARS.map((avatar) => ({
              id: avatar.id,
              name: avatar.name,
              image: avatarImage(avatar.initials, avatar.color),
            }))}
            className="py-2 mb-4"
          />
          <p className="text-xs font-mono uppercase tracking-[0.2em] text-[#64748B] mb-8">
            Built with early-access clinic teams
          </p>
        </div>
        <div data-cta-fade>
          <RadialGlowButton
            type="button"
            onClick={() => router.push('/request-access')}
            className="text-base px-8 py-3 phx-focus-ring cursor-pointer transition-colors duration-200"
          >
            Request Access
          </RadialGlowButton>
        </div>
      </div>
    </section>
  );
}
