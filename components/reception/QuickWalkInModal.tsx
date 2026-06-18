'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import PatientLookupPanel, {
  type SelectedPatient,
} from '@/components/reception/PatientLookupPanel';
import Select from '@/components/ui/premium/Select';
import { createWalkInVisitAction } from '@/lib/services/visit-actions';
import { AlertTriangle, ClipboardList, Loader2, X } from 'lucide-react';

interface Doctor {
  id: string;
  firstName: string;
  lastName: string;
}

interface QuickWalkInModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeBranchId: string;
  branches: { id: string; name: string }[];
  doctors: Doctor[];
}

export default function QuickWalkInModal({
  isOpen,
  onClose,
  activeBranchId,
  branches,
  doctors,
}: QuickWalkInModalProps) {
  const router = useRouter();
  const [selectedPatient, setSelectedPatient] = useState<SelectedPatient | null>(null);
  const [reason, setReason] = useState('');
  const [isEmergency, setIsEmergency] = useState(false);
  const [triageNotes, setTriageNotes] = useState('');
  const [doctorId, setDoctorId] = useState(doctors.length > 0 ? doctors[0].id : '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setSelectedPatient(null);
      setReason('');
      setIsEmergency(false);
      setTriageNotes('');
      setDoctorId(doctors.length > 0 ? doctors[0].id : '');
      setError(null);
      setSuccess(false);
    }
  }, [isOpen, doctors]);

  const handleCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient || !doctorId || !reason.trim()) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await createWalkInVisitAction({
        petId: selectedPatient.pet.id,
        customerId: selectedPatient.customer.id,
        doctorId,
        reason: reason.trim(),
        branchId: activeBranchId,
        isEmergency,
        triageNotes: triageNotes.trim() || undefined,
      });

      if (res.success) {
        setSuccess(true);
        router.refresh();
      } else {
        setError(res.error || 'Failed to check-in patient');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="glass-panel w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl shadow-premium border border-outline-variant/40 relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-on-surface-variant/40 hover:text-on-surface-variant transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 space-y-5">
          <div>
            <h3 className="text-base font-bold text-on-surface flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-primary" />
              Quick walk-in
            </h3>
            <p className="text-xs text-on-surface-variant/60 mt-1">
              Register or find the owner, select a pet, and check in without leaving the dashboard.
            </p>
          </div>

          {success ? (
            <div className="space-y-4 text-center py-4">
              <p className="text-sm font-bold text-emerald-600">
                {selectedPatient?.pet.name} checked in successfully.
              </p>
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <Link
                  href="/dashboard/walk-ins"
                  className="px-4 py-2.5 bg-primary text-white rounded-xl text-xs font-bold"
                  onClick={onClose}
                >
                  View walk-in queue
                </Link>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 border border-outline-variant rounded-xl text-xs font-semibold"
                >
                  Close
                </button>
              </div>
            </div>
          ) : !selectedPatient ? (
            <PatientLookupPanel
              activeBranchId={activeBranchId}
              branches={branches}
              selected={selectedPatient}
              onSelect={setSelectedPatient}
              onClear={() => setSelectedPatient(null)}
            />
          ) : (
            <form onSubmit={handleCheckIn} className="space-y-4">
              <div className="bg-surface-container/30 p-3 rounded-xl border border-outline-variant/35 flex items-center justify-between">
                <div>
                  <span className="text-[9px] font-bold text-on-surface-variant/40 uppercase block">
                    Selected patient
                  </span>
                  <span className="text-xs font-bold text-on-surface">{selectedPatient.pet.name}</span>
                  <span className="text-[10px] text-on-surface-variant/60 block">
                    Owner: {selectedPatient.customer.firstName} {selectedPatient.customer.lastName}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedPatient(null)}
                  className="text-[10px] text-destructive font-bold hover:underline"
                >
                  Change
                </button>
              </div>

              {error && (
                <div className="p-2.5 bg-destructive/5 border border-destructive/20 text-destructive text-[11px] rounded-lg">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-[10px] font-semibold text-on-surface/80 uppercase tracking-wider mb-1.5">
                  Reason for visit
                </label>
                <input
                  type="text"
                  placeholder="e.g. Vaccination, skin rash, ear infection"
                  className="w-full px-3 py-2 bg-surface-container/20 border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-xl text-xs text-on-surface outline-none"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-on-surface/80 uppercase tracking-wider mb-1.5">
                  Initial history / triage (optional)
                </label>
                <textarea
                  placeholder="Presenting complaint, symptoms, duration..."
                  className="w-full px-3 py-2 bg-surface-container/20 border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-xl text-xs text-on-surface outline-none resize-none"
                  rows={3}
                  value={triageNotes}
                  onChange={(e) => setTriageNotes(e.target.value)}
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isEmergency}
                  onChange={(e) => setIsEmergency(e.target.checked)}
                  className="rounded border-outline-variant"
                />
                <AlertTriangle className="w-4 h-4 text-destructive" />
                <span className="text-xs font-bold text-destructive">Mark as emergency</span>
              </label>

              <Select
                label="Assign attending vet"
                value={doctorId}
                onChange={setDoctorId}
                options={doctors.map((doc) => ({
                  value: doc.id,
                  label: `Dr. ${doc.firstName} ${doc.lastName}`,
                }))}
                onAddNew={() => router.push('/dashboard/staff')}
                addNewLabel="Add staff member"
              />

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary hover:bg-primary/95 text-white py-2.5 rounded-xl text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-1.5 disabled:opacity-75"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Checking in...
                  </>
                ) : (
                  'Check-in patient'
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
