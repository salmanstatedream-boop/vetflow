'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  BarChart3,
  Bell,
  Brain,
  Briefcase,
  CalendarCheck,
  ClipboardList,
  Cloud,
  Headphones,
  MessageSquare,
  Shield,
  Smartphone,
  Sparkles,
  Stethoscope,
  Users,
  Zap,
} from 'lucide-react';
import { useRef, useState } from 'react';
import { motionSpring } from '@/components/home/marketing-visuals/animations';
import { HubConnectorOverlay } from '@/components/home/marketing-visuals/shared';
import { FEATURE_ECOSYSTEM } from '@/lib/home-data';
import { useScrollReveal } from '@/lib/hooks/useScrollReveal';
import { cn } from '@/lib/utils';

const CATEGORY_ICONS = {
  clinical: Stethoscope,
  ai: Sparkles,
  team: Users,
  business: Briefcase,
  communication: MessageSquare,
  analytics: BarChart3,
};

const TRUST_ICONS = [Shield, Cloud, Zap, Headphones, Smartphone];
const FEATURE_ICONS = [CalendarCheck, Users, ClipboardList, Bell, Brain, Sparkles, BarChart3, MessageSquare];

export default function FeatureEcosystemSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const hubContainerRef = useRef<HTMLDivElement>(null);
  const hubRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLElement | null)[]>([]);
  const [hubRevealed, setHubRevealed] = useState(false);

  useScrollReveal(sectionRef, {
    selector: '[data-eco-fade], [data-eco-card], [data-eco-trust]',
    staggerMs: 75,
    y: 16,
    onReveal: () => setHubRevealed(true),
  });

  const left = FEATURE_ECOSYSTEM.categories.filter((_, i) => i < 3);
  const right = FEATURE_ECOSYSTEM.categories.filter((_, i) => i >= 3);

  return (
    <section ref={sectionRef} id="ecosystem" className="phx-section relative overflow-hidden">
      <div aria-hidden className="phx-section-divider" />
      <div className="phx-container">
        <div className="text-center max-w-3xl mx-auto phx-section-header mb-12">
          <span
            className="inline-flex items-center px-4 py-1.5 rounded-full border border-[#8B5CF6]/30 bg-[#8B5CF6]/10 text-[#C4B5FD] text-[11px] font-mono uppercase tracking-[0.2em] mb-6"
            data-eco-fade
          >
            {FEATURE_ECOSYSTEM.eyebrow}
          </span>
          <h2 className="phx-heading text-3xl sm:text-4xl lg:text-5xl mb-4" data-eco-fade>
            {FEATURE_ECOSYSTEM.headline[0]}{' '}
            <span>
              One{' '}
              <span className="bg-gradient-to-r from-[#22D3EE] to-[#8B5CF6] bg-clip-text text-transparent">
                Intelligent Ecosystem.
              </span>
            </span>
          </h2>
          <p className="phx-subtext text-lg" data-eco-fade>
            {FEATURE_ECOSYSTEM.subheadline}
          </p>
        </div>

        <div ref={hubContainerRef} className="relative mb-10">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -m-8 bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.12)_0%,transparent_65%)]"
          />
          <HubConnectorOverlay
            containerRef={hubContainerRef}
            hubRef={hubRef}
            cardRefs={cardRefs}
            anchor="edge"
            revealed={hubRevealed}
          />
          <div className="grid lg:grid-cols-[1fr_auto_1fr] gap-6 lg:gap-10 items-center relative z-10">
            <div className="space-y-4">
              {left.map((cat, i) => {
                const Icon = CATEGORY_ICONS[cat.id as keyof typeof CATEGORY_ICONS];
                return (
                  <CategoryCard
                    key={cat.id}
                    cat={cat}
                    Icon={Icon}
                    cardRef={(el) => {
                      cardRefs.current[i] = el;
                    }}
                  />
                );
              })}
            </div>

            <div className="flex flex-col items-center text-center px-4 py-6" data-eco-fade>
              <motion.div
                ref={hubRef}
                initial={{ scale: 0.94, opacity: 0.85 }}
                animate={hubRevealed ? { scale: 1, opacity: 1 } : undefined}
                transition={motionSpring}
                className="relative w-44 h-44 xl:w-52 xl:h-52 mb-2 phx-animate-hub-pulse rounded-full"
              >
                <div
                  aria-hidden
                  className="absolute inset-0 rounded-full p-[2.5px] bg-gradient-to-br from-[#8B5CF6] via-[#6366F1] to-[#3B82F6]"
                >
                  <div className="w-full h-full rounded-full bg-[#030712]" />
                </div>
                <div aria-hidden className="absolute inset-3 rounded-full border border-[#22D3EE]/25" />
                <Image
                  src="/phoenix-logo.png"
                  alt="Phoenix OS"
                  fill
                  className="object-contain p-4 xl:p-5 object-[center_52%]"
                />
              </motion.div>
              <p className="text-sm font-bold text-[#F8FAFC] tracking-wide">PHOENIX OS</p>
              <p className="text-xs text-[#A78BFA] mt-1 font-medium">Intelligent Operating System</p>
              <p className="text-xs text-[#94A3B8]">for Veterinary Clinics</p>
            </div>

            <div className="space-y-4">
              {right.map((cat, i) => {
                const Icon = CATEGORY_ICONS[cat.id as keyof typeof CATEGORY_ICONS];
                const cardIndex = i + 3;
                return (
                  <CategoryCard
                    key={cat.id}
                    cat={cat}
                    Icon={Icon}
                    cardRef={(el) => {
                      cardRefs.current[cardIndex] = el;
                    }}
                  />
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row rounded-2xl border border-white/10 bg-[#0B1020]/60 overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.2)]">
          {FEATURE_ECOSYSTEM.trustBar.map((item, i) => {
            const Icon = TRUST_ICONS[i];
            return (
              <div
                key={item.label}
                data-eco-trust
                className={cn(
                  'flex-1 text-center px-4 py-5 transition-colors hover:bg-white/[0.02]',
                  i > 0 && 'border-t sm:border-t-0 sm:border-l border-white/10',
                )}
              >
                <Icon className="w-5 h-5 text-[#22D3EE] mx-auto mb-2 drop-shadow-[0_0_8px_rgba(34,211,238,0.35)]" />
                <p className="text-xs font-semibold text-[#F8FAFC]">{item.label}</p>
                <p className="text-sm text-[#CBD5E1] mt-1 leading-snug">{item.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function CategoryCard({
  cat,
  Icon,
  cardRef,
}: {
  cat: (typeof FEATURE_ECOSYSTEM.categories)[number];
  Icon: typeof Stethoscope;
  cardRef?: (el: HTMLDivElement | null) => void;
}) {
  const toneBorder = cat.tone === 'blue' ? 'border-[#3B82F6]/30' : 'border-[#8B5CF6]/30';
  const toneText = cat.tone === 'blue' ? 'text-[#93C5FD]' : 'text-[#C4B5FD]';
  const iconGradient =
    cat.tone === 'blue'
      ? 'bg-gradient-to-br from-[#3B82F6] to-[#22D3EE]'
      : 'bg-gradient-to-br from-[#8B5CF6] to-[#6366F1]';
  const glowShadow =
    cat.tone === 'blue'
      ? '0 0 28px rgba(59,130,246,0.14)'
      : '0 0 28px rgba(139,92,246,0.14)';

  return (
    <div
      ref={cardRef}
      data-eco-card
      className={cn(
        'rounded-xl border bg-[#0B1020]/85 backdrop-blur-sm p-4 transition-[transform,border-color,box-shadow] duration-300 hover:-translate-y-1',
        cat.tone === 'blue' ? 'hover:border-[#3B82F6]/55' : 'hover:border-[#8B5CF6]/55',
        toneBorder,
      )}
      style={{ boxShadow: glowShadow }}
    >
      <div className="flex items-start gap-3 mb-2">
        <span
          className={cn(
            'w-10 h-10 rounded-lg flex items-center justify-center shrink-0 shadow-lg',
            iconGradient,
          )}
        >
          <Icon className="w-5 h-5 text-white" />
        </span>
        <div className="min-w-0 pt-0.5">
          <p className={cn('text-sm font-mono uppercase tracking-[0.12em] font-semibold', toneText)}>
            {cat.title.toUpperCase()}
          </p>
          <p className="text-sm text-[#CBD5E1] mt-1 leading-snug">{cat.description}</p>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-2 mt-3">
        {cat.features.map((feat, i) => {
          const FeatIcon = FEATURE_ICONS[i % FEATURE_ICONS.length];
          return (
            <div key={feat} className="text-center">
              <span className="w-7 h-7 rounded border border-white/[0.08] bg-white/[0.02] flex items-center justify-center mx-auto mb-1">
                <FeatIcon className="w-3.5 h-3.5 text-[#CBD5E1]" strokeWidth={1.5} />
              </span>
              <p className="text-[11px] text-[#CBD5E1] leading-tight">{feat}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
