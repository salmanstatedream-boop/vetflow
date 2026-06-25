'use client';

import { Bell, Search } from 'lucide-react';
import { resolvePageTitle } from '@/lib/navigation/dashboard-nav';
import { cn } from '@/lib/utils';

function UserAvatar({
  hasAvatar,
  initial,
  className = 'w-8 h-8 rounded-xl',
}: {
  hasAvatar: boolean;
  initial: string;
  className?: string;
}) {
  if (hasAvatar) {
    return (
      <img
        src="/api/profile/photo"
        alt=""
        className={cn(className, 'object-cover bg-primary/15 border border-outline-variant/30')}
      />
    );
  }
  return (
    <div
      className={cn(
        className,
        'bg-primary/15 text-primary flex items-center justify-center font-bold text-xs border border-outline-variant/30'
      )}
    >
      {initial}
    </div>
  );
}

interface DashboardTopBarProps {
  pathname: string;
  firstName: string;
  organizationName?: string | null;
  displayDate: string;
  notificationCount?: number;
  hasAvatar: boolean;
  avatarInitial: string;
  roleLabel: string;
  onSearchOpen: () => void;
}

export default function DashboardTopBar({
  pathname,
  firstName,
  organizationName,
  displayDate,
  notificationCount = 0,
  hasAvatar,
  avatarInitial,
  roleLabel,
  onSearchOpen,
}: DashboardTopBarProps) {
  const pageTitle = resolvePageTitle(pathname);

  return (
    <div className="border-b border-outline-variant/40 bg-surface-container/50 backdrop-blur-xl px-4 md:px-6 py-4 md:py-5">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-lg md:text-xl font-bold text-on-surface font-[family-name:var(--font-display)]">
            {pageTitle}
          </h1>
          <p className="text-xs text-on-surface-variant mt-0.5 truncate">
            Welcome back, {firstName}! Here&apos;s what&apos;s happening at{' '}
            {organizationName || 'your clinic'}.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 md:gap-3">
          <button
            type="button"
            onClick={onSearchOpen}
            className="flex-1 md:flex-none flex items-center gap-2 px-3 py-2 min-w-[140px] md:min-w-[220px] rounded-xl border border-outline-variant/50 bg-surface-container/40 text-xs text-on-surface-variant hover:border-primary/30 hover:text-on-surface transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            aria-label="Search clinic records"
          >
            <Search className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Search patients, appointments, invoices…</span>
            <span className="hidden sm:inline ml-auto text-[9px] font-semibold opacity-50 border border-outline-variant/40 px-1 rounded">
              ⌘K
            </span>
          </button>

          <button
            type="button"
            className="relative p-2 rounded-xl border border-outline-variant/50 bg-surface-container/40 text-on-surface-variant hover:text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            aria-label={`Notifications${notificationCount > 0 ? `, ${notificationCount} items` : ''}`}
          >
            <Bell className="w-4 h-4" />
            {notificationCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-primary text-[9px] font-bold text-on-primary flex items-center justify-center neon-accent-line">
                {notificationCount > 9 ? '9+' : notificationCount}
              </span>
            )}
          </button>

          <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl border border-outline-variant/40 bg-surface-container/30 text-xs text-on-surface-variant">
            {displayDate}
          </div>

          <div className="flex items-center gap-2 pl-1">
            <UserAvatar hasAvatar={hasAvatar} initial={avatarInitial} />
            <div className="hidden md:block min-w-0">
              <span className="text-[11px] font-bold text-on-surface block truncate">{firstName}</span>
              <span className="text-[9px] text-on-surface-variant block">{roleLabel}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
