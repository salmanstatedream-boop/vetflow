'use client';

import { CHART_COLORS } from '@/lib/ui/dashboard-tokens';

type RankedItem = { name: string; value: number };

interface DashboardRankedBarListProps {
  data: RankedItem[];
  maxItems?: number;
}

export default function DashboardRankedBarList({ data, maxItems = 5 }: DashboardRankedBarListProps) {
  const items = data.slice(0, maxItems);
  const max = Math.max(...items.map((d) => d.value), 1);
  const total = data.reduce((s, d) => s + d.value, 0);

  if (items.length === 0) {
    return <p className="text-[10px] text-on-surface-variant italic py-8 text-center">No visit data yet.</p>;
  }

  return (
    <div className="space-y-2">
      {items.map((item, i) => {
        const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;
        const barWidth = Math.max(4, (item.value / max) * 100);
        return (
          <div key={item.name} className="space-y-0.5">
            <div className="flex items-center justify-between gap-2 text-[10px]">
              <span className="text-on-surface font-medium truncate flex-1">
                <span className="text-on-surface-variant mr-1">{i + 1}.</span>
                {item.name}
              </span>
              <span className="text-on-surface-variant shrink-0 tabular-nums">{pct}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-surface-container-high overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${barWidth}%`,
                  background: i % 2 === 0 ? CHART_COLORS.secondary : CHART_COLORS.primary,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
