'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DashboardCollapsibleSectionProps {
  title: string;
  subtitle?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

export default function DashboardCollapsibleSection({
  title,
  subtitle,
  defaultOpen = false,
  children,
}: DashboardCollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="dashboard-card overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-surface-container/30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/40"
      >
        <div className="min-w-0">
          <h3 className="text-xs font-bold text-on-surface">{title}</h3>
          {subtitle && <p className="text-[10px] text-on-surface-variant mt-0.5">{subtitle}</p>}
        </div>
        <ChevronDown
          className={cn('w-4 h-4 text-on-surface-variant shrink-0 transition-transform', open && 'rotate-180')}
        />
      </button>
      {open && (
        <div className="px-4 pb-4 pt-1 border-t border-outline-variant/25">{children}</div>
      )}
    </div>
  );
}
