'use client';

import { ChevronDown } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type CollapsiblePanelProps = {
  title: ReactNode;
  subtitle?: ReactNode;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
  className?: string;
  headerClassName?: string;
  bodyClassName?: string;
  trailing?: ReactNode;
};

export default function CollapsiblePanel({
  title,
  subtitle,
  open,
  onToggle,
  children,
  className,
  headerClassName,
  bodyClassName,
  trailing,
}: CollapsiblePanelProps) {
  return (
    <div className={cn(className)}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className={cn(
          'flex w-full items-start justify-between gap-2 text-left phx-focus-ring rounded-lg',
          headerClassName,
        )}
      >
        <div className="min-w-0 flex-1">
          {title}
          {subtitle}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {trailing}
          <ChevronDown
            className={cn(
              'h-4 w-4 text-on-surface-variant transition-transform duration-200',
              open && 'rotate-180',
            )}
          />
        </div>
      </button>
      {open ? <div className={bodyClassName}>{children}</div> : null}
    </div>
  );
}
