'use client';

import { useMemo, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceDot,
  ScatterChart,
  Scatter,
} from 'recharts';
import type { PatientMedicalProfileData } from '@/lib/types/patient-medical';
import {
  buildHealthTimeline,
  HEALTH_CHART_METRICS,
  HEALTH_EVENT_COLORS,
  HEALTH_EVENT_LABELS,
  type HealthChartMetric,
  type HealthEventType,
  type HealthMetricPoint,
} from '@/lib/patients/health-timeline';

interface PatientHealthGraphProps {
  profile: PatientMedicalProfileData;
}

function formatDateLabel(iso: string): string {
  return new Date(iso.slice(0, 10)).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: '2-digit',
  });
}

function buildTimeSeries(
  points: HealthMetricPoint[],
  field: keyof Pick<
    HealthMetricPoint,
    'weightKg' | 'bodyConditionScore' | 'temperatureC' | 'heartRateBpm' | 'respiratoryRate'
  >
) {
  return points
    .filter((p) => p[field] != null)
    .map((p) => ({
      date: p.date.slice(0, 10),
      label: formatDateLabel(p.date),
      value: p[field] as number,
    }));
}

export default function PatientHealthGraph({ profile }: PatientHealthGraphProps) {
  const [activeMetric, setActiveMetric] = useState<HealthChartMetric>('weight');
  const { weightPoints, metricPoints, events } = useMemo(
    () => buildHealthTimeline(profile),
    [profile]
  );

  const ageWeightData = useMemo(
    () =>
      metricPoints
        .filter((p) => p.weightKg != null && p.ageYears != null)
        .map((p) => ({
          ageYears: p.ageYears as number,
          weightKg: p.weightKg as number,
          label: `${p.ageYears} yr · ${formatDateLabel(p.date)}`,
        })),
    [metricPoints]
  );

  const activeSeries = useMemo(() => {
    const spec = HEALTH_CHART_METRICS.find((m) => m.id === activeMetric);
    if (!spec || activeMetric === 'ageWeight') return null;
    return {
      ...spec,
      data: buildTimeSeries(metricPoints, spec.field),
    };
  }, [activeMetric, metricPoints]);

  const hasAnyData =
    metricPoints.length > 0 || weightPoints.length > 0 || events.length > 0;

  if (!hasAnyData) {
    return (
      <p className="text-xs text-on-surface-variant italic py-6 text-center">
        No health metrics recorded yet. Vitals and weight from consultations will appear here.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1.5 p-1 rounded-xl bg-surface-container/30 border border-outline-variant/40">
        {HEALTH_CHART_METRICS.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setActiveMetric(m.id)}
            className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-colors ${
              activeMetric === m.id
                ? 'bg-primary text-white shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container/60'
            }`}
          >
            {m.label}
          </button>
        ))}
        {ageWeightData.length > 0 && (
          <button
            type="button"
            onClick={() => setActiveMetric('ageWeight')}
            className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-colors ${
              activeMetric === 'ageWeight'
                ? 'bg-primary text-white shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container/60'
            }`}
          >
            Age vs weight
          </button>
        )}
      </div>

      <div className="h-64 w-full">
        {activeMetric === 'ageWeight' ? (
          ageWeightData.length === 0 ? (
            <p className="text-xs text-on-surface-variant italic text-center py-10">
              Add date of birth and visit weights to see age vs weight.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis
                  type="number"
                  dataKey="ageYears"
                  name="Age"
                  unit=" yr"
                  tick={{ fontSize: 10 }}
                  stroke="rgba(255,255,255,0.4)"
                />
                <YAxis
                  type="number"
                  dataKey="weightKg"
                  name="Weight"
                  unit=" kg"
                  tick={{ fontSize: 10 }}
                  stroke="rgba(255,255,255,0.4)"
                />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(20,20,30,0.95)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 8,
                    fontSize: 11,
                  }}
                  formatter={(value, name) => [
                    name === 'weightKg' ? `${value} kg` : `${value} yr`,
                    name === 'weightKg' ? 'Weight' : 'Age',
                  ]}
                  labelFormatter={(_, payload) =>
                    payload?.[0]?.payload?.label ?? ''
                  }
                />
                <Scatter data={ageWeightData} fill="#74f5ff" />
              </ScatterChart>
            </ResponsiveContainer>
          )
        ) : activeSeries && activeSeries.data.length === 0 ? (
          <p className="text-xs text-on-surface-variant italic text-center py-10">
            No {activeSeries.label.toLowerCase()} readings recorded yet.
          </p>
        ) : activeSeries ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={activeSeries.data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
              <XAxis dataKey="label" tick={{ fontSize: 10 }} stroke="rgba(255,255,255,0.4)" />
              <YAxis
                tick={{ fontSize: 10 }}
                stroke="rgba(255,255,255,0.4)"
                unit={activeSeries.unit === '/9' ? '' : ` ${activeSeries.unit}`}
                domain={activeMetric === 'bodyCondition' ? [1, 9] : ['auto', 'auto']}
              />
              <Tooltip
                contentStyle={{
                  background: 'rgba(20,20,30,0.95)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 8,
                  fontSize: 11,
                }}
                formatter={(value) => [`${value}${activeSeries.unit}`, activeSeries.label]}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke={activeSeries.color}
                strokeWidth={2}
                dot={{ r: 4, fill: activeSeries.color }}
                connectNulls
              />
              {activeMetric === 'weight' &&
                events.map((event, idx) => {
                  const dateKey = event.date.slice(0, 10);
                  const row = activeSeries.data.find((d) => d.date === dateKey);
                  if (!row) return null;
                  return (
                    <ReferenceDot
                      key={`${event.visitId}-${event.type}-${idx}`}
                      x={row.label}
                      y={row.value}
                      r={5}
                      fill={HEALTH_EVENT_COLORS[event.type]}
                      stroke="#fff"
                      strokeWidth={1}
                    />
                  );
                })}
            </LineChart>
          </ResponsiveContainer>
        ) : null}
      </div>

      {activeMetric === 'weight' && (
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
      )}

      {metricPoints.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-outline-variant/30">
          <table className="w-full text-left text-[10px]">
            <thead>
              <tr className="bg-surface-container/40 text-on-surface-variant uppercase">
                <th className="px-3 py-2 font-bold">Date</th>
                <th className="px-3 py-2 font-bold">Weight</th>
                <th className="px-3 py-2 font-bold">BCS</th>
                <th className="px-3 py-2 font-bold">Temp</th>
                <th className="px-3 py-2 font-bold">HR</th>
                <th className="px-3 py-2 font-bold">RR</th>
                <th className="px-3 py-2 font-bold">Age</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {[...metricPoints].reverse().slice(0, 8).map((row) => (
                <tr key={`${row.visitId}-${row.date}`}>
                  <td className="px-3 py-2 text-on-surface-variant">{formatDateLabel(row.date)}</td>
                  <td className="px-3 py-2">{row.weightKg != null ? `${row.weightKg} kg` : '—'}</td>
                  <td className="px-3 py-2">{row.bodyConditionScore ?? '—'}</td>
                  <td className="px-3 py-2">{row.temperatureC != null ? `${row.temperatureC}°C` : '—'}</td>
                  <td className="px-3 py-2">{row.heartRateBpm ?? '—'}</td>
                  <td className="px-3 py-2">{row.respiratoryRate ?? '—'}</td>
                  <td className="px-3 py-2">{row.ageYears != null ? `${row.ageYears} yr` : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
