-- Dashboard notification kind toggles (org-level). Empty {} means all kinds enabled.

ALTER TABLE public.app_settings
  ADD COLUMN IF NOT EXISTS notification_prefs JSONB NOT NULL DEFAULT '{}'::jsonb;
