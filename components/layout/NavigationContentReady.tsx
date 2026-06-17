'use client';

import { useLayoutEffect, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { useGlobalLoadingOptional } from '@/components/layout/NavigationLoadingProvider';

/** Signals that routed page content has mounted and painted. */
export default function NavigationContentReady({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const nav = useGlobalLoadingOptional();
  const completeNavigation = nav?.completeNavigation;

  useLayoutEffect(() => {
    if (!completeNavigation) return;
    let frame1 = 0;
    let frame2 = 0;
    frame1 = requestAnimationFrame(() => {
      frame2 = requestAnimationFrame(() => {
        completeNavigation();
      });
    });
    return () => {
      cancelAnimationFrame(frame1);
      cancelAnimationFrame(frame2);
    };
  }, [pathname, completeNavigation]);

  return <>{children}</>;
}
