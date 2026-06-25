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
} from '@/lib/ui/dashboard-tokens';

type ChartPoint = { name: string; value: number };

export function RevenueTrendChart({
  data,
  currency,
}: {
  data: ChartPoint[];
  currency: string;
}) {
  return (
    <div className="h-52 md:h-56">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <defs>
            <linearGradient id="revenueTrendFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={CHART_COLORS.primary} stopOpacity={0.35} />
              <stop offset="95%" stopColor={CHART_COLORS.primary} stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="name" tick={{ fontSize: 9, fill: CHART_COLORS.muted }} axisLine={false} tickLine={false} />
          <YAxis
            tick={{ fontSize: 9, fill: CHART_COLORS.muted }}
            axisLine={false}
            tickLine={false}
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
            strokeWidth={2}
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
}: {
  booked: number;
  total: number;
}) {
  const pct = total > 0 ? Math.round((booked / total) * 100) : 0;
  const data = [
    { name: 'Booked', value: booked },
    { name: 'Open', value: Math.max(0, total - booked) },
  ];

  return (
    <div className="h-48 relative">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={52}
            outerRadius={72}
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
        <span className="text-2xl font-bold text-on-surface">{pct}%</span>
        <span className="text-[10px] text-on-surface-variant">Booked</span>
      </div>
    </div>
  );
}

export function SpeciesDonut({ data }: { data: ChartPoint[] }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  return (
    <div className="h-48 relative">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={48} outerRadius={68} dataKey="value" stroke="none">
            {data.map((_, i) => (
              <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-xl font-bold text-on-surface">{total}</span>
        <span className="text-[10px] text-on-surface-variant">Pets</span>
      </div>
    </div>
  );
}

export function VisitReasonsChart({ data }: { data: ChartPoint[] }) {
  return (
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 8, left: 0, bottom: 0 }}>
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="name"
            width={72}
            tick={{ fontSize: 9, fill: CHART_COLORS.muted }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
          <Bar dataKey="value" fill={CHART_COLORS.secondary} radius={[0, 6, 6, 0]} maxBarSize={14} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
