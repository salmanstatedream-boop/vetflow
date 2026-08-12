-- Owner-uploaded external prescriptions (other clinics)
CREATE TABLE IF NOT EXISTS public.owner_external_prescriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  clinic_name TEXT NOT NULL,
  notes TEXT,
  taken_at DATE,
  storage_path TEXT,
  file_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_owner_external_rx_patient
  ON public.owner_external_prescriptions (patient_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_owner_external_rx_user
  ON public.owner_external_prescriptions (user_id);

ALTER TABLE public.owner_external_prescriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS owner_external_rx_select ON public.owner_external_prescriptions;
CREATE POLICY owner_external_rx_select ON public.owner_external_prescriptions
  FOR SELECT USING (
    user_id = auth.uid()
    OR public.has_org_role(organization_id, ARRAY['clinic_admin', 'doctor', 'receptionist'])
  );

DROP POLICY IF EXISTS owner_external_rx_insert ON public.owner_external_prescriptions;
CREATE POLICY owner_external_rx_insert ON public.owner_external_prescriptions
  FOR INSERT WITH CHECK (user_id = auth.uid());
