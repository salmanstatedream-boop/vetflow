'use client';

import type { GroomingChartRow } from '@/lib/consultations/workflow-types';

type Props = {
  rows: GroomingChartRow[];
};

export default function GroomingChartTab({ rows }: Props) {
  if (rows.length === 0) {
    return (
      <div className="glass-panel rounded-2xl border border-outline-variant/40 p-10 text-center text-sm text-on-surface-variant">
        No grooming records yet.
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
              <th className="px-4 py-3">Groomer</th>
              <th className="px-4 py-3">Services</th>
              <th className="px-4 py-3">Coat</th>
              <th className="px-4 py-3">Findings</th>
              <th className="px-4 py-3">Behavior</th>
              <th className="px-4 py-3">Photos</th>
              <th className="px-4 py-3">Upsells</th>
              <th className="px-4 py-3">Quality</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/20">
            {rows.map((r) => (
              <tr key={r.visitId} className="hover:bg-surface-container/10">
                <td className="px-4 py-3 whitespace-nowrap">{r.date}</td>
                <td className="px-4 py-3">{r.groomer}</td>
                <td className="px-4 py-3 max-w-[10rem] truncate" title={r.servicesPerformed}>
                  {r.servicesPerformed}
                </td>
                <td className="px-4 py-3">{r.coatCondition}</td>
                <td className="px-4 py-3 max-w-[10rem] truncate" title={r.skinEarNailFindings}>
                  {r.skinEarNailFindings}
                </td>
                <td className="px-4 py-3 max-w-[8rem] truncate">{r.behaviorNotes}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-col gap-0.5">
                    {r.beforePhotoIds.map((id) => (
                      <a
                        key={`b-${id}`}
                        href={`/api/documents/${id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        Before
                      </a>
                    ))}
                    {r.afterPhotoIds.map((id) => (
                      <a
                        key={`a-${id}`}
                        href={`/api/documents/${id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        After
                      </a>
                    ))}
                    {r.beforePhotoIds.length === 0 && r.afterPhotoIds.length === 0 ? '—' : null}
                  </div>
                </td>
                <td className="px-4 py-3 max-w-[8rem] truncate">{r.upsells}</td>
                <td className="px-4 py-3">{r.qualityReviewStatus}</td>
                <td className="px-4 py-3 tabular-nums">{r.totalCharge}</td>
                <td className="px-4 py-3 max-w-[10rem] truncate" title={r.notes}>
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
