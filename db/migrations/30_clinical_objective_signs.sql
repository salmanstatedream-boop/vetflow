-- SOAP Objective: dehydration % and clinical sign checkboxes on clinical_notes
ALTER TABLE public.clinical_notes
  ADD COLUMN IF NOT EXISTS dehydration_percent NUMERIC(5, 2)
    CHECK (dehydration_percent IS NULL OR (dehydration_percent >= 0 AND dehydration_percent <= 100)),
  ADD COLUMN IF NOT EXISTS sign_vomiting BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS sign_anorexia BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS sign_diarrhoea BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS sign_constipation BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS sign_vaccination BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS sign_deworming BOOLEAN NOT NULL DEFAULT FALSE;
