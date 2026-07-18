'use client';

import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export const PHX_BOOT_STORAGE_KEY = 'phx_boot_seen';

function persistBootSeen() {
  try {
    sessionStorage.setItem(PHX_BOOT_STORAGE_KEY, '1');
  } catch {
    // ignore quota / private mode errors
  }
}

function markBootDoneClass() {
  document.documentElement.classList.add('phx-boot-done');
}

export default function PhoenixBootPreloader() {
  const [phase, setPhase] = useState<'idle' | 'playing' | 'exiting' | 'done'>('idle');
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    try {
      if (
        sessionStorage.getItem(PHX_BOOT_STORAGE_KEY) ||
        document.documentElement.classList.contains('phx-boot-done')
      ) {
        setPhase('done');
        return;
      }
    } catch {
      // fall through and play
    }

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setReducedMotion(prefersReduced);
    setPhase('playing');

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const exitDelay = prefersReduced ? 300 : 4800;
    const removeDelay = prefersReduced ? 500 : 5600;

    const exitTimer = window.setTimeout(() => {
      persistBootSeen();
      setPhase('exiting');
    }, exitDelay);

    const doneTimer = window.setTimeout(() => {
      document.body.style.overflow = previousOverflow;
      markBootDoneClass();
      setPhase('done');
    }, removeDelay);

    return () => {
      window.clearTimeout(exitTimer);
      window.clearTimeout(doneTimer);
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  if (phase === 'done') return null;

  return (
    <AnimatePresence>
      {(phase === 'idle' || phase === 'playing' || phase === 'exiting') && (
        <motion.div
          key="phx-boot"
          className={`phx-boot-preloader fixed inset-0 z-[200] flex flex-col items-center justify-center bg-[#050505] ${
            phase === 'exiting' ? 'pointer-events-none' : ''
          }`}
          role="presentation"
          aria-hidden={phase === 'exiting'}
          initial={false}
          animate={
            phase === 'exiting'
              ? { opacity: 0, scale: 1.02 }
              : { opacity: 1, scale: 1 }
          }
          exit={{ opacity: 0 }}
          transition={{ duration: reducedMotion ? 0.25 : 0.65, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="relative flex flex-col items-center text-center px-6">
            <div className="relative w-[161px] h-[161px] sm:w-[204px] sm:h-[204px] lg:w-[234px] lg:h-[234px] mb-8">
              <motion.div
                aria-hidden
                className="absolute inset-[-20%] rounded-full bg-[radial-gradient(circle,rgba(77,166,255,0.35)_0%,transparent_70%)]"
                initial={reducedMotion ? false : { opacity: 0.3, scale: 0.85 }}
                animate={
                  phase === 'playing' && !reducedMotion
                    ? { opacity: [0.35, 0.85, 0.45, 0.7, 0.4], scale: [0.9, 1.08, 1, 1.04, 1] }
                    : { opacity: 0.5, scale: 1 }
                }
                transition={
                  reducedMotion
                    ? { duration: 0 }
                    : { duration: 4.2, ease: 'easeInOut', times: [0, 0.3, 0.55, 0.8, 1] }
                }
              />
              <motion.div
                className="relative w-full h-full"
                initial={reducedMotion ? false : { opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={
                  reducedMotion
                    ? { duration: 0.2 }
                    : { duration: 1.2, delay: 0.2, ease: [0.22, 1, 0.36, 1] }
                }
              >
                <Image
                  src="/phoenix-logo.png"
                  alt=""
                  fill
                  priority
                  className="object-contain"
                  sizes="(max-width: 640px) 161px, (max-width: 1024px) 204px, 234px"
                />
              </motion.div>
            </div>

            <motion.h1
              className="text-[13px] sm:text-sm font-semibold tracking-[0.28em] uppercase text-[#A0CAFF]"
              initial={reducedMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={
                reducedMotion
                  ? { duration: 0.15 }
                  : { duration: 0.6, delay: 1.1, ease: 'easeOut' }
              }
            >
              Phoenix OS
            </motion.h1>
            <motion.p
              className="mt-3 text-[11px] font-mono uppercase tracking-[0.22em] text-[#8A919D]"
              initial={reducedMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 0.85, y: 0 }}
              transition={
                reducedMotion
                  ? { duration: 0.15 }
                  : { duration: 0.55, delay: 1.55, ease: 'easeOut' }
              }
            >
              Initializing Clinic…
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
