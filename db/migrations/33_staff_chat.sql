-- Staff 1:1 DMs (opt-in via subscription_status.features.staff_chat)
-- Super-admins are NOT granted blanket access — only conversation participants.

CREATE TABLE IF NOT EXISTS public.staff_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    participant_a UUID NOT NULL REFERENCES public.user_profiles(id),
    participant_b UUID NOT NULL REFERENCES public.user_profiles(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT staff_conversations_ordered_pair CHECK (participant_a < participant_b),
    CONSTRAINT staff_conversations_unique_pair UNIQUE (organization_id, participant_a, participant_b)
);

CREATE INDEX IF NOT EXISTS idx_staff_conversations_org ON public.staff_conversations (organization_id);
CREATE INDEX IF NOT EXISTS idx_staff_conversations_participant_a ON public.staff_conversations (participant_a);
CREATE INDEX IF NOT EXISTS idx_staff_conversations_participant_b ON public.staff_conversations (participant_b);
CREATE INDEX IF NOT EXISTS idx_staff_conversations_updated ON public.staff_conversations (organization_id, updated_at DESC);

CREATE TABLE IF NOT EXISTS public.staff_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES public.staff_conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.user_profiles(id),
    body TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_staff_messages_conversation ON public.staff_messages (conversation_id, created_at);

ALTER TABLE public.staff_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY select_staff_conversations ON public.staff_conversations
    FOR SELECT TO authenticated
    USING (
        organization_id IN (SELECT public.get_user_organizations())
        AND (
            participant_a = (SELECT auth.uid())
            OR participant_b = (SELECT auth.uid())
        )
    );

CREATE POLICY insert_staff_conversations ON public.staff_conversations
    FOR INSERT TO authenticated
    WITH CHECK (
        organization_id IN (SELECT public.get_user_organizations())
        AND (
            participant_a = (SELECT auth.uid())
            OR participant_b = (SELECT auth.uid())
        )
        AND participant_a < participant_b
    );

CREATE POLICY update_staff_conversations ON public.staff_conversations
    FOR UPDATE TO authenticated
    USING (
        organization_id IN (SELECT public.get_user_organizations())
        AND (
            participant_a = (SELECT auth.uid())
            OR participant_b = (SELECT auth.uid())
        )
    )
    WITH CHECK (
        organization_id IN (SELECT public.get_user_organizations())
        AND (
            participant_a = (SELECT auth.uid())
            OR participant_b = (SELECT auth.uid())
        )
    );

CREATE POLICY select_staff_messages ON public.staff_messages
    FOR SELECT TO authenticated
    USING (
        conversation_id IN (SELECT id FROM public.staff_conversations)
    );

CREATE POLICY insert_staff_messages ON public.staff_messages
    FOR INSERT TO authenticated
    WITH CHECK (
        sender_id = (SELECT auth.uid())
        AND conversation_id IN (SELECT id FROM public.staff_conversations)
    );

GRANT SELECT, INSERT, UPDATE ON public.staff_conversations TO authenticated;
GRANT SELECT, INSERT ON public.staff_messages TO authenticated;

-- Realtime for live DMs when publication exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.staff_messages;
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
