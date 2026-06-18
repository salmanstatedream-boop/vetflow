'use client';

import Link from 'next/link';
import { useVisibilityPolling } from '@/lib/hooks/useVisibilityPolling';
import {
  Clock,
  BriefcaseMedical,
  AlertTriangle,
  Receipt,
} from 'lucide-react';
import VisitStatusBadge from '@/components/dashboard/VisitStatusBadge';

interface Visit {
  id: string;
  reason: string;
  status: string;
  checkedInAt: string;
  consultPausedAt?: string | null;
  consultPauseReason?: string | null;
  isEmergency?: boolean;
  triageNotes?: string | null;
  pet: { id: string; name: string; species: string; breed: string | null };
  customer: { first_name: string; last_name: string; phone: string };
  doctor: { first_name: string; last_name: string } | null;
}

interface CheckoutVisit {
  id: string;
  reason: string;
  petName: string;
  customerName: string;
}

interface WalkInDashboardClientProps {
  initialVisits: Visit[];
  checkoutVisits: CheckoutVisit[];
}

export default function WalkInDashboardClient({
  initialVisits,
  checkoutVisits,
}: WalkInDashboardClientProps) {
  useVisibilityPolling(15000, true);

  const waitingVisits = initialVisits.filter((v) => v.status === 'waiting');
  const consultingVisits = initialVisits.filter((v) => v.status === 'consulting');

  return (
    <div className="space-y-6">
      {checkoutVisits.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 animate-pulse-once">
          <div>
            <p className="text-sm font-bold text-emerald-700">
              {checkoutVisits.length} patient{checkoutVisits.length > 1 ? 's' : ''} ready for checkout
            </p>
            <p className="text-xs text-emerald-600/80">
              Doctor completed consultation — proceed to billing and discharge.
            </p>
          </div>
          <Link
            href={`/dashboard/invoices/create/${checkoutVisits[0].id}`}
            className="shrink-0 bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-1.5"
          >
            <Receipt className="w-4 h-4" />
            Start checkout
          </Link>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6 items-start">
        {/* WAITING QUEUE */}
        <div className="glass-panel rounded-2xl border border-outline-variant/40 overflow-hidden shadow-premium">
          <div className="p-5 border-b border-outline-variant/30 bg-surface-container/20 flex items-center justify-between">
            <h3 className="text-sm font-bold text-on-surface uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" />
              Waiting Queue ({waitingVisits.length})
            </h3>
            <span className="text-[10px] text-on-surface-variant/50 font-semibold">Sorted by arrival time</span>
          </div>

          {waitingVisits.length > 0 ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container/10 border-b border-outline-variant/40 text-[9px] font-bold text-on-surface/80 uppercase tracking-wider">
                  <th className="px-6 py-3">Patient / Owner</th>
                  <th className="px-6 py-3">Reason</th>
                  <th className="px-6 py-3">Assigned Vet</th>
                  <th className="px-6 py-3">Check-In Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20 text-xs">
                {waitingVisits.map((v) => (
                  <tr key={v.id} className="hover:bg-surface-container/10">
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="font-bold text-on-surface">{v.pet.name}</span>
                        {v.isEmergency && (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-destructive/15 text-destructive border border-destructive/30">
                            <AlertTriangle className="w-2.5 h-2.5" />
                            EMERGENCY
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-on-surface-variant/60">
                        {v.pet.species} · Owner: {v.customer.first_name} {v.customer.last_name}
                      </span>
                      {v.triageNotes && (
                        <span className="text-[10px] text-on-surface-variant block mt-0.5 line-clamp-1" title={v.triageNotes}>
                          Triage: {v.triageNotes}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-on-surface-variant/80 font-medium">{v.reason}</td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-on-surface">
                        {v.doctor ? `Dr. ${v.doctor.first_name} ${v.doctor.last_name}` : 'Unassigned'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-on-surface-variant/50 font-semibold">
                      {new Date(v.checkedInAt).toLocaleTimeString(undefined, {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-8 text-center text-xs text-on-surface-variant/50 italic">
              No patients currently waiting.
            </div>
          )}
        </div>

        {/* ATTENDING CONSULTATIONS */}
        <div className="glass-panel rounded-2xl border border-outline-variant/40 overflow-hidden shadow-premium">
          <div className="p-5 border-b border-outline-variant/30 bg-surface-container/20">
            <h3 className="text-sm font-bold text-on-surface uppercase tracking-wider flex items-center gap-2">
              <BriefcaseMedical className="w-4 h-4 text-primary" />
              Attending consultations ({consultingVisits.length})
            </h3>
          </div>

          {consultingVisits.length > 0 ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container/10 border-b border-outline-variant/40 text-[9px] font-bold text-on-surface/80 uppercase tracking-wider">
                  <th className="px-6 py-3">Patient / Owner</th>
                  <th className="px-6 py-3">Attending Vet</th>
                  <th className="px-6 py-3">Reason</th>
                  <th className="px-6 py-3">State</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20 text-xs">
                {consultingVisits.map((v) => (
                  <tr key={v.id} className="hover:bg-surface-container/10">
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="font-bold text-on-surface">{v.pet.name}</span>
                        {v.isEmergency && (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-destructive/15 text-destructive border border-destructive/30">
                            <AlertTriangle className="w-2.5 h-2.5" />
                            EMERGENCY
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-on-surface-variant/60">
                        Owner: {v.customer.first_name} {v.customer.last_name}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-primary">
                        Dr. {v.doctor?.first_name} {v.doctor?.last_name}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-on-surface-variant/80">{v.reason}</td>
                    <td className="px-6 py-4">
                      <VisitStatusBadge
                        status={v.status}
                        pause={{
                          consultPausedAt: v.consultPausedAt,
                          consultPauseReason: v.consultPauseReason,
                        }}
                        showPauseReason
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-8 text-center text-xs text-on-surface-variant/50 italic">
              No consultations currently active in rooms.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
