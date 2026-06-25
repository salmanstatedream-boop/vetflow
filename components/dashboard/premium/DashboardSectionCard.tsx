import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { DASHBOARD_DENSITY } from '@/lib/ui/dashboard-tokens';
import { cn } from '@/lib/utils';

interface DashboardSectionCardProps {
  title: string;
  subtitle?: string;
  href?: string;
  linkLabel?: string;
  className?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  footer?: React.ReactNode;
  density?: 'default' | 'compact';
}

export default function DashboardSectionCard({
  title,
  subtitle,
  href,
  linkLabel = 'View all',
  className,
  children,
  action,
  footer,
  density = 'default',
}: DashboardSectionCardProps) {
  const compact = density === 'compact';

  return (
    <section
      className={cn(
        'dashboard-card flex flex-col min-h-0',
        compact ? 'dashboard-card-compact' : 'p-5 md:p-6',
        className
      )}
    >
      <div className={cn('flex items-start justify-between gap-3 shrink-0', compact ? 'mb-2.5' : 'mb-4')}>
        <div className="min-w-0">
          <h3 className={cn('font-bold text-on-surface', compact ? 'text-xs' : 'text-sm')}>{title}</h3>
          {subtitle && (
            <p className={cn('text-on-surface-variant mt-0.5', compact ? 'text-[10px]' : 'text-[11px]')}>
              {subtitle}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {action}
          {href && !footer && (
            <Link
              href={href}
              className="inline-flex items-center gap-0.5 text-[10px] font-bold text-primary hover:text-primary/80 transition-colors"
            >
              {linkLabel}
              <ChevronRight className="w-3 h-3" />
            </Link>
          )}
        </div>
      </div>
      <div className="flex-1 min-h-0">{children}</div>
      {footer && (
        <div className="mt-2.5 pt-2.5 border-t border-outline-variant/25 shrink-0">{footer}</div>
      )}
    </section>
  );
}
