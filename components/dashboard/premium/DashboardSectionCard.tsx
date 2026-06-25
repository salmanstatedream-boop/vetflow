import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DashboardSectionCardProps {
  title: string;
  subtitle?: string;
  href?: string;
  linkLabel?: string;
  className?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}

export default function DashboardSectionCard({
  title,
  subtitle,
  href,
  linkLabel = 'View all',
  className,
  children,
  action,
}: DashboardSectionCardProps) {
  return (
    <section className={cn('dashboard-card p-5 md:p-6 flex flex-col min-h-0', className)}>
      <div className="flex items-start justify-between gap-3 mb-4 shrink-0">
        <div>
          <h3 className="text-sm font-bold text-on-surface">{title}</h3>
          {subtitle && (
            <p className="text-[11px] text-on-surface-variant mt-0.5">{subtitle}</p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {action}
          {href && (
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
    </section>
  );
}
