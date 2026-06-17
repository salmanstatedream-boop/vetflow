'use client';

import Link from 'next/link';
import type { ComponentProps } from 'react';
import { useGlobalLoadingOptional } from '@/components/layout/NavigationLoadingProvider';

type AppLinkProps = ComponentProps<typeof Link>;

function resolveHref(href: AppLinkProps['href']): string {
  if (typeof href === 'string') return href;
  const path = href.pathname ?? '';
  return path.startsWith('/') && !path.startsWith('//') ? path : '';
}

export default function AppLink({ href, onClick, ...props }: AppLinkProps) {
  const nav = useGlobalLoadingOptional();

  return (
    <Link
      href={href}
      onClick={(e) => {
        const target = resolveHref(href);
        if (target) {
          nav?.startNavigation(target);
        }
        onClick?.(e);
      }}
      {...props}
    />
  );
}
