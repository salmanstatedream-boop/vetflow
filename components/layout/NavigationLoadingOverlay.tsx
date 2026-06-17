'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useGlobalLoadingOptional } from '@/components/layout/NavigationLoadingProvider';

const OVERLAY_DELAY_MS = 500;

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
      className="absolute inset-0 z-30 flex items-center justify-center bg-surface/20 backdrop-blur-[2px] pointer-events-none"
      aria-busy="true"
      aria-label="Loading page"
    >
      <Loader2 className="w-7 h-7 text-primary animate-spin opacity-70" />
    </div>
  );
}
