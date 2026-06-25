-- Structured visit purpose on appointments for booking and dashboard metrics

ALTER TABLE public.appointments
    ADD COLUMN IF NOT EXISTS visit_purpose VARCHAR(30) NOT NULL DEFAULT 'other';

ALTER TABLE public.appointments
    DROP CONSTRAINT IF EXISTS appointments_visit_purpose_check;

ALTER TABLE public.appointments
    ADD CONSTRAINT appointments_visit_purpose_check
    CHECK (visit_purpose IN (
        'vaccination', 'wellness', 'sick_visit', 'surgery',
        'grooming', 'follow_up', 'other'
    ));

CREATE INDEX IF NOT EXISTS idx_appointments_branch_visit_purpose_date
    ON public.appointments (branch_id, visit_purpose, preferred_date);
