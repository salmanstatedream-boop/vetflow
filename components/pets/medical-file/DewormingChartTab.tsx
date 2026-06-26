'use client';

import type { DewormingChartRow } from '@/lib/consultations/workflow-types';

type Props = {
  rows: DewormingChartRow[];
};

export default function DewormingChartTab({ rows }: Props) {
  if (rows.length === 0) {
    return (
      <div className="glass-panel rounded-2xl border border-outline-variant/40 p-10 text-center text-sm text-on-surface-variant">
        No deworming records yet.
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-2xl border border-outline-variant/40 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-surface-container/20 border-b border-outline-variant/40 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Dewormer</th>
              <th className="px-4 py-3">Dose</th>
              <th className="px-4 py-3">Route</th>
              <th className="px-4 py-3">Weight</th>
              <th className="px-4 py-3">Batch</th>
              <th className="px-4 py-3">Parasite risk</th>
              <th className="px-4 py-3">By</th>
              <th className="px-4 py-3">Next dose</th>
              <th className="px-4 py-3">Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/20">
            {rows.map((r) => (
              <tr key={r.visitId} className="hover:bg-surface-container/10">
                <td className="px-4 py-3 whitespace-nowrap">{r.date}</td>
                <td className="px-4 py-3 font-semibold text-on-surface">{r.dewormerName}</td>
                <td className="px-4 py-3">{r.dose}</td>
                <td className="px-4 py-3">{r.route}</td>
                <td className="px-4 py-3">{r.weightAtVisit}</td>
                <td className="px-4 py-3">{r.batchNumber}</td>
                <td className="px-4 py-3">{r.parasiteRisk}</td>
                <td className="px-4 py-3">{r.administeredBy}</td>
                <td className="px-4 py-3">{r.nextDoseDue}</td>
                <td className="px-4 py-3 max-w-[12rem] truncate" title={r.notes}>
                  {r.notes}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
