-- Payment proof attachments (card / bank transfer receipts)
ALTER TABLE public.payments
  ADD COLUMN IF NOT EXISTS proof_storage_path TEXT,
  ADD COLUMN IF NOT EXISTS proof_file_name TEXT;
