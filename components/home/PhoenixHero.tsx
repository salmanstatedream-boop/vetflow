'use client';

import { animate, stagger } from 'animejs';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import ScaledOverviewDashboard from '@/components/home/overview-dashboard-visual/ScaledOverviewDashboard';
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
      className="relative pt-[calc(var(--phx-nav-height)+0.75rem)] pb-16 lg:pb-24 overflow-hidden"
    >
      <div className="absolute inset-0 z-0 pointer-events-none" aria-hidden>
        <LightLines
          className="absolute inset-0 opacity-60 phx-hero-mask"
          showBackground={false}
          linesOpacity={0.05}
          lightsOpacity={0.5}
          gradientFrom="#22D3EE"
          gradientTo="#8B5CF6"
          lightColor="#22D3EE"
          lineColor="#3B82F6"
        />
        <div
          className="absolute inset-0 phx-grid-bg opacity-10"
          style={{
            maskImage: 'radial-gradient(ellipse 70% 80% at 75% 40%, black 20%, transparent 70%)',
            WebkitMaskImage: 'radial-gradient(ellipse 70% 80% at 75% 40%, black 20%, transparent 70%)',
          }}
        />
      </div>

      <div className="phx-container relative z-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.4fr)] gap-10 lg:gap-12 xl:gap-14 items-center">
          <div className="relative text-center lg:text-left isolate">
            <div
              aria-hidden
              className="pointer-events-none absolute -inset-4 sm:-inset-6 rounded-3xl bg-[radial-gradient(ellipse_at_left_center,rgba(3,4,10,0.85)_0%,transparent_70%)]"
            />
            <div className="relative flex flex-col items-center lg:items-start">
              <div
                className="relative inline-flex flex-col items-center self-center lg:self-start gap-0 mb-1"
                data-phx-fade
                style={{ opacity: reducedMotion ? 1 : 0 }}
              >
                <div className="relative z-10 w-[140px] h-[160px] sm:w-[176px] sm:h-[196px] lg:w-[200px] lg:h-[220px] shrink-0">
                  <Image
                    src="/phoenix-logo.png"
                    alt="Phoenix OS"
                    fill
                    priority
                    className="object-contain object-bottom scale-[1.12] origin-bottom"
                    sizes="(max-width: 640px) 140px, (max-width: 1024px) 176px, 200px"
                  />
                </div>
                <p className="phx-eyebrow leading-none m-0 -mt-6 sm:-mt-7 lg:-mt-8 text-center tracking-[0.2em]">
                  {HERO.eyebrow}
                </p>
              </div>

              <h1 className="phx-heading phx-hero-heading text-4xl sm:text-5xl lg:text-5xl xl:text-[3.5rem] max-w-xl mx-auto lg:mx-0 flex flex-col gap-y-1 sm:gap-y-2 mt-2 sm:mt-2.5">
                {HERO.headline.map((line, lineIndex) => (
                  <span key={line} className="block overflow-visible">
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
            </div>

            <div
              className="relative flex items-center justify-center lg:justify-start gap-2 mb-6 flex-wrap mt-4"
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
              className="relative phx-subtext text-lg sm:text-xl max-w-xl mx-auto lg:mx-0 mb-8"
              data-phx-fade
              style={{ opacity: reducedMotion ? 1 : 0 }}
            >
              {HERO.subheadline}
            </p>

            <div
              className="relative flex flex-wrap items-center justify-center lg:justify-start gap-3 mb-6"
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
              className="relative text-sm text-[#64748B] max-w-xl mx-auto lg:mx-0"
              data-phx-fade
              style={{ opacity: reducedMotion ? 1 : 0 }}
            >
              {HERO.microcopy}
            </p>
          </div>

          <div
            id="dashboard"
            className="relative w-full min-w-0"
            data-phx-fade
            style={{ opacity: reducedMotion ? 1 : 0 }}
          >
            <div
              className="relative w-full rounded-2xl border border-white/10 ring-1 ring-white/[0.06] bg-[#0B1020] overflow-hidden shadow-[0_24px_80px_rgba(0,0,0,0.45)] transition-shadow hover:shadow-[0_28px_90px_rgba(34,211,238,0.08)]"
            >
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#22D3EE]/8 via-transparent to-[#8B5CF6]/8 blur-2xl"
              />
              <div className="relative w-full">
                <ScaledOverviewDashboard />
              </div>
            </div>
          </div>
        </div>

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
    </section>
  );
}
