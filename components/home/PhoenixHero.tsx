'use client';

import { animate, stagger } from 'animejs';
import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button';
import { LightLines } from '@/components/ui/light-lines';
import MorphText from '@/components/ui/morph-text';
import { CLINIC_TYPE_WORDS, HERO } from '@/lib/home-data';
import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion';
import { cn } from '@/lib/utils';

export default function PhoenixHero() {
  const rootRef = useRef<HTMLElement>(null);
  const router = useRouter();
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const root = rootRef.current;
    if (!root || reducedMotion) return;

    const words = root.querySelectorAll('[data-phx-word]');
    const fadeEls = root.querySelectorAll('[data-phx-fade]');

    animate(words, {
      opacity: [0, 1],
      y: [24, 0],
      duration: 800,
      delay: stagger(80),
      ease: 'outExpo',
    });

    animate(fadeEls, {
      opacity: [0, 1],
      y: [16, 0],
      duration: 700,
      delay: stagger(100, { start: 400 }),
      ease: 'outExpo',
    });
  }, [reducedMotion]);

  return (
    <section
      ref={rootRef}
      className="relative pt-[calc(var(--phx-nav-height)+3.5rem)] pb-16 lg:pb-24 overflow-hidden"
    >
      <LightLines
        className="absolute inset-0 pointer-events-none opacity-60 phx-hero-mask"
        showBackground={false}
        linesOpacity={0.05}
        lightsOpacity={0.5}
        gradientFrom="#22D3EE"
        gradientTo="#8B5CF6"
        lightColor="#22D3EE"
        lineColor="#3B82F6"
      />
      <div className="absolute inset-0 phx-grid-bg opacity-20 pointer-events-none" />

      <div className="phx-container relative">
        <div className="max-w-6xl mx-auto text-center">
          <p
            className="phx-eyebrow mb-6"
            data-phx-fade
            style={{ opacity: reducedMotion ? 1 : 0 }}
          >
            {HERO.eyebrow}
          </p>

          <h1 className="phx-heading text-4xl sm:text-5xl lg:text-6xl xl:text-[4.25rem] mb-4 max-w-4xl mx-auto">
            {HERO.headline.map((line, lineIndex) => (
              <span key={line} className="block overflow-hidden">
                {line.split(' ').map((word, i) => {
                  const isAccentLine = lineIndex === 1;
                  return (
                    <span
                      key={`${line}-${word}-${i}`}
                      data-phx-word
                      className={cn(
                        'inline-block mr-[0.25em]',
                        isAccentLine && 'phx-gradient-text',
                      )}
                      style={{ opacity: reducedMotion ? 1 : 0 }}
                    >
                      {word}
                    </span>
                  );
                })}
              </span>
            ))}
          </h1>

          <div
            className="flex items-center justify-center gap-2 mb-6 flex-wrap"
            data-phx-fade
            style={{ opacity: reducedMotion ? 1 : 0 }}
          >
            <span className="text-sm text-[#94A3B8]">Built for</span>
            {reducedMotion ? (
              <span className="text-sm font-mono uppercase tracking-wider text-[#22D3EE]">
                {CLINIC_TYPE_WORDS[0]}
              </span>
            ) : (
              <MorphText
                words={[...CLINIC_TYPE_WORDS]}
                interval={2600}
                fontSize="0.875rem"
                fontFamily="inherit"
                minWidth="20ch"
                className="!flex-row items-center"
                textClassName="font-mono uppercase tracking-wider text-[#22D3EE] !font-semibold"
              />
            )}
          </div>

          <p
            className="phx-subtext text-lg sm:text-xl max-w-3xl mx-auto mb-8"
            data-phx-fade
            style={{ opacity: reducedMotion ? 1 : 0 }}
          >
            {HERO.subheadline}
          </p>

          <div
            className="flex flex-wrap items-center justify-center gap-3 mb-6"
            data-phx-fade
            style={{ opacity: reducedMotion ? 1 : 0 }}
          >
            <InteractiveHoverButton
              onClick={() => router.push('/request-access')}
              className="border-[#22D3EE]/30 text-[#F8FAFC] phx-focus-ring transition-colors duration-200"
              style={
                {
                  '--background': '#0B1020',
                  '--primary': '#22D3EE',
                  '--primary-foreground': '#03040A',
                } as React.CSSProperties
              }
            >
              Request Access
            </InteractiveHoverButton>
            <InteractiveHoverButton
              onClick={() => router.push('/login')}
              className="border-white/15 text-[#94A3B8] hover:text-[#F8FAFC] phx-focus-ring transition-colors duration-200"
              style={
                {
                  '--background': 'transparent',
                  '--primary': '#1E293B',
                  '--primary-foreground': '#F8FAFC',
                } as React.CSSProperties
              }
            >
              Sign In
            </InteractiveHoverButton>
          </div>

          <p
            className="text-sm text-[#64748B] max-w-2xl mx-auto"
            data-phx-fade
            style={{ opacity: reducedMotion ? 1 : 0 }}
          >
            {HERO.microcopy}
          </p>

          <div
            className="flex items-center justify-center gap-2 mt-12"
            data-phx-fade
            style={{ opacity: reducedMotion ? 1 : 0 }}
            aria-hidden
          >
            <div className="w-5 h-8 rounded-full border border-white/20 flex items-start justify-center p-1.5">
              <span className="phx-scroll-cue-dot w-1 h-1.5 rounded-full bg-[#22D3EE]" />
            </div>
            <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#64748B]">
              Scroll
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
