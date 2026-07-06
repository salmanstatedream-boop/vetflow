/** Shared dashboard visual tokens for Tailwind classes and Recharts. */

export const CHART_COLORS = {
  primary: '#22D3EE',
  secondary: '#3B82F6',
  tertiary: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  pink: '#8B5CF6',
  muted: '#64748B',
} as const;

export const DONUT_COLORS = [
  CHART_COLORS.primary,
  CHART_COLORS.secondary,
  CHART_COLORS.pink,
  CHART_COLORS.tertiary,
  CHART_COLORS.warning,
  CHART_COLORS.danger,
] as const;

export const KPI_ACCENTS = {
  appointments: { bg: 'from-cyan-500/20 to-blue-600/10', text: 'text-cyan-400', stroke: CHART_COLORS.primary },
  revenue: { bg: 'from-emerald-500/20 to-teal-600/10', text: 'text-emerald-400', stroke: CHART_COLORS.tertiary },
  receivables: { bg: 'from-amber-500/20 to-orange-600/10', text: 'text-amber-400', stroke: CHART_COLORS.warning },
  inClinic: { bg: 'from-blue-500/20 to-cyan-600/10', text: 'text-blue-400', stroke: CHART_COLORS.secondary },
  inventory: { bg: 'from-red-500/20 to-rose-600/10', text: 'text-red-400', stroke: CHART_COLORS.danger },
  clients: { bg: 'from-cyan-500/20 to-blue-600/10', text: 'text-cyan-400', stroke: CHART_COLORS.secondary },
  vaccinations: { bg: 'from-green-500/20 to-emerald-600/10', text: 'text-green-400', stroke: CHART_COLORS.tertiary },
} as const;

export const DASHBOARD_GRID = 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-3 md:gap-3.5';

export const DASHBOARD_DENSITY = {
  pageGap: 'space-y-3 md:space-y-4',
  gridGap: 'gap-3 md:gap-3.5',
  kpiCompactH: 'min-h-[128px]',
  kpiDefaultH: 'min-h-[144px]',
  kpiFooterH: 'min-h-8',
  kpiSparklineW: 'w-14',
  sectionPad: 'p-3.5 md:p-4',
  listMaxH: 'max-h-[200px]',
  chartH: 'h-[148px]',
} as const;

export const QAB_GROUP_ACCENTS = {
  clinical: {
    chip: 'bg-cyan-500/15 text-cyan-400',
    hover: 'hover:border-cyan-500/30',
  },
  operations: {
    chip: 'bg-blue-500/15 text-blue-400',
    hover: 'hover:border-blue-500/30',
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
  backgroundColor: 'rgba(11, 16, 32, 0.95)',
  borderColor: 'rgba(34, 211, 238, 0.15)',
  borderRadius: '12px',
  fontSize: '11px',
  color: '#f8fafc',
} as const;
