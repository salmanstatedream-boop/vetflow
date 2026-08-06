-- Chat/task unread tracking for notification bell + sidebar dots

ALTER TABLE public.staff_conversation_members
    ADD COLUMN IF NOT EXISTS last_read_at TIMESTAMP WITH TIME ZONE;

UPDATE public.staff_conversation_members
SET last_read_at = COALESCE(joined_at, timezone('utc'::text, now()))
WHERE last_read_at IS NULL;

CREATE TABLE IF NOT EXISTS public.staff_user_activity (
    user_id UUID PRIMARY KEY REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    tasks_seen_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.staff_task_reads (
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    task_id UUID NOT NULL REFERENCES public.staff_tasks(id) ON DELETE CASCADE,
    last_read_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (user_id, task_id)
);

CREATE INDEX IF NOT EXISTS idx_staff_task_reads_user
    ON public.staff_task_reads (user_id);

ALTER TABLE public.staff_user_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_task_reads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS select_staff_user_activity ON public.staff_user_activity;
CREATE POLICY select_staff_user_activity ON public.staff_user_activity
    FOR SELECT TO authenticated
    USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS insert_staff_user_activity ON public.staff_user_activity;
CREATE POLICY insert_staff_user_activity ON public.staff_user_activity
    FOR INSERT TO authenticated
    WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS update_staff_user_activity ON public.staff_user_activity;
CREATE POLICY update_staff_user_activity ON public.staff_user_activity
    FOR UPDATE TO authenticated
    USING (user_id = (SELECT auth.uid()))
    WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS select_staff_task_reads ON public.staff_task_reads;
CREATE POLICY select_staff_task_reads ON public.staff_task_reads
    FOR SELECT TO authenticated
    USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS insert_staff_task_reads ON public.staff_task_reads;
CREATE POLICY insert_staff_task_reads ON public.staff_task_reads
    FOR INSERT TO authenticated
    WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS update_staff_task_reads ON public.staff_task_reads;
CREATE POLICY update_staff_task_reads ON public.staff_task_reads
    FOR UPDATE TO authenticated
    USING (user_id = (SELECT auth.uid()))
    WITH CHECK (user_id = (SELECT auth.uid()));

GRANT SELECT, INSERT, UPDATE ON public.staff_user_activity TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.staff_task_reads TO authenticated;
