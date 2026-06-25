'use client';

import { Area, AreaChart, ResponsiveContainer } from 'recharts';

interface DashboardSparklineProps {
  data: number[];
  stroke?: string;
  className?: string;
}

export default function DashboardSparkline({
  data,
  stroke = '#A855F7',
  className = 'h-8 w-full',
}: DashboardSparklineProps) {
  const points = data.map((value, i) => ({ i, value }));
  if (points.length < 2) return <div className={className} />;

  return (
    <div className={className} aria-hidden>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={points} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={`spark-${stroke.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={stroke} stopOpacity={0.35} />
              <stop offset="95%" stopColor={stroke} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="value"
            stroke={stroke}
            strokeWidth={1.5}
            fill={`url(#spark-${stroke.replace('#', '')})`}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
