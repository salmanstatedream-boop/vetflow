'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ComponentProps } from 'react';
import { useGlobalLoadingOptional } from '@/components/layout/NavigationLoadingProvider';
import { routePathsMatch } from '@/lib/utils/route-path';

type AppLinkProps = ComponentProps<typeof Link>;

function resolveHref(href: AppLinkProps['href']): string {
  if (typeof href === 'string') return href;
  const path = href.pathname ?? '';
  return path.startsWith('/') && !path.startsWith('//') ? path : '';
}

export default function AppLink({ href, onClick, ...props }: AppLinkProps) {
  const pathname = usePathname();
  const nav = useGlobalLoadingOptional();

  return (
    <Link
      href={href}
      onClick={(e) => {
        const target = resolveHref(href);
        if (target && !routePathsMatch(target, pathname)) {
          nav?.startNavigation(target);
        }
        onClick?.(e);
      }}
      {...props}
    />
  );
}
