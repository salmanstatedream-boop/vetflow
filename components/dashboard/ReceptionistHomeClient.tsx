'use client';

import AppLink from '@/components/layout/AppLink';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  AlertTriangle,
  Heart,
  Phone,
  Printer,
  FileText,
} from 'lucide-react';
import { useVisibilityPolling } from '@/lib/hooks/useVisibilityPolling';
import DateRangeQuickFilter from '@/components/dashboard/DateRangeQuickFilter';
import VisitStatusBadge from '@/components/dashboard/VisitStatusBadge';
import { isConsultPaused } from '@/lib/utils/visit-status';
import { resolveDashboardFilterDate } from '@/lib/utils/date-filters';

export type ReceptionistAppointmentRow = {
  id: string;
  petName: string;
  customerName: string;
  customerPhone: string;
  preferredTime: string;
  isEmergency: boolean;
};

export type ReceptionistVisitRow = {
  id: string;
  petName: string;
  customerName: string;
  reason: string;
  status: string;
  doctorName?: string;
  consultPausedAt?: string | null;
  consultPauseReason?: string | null;
};

export type VisitRecordRow = {
  id: string;
  invoiceNumber: string;
  visitId: string | null;
  saleType: 'clinical' | 'retail';
  customerName: string;
  petName: string;
  total: number;
  paymentStatus: string;
  createdAt: string;
};

type RecordTypeFilter = 'all' | 'clinical' | 'retail';

export interface ReceptionistHomeClientProps {
  upcomingAppointments: ReceptionistAppointmentRow[];
  waitingVisits: ReceptionistVisitRow[];
  consultingVisits?: ReceptionistVisitRow[];
  checkoutVisits: ReceptionistVisitRow[];
  visitRecords: VisitRecordRow[];
  activeBranchId: string;
  branches: { id: string; name: string }[];
  doctors: { id: string; firstName: string; lastName: string }[];
  deviceTimezone: string;
}

export default function ReceptionistHomeClient({
  upcomingAppointments,
  waitingVisits,
  consultingVisits = [],
  checkoutVisits,
  visitRecords,
  deviceTimezone,
}: ReceptionistHomeClientProps) {
  useVisibilityPolling(15000, true);

  const searchParams = useSearchParams();
  const urlDate = searchParams.get('date');
  const selectedDate = resolveDashboardFilterDate(urlDate, deviceTimezone);

  const [recordSearch, setRecordSearch] = useState('');
  const [dateFrom, setDateFrom] = useState(selectedDate);
  const [dateTo, setDateTo] = useState(selectedDate);
  const [recordTypeFilter, setRecordTypeFilter] = useState<RecordTypeFilter>('all');

  useEffect(() => {
    setDateFrom(selectedDate);
    setDateTo(selectedDate);
  }, [selectedDate]);

  const filteredRecords = useMemo(() => {
    const q = recordSearch.trim().toLowerCase();
    return visitRecords.filter((r) => {
      if (recordTypeFilter !== 'all' && r.saleType !== recordTypeFilter) return false;
      if (dateFrom && r.createdAt.slice(0, 10) < dateFrom) return false;
      if (dateTo && r.createdAt.slice(0, 10) > dateTo) return false;
      if (!q) return true;
      return (
        r.customerName.toLowerCase().includes(q) ||
        r.petName.toLowerCase().includes(q) ||
        r.invoiceNumber.toLowerCase().includes(q)
      );
    });
  }, [visitRecords, recordSearch, dateFrom, dateTo, recordTypeFilter]);

  return (
    <div className="space-y-6">
      <DateRangeQuickFilter showWeek={false} deviceTimezone={deviceTimezone} />

      <div className="grid md:grid-cols-3 gap-4">
        <QueuePanel
          title="Upcoming appointments"
          empty="No appointments scheduled for today."
          href="/dashboard/appointments"
          isEmpty={upcomingAppointments.length === 0}
        >
          {upcomingAppointments.map((a) => (
            <AppLink
              key={a.id}
              href="/dashboard/appointments"
              className="block px-4 py-3 hover:bg-surface-container/30 border-b border-outline-variant/20 last:border-0"
            >
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-on-surface">{a.petName}</span>
                {a.isEmergency && (
                  <span className="text-[9px] font-bold text-destructive flex items-center gap-0.5">
                    <AlertTriangle className="w-2.5 h-2.5" />
                    EMERGENCY
                  </span>
                )}
              </div>
              <span className="text-[10px] text-on-surface-variant block">
                {a.customerName} · <Phone className="w-2.5 h-2.5 inline" /> {a.customerPhone}
              </span>
              <span className="text-[10px] text-primary font-semibold">{a.preferredTime}</span>
            </AppLink>
          ))}
        </QueuePanel>

        <QueuePanel title="Waiting walk-ins" empty="No patients waiting." href="/dashboard/walk-ins" isEmpty={waitingVisits.length === 0}>
          {waitingVisits.map((v) => (
            <AppLink
              key={v.id}
              href="/dashboard/walk-ins"
              className="block px-4 py-3 hover:bg-surface-container/30 border-b border-outline-variant/20 last:border-0"
            >
              <span className="text-xs font-bold text-on-surface flex items-center gap-1">
                <Heart className="w-3 h-3 text-primary" />
                {v.petName}
              </span>
              <span className="text-[10px] text-on-surface-variant block">{v.customerName}</span>
              <span className="text-[10px] text-on-surface-variant/70 line-clamp-1">{v.reason}</span>
            </AppLink>
          ))}
        </QueuePanel>

        <QueuePanel title="Ready for checkout" empty="No patients awaiting billing." href="/dashboard/walk-ins" isEmpty={checkoutVisits.length === 0}>
          {checkoutVisits.map((v) => (
            <AppLink
              key={v.id}
              href={`/dashboard/invoices/create/${v.id}`}
              className="block px-4 py-3 hover:bg-surface-container/30 border-b border-outline-variant/20 last:border-0"
            >
              <span className="text-xs font-bold text-on-surface">{v.petName}</span>
              <span className="text-[10px] text-on-surface-variant block">{v.customerName}</span>
              <span className="text-[10px] text-emerald-500 font-bold">Open checkout hub →</span>
            </AppLink>
          ))}
        </QueuePanel>
      </div>

      {consultingVisits.length > 0 && (
        <div className="glass-panel rounded-2xl border border-blue-500/30 p-4 space-y-2">
          <h3 className="text-xs font-bold text-blue-400 uppercase tracking-wider">
            Consultations in progress
          </h3>
          {consultingVisits.map((v) => (
            <div key={v.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs py-1">
              <span className="font-bold text-on-surface">
                {v.petName} — {v.customerName}
              </span>
              <div className="flex flex-col items-start sm:items-end gap-1">
                <VisitStatusBadge
                  status={v.status}
                  pause={{
                    consultPausedAt: v.consultPausedAt,
                    consultPauseReason: v.consultPauseReason,
                  }}
                />
                <span className="text-[10px] text-on-surface-variant">
                  {v.doctorName || 'Doctor'}
                  {isConsultPaused(v) ? ' — paused' : ' — consulting'}
                </span>
                {v.consultPauseReason && isConsultPaused(v) && (
                  <span className="text-[10px] text-violet-300/90 max-w-xs text-right">{v.consultPauseReason}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="glass-panel rounded-2xl p-5 border border-outline-variant/40">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <h3 className="text-xs font-bold text-on-surface uppercase tracking-wider">
            Sales & visit records
          </h3>
          <AppLink href="/dashboard/invoices" className="text-[10px] text-primary font-bold hover:underline">
            Full billing ledger →
          </AppLink>
        </div>
        <div className="flex flex-wrap gap-2 mb-3">
          {(['all', 'clinical', 'retail'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setRecordTypeFilter(t)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold capitalize transition-colors ${
                recordTypeFilter === t
                  ? 'bg-primary text-white'
                  : 'bg-surface-container border border-outline-variant text-on-surface-variant'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 mb-3">
          <input
            type="search"
            value={recordSearch}
            onChange={(e) => setRecordSearch(e.target.value)}
            placeholder="Search owner, pet, or invoice #..."
            className="flex-1 min-w-[180px] px-3 py-2 text-xs rounded-xl bg-surface-container border border-outline-variant text-on-surface outline-none focus:border-primary"
          />
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl bg-surface-container border border-outline-variant text-on-surface outline-none"
            aria-label="From date"
          />
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl bg-surface-container border border-outline-variant text-on-surface outline-none"
            aria-label="To date"
          />
        </div>
        {filteredRecords.length === 0 ? (
          <p className="text-[10px] text-on-surface-variant/60 text-center py-6 italic">
            No visit records match your filters.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-[10px] uppercase text-on-surface-variant border-b border-outline-variant/30">
                  <th className="py-2 pr-3">Date</th>
                  <th className="py-2 pr-3">Owner / Pet</th>
                  <th className="py-2 pr-3">Invoice</th>
                  <th className="py-2 pr-3">Status</th>
                  <th className="py-2 text-right">PDFs</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {filteredRecords.slice(0, 12).map((r) => (
                  <tr key={r.id}>
                    <td className="py-2.5 pr-3 text-on-surface-variant whitespace-nowrap">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-2.5 pr-3">
                      <span className="font-semibold text-on-surface block">{r.customerName}</span>
                      <span className="text-[10px] text-on-surface-variant">
                        {r.saleType === 'retail' ? '—' : r.petName}
                      </span>
                    </td>
                    <td className="py-2.5 pr-3 font-mono text-[10px]">
                      {r.invoiceNumber}
                      {r.saleType === 'retail' && (
                        <span className="ml-1 inline-flex px-1 py-0.5 rounded text-[8px] font-bold uppercase bg-violet-500/10 text-violet-400 border border-violet-500/20">
                          Retail
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 pr-3 capitalize">{r.paymentStatus}</td>
                    <td className="py-2.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <a
                          href={`/api/invoices/${r.id}/pdf`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-0.5 text-[9px] font-bold text-primary border border-primary/20 px-2 py-1 rounded-lg hover:bg-primary/10"
                        >
                          <Printer className="w-3 h-3" />
                          Invoice
                        </a>
                        {r.visitId && (
                          <a
                            href={`/api/visits/${r.visitId}/treatment-pdf`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-0.5 text-[9px] font-bold text-secondary border border-secondary/20 px-2 py-1 rounded-lg hover:bg-secondary/10"
                          >
                            <FileText className="w-3 h-3" />
                            Treatment
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function QueuePanel({
  title,
  empty,
  href,
  isEmpty,
  children,
}: {
  title: string;
  empty: string;
  href: string;
  isEmpty: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="glass-panel rounded-2xl border border-outline-variant/40 overflow-hidden">
      <div className="px-4 py-3 border-b border-outline-variant/30 flex items-center justify-between">
        <h4 className="text-[10px] font-bold text-on-surface uppercase tracking-wider">{title}</h4>
        <AppLink href={href} className="text-[10px] text-primary font-bold hover:underline">
          View all
        </AppLink>
      </div>
      {!isEmpty ? (
        <div>{children}</div>
      ) : (
        <p className="px-4 py-6 text-[10px] text-on-surface-variant/60 text-center italic">{empty}</p>
      )}
    </div>
  );
}
