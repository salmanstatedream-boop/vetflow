'use client';

import { motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { useGlobalLoadingOptional } from '@/components/layout/NavigationLoadingProvider';
import NavigationContentReady from '@/components/layout/NavigationContentReady';

export default function DashboardPageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const nav = useGlobalLoadingOptional();

  if (reduceMotion) {
    return <NavigationContentReady>{children}</NavigationContentReady>;
  }

  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      onAnimationComplete={() => nav?.completeNavigation()}
    >
      <NavigationContentReady>{children}</NavigationContentReady>
    </motion.div>
  );
}
