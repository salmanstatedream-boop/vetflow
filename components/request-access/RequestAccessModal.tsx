'use client';

import { useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import PhoenixLogo from '@/components/brand/PhoenixLogo';
import AnimatedTestimonials from '@/components/home/AnimatedTestimonials';
import RequestAccessForm from '@/components/request-access/RequestAccessForm';
import { PRODUCT_NAME } from '@/lib/brand';
import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion';

type RequestAccessModalProps = {
  open: boolean;
  onClose: () => void;
};

export default function RequestAccessModal({ open, onClose }: RequestAccessModalProps) {
  const reducedMotion = usePrefersReducedMotion();

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (!open) return;
    document.addEventListener('keydown', handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, handleKeyDown]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
          role="presentation"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reducedMotion ? 0 : 0.2 }}
        >
          <motion.div
            className="relative w-full max-w-5xl max-h-[92vh] overflow-y-auto glass-panel rounded-3xl border border-outline-variant/40 shadow-premium flex flex-col lg:flex-row"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Request access"
            initial={reducedMotion ? false : { opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 260, damping: 26 }}
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute right-4 top-4 z-20 flex items-center justify-center w-9 h-9 rounded-full border border-white/10 bg-black/30 text-on-surface-variant/70 hover:text-on-surface hover:border-white/25 transition-colors phx-focus-ring"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Left: brand + testimonials */}
            <div className="relative lg:w-[44%] min-h-[220px] lg:min-h-0 overflow-hidden rounded-t-3xl lg:rounded-l-3xl lg:rounded-tr-none border-b lg:border-b-0 lg:border-r border-outline-variant/30">
              <div
                className="absolute inset-0"
                style={{
                  background:
                    'radial-gradient(ellipse 80% 60% at 20% 20%, rgba(249,115,22,0.45) 0%, transparent 55%), radial-gradient(ellipse 70% 50% at 80% 80%, rgba(139,92,246,0.4) 0%, transparent 50%), linear-gradient(145deg, #0B1020 0%, #101a33 50%, #03040a 100%)',
                }}
              />
              <div className="relative z-10 flex flex-col h-full p-6 lg:p-8">
                <div className="flex items-center gap-2.5 mb-6">
                  <PhoenixLogo size={32} priority />
                  <span className="font-black tracking-tight text-lg font-[family-name:var(--font-display)] text-on-surface">
                    {PRODUCT_NAME}
                  </span>
                </div>
                <div className="flex-1 flex flex-col justify-center">
                  <div className="rounded-2xl border border-white/10 bg-black/25 backdrop-blur-md p-4 lg:p-5">
                    <AnimatedTestimonials compact showCounter={false} autoPlay autoPlayInterval={5000} />
                  </div>
                </div>
              </div>
            </div>

            {/* Right: form */}
            <div className="flex-1 flex flex-col justify-center p-6 sm:p-8 lg:p-10 bg-surface-container/20">
              <div className="max-w-md mx-auto w-full">
                <h2 className="text-2xl md:text-3xl font-black font-[family-name:var(--font-display)] tracking-tight text-on-surface mb-2 pr-10">
                  Request <span className="gradient-text">access</span>
                </h2>
                <p className="text-sm text-on-surface-variant/75 mb-6">
                  Request access to {PRODUCT_NAME}. Our team provisions each clinic with secure,
                  compliant multi-tenant isolation.
                </p>
                <RequestAccessForm onClose={onClose} defaultClinicType="vet" />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
