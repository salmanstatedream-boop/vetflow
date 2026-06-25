'use client';

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';
import { formatMoney } from '@/lib/utils/currency';
import {
  CHART_COLORS,
  CHART_TOOLTIP_STYLE,
  DONUT_COLORS,
  DASHBOARD_DENSITY,
} from '@/lib/ui/dashboard-tokens';
import { cn } from '@/lib/utils';

type ChartPoint = { name: string; value: number };

export function RevenueTrendChart({
  data,
  currency,
  compact = false,
}: {
  data: ChartPoint[];
  currency: string;
  compact?: boolean;
}) {
  return (
    <div className={compact ? DASHBOARD_DENSITY.chartH : 'h-52 md:h-56'}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="revenueTrendFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={CHART_COLORS.primary} stopOpacity={0.35} />
              <stop offset="95%" stopColor={CHART_COLORS.primary} stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="name" tick={{ fontSize: 8, fill: CHART_COLORS.muted }} axisLine={false} tickLine={false} />
          <YAxis
            tick={{ fontSize: 8, fill: CHART_COLORS.muted }}
            axisLine={false}
            tickLine={false}
            width={compact ? 36 : 48}
            tickFormatter={(v) => formatMoney(Number(v), currency, { compact: true, decimals: 0 })}
          />
          <Tooltip
            formatter={(val) => [formatMoney(Number(val ?? 0), currency), 'Revenue']}
            contentStyle={CHART_TOOLTIP_STYLE}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke={CHART_COLORS.primary}
            strokeWidth={compact ? 1.5 : 2}
            fill="url(#revenueTrendFill)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function UtilizationDonut({
  booked,
  total,
  compact = false,
}: {
  booked: number;
  total: number;
  compact?: boolean;
}) {
  const pct = total > 0 ? Math.round((booked / total) * 100) : 0;
  const data = [
    { name: 'Booked', value: booked },
    { name: 'Open', value: Math.max(0, total - booked) },
  ];

  return (
    <div className={cn('relative', compact ? DASHBOARD_DENSITY.chartH : 'h-48')}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={compact ? 36 : 52}
            outerRadius={compact ? 52 : 72}
            paddingAngle={3}
            dataKey="value"
            stroke="none"
          >
            <Cell fill={CHART_COLORS.primary} />
            <Cell fill="rgba(255,255,255,0.06)" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className={cn('font-bold text-on-surface', compact ? 'text-lg' : 'text-2xl')}>{pct}%</span>
        <span className="text-[9px] text-on-surface-variant">Booked</span>
      </div>
    </div>
  );
}

export function SpeciesDonut({
  data,
  compact = false,
  inlineLegend = false,
}: {
  data: ChartPoint[];
  compact?: boolean;
  inlineLegend?: boolean;
}) {
  const total = data.reduce((s, d) => s + d.value, 0);

  const donut = (
    <div className={cn('relative shrink-0', compact ? 'w-[100px] h-[100px]' : 'h-48 w-full')}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={compact ? 28 : 48}
            outerRadius={compact ? 42 : 68}
            dataKey="value"
            stroke="none"
          >
            {data.map((_, i) => (
              <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
        </PieChart>
      </ResponsiveContainer>
      {!inlineLegend && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className={cn('font-bold text-on-surface', compact ? 'text-sm' : 'text-xl')}>{total}</span>
          <span className="text-[9px] text-on-surface-variant">Pets</span>
        </div>
      )}
    </div>
  );

  if (inlineLegend) {
    return (
      <div className="flex items-center gap-2 min-h-[100px]">
        {donut}
        <div className="flex-1 min-w-0 space-y-1">
          {data.map((s, i) => (
            <div key={s.name} className="flex items-center gap-1.5 text-[9px] text-on-surface-variant">
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ background: DONUT_COLORS[i % DONUT_COLORS.length] }}
              />
              <span className="truncate flex-1">{s.name}</span>
              <span className="font-semibold text-on-surface">{s.value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return donut;
}

export function VisitReasonsChart({ data, compact = false }: { data: ChartPoint[]; compact?: boolean }) {
  return (
    <div className={compact ? DASHBOARD_DENSITY.chartH : 'h-48'}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 8, left: 0, bottom: 0 }}>
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="name"
            width={compact ? 56 : 72}
            tick={{ fontSize: 8, fill: CHART_COLORS.muted }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
          <Bar dataKey="value" fill={CHART_COLORS.secondary} radius={[0, 4, 4, 0]} maxBarSize={compact ? 10 : 14} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
