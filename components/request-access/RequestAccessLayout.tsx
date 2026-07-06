'use client';

import type { ReactNode } from 'react';
import PhoenixLogo from '@/components/brand/PhoenixLogo';
import AnimatedTestimonials from '@/components/home/AnimatedTestimonials';
import { PRODUCT_NAME } from '@/lib/brand';

type RequestAccessLayoutProps = {
  children: ReactNode;
  title?: string;
  titleAccent?: string;
  footer?: ReactNode;
};

export default function RequestAccessLayout({
  children,
  title = 'Tell us about',
  titleAccent = 'your clinic',
  footer,
}: RequestAccessLayoutProps) {
  return (
    <div className="min-h-screen mesh-gradient flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-6xl glass-panel rounded-3xl border border-outline-variant/40 overflow-hidden shadow-premium flex flex-col lg:flex-row min-h-[min(720px,90vh)]">
        <div className="relative lg:w-[44%] min-h-[280px] lg:min-h-0 overflow-hidden border-b lg:border-b-0 lg:border-r border-outline-variant/30">
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse 80% 60% at 20% 20%, rgba(249,115,22,0.45) 0%, transparent 55%), radial-gradient(ellipse 70% 50% at 80% 80%, rgba(139,92,246,0.4) 0%, transparent 50%), linear-gradient(145deg, #0B1020 0%, #101a33 50%, #03040a 100%)',
            }}
          />
          <div className="relative z-10 flex flex-col h-full p-8 lg:p-10">
            <div className="flex items-center gap-2.5 mb-6">
              <PhoenixLogo size={32} priority />
              <span className="font-black tracking-tight text-lg font-[family-name:var(--font-display)] text-on-surface">
                {PRODUCT_NAME}
              </span>
            </div>
            <div className="flex-1 flex flex-col justify-center">
              <div className="rounded-2xl border border-white/10 bg-black/25 backdrop-blur-md p-4 lg:p-6">
                <AnimatedTestimonials compact showCounter={false} autoPlay autoPlayInterval={5000} />
              </div>
            </div>
            <p className="text-[10px] text-on-surface-variant/50 mt-6">
              © 2026 {PRODUCT_NAME}. All rights reserved.
            </p>
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-center p-8 lg:p-10 bg-surface-container/20">
          <div className="max-w-md mx-auto w-full">
            <h1 className="text-2xl md:text-3xl font-black font-[family-name:var(--font-display)] tracking-tight text-on-surface mb-2">
              {title}{' '}
              <span className="gradient-text">{titleAccent}</span>
            </h1>
            <p className="text-sm text-on-surface-variant/75 mb-8">
              Request access to {PRODUCT_NAME}. Our team provisions each clinic with secure, compliant
              multi-tenant isolation.
            </p>
            {children}
            {footer && (
              <p className="text-xs text-on-surface-variant/70 text-center mt-6">{footer}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
