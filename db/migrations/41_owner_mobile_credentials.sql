-- Track Phoenix Care mobile login credential issuance (no plaintext passwords).

CREATE TABLE IF NOT EXISTS public.owner_mobile_credentials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    issued_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    last_issued_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE (customer_id)
);

CREATE INDEX IF NOT EXISTS idx_owner_mobile_credentials_org
    ON public.owner_mobile_credentials (organization_id);
CREATE INDEX IF NOT EXISTS idx_owner_mobile_credentials_user
    ON public.owner_mobile_credentials (user_id);

ALTER TABLE public.owner_mobile_credentials ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS owner_mobile_credentials_staff_manage ON public.owner_mobile_credentials;
CREATE POLICY owner_mobile_credentials_staff_manage ON public.owner_mobile_credentials
    FOR ALL
    USING (
        public.has_org_role(organization_id, ARRAY['clinic_admin', 'receptionist'])
    )
    WITH CHECK (
        public.has_org_role(organization_id, ARRAY['clinic_admin', 'receptionist'])
    );

GRANT SELECT, INSERT, UPDATE, DELETE ON public.owner_mobile_credentials TO authenticated;
