-- Appointment-type consultation workflows: visit purpose on visits + structured workflow payload

-- Extend appointment visit_purpose to include deworming
ALTER TABLE public.appointments
    DROP CONSTRAINT IF EXISTS appointments_visit_purpose_check;

ALTER TABLE public.appointments
    ADD CONSTRAINT appointments_visit_purpose_check
    CHECK (visit_purpose IN (
        'vaccination', 'wellness', 'sick_visit', 'surgery',
        'grooming', 'deworming', 'follow_up', 'other'
    ));

-- Copy visit purpose onto visits for consultation routing
ALTER TABLE public.visits
    ADD COLUMN IF NOT EXISTS visit_purpose VARCHAR(30) NOT NULL DEFAULT 'other';

ALTER TABLE public.visits
    DROP CONSTRAINT IF EXISTS visits_visit_purpose_check;

ALTER TABLE public.visits
    ADD CONSTRAINT visits_visit_purpose_check
    CHECK (visit_purpose IN (
        'vaccination', 'wellness', 'sick_visit', 'surgery',
        'grooming', 'deworming', 'follow_up', 'other'
    ));

-- Finalized structured workflow record (grooming / vaccination / deworming)
ALTER TABLE public.visits
    ADD COLUMN IF NOT EXISTS workflow_payload JSONB;

COMMENT ON COLUMN public.visits.visit_purpose IS 'Copied from appointment at check-in; drives consultation workflow routing';
COMMENT ON COLUMN public.visits.workflow_payload IS 'Finalized structured workflow data after grooming/vaccination/deworming consultation complete';

-- Backfill visit_purpose from linked appointments
UPDATE public.visits v
SET visit_purpose = a.visit_purpose
FROM public.appointments a
WHERE v.appointment_id = a.id
  AND a.visit_purpose IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_visits_patient_workflow
    ON public.visits (patient_id, visit_purpose)
    WHERE workflow_payload IS NOT NULL;
