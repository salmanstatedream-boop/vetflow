-- Body condition score on patients and per-visit clinical notes

ALTER TABLE public.patients
  ADD COLUMN IF NOT EXISTS body_condition_score SMALLINT;

ALTER TABLE public.clinical_notes
  ADD COLUMN IF NOT EXISTS body_condition_score SMALLINT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'patients_body_condition_score_check'
  ) THEN
    ALTER TABLE public.patients
      ADD CONSTRAINT patients_body_condition_score_check
      CHECK (body_condition_score IS NULL OR (body_condition_score >= 1 AND body_condition_score <= 9));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'clinical_notes_body_condition_score_check'
  ) THEN
    ALTER TABLE public.clinical_notes
      ADD CONSTRAINT clinical_notes_body_condition_score_check
      CHECK (body_condition_score IS NULL OR (body_condition_score >= 1 AND body_condition_score <= 9));
  END IF;
END $$;
