-- Phoenix Care: link auth users (pet owners) to customers across clinics.

CREATE TABLE IF NOT EXISTS public.customer_account_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE (user_id, customer_id)
);

CREATE INDEX IF NOT EXISTS idx_customer_account_links_user
    ON public.customer_account_links (user_id);
CREATE INDEX IF NOT EXISTS idx_customer_account_links_customer
    ON public.customer_account_links (customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_account_links_org
    ON public.customer_account_links (organization_id);

CREATE TABLE IF NOT EXISTS public.owner_invites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    email VARCHAR(255),
    phone VARCHAR(50),
    token TEXT NOT NULL UNIQUE,
    invited_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    accepted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_owner_invites_token ON public.owner_invites (token);
CREATE INDEX IF NOT EXISTS idx_owner_invites_customer ON public.owner_invites (customer_id);
CREATE INDEX IF NOT EXISTS idx_owner_invites_email
    ON public.owner_invites (lower(email))
    WHERE email IS NOT NULL AND accepted_at IS NULL;

ALTER TABLE public.customer_account_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.owner_invites ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_linked_customer(p_customer_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.customer_account_links l
    WHERE l.customer_id = p_customer_id
      AND l.user_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.is_linked_patient(p_patient_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.patients p
    JOIN public.customer_account_links l ON l.customer_id = p.customer_id
    WHERE p.id = p_patient_id
      AND l.user_id = auth.uid()
  );
$$;

DROP POLICY IF EXISTS owner_links_select_own ON public.customer_account_links;
CREATE POLICY owner_links_select_own ON public.customer_account_links
    FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS owner_links_staff_manage ON public.customer_account_links;
CREATE POLICY owner_links_staff_manage ON public.customer_account_links
    FOR ALL USING (
        public.has_org_role(organization_id, ARRAY['clinic_admin', 'receptionist', 'doctor'])
    )
    WITH CHECK (
        public.has_org_role(organization_id, ARRAY['clinic_admin', 'receptionist', 'doctor'])
    );

DROP POLICY IF EXISTS owner_invites_staff_manage ON public.owner_invites;
CREATE POLICY owner_invites_staff_manage ON public.owner_invites
    FOR ALL USING (
        public.has_org_role(organization_id, ARRAY['clinic_admin', 'receptionist'])
    )
    WITH CHECK (
        public.has_org_role(organization_id, ARRAY['clinic_admin', 'receptionist'])
    );

DROP POLICY IF EXISTS owner_invites_select_pending ON public.owner_invites;
CREATE POLICY owner_invites_select_pending ON public.owner_invites
    FOR SELECT USING (
        accepted_at IS NULL
        AND expires_at > timezone('utc'::text, now())
        AND (
            (email IS NOT NULL AND lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')))
            OR token IS NOT NULL
        )
    );

-- Owners can read their linked customer / patient rows (additive policies).
DROP POLICY IF EXISTS owner_select_linked_customers ON public.customers;
CREATE POLICY owner_select_linked_customers ON public.customers
    FOR SELECT USING (public.is_linked_customer(id));

DROP POLICY IF EXISTS owner_select_linked_patients ON public.patients;
CREATE POLICY owner_select_linked_patients ON public.patients
    FOR SELECT USING (public.is_linked_customer(customer_id));

DROP POLICY IF EXISTS owner_select_linked_appointments ON public.appointments;
CREATE POLICY owner_select_linked_appointments ON public.appointments
    FOR SELECT USING (
        (customer_id IS NOT NULL AND public.is_linked_customer(customer_id))
        OR (patient_id IS NOT NULL AND public.is_linked_patient(patient_id))
    );

DROP POLICY IF EXISTS owner_insert_linked_appointments ON public.appointments;
CREATE POLICY owner_insert_linked_appointments ON public.appointments
    FOR INSERT WITH CHECK (
        customer_id IS NOT NULL
        AND public.is_linked_customer(customer_id)
        AND source = 'owner_app'
    );

DROP POLICY IF EXISTS owner_select_linked_visits ON public.visits;
CREATE POLICY owner_select_linked_visits ON public.visits
    FOR SELECT USING (public.is_linked_customer(customer_id));

DROP POLICY IF EXISTS owner_select_linked_clinical_notes ON public.clinical_notes;
CREATE POLICY owner_select_linked_clinical_notes ON public.clinical_notes
    FOR SELECT USING (
        EXISTS (
            SELECT 1
            FROM public.visits v
            WHERE v.id = visit_id
              AND public.is_linked_customer(v.customer_id)
        )
    );

DROP POLICY IF EXISTS owner_select_linked_prescriptions ON public.prescriptions;
CREATE POLICY owner_select_linked_prescriptions ON public.prescriptions
    FOR SELECT USING (
        EXISTS (
            SELECT 1
            FROM public.visits v
            WHERE v.id = visit_id
              AND public.is_linked_customer(v.customer_id)
        )
    );

GRANT SELECT ON public.customer_account_links TO authenticated;
GRANT SELECT ON public.owner_invites TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_linked_customer(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_linked_patient(UUID) TO authenticated;
