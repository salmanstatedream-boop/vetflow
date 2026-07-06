'use client';

import Lenis from 'lenis';
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

const LenisContext = createContext<Lenis | null>(null);

/** Access the homepage Lenis instance (null when reduced motion or before mount). */
export function useLenis() {
  return useContext(LenisContext);
}

export default function SmoothScrollProvider({ children }: { children: ReactNode }) {
  const [lenis, setLenis] = useState<Lenis | null>(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const instance = new Lenis({ lerp: 0.1, wheelMultiplier: 1 });
    let rafId = requestAnimationFrame(function loop(time) {
      instance.raf(time);
      rafId = requestAnimationFrame(loop);
    });
    setLenis(instance);

    const emitScroll = () => {
      window.dispatchEvent(new CustomEvent('phx:scroll'));
    };
    instance.on('scroll', emitScroll);

    return () => {
      instance.off('scroll', emitScroll);
      cancelAnimationFrame(rafId);
      instance.destroy();
      setLenis(null);
    };
  }, []);

  return <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>;
}
