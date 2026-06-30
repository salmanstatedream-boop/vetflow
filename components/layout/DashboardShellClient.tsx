'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import type { ServerAuthContext } from '@/lib/auth/context';
import { setActiveBranchAction } from '@/lib/services/branch-cookie-actions';
import { globalClinicSearchAction } from '@/lib/services/search-actions';
import LogoutButton from '@/components/ui/premium/LogoutButton';
import ImpersonationBanner from '@/components/layout/ImpersonationBanner';
import DashboardPageTransition from '@/components/layout/DashboardPageTransition';
import DashboardNavLink from '@/components/layout/DashboardNavLink';
import DashboardSidebarNav from '@/components/layout/DashboardSidebarNav';
import DashboardTopBar from '@/components/layout/DashboardTopBar';
import ThemeToggle from '@/components/layout/ThemeToggle';
import { CurrencyProvider } from '@/lib/context/CurrencyContext';
import { DashboardShellProvider, useDashboardShell } from '@/lib/context/DashboardShellContext';
import DashboardNotificationsSync from '@/components/layout/DashboardNotificationsSync';
import DashboardCheckoutAlertBar from '@/components/layout/DashboardCheckoutAlertBar';
import DashboardAssignedConsultAlertBar from '@/components/layout/DashboardAssignedConsultAlertBar';
import DashboardBranchSearchCluster from '@/components/layout/DashboardBranchSearchCluster';
import DashboardAiAssistantWidget from '@/components/layout/DashboardAiAssistantWidget';
import DeviceTimezoneSync from '@/components/layout/DeviceTimezoneSync';
import StaffAttendanceGate from '@/components/layout/StaffAttendanceGate';
import { AttendanceProvider, useAttendance } from '@/lib/context/AttendanceContext';
import type { MyAttendance } from '@/components/dashboard/AttendanceWidgetClient';
import { hasCapability } from '@/lib/auth/capabilities';
import { EMPTY_ATTENDANCE } from '@/lib/dashboard/load-my-attendance';
import { resolveClinicLogoSrc } from '@/lib/branding/clinic-logo';
import { Stethoscope, Search, Menu, X, PanelLeftClose } from 'lucide-react';
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
        className={`${className} object-cover bg-primary/15 border border-outline-variant/30`}
      />
    );
  }
  return (
    <div
      className={`${className} bg-primary/15 text-primary flex items-center justify-center font-bold text-xs border border-outline-variant/30`}
    >
      {initial}
    </div>
  );
}

function formatRoleLabel(role: string | null | undefined): string {
  switch (role) {
    case 'clinic_admin':
      return 'Clinic Admin';
    case 'receptionist':
      return 'Receptionist';
    case 'doctor':
      return 'Doctor';
    default:
      return role?.replace(/_/g, ' ') || 'Staff';
  }
}

const SIDEBAR_COLLAPSED_KEY = 'vetflow_sidebar_collapsed';
const SIDEBAR_WIDTH_EXPANDED = '17rem';
const SIDEBAR_WIDTH_COLLAPSED = '4rem';

function SidebarBrand({
  organizationName,
  clinicLogoUrl,
  collapsed = false,
  interactive = false,
  onLogoClick,
}: {
  organizationName?: string | null;
  clinicLogoUrl?: string | null;
  collapsed?: boolean;
  interactive?: boolean;
  onLogoClick?: () => void;
}) {
  const logoSrc = resolveClinicLogoSrc(clinicLogoUrl);
  const logoMark = logoSrc ? (
    <img
      src={logoSrc}
      alt=""
      className="w-9 h-9 rounded-xl object-contain bg-white/10 border border-outline-variant/30"
    />
  ) : (
    <div className="w-9 h-9 bg-gradient-to-br from-violet-500/30 to-purple-800/40 flex items-center justify-center rounded-xl border border-violet-500/20 neon-accent-line">
      <Stethoscope className="w-4 h-4 text-primary" />
    </div>
  );

  const rowClass = `h-16 flex items-center border-b border-outline-variant/50 shrink-0 ${collapsed ? 'justify-center px-2' : 'px-5 gap-2.5'}`;

  if (interactive && onLogoClick) {
    return (
      <div className={rowClass}>
        <button
          type="button"
          onClick={onLogoClick}
          className="rounded-xl p-1 cursor-pointer hover:bg-surface-container-high focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 transition-colors"
          aria-label="Expand sidebar"
          title="Expand sidebar"
        >
          {logoMark}
        </button>
      </div>
    );
  }

  return (
    <div className={rowClass}>
      {logoMark}
      {!collapsed && (
        <div className="min-w-0">
          <span className="font-bold text-sm text-on-surface block font-[family-name:var(--font-display)] truncate">
            VetFlow
          </span>
          <span className="text-[9px] text-on-surface-variant uppercase tracking-wider block truncate">
            {organizationName || 'AI Clinic OS'}
          </span>
        </div>
      )}
    </div>
  );
}

interface DashboardShellClientProps {
  session: ServerAuthContext;
  activeBranchId?: string;
  initialAttendance?: MyAttendance;
  children: React.ReactNode;
}

export default function DashboardShellClient({
  session,
  activeBranchId,
  initialAttendance = EMPTY_ATTENDANCE,
  children,
}: DashboardShellClientProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isBranchDropdownOpen, setIsBranchDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<
    Awaited<ReturnType<typeof globalClinicSearchAction>>['results']
  >([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [headerScrolled, setHeaderScrolled] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const mainScrollRef = React.useRef<HTMLElement>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
      if (stored === 'true') setSidebarCollapsed(true);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty(
      '--dashboard-sidebar-width',
      sidebarCollapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH_EXPANDED
    );
  }, [sidebarCollapsed]);

  const toggleSidebarCollapsed = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  useEffect(() => {
    const el = mainScrollRef.current;
    if (!el) return;
    const onScroll = () => setHeaderScrolled(el.scrollTop > 4);
    onScroll();
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, [pathname]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const activeBranch =
    session.branches.find((b) => b.id === activeBranchId) || session.branches[0];
  const displayName = [session.firstName || 'User', session.lastName].filter(Boolean).join(' ');
  const avatarInitial = (session.firstName?.charAt(0) || session.email?.charAt(0) || 'U').toUpperCase();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (!isSearchOpen) return;
    const q = searchQuery.trim();
    if (q.length < 2) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setSearchLoading(true);
      const res = await globalClinicSearchAction({ query: q });
      setSearchResults(res.success ? res.results || [] : []);
      setSearchLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, isSearchOpen]);

  const handleBranchChange = (branchId: string) => {
    startTransition(async () => {
      const result = await setActiveBranchAction(branchId);
      if (result.success) {
        setIsBranchDropdownOpen(false);
        router.refresh();
      }
    });
  };

  const navLinkClass = (active: boolean) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
      active
        ? 'bg-primary/20 text-primary border border-primary/30 shadow-sm'
        : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high border border-transparent'
    }`;

  const mobileMenuButton = (
    <button
      type="button"
      className="lg:hidden p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high shrink-0"
      onClick={() => setIsMobileMenuOpen(true)}
      aria-label="Open menu"
    >
      <Menu className="w-5 h-5" />
    </button>
  );

  const branchSearchCluster = (
    <DashboardBranchSearchCluster
      branches={session.branches}
      activeBranchId={activeBranchId}
      activeBranchName={activeBranch?.name}
      isPending={isPending}
      isDropdownOpen={isBranchDropdownOpen}
      onToggleDropdown={() => setIsBranchDropdownOpen((o) => !o)}
      onCloseDropdown={() => setIsBranchDropdownOpen(false)}
      onBranchChange={handleBranchChange}
      onSearchOpen={() => setIsSearchOpen(true)}
    />
  );

  const showAttendance =
    session.role !== 'clinic_admin' && hasCapability(session.role, 'mark_attendance');
  const staffRequiresAttendanceGate =
    showAttendance && (session.role === 'receptionist' || session.role === 'doctor');

  const topBarCompact = pathname !== '/dashboard';

  return (
    <DashboardShellProvider key={activeBranchId}>
      <DeviceTimezoneSync />
      <DashboardNotificationsSync />
      <AttendanceProvider initial={initialAttendance}>
        <DashboardShellBody
          session={session}
          activeBranchId={activeBranchId}
          staffRequiresAttendanceGate={staffRequiresAttendanceGate}
          topBarCompact={topBarCompact}
          pathname={pathname}
          sidebarCollapsed={sidebarCollapsed}
          toggleSidebarCollapsed={toggleSidebarCollapsed}
          navLinkClass={navLinkClass}
          displayName={displayName}
          avatarInitial={avatarInitial}
          headerScrolled={headerScrolled}
          mainScrollRef={mainScrollRef}
          mobileMenuButton={mobileMenuButton}
          branchSearchCluster={branchSearchCluster}
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
          isSearchOpen={isSearchOpen}
          setIsSearchOpen={setIsSearchOpen}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          searchResults={searchResults}
          searchLoading={searchLoading}
        >
          {children}
        </DashboardShellBody>
      </AttendanceProvider>
    </DashboardShellProvider>
  );
}

type DashboardShellBodyProps = {
  session: ServerAuthContext;
  activeBranchId?: string;
  staffRequiresAttendanceGate: boolean;
  topBarCompact: boolean;
  pathname: string;
  sidebarCollapsed: boolean;
  toggleSidebarCollapsed: () => void;
  navLinkClass: (active: boolean) => string;
  displayName: string;
  avatarInitial: string;
  headerScrolled: boolean;
  mainScrollRef: React.RefObject<HTMLElement | null>;
  mobileMenuButton: React.ReactNode;
  branchSearchCluster: React.ReactNode;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  searchResults: Awaited<ReturnType<typeof globalClinicSearchAction>>['results'];
  searchLoading: boolean;
  children: React.ReactNode;
};

function DashboardShellBody({
  session,
  staffRequiresAttendanceGate,
  topBarCompact,
  pathname,
  sidebarCollapsed,
  toggleSidebarCollapsed,
  navLinkClass,
  displayName,
  avatarInitial,
  headerScrolled,
  mainScrollRef,
  mobileMenuButton,
  branchSearchCluster,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  isSearchOpen,
  setIsSearchOpen,
  searchQuery,
  setSearchQuery,
  searchResults,
  searchLoading,
  children,
}: DashboardShellBodyProps) {
  const attendance = useAttendance();
  const attendanceGateLocked =
    staffRequiresAttendanceGate && !(attendance?.checkedIn ?? false);

  return (
    <div className="h-screen overflow-hidden bg-surface flex flex-col dashboard-shell">
      {session.isImpersonating && session.organizationName && (
        <ImpersonationBanner organizationName={session.organizationName} />
      )}

      {isSearchOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center pt-24 px-4">
          <div className="dashboard-card w-full max-w-xl overflow-hidden">
            <div className="p-4 flex items-center gap-3 border-b border-outline-variant/40">
              <Search className="w-5 h-5 text-outline" />
              <input
                type="text"
                placeholder="Search customers, pets, invoices..."
                className="w-full text-sm outline-none bg-transparent text-on-surface placeholder:text-outline"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
              <button
                type="button"
                onClick={() => setIsSearchOpen(false)}
                className="text-[10px] font-semibold px-2 py-1 rounded border border-outline-variant text-on-surface-variant"
              >
                ESC
              </button>
            </div>
            <div className="p-2 max-h-72 overflow-y-auto">
              {searchLoading && (
                <p className="text-xs text-on-surface-variant text-center py-6">Searching...</p>
              )}
              {!searchLoading && searchQuery.trim().length < 2 && (
                <p className="text-xs text-on-surface-variant text-center py-6">Type at least 2 characters</p>
              )}
              {!searchLoading && searchQuery.trim().length >= 2 && (searchResults?.length === 0 ? (
                <p className="text-xs text-on-surface-variant text-center py-6">No results</p>
              ) : (
                <ul className="divide-y divide-outline-variant/50">
                  {searchResults?.map((r) => (
                    <li key={`${r.type}-${r.id}`}>
                      <DashboardNavLink
                        href={r.href}
                        onClick={() => setIsSearchOpen(false)}
                        className="block px-3 py-2.5 hover:bg-surface-container-high rounded-lg"
                      >
                        <span className="text-[9px] uppercase text-primary font-bold">{r.type}</span>
                        <p className="text-xs font-semibold text-on-surface">{r.title}</p>
                        <p className={`text-[10px] ${r.phoneMatch ? 'text-primary font-semibold' : 'text-on-surface-variant'}`}>
                          {r.phoneMatch ? `Phone match: ${r.subtitle}` : r.subtitle}
                        </p>
                      </DashboardNavLink>
                    </li>
                  ))}
                </ul>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-1 min-h-0 overflow-hidden relative">
        <aside
          className={cn(
            'hidden lg:flex bg-surface-container/80 border-r border-outline-variant/50 flex-col z-20 backdrop-blur-xl shrink-0 transition-[width] duration-200 h-full',
            sidebarCollapsed ? 'w-16' : 'w-[17rem]'
          )}
        >
          <div className="relative">
            <SidebarBrand
              organizationName={session.organizationName}
              clinicLogoUrl={session.clinicLogoUrl}
              collapsed={sidebarCollapsed}
              interactive={sidebarCollapsed}
              onLogoClick={sidebarCollapsed ? toggleSidebarCollapsed : undefined}
            />
            {!sidebarCollapsed && (
              <button
                type="button"
                onClick={toggleSidebarCollapsed}
                className="absolute right-2 top-5 p-1 rounded-lg text-on-surface-variant hover:bg-surface-container-high hidden lg:flex"
                aria-label="Collapse sidebar"
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>
            )}
          </div>
          <nav className="flex-1 py-4 px-3 overflow-y-auto overscroll-contain" aria-label="Main navigation">
            <DashboardSidebarNav
              session={session}
              pathname={pathname}
              navLinkClass={navLinkClass}
              collapsed={sidebarCollapsed}
              navLocked={attendanceGateLocked}
            />
          </nav>
          <div className="p-4 border-t border-outline-variant/50 shrink-0">
            <div className={`flex items-center gap-2 ${sidebarCollapsed ? 'justify-center' : 'justify-between'}`}>
              <DashboardNavLink
                href="/dashboard/profile"
                className={`flex items-center gap-3 min-w-0 hover:opacity-90 transition-opacity ${sidebarCollapsed ? 'justify-center' : ''}`}
                title={sidebarCollapsed ? displayName : undefined}
              >
                <UserAvatar hasAvatar={session.hasAvatar} initial={avatarInitial} />
                {!sidebarCollapsed && (
                  <div className="min-w-0">
                    <span className="text-[11px] font-bold text-on-surface block truncate">{displayName}</span>
                    <span className="text-[9px] text-on-surface-variant block">{formatRoleLabel(session.role)}</span>
                  </div>
                )}
              </DashboardNavLink>
              {!sidebarCollapsed && (
                <LogoutButton className="text-on-surface-variant hover:text-destructive p-1.5 rounded-lg hover:bg-surface-container-high transition-colors" />
              )}
            </div>
          </div>
        </aside>

        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-40 lg:hidden flex">
            <div className="fixed inset-0 bg-black/50" onClick={() => setIsMobileMenuOpen(false)} />
            <aside className="relative w-[17rem] bg-surface-container h-full z-10 border-r border-outline-variant flex flex-col">
              <div className="flex items-center justify-between pr-4">
                <SidebarBrand organizationName={session.organizationName} clinicLogoUrl={session.clinicLogoUrl} />
                <button type="button" onClick={() => setIsMobileMenuOpen(false)} className="absolute right-4 top-5">
                  <X className="w-5 h-5 text-on-surface-variant" />
                </button>
              </div>
              <nav className="flex-1 py-4 px-3 overflow-y-auto">
                <DashboardSidebarNav
                  session={session}
                  pathname={pathname}
                  navLinkClass={navLinkClass}
                  onNavigate={() => setIsMobileMenuOpen(false)}
                  navLocked={attendanceGateLocked}
                />
              </nav>
              <div className="p-4 border-t border-outline-variant">
                <div className="flex items-center justify-between gap-2">
                  <DashboardNavLink href="/dashboard/profile" className="flex items-center gap-3 min-w-0" onClick={() => setIsMobileMenuOpen(false)}>
                    <UserAvatar hasAvatar={session.hasAvatar} initial={avatarInitial} />
                    <div className="min-w-0">
                      <span className="text-[11px] font-bold text-on-surface block truncate">{displayName}</span>
                      <span className="text-[9px] text-on-surface-variant block">{formatRoleLabel(session.role)}</span>
                    </div>
                  </DashboardNavLink>
                  <LogoutButton className="text-on-surface-variant hover:text-destructive p-1.5 rounded-lg" />
                </div>
              </div>
            </aside>
          </div>
        )}

        <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden">
          <div
            className={cn(
              'sticky top-0 z-30 bg-surface/75 backdrop-blur-xl border-b border-outline-variant/40',
              headerScrolled && 'shadow-sm'
            )}
          >
            <ConnectedDashboardTopBar
              pathname={pathname}
              firstName={session.firstName || 'User'}
              organizationName={session.organizationName}
              clinicLogoUrl={session.clinicLogoUrl}
              hasAvatar={session.hasAvatar}
              avatarInitial={avatarInitial}
              roleLabel={formatRoleLabel(session.role)}
              compact={topBarCompact}
              mobileMenuButton={mobileMenuButton}
              branchSearchCluster={branchSearchCluster}
              themeToggle={<ThemeToggle />}
            />
            <DashboardCheckoutAlertBar />
            <DashboardAssignedConsultAlertBar />
          </div>

          <main
            ref={mainScrollRef}
            className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 md:p-6 lg:p-8 max-w-[1600px] w-full mx-auto relative"
          >
            <CurrencyProvider currency={session.currency}>
              <StaffAttendanceGate locked={attendanceGateLocked}>
                <DashboardPageTransition>{children}</DashboardPageTransition>
              </StaffAttendanceGate>
            </CurrencyProvider>
          </main>

          <DashboardAiAssistantWidget role={session.role} features={session.features} />
        </div>
      </div>
    </div>
  );
}

function ConnectedDashboardTopBar(
  props: Omit<
    React.ComponentProps<typeof DashboardTopBar>,
    'notificationCount' | 'notifications' | 'onClearNotifications'
  >
) {
  const shell = useDashboardShell();
  return (
    <DashboardTopBar
      {...props}
      notificationCount={shell?.notificationCount ?? 0}
      notifications={shell?.notifications ?? []}
      onClearNotifications={shell?.clearNotifications}
    />
  );
}
