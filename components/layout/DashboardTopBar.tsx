'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Bell } from 'lucide-react';
import ClinicOrPlatformLogo from '@/components/brand/ClinicOrPlatformLogo';
import { PRODUCT_NAME } from '@/lib/brand';
import { resolvePageTitle } from '@/lib/navigation/dashboard-nav';
import { cn } from '@/lib/utils';
import type { DashboardNotification } from '@/lib/dashboard/notifications';
import DashboardNotificationsPanel from '@/components/layout/DashboardNotificationsPanel';
import DeviceLocalDate from '@/components/layout/DeviceLocalDate';

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

function ClinicBrandCluster({
  clinicLogoUrl,
  organizationName,
}: {
  clinicLogoUrl?: string | null;
  organizationName?: string | null;
}) {
  return (
    <div className="hidden xl:flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-outline-variant/40 bg-surface-container/30 shrink-0">
      <ClinicOrPlatformLogo
        clinicLogoUrl={clinicLogoUrl}
        size={32}
        imgClassName="rounded-lg"
        platformWrapperClassName="rounded-lg"
      />
      <div className="min-w-0">
        <span className="text-[11px] font-bold text-on-surface block font-[family-name:var(--font-display)] leading-tight">
          {PRODUCT_NAME}
        </span>
        <span className="text-[9px] text-on-surface-variant block truncate max-w-[120px]">
          {organizationName || 'Clinic'}
        </span>
      </div>
    </div>
  );
}

interface DashboardTopBarProps {
  pathname: string;
  firstName: string;
  organizationName?: string | null;
  clinicLogoUrl?: string | null;
  notificationCount?: number;
  notifications?: DashboardNotification[];
  onClearNotifications?: () => void;
  hasAvatar: boolean;
  avatarInitial: string;
  roleLabel: string;
  compact?: boolean;
  mobileMenuButton?: ReactNode;
  branchSearchCluster?: ReactNode;
  themeToggle?: ReactNode;
}

export default function DashboardTopBar({
  pathname,
  firstName,
  organizationName,
  clinicLogoUrl,
  notificationCount = 0,
  notifications = [],
  onClearNotifications,
  hasAvatar,
  avatarInitial,
  roleLabel,
  compact = false,
  mobileMenuButton,
  branchSearchCluster,
  themeToggle,
}: DashboardTopBarProps) {
  const pageTitle = resolvePageTitle(pathname);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const bellRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (compact) setNotificationsOpen(false);
  }, [compact]);

  return (
    <div
      className={cn(
        'bg-transparent px-4 md:px-6 transition-[padding] duration-200',
        compact ? 'py-2' : 'py-3 md:py-4'
      )}
    >
      <div
        className={cn(
          'min-w-0 overflow-hidden transition-all duration-200',
          compact ? 'max-h-0 opacity-0 mb-0' : 'max-h-24 opacity-100 mb-3'
        )}
        aria-hidden={compact}
      >
        <h1 className="text-lg md:text-xl font-bold text-on-surface font-[family-name:var(--font-display)]">
          {pageTitle}
        </h1>
        <p className="text-xs text-on-surface-variant mt-0.5 truncate">
          Welcome back, {firstName}! Here&apos;s what&apos;s happening at{' '}
          {organizationName || 'your clinic'}.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2 md:gap-3">
        {mobileMenuButton}
        {branchSearchCluster && (
          <div className="flex-1 min-w-[200px] order-first sm:order-none w-full sm:w-auto">
            {branchSearchCluster}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2 md:gap-3 ml-auto">
          {!compact && (
            <ClinicBrandCluster clinicLogoUrl={clinicLogoUrl} organizationName={organizationName} />
          )}

          {!compact && (
            <>
              <button
                ref={bellRef}
                type="button"
                onClick={() => setNotificationsOpen((o) => !o)}
                className="relative p-2 rounded-xl border border-outline-variant/50 bg-surface-container/40 text-on-surface-variant hover:text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                aria-label={`Notifications${notificationCount > 0 ? `, ${notificationCount} items` : ''}`}
                aria-expanded={notificationsOpen}
              >
                <Bell className="w-4 h-4" />
                {notificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-primary text-[9px] font-bold text-on-primary flex items-center justify-center neon-accent-line">
                    {notificationCount > 9 ? '9+' : notificationCount}
                  </span>
                )}
              </button>

              <DashboardNotificationsPanel
                open={notificationsOpen}
                onClose={() => setNotificationsOpen(false)}
                onClear={onClearNotifications}
                notifications={notifications}
                triggerRef={bellRef}
              />
            </>
          )}

          <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl border border-outline-variant/40 bg-surface-container/30 text-xs text-on-surface-variant">
            <DeviceLocalDate />
          </div>

          {themeToggle}

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
