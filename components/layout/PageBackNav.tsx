'use client';

import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { ChevronLeft } from 'lucide-react';

export type PageBackNavItem = {
  label: string;
  href: string;
  icon?: LucideIcon;
};

interface PageBackNavProps {
  items: PageBackNavItem[];
  className?: string;
}

export default function PageBackNav({ items, className = '' }: PageBackNavProps) {
  if (items.length === 0) return null;

  return (
    <nav
      className={`flex flex-wrap items-center gap-x-4 gap-y-2 mb-3 ${className}`}
      aria-label="Back navigation"
    >
      {items.map((item) => {
        const Icon = item.icon ?? ChevronLeft;
        return (
          <Link
            key={item.href}
            href={item.href}
            className="inline-flex items-center gap-1.5 text-xs text-on-surface-variant/60 hover:text-primary font-semibold transition-colors"
          >
            <Icon className="w-4 h-4 shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
