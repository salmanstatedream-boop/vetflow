'use client';

import Link from 'next/link';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';
import { useGlobalLoadingOptional } from '@/components/layout/NavigationLoadingProvider';

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
  const nav = useGlobalLoadingOptional();
  const target = resolveHref(href);
  const isPending =
    nav?.isNavigating &&
    nav.navigationTarget != null &&
    (nav.navigationTarget === target || target.startsWith(`${nav.navigationTarget}/`));

  return (
    <Link
      href={href}
      onClick={(e) => {
        if (target && !target.startsWith('http')) {
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
