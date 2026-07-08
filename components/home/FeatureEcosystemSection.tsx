'use client';

import Image from 'next/image';
import {
  Activity,
  BarChart3,
  Bell,
  Brain,
  CalendarCheck,
  ClipboardList,
  Cloud,
  Headphones,
  MessageSquare,
  Shield,
  Smartphone,
  Sparkles,
  Users,
  Zap,
} from 'lucide-react';
import { useRef } from 'react';
import { FEATURE_ECOSYSTEM } from '@/lib/home-data';
import { useScrollReveal } from '@/lib/hooks/useScrollReveal';
import { cn } from '@/lib/utils';

const CATEGORY_ICONS = {
  clinical: Activity,
  ai: Brain,
  team: Users,
  business: BarChart3,
  communication: MessageSquare,
  analytics: Sparkles,
};

const TRUST_ICONS = [Shield, Cloud, Zap, Headphones, Smartphone];

const FEATURE_ICONS = [CalendarCheck, Users, ClipboardList, Bell, Brain, Sparkles, BarChart3, MessageSquare];

export default function FeatureEcosystemSection() {
  const sectionRef = useRef<HTMLElement>(null);
  useScrollReveal(sectionRef, { selector: '[data-eco-fade]', staggerMs: 70, y: 18 });

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
            <span className="bg-gradient-to-r from-[#22D3EE] to-[#8B5CF6] bg-clip-text text-transparent">
              {FEATURE_ECOSYSTEM.headline[1]}
            </span>
          </h2>
          <p className="phx-subtext text-lg" data-eco-fade>
            {FEATURE_ECOSYSTEM.subheadline}
          </p>
        </div>

        <div className="grid lg:grid-cols-[1fr_auto_1fr] gap-6 lg:gap-8 items-center mb-10" data-eco-fade>
          <div className="space-y-4">
            {left.map((cat) => {
              const Icon = CATEGORY_ICONS[cat.id as keyof typeof CATEGORY_ICONS];
              return (
                <CategoryCard key={cat.id} cat={cat} Icon={Icon} />
              );
            })}
          </div>

          <div className="flex flex-col items-center text-center px-4 py-6">
            <div className="relative w-24 h-24 mb-4">
              <div aria-hidden className="absolute inset-0 rounded-full border border-[#8B5CF6]/30 animate-pulse" />
              <Image src="/phoenix-logo.png" alt="Phoenix OS" fill className="object-contain p-2" />
            </div>
            <p className="text-sm font-bold text-[#F8FAFC] tracking-wide">PHOENIX OS</p>
            <p className="text-[10px] text-[#8B5CF6] mt-1">Intelligent Operating System</p>
            <p className="text-[10px] text-[#64748B]">for Veterinary Clinics</p>
          </div>

          <div className="space-y-4">
            {right.map((cat) => {
              const Icon = CATEGORY_ICONS[cat.id as keyof typeof CATEGORY_ICONS];
              return (
                <CategoryCard key={cat.id} cat={cat} Icon={Icon} />
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 rounded-2xl border border-white/10 bg-[#0B1020]/60 px-4 py-5" data-eco-fade>
          {FEATURE_ECOSYSTEM.trustBar.map((item, i) => {
            const Icon = TRUST_ICONS[i];
            return (
              <div key={item.label} className="text-center">
                <Icon className="w-5 h-5 text-[#22D3EE] mx-auto mb-2" />
                <p className="text-[11px] font-semibold text-[#F8FAFC]">{item.label}</p>
                <p className="text-[9px] text-[#64748B] mt-1">{item.description}</p>
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
}: {
  cat: (typeof FEATURE_ECOSYSTEM.categories)[number];
  Icon: typeof Activity;
}) {
  const toneBorder = cat.tone === 'blue' ? 'border-[#3B82F6]/25' : 'border-[#8B5CF6]/25';
  const toneBg = cat.tone === 'blue' ? 'bg-[#3B82F6]/10' : 'bg-[#8B5CF6]/10';
  const toneText = cat.tone === 'blue' ? 'text-[#93C5FD]' : 'text-[#C4B5FD]';

  return (
    <div className={cn('rounded-xl border bg-[#0B1020]/80 p-4', toneBorder)}>
      <div className="flex items-center gap-2 mb-2">
        <span className={cn('w-8 h-8 rounded-lg border flex items-center justify-center', toneBg, toneBorder)}>
          <Icon className={cn('w-4 h-4', toneText)} />
        </span>
        <p className={cn('text-[11px] font-mono uppercase tracking-wider', toneText)}>{cat.title}</p>
      </div>
      <p className="text-[10px] text-[#64748B] mb-3">{cat.description}</p>
      <div className="grid grid-cols-4 gap-1.5">
        {cat.features.map((feat, i) => {
          const FeatIcon = FEATURE_ICONS[i % FEATURE_ICONS.length];
          return (
            <div key={feat} className="text-center">
              <span className="w-7 h-7 rounded-md border border-white/10 bg-white/[0.03] flex items-center justify-center mx-auto mb-1">
                <FeatIcon className="w-3 h-3 text-[#64748B]" />
              </span>
              <p className="text-[7px] text-[#64748B] leading-tight">{feat}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
