'use client';

import { Cloud, Lock, Shield, Users } from 'lucide-react';
import { useRef, useState } from 'react';
import { GradientPillButton } from '@/components/home/marketing-visuals/shared';
import PlatformExpansionDetailCard from '@/components/home/PlatformExpansionDetailCard';
import PlatformExpansionJourney from '@/components/home/PlatformExpansionJourney';
import PlatformExpansionOrbitMap, {
  PlatformExpansionConnector,
  TONE_COLORS,
  type ClinicId,
} from '@/components/home/PlatformExpansionOrbitMap';
import { useRequestAccess } from '@/components/home/RequestAccessProvider';
import Modal from '@/components/ui/premium/Modal';
import { CLINIC_TYPES, PLATFORM_EXPANSION } from '@/lib/home-data';
import { useScrollReveal } from '@/lib/hooks/useScrollReveal';

type ClinicType = (typeof CLINIC_TYPES)[number];

const FIELD_CLS =
  'w-full px-4 py-3 bg-surface-container border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-2xl outline-none text-sm text-on-surface';
const FIELD_LABEL_CLS =
  'block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2';

const TRUST_ICONS = [Shield, Cloud, Lock, Users];

export default function PlatformExpansionSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const activeBallRef = useRef<HTMLElement>(null);
  const cardRef = useRef<HTMLElement>(null);
  useScrollReveal(sectionRef, { selector: '[data-platform-fade]', staggerMs: 80, y: 18 });

  const { open: openRequestAccess } = useRequestAccess();
  const [selectedId, setSelectedId] = useState<ClinicId>('vet');
  const [dentalOpen, setDentalOpen] = useState(false);
  const [waitlistClinic, setWaitlistClinic] = useState<ClinicType | null>(null);

  const selected = CLINIC_TYPES.find((c) => c.id === selectedId) ?? CLINIC_TYPES[0];
  const accent = TONE_COLORS[selected.tone];

  const handleClinicAction = (id: ClinicId) => {
    const clinic = CLINIC_TYPES.find((c) => c.id === id);
    if (!clinic) return;
    if (clinic.id === 'vet') {
      openRequestAccess();
    } else if (clinic.id === 'dental') {
      setDentalOpen(true);
    } else {
      setWaitlistClinic(clinic);
    }
  };

  const dentalClinic = CLINIC_TYPES.find((c) => c.id === 'dental');

  return (
    <section ref={sectionRef} id="roadmap" className="phx-section relative overflow-hidden">
      <div aria-hidden className="phx-section-divider" />
      <div className="phx-container">
        {/* Header */}
        <div className="phx-section-header mb-12 max-w-3xl" data-platform-fade>
          <span className="mb-6 inline-flex items-center rounded-full border border-[#22D3EE]/35 bg-[#22D3EE]/10 px-4 py-1.5 text-[11px] font-mono uppercase tracking-[0.22em] text-[#22D3EE] shadow-[0_0_20px_rgba(34,211,238,0.12)]">
            {PLATFORM_EXPANSION.eyebrow}
          </span>
          <h2 className="phx-heading text-3xl sm:text-4xl lg:text-[3.25rem] lg:leading-[1.1]">
            {PLATFORM_EXPANSION.headline[0]}{' '}
            {PLATFORM_EXPANSION.headline[1]}{' '}
            <span className="bg-gradient-to-r from-[#22D3EE] via-[#60A5FA] to-[#8B5CF6] bg-clip-text text-transparent">
              {PLATFORM_EXPANSION.headline[2]}
            </span>
          </h2>
          <p className="phx-subtext mt-5 max-w-xl text-lg text-[#94A3B8]">
            {PLATFORM_EXPANSION.subheadline}
          </p>
          <div className="mt-7">
            <GradientPillButton onClick={openRequestAccess}>
              {PLATFORM_EXPANSION.headerCta} →
            </GradientPillButton>
          </div>
        </div>

        {/* Orbit + detail + live connector */}
        <div
          ref={stageRef}
          className="relative mb-14 grid items-center gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(280px,0.85fr)] lg:gap-6 xl:gap-10"
          data-platform-fade
        >
          <PlatformExpansionConnector
            containerRef={stageRef}
            ballRef={activeBallRef}
            cardRef={cardRef}
            color={accent}
          />
          <PlatformExpansionOrbitMap
            selectedId={selectedId}
            onSelect={setSelectedId}
            activeBallRef={activeBallRef}
          />
          <PlatformExpansionDetailCard
            selectedId={selectedId}
            onAction={handleClinicAction}
            cardRef={cardRef}
          />
        </div>

        {/* Journey */}
        <div className="mb-12">
          <PlatformExpansionJourney />
        </div>

        {/* Trust bar */}
        <div
          className="flex w-full flex-col items-stretch justify-between gap-6 rounded-2xl border border-white/[0.08] bg-[#0A1020]/85 p-5 shadow-[0_0_40px_rgba(0,0,0,0.25)] backdrop-blur-sm sm:p-6 lg:flex-row lg:items-center lg:gap-8"
          data-platform-fade
        >
          <div className="grid flex-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
            {PLATFORM_EXPANSION.trustBar.map((item, i) => {
              const Icon = TRUST_ICONS[i];
              return (
                <div key={item.label} className="flex items-start gap-2.5">
                  <Icon className="mt-0.5 h-4 w-4 shrink-0 text-[#22D3EE]" />
                  <div>
                    <p className="text-[11px] font-semibold text-[#F8FAFC]">{item.label}</p>
                    <p className="mt-0.5 text-[10px] leading-snug text-[#64748B]">{item.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
          <GradientPillButton onClick={openRequestAccess} className="lg:shrink-0">
            {PLATFORM_EXPANSION.cta} →
          </GradientPillButton>
        </div>
      </div>

      {dentalClinic && (
        <DentalInfoModal
          open={dentalOpen}
          clinic={dentalClinic}
          onClose={() => setDentalOpen(false)}
        />
      )}
      <WaitlistModal clinic={waitlistClinic} onClose={() => setWaitlistClinic(null)} />
    </section>
  );
}

function DentalInfoModal({
  open,
  clinic,
  onClose,
}: {
  open: boolean;
  clinic: ClinicType;
  onClose: () => void;
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Dental Clinics — In Development"
      description="Modern dental workflows are being built into the Phoenix OS platform."
      size="md"
    >
      <div className="space-y-4">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-[#8B5CF6]/30 bg-[#8B5CF6]/10 px-2.5 py-1 text-[10px] font-mono uppercase tracking-wide text-[#C4B5FD]">
          ● In Development
        </span>
        <p className="text-sm leading-relaxed text-on-surface-variant/80">
          {clinic.description} Here&apos;s what the dental build will include:
        </p>
        <ul className="grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
          {clinic.details.map((detail) => (
            <li key={detail} className="flex items-start gap-2 text-sm text-on-surface-variant/70">
              <span className="mt-0.5 shrink-0 text-[#8B5CF6]">✓</span>
              <span className="leading-snug">{detail}</span>
            </li>
          ))}
        </ul>
        <div className="flex justify-end pt-1">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center rounded-full border border-[#8B5CF6]/40 px-4 py-2 text-[11px] font-medium text-[#C4B5FD] transition-colors hover:bg-[#8B5CF6]/10 phx-focus-ring"
          >
            Got it
          </button>
        </div>
      </div>
    </Modal>
  );
}

function WaitlistModal({
  clinic,
  onClose,
}: {
  clinic: ClinicType | null;
  onClose: () => void;
}) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [clinicType, setClinicType] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const activeId = clinic?.id ?? '';
  const [lastId, setLastId] = useState('');
  if (clinic && activeId !== lastId) {
    setLastId(activeId);
    setName('');
    setEmail('');
    setClinicType(clinic.title);
    setSubmitted(false);
  }

  if (!clinic) {
    if (lastId !== '') setLastId('');
    return null;
  }

  return (
    <Modal
      open={Boolean(clinic)}
      onClose={onClose}
      title={submitted ? "You're on the list" : `Join the ${clinic.title} waitlist`}
      description={
        submitted
          ? undefined
          : "Be the first to know when it launches — we'll email you the moment it's ready."
      }
      size="sm"
    >
      {submitted ? (
        <div className="py-4 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-[#22C55E]/30 bg-[#22C55E]/15 text-2xl">
            ✓
          </div>
          <p className="text-sm leading-relaxed text-on-surface-variant/80">
            Thanks, {name || 'there'}! We&apos;ve added you to the {clinicType} waitlist and will
            reach out at <span className="text-on-surface">{email}</span>.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="mt-5 inline-flex items-center rounded-full border border-[#3B82F6]/40 px-4 py-2 text-[11px] font-medium text-[#93C5FD] transition-colors hover:bg-[#3B82F6]/10 phx-focus-ring"
          >
            Close
          </button>
        </div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setSubmitted(true);
          }}
          className="space-y-4"
        >
          <div>
            <label htmlFor="waitlist-name" className={FIELD_LABEL_CLS}>
              Full name
            </label>
            <input
              id="waitlist-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className={FIELD_CLS}
              placeholder="Jane Doe"
            />
          </div>
          <div>
            <label htmlFor="waitlist-email" className={FIELD_LABEL_CLS}>
              Email
            </label>
            <input
              id="waitlist-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={FIELD_CLS}
              placeholder="you@clinic.com"
            />
          </div>
          <div>
            <label htmlFor="waitlist-type" className={FIELD_LABEL_CLS}>
              Clinic type
            </label>
            <select
              id="waitlist-type"
              value={clinicType}
              onChange={(e) => setClinicType(e.target.value)}
              className={FIELD_CLS}
            >
              {CLINIC_TYPES.filter((c) => c.id !== 'vet').map((c) => (
                <option key={c.id} value={c.title}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="inline-flex w-full items-center justify-center rounded-full bg-[#3B82F6] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#2563EB] phx-focus-ring"
          >
            Notify me
          </button>
        </form>
      )}
    </Modal>
  );
}
