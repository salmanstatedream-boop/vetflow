-- Product-level expiry tracking for catalog items

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS track_expiry BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS expiry_date DATE NULL;

CREATE INDEX IF NOT EXISTS idx_products_expiry
  ON public.products (branch_id, expiry_date)
  WHERE track_expiry = TRUE AND expiry_date IS NOT NULL AND deleted_at IS NULL;
