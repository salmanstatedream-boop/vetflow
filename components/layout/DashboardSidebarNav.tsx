'use client';

import { useState, useMemo, type ComponentType } from 'react';
import { useSearchParams } from 'next/navigation';
import { ChevronDown } from 'lucide-react';
import DashboardNavLink from '@/components/layout/DashboardNavLink';
import {
  filterNavGroups,
  isNavItemActive,
  reorderNavGroupsForRole,
  SETTINGS_NAV_ITEM,
  type DashboardNavGroup,
} from '@/lib/navigation/dashboard-nav';
import type { ServerAuthContext } from '@/lib/auth/context';
import type { Feature } from '@/lib/auth/features';
import { canAccessRoute } from '@/lib/auth/capabilities';
import { canAccessRouteByFeature } from '@/lib/auth/features';
import {
  useDashboardShell,
  type NavIndicators,
} from '@/lib/context/DashboardShellContext';

interface DashboardSidebarNavProps {
  session: ServerAuthContext;
  pathname: string;
  navLinkClass: (active: boolean) => string;
  onNavigate?: () => void;
  collapsed?: boolean;
  navLocked?: boolean;
}

function isNavAllowedWhenLocked(href: string): boolean {
  const base = href.split('?')[0];
  return base === '/dashboard';
}

function NavIcon({
  Icon,
  showDot,
  label,
}: {
  Icon: ComponentType<{ className?: string }>;
  showDot?: boolean;
  label: string;
}) {
  return (
    <span className="relative shrink-0">
      <Icon className="w-4 h-4" />
      {showDot && (
        <span
          className="absolute -top-0.5 -right-0.5 size-1.5 rounded-full bg-destructive ring-2 ring-surface-container"
          aria-hidden
        />
      )}
      {showDot && (
        <span className="sr-only">{label} has unread notifications</span>
      )}
    </span>
  );
}

export default function DashboardSidebarNav({
  session,
  pathname,
  navLinkClass,
  onNavigate,
  collapsed = false,
  navLocked = false,
}: DashboardSidebarNavProps) {
  const shell = useDashboardShell();
  const indicators: NavIndicators = shell?.navIndicators ?? {};
  const urlSearchParams = useSearchParams();
  const searchParams = useMemo(() => {
    const params: Record<string, string> = {};
    urlSearchParams.forEach((value, key) => {
      params[key] = value;
    });
    return params;
  }, [urlSearchParams]);

  const groups = reorderNavGroupsForRole(
    filterNavGroups(session.role, session.features as Feature[], session.featuresJson),
    session.role
  );
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(groups.filter((g) => g.collapsible).map((g) => [g.section, true]))
  );

  const toggle = (section: string) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const settingsVisible =
    canAccessRoute(session.role, SETTINGS_NAV_ITEM.href) &&
    canAccessRouteByFeature(session.features, SETTINGS_NAV_ITEM.href);

  return (
    <>
      {groups.map((group) => (
        <NavGroupBlock
          key={group.section}
          group={group}
          pathname={pathname}
          searchParams={searchParams}
          navLinkClass={navLinkClass}
          onNavigate={onNavigate}
          collapsible={group.collapsible}
          open={openSections[group.section] ?? true}
          onToggle={() => toggle(group.section)}
          collapsed={collapsed}
          navLocked={navLocked}
          indicators={indicators}
        />
      ))}
      {settingsVisible && (
        <div className="pt-2 mt-2 border-t border-outline-variant/40">
          <DashboardNavLink
            href={SETTINGS_NAV_ITEM.href}
            disabled={navLocked}
            className={`${navLinkClass(isNavItemActive(pathname, SETTINGS_NAV_ITEM.href, searchParams))} ${collapsed ? 'justify-center px-2' : ''}`}
            onClick={onNavigate}
            title={collapsed ? SETTINGS_NAV_ITEM.name : undefined}
            aria-current={
              isNavItemActive(pathname, SETTINGS_NAV_ITEM.href, searchParams)
                ? 'page'
                : undefined
            }
          >
            <NavIcon Icon={SETTINGS_NAV_ITEM.icon} label={SETTINGS_NAV_ITEM.name} />
            {!collapsed && SETTINGS_NAV_ITEM.name}
          </DashboardNavLink>
        </div>
      )}
    </>
  );
}

function NavGroupBlock({
  group,
  pathname,
  searchParams,
  navLinkClass,
  onNavigate,
  collapsible,
  open,
  onToggle,
  collapsed = false,
  navLocked = false,
  indicators,
}: {
  group: DashboardNavGroup;
  pathname: string;
  searchParams: Record<string, string>;
  navLinkClass: (active: boolean) => string;
  onNavigate?: () => void;
  collapsible?: boolean;
  open: boolean;
  onToggle: () => void;
  collapsed?: boolean;
  navLocked?: boolean;
  indicators: NavIndicators;
}) {
  if (group.section === 'Overview' && group.items.length === 1) {
    const item = group.items[0]!;
    const active = isNavItemActive(pathname, item.href, searchParams);
    const showDot = Boolean(indicators[item.href as keyof NavIndicators]);
    return (
      <DashboardNavLink
        href={item.href}
        disabled={navLocked && !isNavAllowedWhenLocked(item.href)}
        className={`${navLinkClass(active)} ${collapsed ? 'justify-center px-2' : ''}`}
        onClick={onNavigate}
        title={collapsed ? item.name : undefined}
        aria-current={active ? 'page' : undefined}
      >
        <NavIcon Icon={item.icon} showDot={showDot} label={item.name} />
        {!collapsed && item.name}
      </DashboardNavLink>
    );
  }

  return (
    <div className="mb-2">
      {!collapsed && (
        <button
          type="button"
          onClick={collapsible ? onToggle : undefined}
          className={`sidebar-section-label w-full flex items-center justify-between ${collapsible ? 'cursor-pointer hover:text-on-surface' : 'cursor-default'}`}
          aria-expanded={collapsible ? open : undefined}
        >
          {group.section}
          {collapsible && (
            <ChevronDown
              className={`w-3 h-3 transition-transform ${open ? '' : '-rotate-90'}`}
            />
          )}
        </button>
      )}
      {(!collapsible || open || collapsed) && (
        <div className="space-y-0.5">
          {group.items.map((item) => {
            const active = isNavItemActive(pathname, item.href, searchParams);
            const showDot = Boolean(indicators[item.href as keyof NavIndicators]);
            return (
              <DashboardNavLink
                key={item.href}
                href={item.href}
                disabled={navLocked && !isNavAllowedWhenLocked(item.href)}
                className={`${navLinkClass(active)} ${collapsed ? 'justify-center px-2' : ''}`}
                onClick={onNavigate}
                title={collapsed ? item.name : undefined}
                aria-current={active ? 'page' : undefined}
              >
                <NavIcon Icon={item.icon} showDot={showDot} label={item.name} />
                {!collapsed && item.name}
              </DashboardNavLink>
            );
          })}
        </div>
      )}
    </div>
  );
}
