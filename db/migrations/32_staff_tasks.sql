-- Staff tasks / tickets (opt-in per organization via subscription_status.features.staff_tasks)

CREATE TABLE IF NOT EXISTS public.staff_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    branch_id UUID REFERENCES public.branches(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    body TEXT,
    status TEXT NOT NULL DEFAULT 'open'
        CHECK (status IN ('open', 'in_progress', 'done')),
    created_by UUID NOT NULL REFERENCES public.user_profiles(id),
    assignee_id UUID NOT NULL REFERENCES public.user_profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TRIGGER update_staff_tasks_updated_at
    BEFORE UPDATE ON public.staff_tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_staff_tasks_org ON public.staff_tasks (organization_id);
CREATE INDEX IF NOT EXISTS idx_staff_tasks_assignee ON public.staff_tasks (assignee_id, status);
CREATE INDEX IF NOT EXISTS idx_staff_tasks_created_by ON public.staff_tasks (created_by);

CREATE TABLE IF NOT EXISTS public.staff_task_replies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES public.staff_tasks(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES public.user_profiles(id),
    body TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_staff_task_replies_task ON public.staff_task_replies (task_id, created_at);

ALTER TABLE public.staff_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_task_replies ENABLE ROW LEVEL SECURITY;

-- Visible to assignee, creator, or clinic admin in the same org (not super-admin blanket)
CREATE POLICY select_staff_tasks ON public.staff_tasks
    FOR SELECT TO authenticated
    USING (
        organization_id IN (SELECT public.get_user_organizations())
        AND (
            assignee_id = (SELECT auth.uid())
            OR created_by = (SELECT auth.uid())
            OR public.has_org_role(organization_id, ARRAY['clinic_admin'])
        )
    );

CREATE POLICY insert_staff_tasks ON public.staff_tasks
    FOR INSERT TO authenticated
    WITH CHECK (
        organization_id IN (SELECT public.get_user_organizations())
        AND public.has_org_role(organization_id, ARRAY['clinic_admin'])
        AND created_by = (SELECT auth.uid())
    );

CREATE POLICY update_staff_tasks ON public.staff_tasks
    FOR UPDATE TO authenticated
    USING (
        organization_id IN (SELECT public.get_user_organizations())
        AND (
            assignee_id = (SELECT auth.uid())
            OR created_by = (SELECT auth.uid())
            OR public.has_org_role(organization_id, ARRAY['clinic_admin'])
        )
    )
    WITH CHECK (
        organization_id IN (SELECT public.get_user_organizations())
        AND (
            assignee_id = (SELECT auth.uid())
            OR created_by = (SELECT auth.uid())
            OR public.has_org_role(organization_id, ARRAY['clinic_admin'])
        )
    );

CREATE POLICY delete_staff_tasks ON public.staff_tasks
    FOR DELETE TO authenticated
    USING (
        organization_id IN (SELECT public.get_user_organizations())
        AND public.has_org_role(organization_id, ARRAY['clinic_admin'])
    );

CREATE POLICY select_staff_task_replies ON public.staff_task_replies
    FOR SELECT TO authenticated
    USING (
        task_id IN (SELECT id FROM public.staff_tasks)
    );

CREATE POLICY insert_staff_task_replies ON public.staff_task_replies
    FOR INSERT TO authenticated
    WITH CHECK (
        author_id = (SELECT auth.uid())
        AND task_id IN (SELECT id FROM public.staff_tasks)
    );

GRANT SELECT, INSERT, UPDATE, DELETE ON public.staff_tasks TO authenticated;
GRANT SELECT, INSERT ON public.staff_task_replies TO authenticated;
