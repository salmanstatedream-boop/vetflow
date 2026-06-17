'use client';

import { useEffect, useRef, useState } from 'react';
import { useGlobalLoadingOptional } from '@/components/layout/NavigationLoadingProvider';

export default function TopLoadingBar() {
  const loading = useGlobalLoadingOptional();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const trickleRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hideRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isActive = loading?.isNavigating ?? false;

  useEffect(() => {
    if (isActive) {
      if (hideRef.current) {
        clearTimeout(hideRef.current);
        hideRef.current = null;
      }
      setVisible(true);
      setProgress((p) => (p < 12 ? 12 : p));

      if (!trickleRef.current) {
        trickleRef.current = setInterval(() => {
          setProgress((p) => {
            if (p >= 88) return p;
            const inc = Math.random() * 6 + 1.5;
            return Math.min(p + inc, 88);
          });
        }, 280);
      }
    } else if (visible) {
      if (trickleRef.current) {
        clearInterval(trickleRef.current);
        trickleRef.current = null;
      }
      setProgress(100);
      hideRef.current = setTimeout(() => {
        setVisible(false);
        setProgress(0);
      }, 200);
    }

    return () => {
      if (trickleRef.current) {
        clearInterval(trickleRef.current);
        trickleRef.current = null;
      }
    };
  }, [isActive, visible]);

  useEffect(() => {
    return () => {
      if (hideRef.current) clearTimeout(hideRef.current);
      if (trickleRef.current) clearInterval(trickleRef.current);
    };
  }, []);

  if (!visible && progress === 0) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[9999] h-[3px] pointer-events-none"
      role="progressbar"
      aria-valuemin={0}
      aria-valuenow={Math.round(progress)}
      aria-valuemax={100}
      aria-label="Page loading"
    >
      <div
        className="h-full bg-primary shadow-[0_0_10px_color-mix(in_srgb,var(--color-primary)_45%,transparent)] transition-[width] duration-200 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
