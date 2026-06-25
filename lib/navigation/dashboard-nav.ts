import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  Heart,
  BriefcaseMedical,
  FileText,
  ClipboardList,
  CalendarDays,
  Calendar,
  Layers,
  Camera,
  Receipt,
  DollarSign,
  TrendingUp,
  Users,
  Bot,
  Sparkles,
  Settings,
  MapPin,
  UserCircle,
  ShoppingBag,
  BarChart3,
  Share2,
} from 'lucide-react';
import type { UserSessionDetails } from '@/lib/services/auth';
import { canAccessRoute, hasCapability, type Capability } from '@/lib/auth/capabilities';
import { canAccessRouteByFeature, type Feature } from '@/lib/auth/features';

export type DashboardNavItem = {
  name: string;
  href: string;
  icon: LucideIcon;
  adminOnly?: boolean;
  requiredCapability?: Capability;
};

export type DashboardNavGroup = {
  section: string;
  collapsible?: boolean;
  items: DashboardNavItem[];
};

export const DASHBOARD_NAV_GROUPS: DashboardNavGroup[] = [
  {
    section: 'Overview',
    items: [{ name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard }],
  },
  {
    section: 'Clinical',
    collapsible: true,
    items: [
      { name: 'Pets', href: '/dashboard/pets', icon: Heart },
      { name: 'Consultations', href: '/dashboard/doctors', icon: BriefcaseMedical },
      { name: 'Prescriptions', href: '/dashboard/prescriptions', icon: FileText },
      { name: 'Walk-ins', href: '/dashboard/walk-ins', icon: ClipboardList },
    ],
  },
  {
    section: 'Scheduling',
    collapsible: true,
    items: [
      { name: 'Calendar', href: '/dashboard/schedule', icon: CalendarDays },
      { name: 'Appointments', href: '/dashboard/appointments', icon: Calendar },
    ],
  },
  {
    section: 'Operations',
    collapsible: true,
    items: [
      { name: 'Inventory', href: '/dashboard/inventory', icon: Layers, requiredCapability: 'manage_inventory' },
      { name: 'Stock intake', href: '/dashboard/inventory?tab=intake', icon: Camera, requiredCapability: 'manage_inventory' },
    ],
  },
  {
    section: 'Financial',
    collapsible: true,
    items: [
      { name: 'Invoices', href: '/dashboard/invoices', icon: Receipt },
      { name: 'Revenue', href: '/dashboard/revenue', icon: DollarSign, adminOnly: true },
      { name: 'Reports', href: '/dashboard/reports', icon: TrendingUp },
    ],
  },
  {
    section: 'CRM',
    collapsible: true,
    items: [{ name: 'Clients', href: '/dashboard/customers', icon: Users }],
  },
  {
    section: 'AI Tools',
    collapsible: true,
    items: [
      { name: 'AI Assistant', href: '/dashboard/ai-assistant', icon: Bot },
      { name: 'AI Analytics', href: '/dashboard/reports/ai', icon: Sparkles },
    ],
  },
  {
    section: 'Organization',
    collapsible: true,
    items: [
      { name: 'Retail Sale', href: '/dashboard/sales/new', icon: ShoppingBag },
      { name: 'Sales', href: '/dashboard/sales', icon: BarChart3, adminOnly: true },
      { name: 'Social', href: '/dashboard/social', icon: Share2 },
      { name: 'Branches', href: '/dashboard/branches', icon: MapPin },
      { name: 'Staff', href: '/dashboard/staff', icon: Users },
      { name: 'My Profile', href: '/dashboard/profile', icon: UserCircle },
      { name: 'Upgrade', href: '/dashboard/upgrade', icon: Sparkles },
    ],
  },
];

export const SETTINGS_NAV_ITEM: DashboardNavItem = {
  name: 'Settings',
  href: '/dashboard/settings',
  icon: Settings,
};

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/dashboard/appointments': 'Appointments',
  '/dashboard/schedule': 'Schedule',
  '/dashboard/walk-ins': 'Walk-ins',
  '/dashboard/customers': 'Clients',
  '/dashboard/pets': 'Pets',
  '/dashboard/doctors': 'Consultations',
  '/dashboard/prescriptions': 'Prescriptions',
  '/dashboard/invoices': 'Invoices',
  '/dashboard/sales': 'Sales',
  '/dashboard/sales/new': 'Retail Sale',
  '/dashboard/inventory': 'Inventory',
  '/dashboard/reports': 'Reports',
  '/dashboard/reports/ai': 'AI Analytics',
  '/dashboard/revenue': 'Revenue',
  '/dashboard/ai-assistant': 'AI Assistant',
  '/dashboard/social': 'Social',
  '/dashboard/branches': 'Branches',
  '/dashboard/staff': 'Staff',
  '/dashboard/profile': 'My Profile',
  '/dashboard/settings': 'Settings',
  '/dashboard/upgrade': 'Upgrade',
  '/dashboard/benchmarking': 'Benchmarking',
};

export function resolvePageTitle(pathname: string): string {
  const bases = Object.keys(PAGE_TITLES).sort((a, b) => b.length - a.length);
  const match = bases.find((r) => pathname === r || pathname.startsWith(`${r}/`));
  return match ? PAGE_TITLES[match]! : 'Dashboard';
}

export function filterNavGroups(
  role: UserSessionDetails['role'],
  features: Feature[]
): DashboardNavGroup[] {
  const canSee = (item: DashboardNavItem) => {
    if (item.adminOnly && role !== 'clinic_admin') return false;
    if (item.requiredCapability && !hasCapability(role, item.requiredCapability)) return false;
    return canAccessRoute(role, item.href) && canAccessRouteByFeature(features, item.href);
  };

  return DASHBOARD_NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) => canSee(item)),
  })).filter((group) => group.items.length > 0);
}

export type NavSearchParams = Record<string, string | string[] | undefined>;

function parseHrefQuery(href: string): { base: string; query: URLSearchParams } {
  const [base, queryString] = href.split('?');
  return { base: base!, query: new URLSearchParams(queryString ?? '') };
}

function searchParamsMatch(
  hrefQuery: URLSearchParams,
  current: NavSearchParams
): boolean {
  for (const [key, expected] of hrefQuery.entries()) {
    const actual = current[key];
    if (actual === undefined || actual === null) return false;
    if (Array.isArray(actual)) {
      if (!actual.includes(expected)) return false;
    } else if (actual !== expected) {
      return false;
    }
  }
  return true;
}

export function isNavItemActive(
  pathname: string,
  href: string,
  searchParams?: NavSearchParams
): boolean {
  if (href === '/dashboard') return pathname === '/dashboard';
  if (href === '/dashboard/sales' && pathname.startsWith('/dashboard/sales/')) {
    return pathname === '/dashboard/sales';
  }

  const { base, query: hrefQuery } = parseHrefQuery(href);
  const pathMatches = pathname === base || pathname.startsWith(`${base}/`);

  if (!pathMatches) return false;

  if (hrefQuery.size > 0) {
    return searchParamsMatch(hrefQuery, searchParams ?? {});
  }

  // Same path without query: active only when no conflicting query keys from sibling nav items
  if (base === '/dashboard/inventory') {
    const tab = searchParams?.tab;
    const tabValue = Array.isArray(tab) ? tab[0] : tab;
    return tabValue !== 'intake';
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}
