'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useVisibilityPolling } from '@/lib/hooks/useVisibilityPolling';
import { globalClinicSearchAction } from '@/lib/services/search-actions';
import ConsultTimer from '@/components/dashboard/ConsultTimer';
import VisitStatusBadge from '@/components/dashboard/VisitStatusBadge';
import {
  Play,
  ClipboardList,
  AlertTriangle,
  Search,
  Loader2,
  Pill,
} from 'lucide-react';

interface Visit {
  id: string;
  reason: string;
  status: string;
  checkedInAt: string;
  consultStartedAt?: string | null;
  consultPausedAt?: string | null;
  consultPauseReason?: string | null;
  consultPauseAccumulatedSec?: number;
  isEmergency: boolean;
  triageNotes: string | null;
  pet: { id: string; name: string; species: string; breed: string | null; gender: string };
  customer: { firstName: string; lastName: string; phone: string };
  prescriptionId?: string | null;
  assignedDoctorName?: string | null;
}

interface DoctorQueueClientProps {
  waitingVisits: Visit[];
  consultingVisits: Visit[];
  completedVisits?: Visit[];
  doctorFirstName: string;
  doctorLastName: string;
  showConsultTimer: boolean;
  isSupervisoryView?: boolean;
}

function fmtTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function EmergencyBadge() {
  return (
    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-destructive/15 text-destructive border border-destructive/30">
      <AlertTriangle className="w-2.5 h-2.5" />
      EMERGENCY
    </span>
  );
}

function StatChip({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="glass-panel rounded-xl border border-outline-variant/40 px-4 py-2.5 flex items-center gap-3 min-w-[140px]">
      <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wide">{label}</span>
      <span className="text-sm font-bold text-on-surface">{value}</span>
    </div>
  );
}

export default function DoctorQueueClient({
  waitingVisits,
  consultingVisits,
  completedVisits = [],
  doctorFirstName,
  doctorLastName,
  showConsultTimer,
  isSupervisoryView = false,
}: DoctorQueueClientProps) {
  useVisibilityPolling(15000, true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<
    Array<{ type: string; title: string; subtitle: string; href: string }>
  >([]);
  const [isSearching, startSearch] = useTransition();

  const handleSearch = (q: string) => {
    setSearchQuery(q);
    if (q.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    startSearch(async () => {
      const res = await globalClinicSearchAction({ query: q.trim() });
      if (res.success && res.results) {
        setSearchResults(
          res.results
            .filter((r) => r.type === 'pet' || r.type === 'customer')
            .slice(0, 6)
        );
      }
    });
  };

  const attendingLabel = isSupervisoryView
    ? 'All clinicians'
    : `Dr. ${doctorFirstName} ${doctorLastName}`.trim();

  return (
    <div className="space-y-6">
      <div className="glass-panel rounded-2xl border border-outline-variant/40 p-5 shadow-premium">
        <label className="block text-[10px] font-bold text-on-surface-variant uppercase mb-2">
          Find patient before taking a case
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/40" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search pet name, owner name, phone..."
            className="w-full pl-9 pr-3 py-2.5 bg-surface-container/40 border border-outline-variant/60 rounded-xl text-xs"
          />
          {isSearching && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-primary" />
          )}
        </div>
        {searchResults.length > 0 && (
          <div className="mt-2 border border-outline-variant/40 rounded-xl overflow-hidden divide-y divide-outline-variant/20">
            {searchResults.map((r) => (
              <Link
                key={`${r.type}-${r.href}`}
                href={r.href}
                className="block px-4 py-2.5 hover:bg-surface-container/40 transition-colors"
              >
                <span className="text-xs font-bold text-on-surface">{r.title}</span>
                <span className="text-[10px] text-on-surface-variant block">{r.subtitle}</span>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        <StatChip label={isSupervisoryView ? 'View mode' : 'Attending'} value={attendingLabel} />
        <StatChip label="Active" value={consultingVisits.length} />
        <StatChip label="Waiting" value={waitingVisits.length} />
      </div>

      <div className="grid md:grid-cols-2 gap-6 items-start">
        <div className="glass-panel rounded-2xl border border-outline-variant/40 overflow-hidden shadow-premium">
          <div className="p-5 border-b border-outline-variant/30 bg-surface-container/20">
            <h3 className="text-sm font-bold text-on-surface uppercase tracking-wider flex items-center gap-2">
              <Play className="w-4 h-4 text-primary fill-current" />
              Active Consultations ({consultingVisits.length})
            </h3>
          </div>

          {consultingVisits.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container/10 border-b border-outline-variant/40 text-[9px] font-bold text-on-surface/80 uppercase tracking-wider">
                    <th className="px-5 py-3">Patient / Owner</th>
                    <th className="px-5 py-3">Reason</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/20 text-xs">
                  {consultingVisits.map((v) => (
                    <tr key={v.id} className="hover:bg-surface-container/10">
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="font-bold text-on-surface">{v.pet.name}</span>
                          {v.isEmergency && <EmergencyBadge />}
                        </div>
                        <span className="text-[10px] text-on-surface-variant/60 block">
                          {v.customer.firstName} {v.customer.lastName} · {v.pet.species}
                        </span>
                        {v.triageNotes && (
                          <span
                            className="text-[10px] text-on-surface-variant block mt-0.5 line-clamp-1"
                            title={v.triageNotes}
                          >
                            Intake: {v.triageNotes}
                          </span>
                        )}
                        {isSupervisoryView && v.assignedDoctorName && (
                          <span className="text-[10px] text-primary font-semibold block mt-0.5">
                            Dr. {v.assignedDoctorName}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-on-surface-variant/80 font-medium max-w-[120px]">
                        <span className="line-clamp-2">{v.reason}</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex flex-col items-start gap-1">
                          <VisitStatusBadge
                            status={v.status}
                            pause={{
                              consultPausedAt: v.consultPausedAt,
                              consultPauseReason: v.consultPauseReason,
                            }}
                            showPauseReason
                          />
                          {showConsultTimer && v.consultStartedAt && (
                            <ConsultTimer
                              startedAt={v.consultStartedAt}
                              pausedAt={v.consultPausedAt}
                              accumulatedPauseSec={v.consultPauseAccumulatedSec ?? 0}
                            />
                          )}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        <Link
                          href={`/dashboard/doctors/${v.id}`}
                          className="inline-flex items-center gap-1 bg-primary hover:bg-primary/95 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all"
                        >
                          Open
                          <Play className="w-3 h-3 fill-current" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-on-surface-variant/50 italic">
              No consultations currently in progress. Open a patient from the waiting queue to start.
            </div>
          )}
        </div>

        <div className="glass-panel rounded-2xl border border-outline-variant/40 overflow-hidden shadow-premium">
          <div className="p-5 border-b border-outline-variant/30 bg-surface-container/20 flex items-center justify-between gap-2">
            <h3 className="text-sm font-bold text-on-surface uppercase tracking-wider flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-amber-500" />
              Waiting Queue ({waitingVisits.length})
            </h3>
            <span className="text-[10px] text-on-surface-variant/50 font-semibold hidden sm:inline">
              By arrival
            </span>
          </div>

          {waitingVisits.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container/10 border-b border-outline-variant/40 text-[9px] font-bold text-on-surface/80 uppercase tracking-wider">
                    <th className="px-5 py-3">Patient / Owner</th>
                    <th className="px-5 py-3">Reason</th>
                    <th className="px-5 py-3">Arrived</th>
                    <th className="px-5 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/20 text-xs">
                  {waitingVisits.map((v) => (
                    <tr key={v.id} className="hover:bg-surface-container/10">
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="font-bold text-on-surface">{v.pet.name}</span>
                          {v.isEmergency && <EmergencyBadge />}
                        </div>
                        <span className="text-[10px] text-on-surface-variant/60 block">
                          {v.customer.firstName} {v.customer.lastName} · {v.pet.species}
                        </span>
                        <Link
                          href={`/dashboard/doctors/patients/${v.pet.id}`}
                          className="text-[10px] text-primary font-bold hover:underline"
                        >
                          View history
                        </Link>
                        {isSupervisoryView && v.assignedDoctorName && (
                          <span className="text-[10px] text-primary font-semibold block mt-0.5">
                            Dr. {v.assignedDoctorName}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-on-surface-variant/80 font-medium max-w-[120px]">
                        <span className="line-clamp-2">{v.reason}</span>
                      </td>
                      <td className="px-5 py-4 text-on-surface-variant/50 font-semibold whitespace-nowrap">
                        {fmtTime(v.checkedInAt)}
                      </td>
                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        <Link
                          href={`/dashboard/doctors/${v.id}`}
                          className="inline-flex items-center gap-1 border border-primary/30 hover:bg-primary/5 text-primary px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all"
                        >
                          Start
                          <Play className="w-3 h-3 fill-current" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-on-surface-variant/50 italic">
              Your assigned waiting queue is empty.
            </div>
          )}
        </div>
      </div>

      {completedVisits.length > 0 && (
        <div className="glass-panel rounded-2xl border border-outline-variant/40 overflow-hidden shadow-premium">
          <div className="p-5 border-b border-outline-variant/30 bg-surface-container/20">
            <h3 className="text-sm font-bold text-on-surface uppercase tracking-wider flex items-center gap-2">
              <Pill className="w-4 h-4 text-primary" />
              Completed today ({completedVisits.length})
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container/10 border-b border-outline-variant/40 text-[9px] font-bold text-on-surface/80 uppercase tracking-wider">
                  <th className="px-5 py-3">Patient / Owner</th>
                  <th className="px-5 py-3">Reason</th>
                  <th className="px-5 py-3 text-right">Documents</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20 text-xs">
                {completedVisits.map((v) => (
                  <tr key={v.id} className="hover:bg-surface-container/10">
                    <td className="px-5 py-4">
                      <span className="font-bold text-on-surface block">{v.pet.name}</span>
                      <span className="text-[10px] text-on-surface-variant/60">
                        {v.customer.firstName} {v.customer.lastName}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-on-surface-variant/80">{v.reason}</td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 flex-wrap">
                        {v.prescriptionId && (
                          <a
                            href={`/api/prescriptions/${v.prescriptionId}/pdf`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20"
                          >
                            <Pill className="w-3 h-3" />
                            Rx PDF
                          </a>
                        )}
                        <a
                          href={`/api/visits/${v.id}/treatment-pdf`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] font-bold text-on-surface-variant hover:text-primary underline"
                        >
                          Treatment summary
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
