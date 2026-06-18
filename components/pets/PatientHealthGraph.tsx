'use client';

import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceDot,
} from 'recharts';
import type { PatientMedicalProfileData } from '@/lib/types/patient-medical';
import {
  buildHealthTimeline,
  HEALTH_EVENT_COLORS,
  HEALTH_EVENT_LABELS,
  type HealthEventType,
} from '@/lib/patients/health-timeline';

interface PatientHealthGraphProps {
  profile: PatientMedicalProfileData;
}

export default function PatientHealthGraph({ profile }: PatientHealthGraphProps) {
  const { weightPoints, events } = useMemo(() => buildHealthTimeline(profile), [profile]);

  const chartData = useMemo(() => {
    const dateSet = new Set<string>();
    for (const p of weightPoints) dateSet.add(p.date.slice(0, 10));
    for (const e of events) dateSet.add(e.date.slice(0, 10));
    const dates = [...dateSet].sort();

    return dates.map((date) => {
      const weightPoint = [...weightPoints]
        .reverse()
        .find((p) => p.date.slice(0, 10) <= date);
      return {
        date,
        weightKg: weightPoint?.weightKg ?? null,
        label: new Date(date).toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
          year: '2-digit',
        }),
      };
    });
  }, [weightPoints, events]);

  if (weightPoints.length === 0 && events.length === 0) {
    return (
      <p className="text-xs text-on-surface-variant italic py-6 text-center">
        No weight or visit history recorded yet.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
            <XAxis dataKey="label" tick={{ fontSize: 10 }} stroke="rgba(255,255,255,0.4)" />
            <YAxis
              tick={{ fontSize: 10 }}
              stroke="rgba(255,255,255,0.4)"
              unit=" kg"
              domain={['auto', 'auto']}
            />
            <Tooltip
              contentStyle={{
                background: 'rgba(20,20,30,0.95)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 8,
                fontSize: 11,
              }}
              formatter={(value) => [`${value} kg`, 'Weight']}
            />
            {weightPoints.length > 0 && (
              <Line
                type="monotone"
                dataKey="weightKg"
                stroke="#74f5ff"
                strokeWidth={2}
                dot={{ r: 3, fill: '#74f5ff' }}
                connectNulls
              />
            )}
            {events.map((event, idx) => {
              const dateKey = event.date.slice(0, 10);
              const row = chartData.find((d) => d.date === dateKey);
              if (!row?.weightKg) return null;
              return (
                <ReferenceDot
                  key={`${event.visitId}-${event.type}-${idx}`}
                  x={row.label}
                  y={row.weightKg}
                  r={5}
                  fill={HEALTH_EVENT_COLORS[event.type]}
                  stroke="#fff"
                  strokeWidth={1}
                />
              );
            })}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="flex flex-wrap gap-3 text-[10px]">
        {(Object.keys(HEALTH_EVENT_LABELS) as HealthEventType[]).map((type) => (
          <span key={type} className="inline-flex items-center gap-1.5 text-on-surface-variant">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: HEALTH_EVENT_COLORS[type] }}
            />
            {HEALTH_EVENT_LABELS[type]}
          </span>
        ))}
      </div>
    </div>
  );
}
