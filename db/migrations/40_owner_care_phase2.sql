-- Phoenix Care Phase 2: cancel/reschedule, owner↔clinic messaging, notifications, richer owner reads.

-- Owner may cancel / reschedule linked appointments (not completed/cancelled).
DROP POLICY IF EXISTS owner_update_linked_appointments ON public.appointments;
CREATE POLICY owner_update_linked_appointments ON public.appointments
    FOR UPDATE USING (
        customer_id IS NOT NULL
        AND public.is_linked_customer(customer_id)
        AND status IN ('requested', 'confirmed', 'rescheduled')
    )
    WITH CHECK (
        customer_id IS NOT NULL
        AND public.is_linked_customer(customer_id)
        AND status IN ('requested', 'confirmed', 'rescheduled', 'cancelled')
    );

-- Prescription item lines for linked visits
DROP POLICY IF EXISTS owner_select_linked_prescription_items ON public.prescription_items;
CREATE POLICY owner_select_linked_prescription_items ON public.prescription_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1
            FROM public.prescriptions rx
            JOIN public.visits v ON v.id = rx.visit_id
            WHERE rx.id = prescription_id
              AND public.is_linked_customer(v.customer_id)
        )
    );

-- Clinic phone for emergency (org-scoped settings)
DROP POLICY IF EXISTS owner_select_linked_app_settings ON public.app_settings;
CREATE POLICY owner_select_linked_app_settings ON public.app_settings
    FOR SELECT USING (
        EXISTS (
            SELECT 1
            FROM public.customer_account_links l
            WHERE l.organization_id = app_settings.organization_id
              AND l.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS owner_select_linked_branches ON public.branches;
CREATE POLICY owner_select_linked_branches ON public.branches
    FOR SELECT USING (
        EXISTS (
            SELECT 1
            FROM public.customer_account_links l
            WHERE l.organization_id = branches.organization_id
              AND l.user_id = auth.uid()
        )
    );

-- Owner ↔ clinic messaging
CREATE TABLE IF NOT EXISTS public.owner_clinic_threads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE (user_id, organization_id, customer_id)
);

CREATE INDEX IF NOT EXISTS idx_owner_clinic_threads_user
    ON public.owner_clinic_threads (user_id, last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_owner_clinic_threads_org
    ON public.owner_clinic_threads (organization_id, last_message_at DESC);

CREATE TABLE IF NOT EXISTS public.owner_clinic_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    thread_id UUID NOT NULL REFERENCES public.owner_clinic_threads(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    sender_type TEXT NOT NULL CHECK (sender_type IN ('owner', 'staff')),
    sender_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    body TEXT NOT NULL CHECK (char_length(trim(body)) > 0 AND char_length(body) <= 4000),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    read_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_owner_clinic_messages_thread
    ON public.owner_clinic_messages (thread_id, created_at ASC);

-- In-app owner notifications
CREATE TABLE IF NOT EXISTS public.owner_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
    kind TEXT NOT NULL,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_owner_notifications_user
    ON public.owner_notifications (user_id, created_at DESC);

-- Optional push tokens (registration only in Phase 2; send later)
CREATE TABLE IF NOT EXISTS public.owner_push_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    token TEXT NOT NULL,
    platform TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE (user_id, token)
);

ALTER TABLE public.owner_clinic_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.owner_clinic_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.owner_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.owner_push_tokens ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS owner_threads_select ON public.owner_clinic_threads;
CREATE POLICY owner_threads_select ON public.owner_clinic_threads
    FOR SELECT USING (
        user_id = auth.uid()
        OR public.has_org_role(organization_id, ARRAY['clinic_admin', 'receptionist', 'doctor'])
    );

DROP POLICY IF EXISTS owner_threads_insert ON public.owner_clinic_threads;
CREATE POLICY owner_threads_insert ON public.owner_clinic_threads
    FOR INSERT WITH CHECK (
        user_id = auth.uid()
        AND public.is_linked_customer(customer_id)
    );

DROP POLICY IF EXISTS owner_threads_staff_all ON public.owner_clinic_threads;
CREATE POLICY owner_threads_staff_all ON public.owner_clinic_threads
    FOR ALL USING (
        public.has_org_role(organization_id, ARRAY['clinic_admin', 'receptionist', 'doctor'])
    )
    WITH CHECK (
        public.has_org_role(organization_id, ARRAY['clinic_admin', 'receptionist', 'doctor'])
    );

DROP POLICY IF EXISTS owner_messages_select ON public.owner_clinic_messages;
CREATE POLICY owner_messages_select ON public.owner_clinic_messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.owner_clinic_threads t
            WHERE t.id = thread_id
              AND (
                t.user_id = auth.uid()
                OR public.has_org_role(t.organization_id, ARRAY['clinic_admin', 'receptionist', 'doctor'])
              )
        )
    );

DROP POLICY IF EXISTS owner_messages_insert_owner ON public.owner_clinic_messages;
CREATE POLICY owner_messages_insert_owner ON public.owner_clinic_messages
    FOR INSERT WITH CHECK (
        sender_type = 'owner'
        AND sender_user_id = auth.uid()
        AND EXISTS (
            SELECT 1 FROM public.owner_clinic_threads t
            WHERE t.id = thread_id
              AND t.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS owner_messages_insert_staff ON public.owner_clinic_messages;
CREATE POLICY owner_messages_insert_staff ON public.owner_clinic_messages
    FOR INSERT WITH CHECK (
        sender_type = 'staff'
        AND public.has_org_role(organization_id, ARRAY['clinic_admin', 'receptionist', 'doctor'])
    );

DROP POLICY IF EXISTS owner_notifications_own ON public.owner_notifications;
CREATE POLICY owner_notifications_own ON public.owner_notifications
    FOR ALL USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS owner_push_tokens_own ON public.owner_push_tokens;
CREATE POLICY owner_push_tokens_own ON public.owner_push_tokens
    FOR ALL USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

GRANT SELECT, INSERT, UPDATE ON public.owner_clinic_threads TO authenticated;
GRANT SELECT, INSERT ON public.owner_clinic_messages TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.owner_notifications TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.owner_push_tokens TO authenticated;
