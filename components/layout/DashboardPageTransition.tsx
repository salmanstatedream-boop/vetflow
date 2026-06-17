'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useEffect, type ReactNode } from 'react';
import { useGlobalLoadingOptional } from '@/components/layout/NavigationLoadingProvider';

function NavigationCompleteOnMount({ children }: { children: ReactNode }) {
  const nav = useGlobalLoadingOptional();

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      nav?.completeNavigation();
    });
    return () => cancelAnimationFrame(frame);
  }, [nav]);

  return <>{children}</>;
}

export default function DashboardPageTransition({ children }: { children: ReactNode }) {
  const reduceMotion = useReducedMotion();
  const nav = useGlobalLoadingOptional();

  if (reduceMotion) {
    return <NavigationCompleteOnMount>{children}</NavigationCompleteOnMount>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      onAnimationComplete={() => nav?.completeNavigation()}
    >
      {children}
    </motion.div>
  );
}
