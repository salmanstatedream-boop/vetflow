'use client';

interface ConsultationStepProgressBarProps {
  active: boolean;
}

/** Indeterminate top progress line while SOAP steps transition. */
export default function ConsultationStepProgressBar({ active }: ConsultationStepProgressBarProps) {
  if (!active) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 md:left-64 z-[60] h-[3px] overflow-hidden bg-outline-variant/15 pointer-events-none"
      role="progressbar"
      aria-label="Loading next section"
      aria-busy="true"
    >
      <div className="h-full w-2/5 bg-gradient-to-r from-transparent via-primary to-transparent consult-step-progress-bar" />
    </div>
  );
}
