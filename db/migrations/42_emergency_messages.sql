-- Clinic-editable emergency / after-hours copy for Phoenix Care
ALTER TABLE public.app_settings
  ADD COLUMN IF NOT EXISTS emergency_call_prompt TEXT,
  ADD COLUMN IF NOT EXISTS after_hours_note TEXT;
