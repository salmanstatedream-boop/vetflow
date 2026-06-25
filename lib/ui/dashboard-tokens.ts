/** Shared dashboard visual tokens for Tailwind classes and Recharts. */

export const CHART_COLORS = {
  primary: '#A855F7',
  secondary: '#06B6D4',
  tertiary: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  pink: '#EC4899',
  muted: '#958ea0',
} as const;

export const DONUT_COLORS = [
  CHART_COLORS.primary,
  CHART_COLORS.secondary,
  CHART_COLORS.tertiary,
  CHART_COLORS.warning,
  CHART_COLORS.pink,
  CHART_COLORS.danger,
] as const;

export const KPI_ACCENTS = {
  appointments: { bg: 'from-violet-500/20 to-purple-600/10', text: 'text-violet-400', stroke: CHART_COLORS.primary },
  revenue: { bg: 'from-emerald-500/20 to-teal-600/10', text: 'text-emerald-400', stroke: CHART_COLORS.tertiary },
  receivables: { bg: 'from-amber-500/20 to-orange-600/10', text: 'text-amber-400', stroke: CHART_COLORS.warning },
  inClinic: { bg: 'from-pink-500/20 to-rose-600/10', text: 'text-pink-400', stroke: CHART_COLORS.pink },
  inventory: { bg: 'from-red-500/20 to-rose-600/10', text: 'text-red-400', stroke: CHART_COLORS.danger },
  clients: { bg: 'from-cyan-500/20 to-blue-600/10', text: 'text-cyan-400', stroke: CHART_COLORS.secondary },
} as const;

export const DASHBOARD_GRID = 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-3 md:gap-3.5';

export const DASHBOARD_DENSITY = {
  pageGap: 'space-y-3 md:space-y-4',
  gridGap: 'gap-3 md:gap-3.5',
  kpiMinH: 'min-h-[92px]',
  sectionPad: 'p-3.5 md:p-4',
  listMaxH: 'max-h-[200px]',
  chartH: 'h-[148px]',
} as const;

export const QAB_GROUP_ACCENTS = {
  clinical: {
    chip: 'bg-violet-500/15 text-violet-400',
    hover: 'hover:border-violet-500/30',
  },
  operations: {
    chip: 'bg-cyan-500/15 text-cyan-400',
    hover: 'hover:border-cyan-500/30',
  },
  financial: {
    chip: 'bg-emerald-500/15 text-emerald-400',
    hover: 'hover:border-emerald-500/30',
  },
  insights: {
    chip: 'bg-amber-500/15 text-amber-400',
    hover: 'hover:border-amber-500/30',
  },
  organization: {
    chip: 'bg-slate-500/15 text-slate-300',
    hover: 'hover:border-slate-400/30',
  },
} as const;

export const CHART_TOOLTIP_STYLE = {
  backgroundColor: 'rgba(21, 18, 27, 0.95)',
  borderColor: 'rgba(255,255,255,0.08)',
  borderRadius: '12px',
  fontSize: '11px',
  color: '#e7e0ed',
} as const;
