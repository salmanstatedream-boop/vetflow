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
import { resolveClinicLogoSrc } from '@/lib/branding/clinic-logo';
import { Stethoscope, MapPin, Search, Menu, X, ChevronDown } from 'lucide-react';
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

function SidebarBrand({
  organizationName,
  clinicLogoUrl,
}: {
  organizationName?: string | null;
  clinicLogoUrl?: string | null;
}) {
  const logoSrc = resolveClinicLogoSrc(clinicLogoUrl);
  return (
    <div className="h-16 flex items-center px-5 gap-2.5 border-b border-outline-variant/50 shrink-0">
      {logoSrc ? (
        <img
          src={logoSrc}
          alt=""
          className="w-9 h-9 rounded-xl object-contain bg-white/10 border border-outline-variant/30"
        />
      ) : (
        <div className="w-9 h-9 bg-gradient-to-br from-violet-500/30 to-purple-800/40 flex items-center justify-center rounded-xl border border-violet-500/20 neon-accent-line">
          <Stethoscope className="w-4 h-4 text-primary" />
        </div>
      )}
      <div className="min-w-0">
        <span className="font-bold text-sm text-on-surface block font-[family-name:var(--font-display)] truncate">
          VetFlow
        </span>
        <span className="text-[9px] text-on-surface-variant uppercase tracking-wider block truncate">
          {organizationName || 'AI Clinic OS'}
        </span>
      </div>
    </div>
  );
}

interface DashboardShellClientProps {
  session: ServerAuthContext;
  activeBranchId?: string;
  children: React.ReactNode;
}

export default function DashboardShellClient({
  session,
  activeBranchId,
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

  useEffect(() => {
    const onScroll = () => setHeaderScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const activeBranch =
    session.branches.find((b) => b.id === activeBranchId) || session.branches[0];
  const displayName = [session.firstName || 'User', session.lastName].filter(Boolean).join(' ');
  const avatarInitial = (session.firstName?.charAt(0) || session.email?.charAt(0) || 'U').toUpperCase();
  const displayDate = new Date().toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

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

  const branchSwitcher = (
    <div className="relative">
      {session.branches.length > 0 ? (
        <>
          <button
            type="button"
            disabled={isPending}
            onClick={() => setIsBranchDropdownOpen(!isBranchDropdownOpen)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold border border-outline-variant/50 bg-surface-container/40 transition-opacity ${
              isPending ? 'opacity-60' : ''
            } ${activeBranch ? 'text-on-surface' : 'text-on-surface-variant'}`}
          >
            <MapPin className="w-3.5 h-3.5 text-primary" />
            <span className="truncate max-w-[140px]">{isPending ? 'Switching…' : activeBranch?.name || 'Branch'}</span>
            <ChevronDown className="w-3 h-3 text-outline shrink-0" />
          </button>
          {isBranchDropdownOpen && (
            <>
              <div className="fixed inset-0 z-20" onClick={() => setIsBranchDropdownOpen(false)} />
              <div className="absolute left-0 mt-2 w-56 dashboard-card z-30 py-1.5">
                <span className="block px-4 py-1.5 text-[9px] font-semibold text-outline uppercase">
                  Branch scope
                </span>
                {session.branches.map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => handleBranchChange(b.id)}
                    className={`w-full text-left px-4 py-2 text-xs font-semibold hover:bg-surface-container-high ${
                      b.id === activeBranchId ? 'text-primary' : 'text-on-surface'
                    }`}
                  >
                    {b.name}
                  </button>
                ))}
              </div>
            </>
          )}
        </>
      ) : (
        <span className="text-xs text-on-surface-variant flex items-center gap-2">
          <MapPin className="w-3.5 h-3.5" />
          No branch
        </span>
      )}
    </div>
  );

  return (
    <DashboardShellProvider>
      <DashboardNotificationsSync />
    <div className="min-h-screen bg-surface flex flex-col dashboard-shell">
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

      <div className="flex flex-1 relative">
        <aside className="hidden lg:flex w-[17rem] bg-surface-container/80 border-r border-outline-variant/50 flex-col sticky top-0 h-screen z-20 backdrop-blur-xl">
          <SidebarBrand organizationName={session.organizationName} clinicLogoUrl={session.clinicLogoUrl} />
          <nav className="flex-1 py-4 px-3 overflow-y-auto" aria-label="Main navigation">
            <DashboardSidebarNav session={session} pathname={pathname} navLinkClass={navLinkClass} />
          </nav>
          <div className="p-4 border-t border-outline-variant/50">
            <div className="flex items-center justify-between gap-2">
              <DashboardNavLink href="/dashboard/profile" className="flex items-center gap-3 min-w-0 hover:opacity-90 transition-opacity">
                <UserAvatar hasAvatar={session.hasAvatar} initial={avatarInitial} />
                <div className="min-w-0">
                  <span className="text-[11px] font-bold text-on-surface block truncate">{displayName}</span>
                  <span className="text-[9px] text-on-surface-variant block">{formatRoleLabel(session.role)}</span>
                </div>
              </DashboardNavLink>
              <LogoutButton className="text-on-surface-variant hover:text-destructive p-1.5 rounded-lg hover:bg-surface-container-high transition-colors" />
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

        <div className="flex-1 flex flex-col min-w-0">
          <div
            className={cn(
              'sticky top-0 z-30 bg-surface border-b border-outline-variant/40',
              headerScrolled && 'shadow-sm'
            )}
          >
            <div className="flex items-center justify-between gap-3 px-4 md:px-6 py-2 border-b border-outline-variant/20">
              <div className="flex items-center gap-3 min-w-0">
                <button
                  type="button"
                  className="lg:hidden p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high"
                  onClick={() => setIsMobileMenuOpen(true)}
                  aria-label="Open menu"
                >
                  <Menu className="w-5 h-5" />
                </button>
                {branchSwitcher}
              </div>
              <ThemeToggle />
            </div>
            <ConnectedDashboardTopBar
              pathname={pathname}
              firstName={session.firstName || 'User'}
              organizationName={session.organizationName}
              clinicLogoUrl={session.clinicLogoUrl}
              displayDate={displayDate}
              hasAvatar={session.hasAvatar}
              avatarInitial={avatarInitial}
              roleLabel={formatRoleLabel(session.role)}
              onSearchOpen={() => setIsSearchOpen(true)}
              compact={pathname === '/dashboard'}
            />
            <DashboardCheckoutAlertBar />
          </div>

          <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-[1600px] w-full mx-auto relative">
            <CurrencyProvider currency={session.currency}>
              <DashboardPageTransition>{children}</DashboardPageTransition>
            </CurrencyProvider>
          </main>
        </div>
      </div>
    </div>
    </DashboardShellProvider>
  );
}

function ConnectedDashboardTopBar(
  props: Omit<
    React.ComponentProps<typeof DashboardTopBar>,
    'notificationCount' | 'notifications'
  >
) {
  const shell = useDashboardShell();
  return (
    <DashboardTopBar
      {...props}
      notificationCount={shell?.notificationCount ?? 0}
      notifications={shell?.notifications ?? []}
    />
  );
}
