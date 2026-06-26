'use client';

import type { VaccinationChartRow } from '@/lib/consultations/workflow-types';

type Props = {
  rows: VaccinationChartRow[];
};

export default function VaccinationChartTab({ rows }: Props) {
  if (rows.length === 0) {
    return (
      <div className="glass-panel rounded-2xl border border-outline-variant/40 p-10 text-center text-sm text-on-surface-variant">
        No vaccination records yet.
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
              <th className="px-4 py-3">Vaccine</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Manufacturer</th>
              <th className="px-4 py-3">Lot</th>
              <th className="px-4 py-3">Expiry</th>
              <th className="px-4 py-3">Dose</th>
              <th className="px-4 py-3">Route/site</th>
              <th className="px-4 py-3">By</th>
              <th className="px-4 py-3">Next due</th>
              <th className="px-4 py-3">Certificate</th>
              <th className="px-4 py-3">Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/20">
            {rows.map((r) => (
              <tr key={r.visitId} className="hover:bg-surface-container/10">
                <td className="px-4 py-3 whitespace-nowrap">{r.date}</td>
                <td className="px-4 py-3 font-semibold text-on-surface">{r.vaccineName}</td>
                <td className="px-4 py-3 capitalize">{r.vaccineType.replace('_', ' ')}</td>
                <td className="px-4 py-3">{r.manufacturer}</td>
                <td className="px-4 py-3">{r.lotNumber}</td>
                <td className="px-4 py-3">{r.expiryDate}</td>
                <td className="px-4 py-3">{r.dose}</td>
                <td className="px-4 py-3">{r.routeSite}</td>
                <td className="px-4 py-3">{r.administeredBy}</td>
                <td className="px-4 py-3">{r.nextDueDate}</td>
                <td className="px-4 py-3">
                  {r.certificateDocumentId ? (
                    <a
                      href={`/api/documents/${r.certificateDocumentId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      View
                    </a>
                  ) : (
                    <a
                      href={`/api/visits/${r.visitId}/vaccination-certificate`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Generate
                    </a>
                  )}
                </td>
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
