'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useGlobalLoadingOptional } from '@/components/layout/NavigationLoadingProvider';

const OVERLAY_DELAY_MS = 400;

export default function NavigationLoadingOverlay() {
  const nav = useGlobalLoadingOptional();
  const [showOverlay, setShowOverlay] = useState(false);

  useEffect(() => {
    if (!nav?.isNavigating) {
      setShowOverlay(false);
      return;
    }
    const timer = setTimeout(() => setShowOverlay(true), OVERLAY_DELAY_MS);
    return () => clearTimeout(timer);
  }, [nav?.isNavigating]);

  if (!showOverlay) return null;

  return (
    <div
      className="absolute inset-0 z-30 flex items-center justify-center bg-surface/30 backdrop-blur-md"
      aria-busy="true"
      aria-label="Loading page"
    >
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
          Loading…
        </span>
      </div>
    </div>
  );
}
