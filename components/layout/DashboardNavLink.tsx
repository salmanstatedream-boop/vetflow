'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';
import { useGlobalLoadingOptional } from '@/components/layout/NavigationLoadingProvider';
import { normalizeRoutePath, routePathsMatch } from '@/lib/utils/route-path';

type DashboardNavLinkProps = ComponentProps<typeof Link>;

function resolveHref(href: DashboardNavLinkProps['href']): string {
  if (typeof href === 'string') return href;
  const path = href.pathname ?? '';
  const query = href.query
    ? `?${new URLSearchParams(href.query as Record<string, string>).toString()}`
    : '';
  return `${path}${query}`;
}

export default function DashboardNavLink({ href, onClick, className, ...props }: DashboardNavLinkProps) {
  const pathname = usePathname();
  const nav = useGlobalLoadingOptional();
  const target = resolveHref(href);
  const targetPath = normalizeRoutePath(target.split('?')[0] ?? target);
  const isPending =
    nav?.isNavigating &&
    nav.navigationTarget != null &&
    (routePathsMatch(nav.navigationTarget, targetPath) ||
      targetPath.startsWith(`${normalizeRoutePath(nav.navigationTarget)}/`));

  return (
    <Link
      href={href}
      onClick={(e) => {
        if (nav?.isNavigating) {
          e.preventDefault();
          return;
        }
        if (target && !target.startsWith('http') && routePathsMatch(target, pathname)) {
          e.preventDefault();
          return;
        }
        if (target && !target.startsWith('http') && !routePathsMatch(target, pathname)) {
          nav?.startNavigation(target);
        }
        onClick?.(e);
      }}
      className={cn(className, isPending && 'opacity-80 animate-pulse')}
      aria-busy={isPending || undefined}
      {...props}
    />
  );
}
