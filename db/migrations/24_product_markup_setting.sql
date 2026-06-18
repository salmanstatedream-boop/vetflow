-- Default product markup percent for auto-calculating selling price from purchase/cost

ALTER TABLE public.app_settings
  ADD COLUMN IF NOT EXISTS product_markup_percent NUMERIC(5, 2) NOT NULL DEFAULT 20;
