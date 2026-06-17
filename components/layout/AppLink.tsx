'use client';

import Link from 'next/link';
import type { ComponentProps } from 'react';
import { useGlobalLoadingOptional } from '@/components/layout/NavigationLoadingProvider';

type AppLinkProps = ComponentProps<typeof Link>;

function isInternalHref(href: AppLinkProps['href']): boolean {
  if (typeof href === 'string') {
    return href.startsWith('/') && !href.startsWith('//');
  }
  const path = href.pathname ?? '';
  return path.startsWith('/') && !path.startsWith('//');
}

export default function AppLink({ href, onClick, ...props }: AppLinkProps) {
  const loading = useGlobalLoadingOptional();

  return (
    <Link
      href={href}
      onClick={(e) => {
        if (isInternalHref(href)) {
          loading?.startLoading();
        }
        onClick?.(e);
      }}
      {...props}
    />
  );
}
