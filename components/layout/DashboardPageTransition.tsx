'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useEffect, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { useGlobalLoadingOptional } from '@/components/layout/NavigationLoadingProvider';

function NavigationCompleteOnPathname({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const nav = useGlobalLoadingOptional();
  const isNavigating = nav?.isNavigating;
  const completeNavigation = nav?.completeNavigation;

  useEffect(() => {
    if (!isNavigating || !completeNavigation) return;
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
  }, [pathname, isNavigating, completeNavigation]);

  return <>{children}</>;
}

export default function DashboardPageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const nav = useGlobalLoadingOptional();

  if (reduceMotion) {
    return <NavigationCompleteOnPathname>{children}</NavigationCompleteOnPathname>;
  }

  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      onAnimationComplete={() => nav?.completeNavigation()}
    >
      {children}
    </motion.div>
  );
}
