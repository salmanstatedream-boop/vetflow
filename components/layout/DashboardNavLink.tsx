'use client';

import Link from 'next/link';
import type { ComponentProps } from 'react';
import { useGlobalLoadingOptional } from '@/components/layout/NavigationLoadingProvider';

type DashboardNavLinkProps = ComponentProps<typeof Link>;

export default function DashboardNavLink({ href, onClick, ...props }: DashboardNavLinkProps) {
  const nav = useGlobalLoadingOptional();

  return (
    <Link
      href={href}
      onClick={(e) => {
        const target = typeof href === 'string' ? href : href.pathname ?? '';
        if (target && !target.startsWith('http')) {
          nav?.startLoading();
        }
        onClick?.(e);
      }}
      {...props}
    />
  );
}
