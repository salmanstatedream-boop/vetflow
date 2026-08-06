-- Group chat: conversation type + members table (clinic_admin creates groups)

-- ---------------------------------------------------------------------------
-- Schema: staff_conversations
-- ---------------------------------------------------------------------------

ALTER TABLE public.staff_conversations
    ADD COLUMN IF NOT EXISTS type TEXT NOT NULL DEFAULT 'dm',
    ADD COLUMN IF NOT EXISTS title TEXT,
    ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.user_profiles(id);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'staff_conversations_type_check'
  ) THEN
    ALTER TABLE public.staff_conversations
      ADD CONSTRAINT staff_conversations_type_check
      CHECK (type IN ('dm', 'group'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'staff_conversations_title_check'
  ) THEN
    ALTER TABLE public.staff_conversations
      ADD CONSTRAINT staff_conversations_title_check
      CHECK (
        type = 'dm'
        OR (title IS NOT NULL AND length(btrim(title)) > 0)
      );
  END IF;
END $$;

ALTER TABLE public.staff_conversations
    ALTER COLUMN participant_a DROP NOT NULL,
    ALTER COLUMN participant_b DROP NOT NULL;

ALTER TABLE public.staff_conversations
    DROP CONSTRAINT IF EXISTS staff_conversations_ordered_pair;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'staff_conversations_dm_pair_check'
  ) THEN
    ALTER TABLE public.staff_conversations
      ADD CONSTRAINT staff_conversations_dm_pair_check
      CHECK (
        type = 'group'
        OR (
          participant_a IS NOT NULL
          AND participant_b IS NOT NULL
          AND participant_a < participant_b
        )
      );
  END IF;
END $$;

ALTER TABLE public.staff_conversations
    DROP CONSTRAINT IF EXISTS staff_conversations_unique_pair;

CREATE UNIQUE INDEX IF NOT EXISTS staff_conversations_unique_dm
    ON public.staff_conversations (organization_id, participant_a, participant_b)
    WHERE type = 'dm';

CREATE INDEX IF NOT EXISTS idx_staff_conversations_type
    ON public.staff_conversations (organization_id, type);

-- ---------------------------------------------------------------------------
-- Schema: staff_conversation_members
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.staff_conversation_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES public.staff_conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.user_profiles(id),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    hidden BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT staff_conversation_members_unique UNIQUE (conversation_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_staff_conversation_members_user
    ON public.staff_conversation_members (user_id, hidden);

CREATE INDEX IF NOT EXISTS idx_staff_conversation_members_convo
    ON public.staff_conversation_members (conversation_id);

-- Backfill DM members + hide flags
INSERT INTO public.staff_conversation_members (conversation_id, user_id, hidden)
SELECT c.id, c.participant_a, COALESCE(c.hidden_for_a, FALSE)
FROM public.staff_conversations c
WHERE c.type = 'dm'
  AND c.participant_a IS NOT NULL
ON CONFLICT (conversation_id, user_id) DO NOTHING;

INSERT INTO public.staff_conversation_members (conversation_id, user_id, hidden)
SELECT c.id, c.participant_b, COALESCE(c.hidden_for_b, FALSE)
FROM public.staff_conversations c
WHERE c.type = 'dm'
  AND c.participant_b IS NOT NULL
ON CONFLICT (conversation_id, user_id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- Helpers (avoid RLS recursion on members)
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.is_staff_conversation_member(convo_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.staff_conversation_members
    WHERE conversation_id = convo_id
      AND user_id = auth.uid()
  );
$$;

REVOKE ALL ON FUNCTION public.is_staff_conversation_member(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_staff_conversation_member(UUID) TO authenticated, service_role;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

ALTER TABLE public.staff_conversation_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS select_staff_conversations ON public.staff_conversations;
CREATE POLICY select_staff_conversations ON public.staff_conversations
    FOR SELECT TO authenticated
    USING (
        organization_id IN (SELECT public.get_user_organizations())
        AND (
            public.is_staff_conversation_member(id)
            OR created_by = (SELECT auth.uid())
            OR participant_a = (SELECT auth.uid())
            OR participant_b = (SELECT auth.uid())
        )
    );

DROP POLICY IF EXISTS insert_staff_conversations ON public.staff_conversations;
CREATE POLICY insert_staff_conversations ON public.staff_conversations
    FOR INSERT TO authenticated
    WITH CHECK (
        organization_id IN (SELECT public.get_user_organizations())
        AND (
            (
                type = 'dm'
                AND participant_a IS NOT NULL
                AND participant_b IS NOT NULL
                AND participant_a < participant_b
                AND (
                    participant_a = (SELECT auth.uid())
                    OR participant_b = (SELECT auth.uid())
                )
            )
            OR (
                type = 'group'
                AND created_by = (SELECT auth.uid())
                AND public.has_org_role(organization_id, ARRAY['clinic_admin'])
            )
        )
    );

DROP POLICY IF EXISTS update_staff_conversations ON public.staff_conversations;
CREATE POLICY update_staff_conversations ON public.staff_conversations
    FOR UPDATE TO authenticated
    USING (
        organization_id IN (SELECT public.get_user_organizations())
        AND public.is_staff_conversation_member(id)
    )
    WITH CHECK (
        organization_id IN (SELECT public.get_user_organizations())
        AND public.is_staff_conversation_member(id)
    );

-- Members
DROP POLICY IF EXISTS select_staff_conversation_members ON public.staff_conversation_members;
CREATE POLICY select_staff_conversation_members ON public.staff_conversation_members
    FOR SELECT TO authenticated
    USING (public.is_staff_conversation_member(conversation_id));

DROP POLICY IF EXISTS insert_staff_conversation_members ON public.staff_conversation_members;
CREATE POLICY insert_staff_conversation_members ON public.staff_conversation_members
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM public.staff_conversations c
            WHERE c.id = conversation_id
              AND c.organization_id IN (SELECT public.get_user_organizations())
              AND (
                  (
                      c.type = 'dm'
                      AND (c.participant_a = (SELECT auth.uid()) OR c.participant_b = (SELECT auth.uid()))
                      AND (user_id = c.participant_a OR user_id = c.participant_b)
                  )
                  OR (
                      c.type = 'group'
                      AND public.has_org_role(c.organization_id, ARRAY['clinic_admin'])
                  )
              )
        )
    );

DROP POLICY IF EXISTS update_staff_conversation_members ON public.staff_conversation_members;
CREATE POLICY update_staff_conversation_members ON public.staff_conversation_members
    FOR UPDATE TO authenticated
    USING (user_id = (SELECT auth.uid()))
    WITH CHECK (user_id = (SELECT auth.uid()));

-- Messages: membership-based
DROP POLICY IF EXISTS select_staff_messages ON public.staff_messages;
CREATE POLICY select_staff_messages ON public.staff_messages
    FOR SELECT TO authenticated
    USING (public.is_staff_conversation_member(conversation_id));

DROP POLICY IF EXISTS insert_staff_messages ON public.staff_messages;
CREATE POLICY insert_staff_messages ON public.staff_messages
    FOR INSERT TO authenticated
    WITH CHECK (
        sender_id = (SELECT auth.uid())
        AND public.is_staff_conversation_member(conversation_id)
    );

DROP POLICY IF EXISTS update_staff_messages ON public.staff_messages;
CREATE POLICY update_staff_messages ON public.staff_messages
    FOR UPDATE TO authenticated
    USING (
        sender_id = (SELECT auth.uid())
        AND public.is_staff_conversation_member(conversation_id)
    )
    WITH CHECK (
        sender_id = (SELECT auth.uid())
        AND public.is_staff_conversation_member(conversation_id)
    );

GRANT SELECT, INSERT, UPDATE ON public.staff_conversation_members TO authenticated;
