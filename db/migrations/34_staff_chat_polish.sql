-- Staff chat polish: hide-for-me, edit/delete tombstones, voice notes

ALTER TABLE public.staff_conversations
    ADD COLUMN IF NOT EXISTS hidden_for_a BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS hidden_for_b BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE public.staff_messages
    ADD COLUMN IF NOT EXISTS message_type TEXT NOT NULL DEFAULT 'text',
    ADD COLUMN IF NOT EXISTS edited_at TIMESTAMP WITH TIME ZONE,
    ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE,
    ADD COLUMN IF NOT EXISTS audio_path TEXT,
    ADD COLUMN IF NOT EXISTS audio_duration_sec NUMERIC;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'staff_messages_message_type_check'
  ) THEN
    ALTER TABLE public.staff_messages
      ADD CONSTRAINT staff_messages_message_type_check
      CHECK (message_type IN ('text', 'voice', 'system'));
  END IF;
END $$;

-- Soft-deleted / voice messages may have empty body
ALTER TABLE public.staff_messages
    ALTER COLUMN body DROP NOT NULL;

ALTER TABLE public.staff_messages
    ALTER COLUMN body SET DEFAULT '';

UPDATE public.staff_messages
    SET body = COALESCE(body, '')
    WHERE body IS NULL;

-- Sender can update own messages (edit / soft-delete)
DROP POLICY IF EXISTS update_staff_messages ON public.staff_messages;
CREATE POLICY update_staff_messages ON public.staff_messages
    FOR UPDATE TO authenticated
    USING (
        sender_id = (SELECT auth.uid())
        AND conversation_id IN (SELECT id FROM public.staff_conversations)
    )
    WITH CHECK (
        sender_id = (SELECT auth.uid())
        AND conversation_id IN (SELECT id FROM public.staff_conversations)
    );

GRANT UPDATE ON public.staff_messages TO authenticated;

-- Private voice note bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'staff-chat-voice',
    'staff-chat-voice',
    FALSE,
    5242880,
    ARRAY['audio/webm', 'audio/ogg', 'audio/mp4', 'audio/mpeg', 'audio/wav']
)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "staff_chat_voice_select" ON storage.objects;
CREATE POLICY "staff_chat_voice_select" ON storage.objects
    FOR SELECT TO authenticated
    USING (
        bucket_id = 'staff-chat-voice'
        AND (split_part(name, '/', 1))::uuid IN (SELECT public.get_user_organizations())
    );

DROP POLICY IF EXISTS "staff_chat_voice_insert" ON storage.objects;
CREATE POLICY "staff_chat_voice_insert" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (
        bucket_id = 'staff-chat-voice'
        AND (split_part(name, '/', 1))::uuid IN (SELECT public.get_user_organizations())
        AND auth.uid() IN (
            SELECT user_id FROM public.organization_members
            WHERE is_active = TRUE
              AND role IN ('doctor', 'clinic_admin', 'receptionist')
        )
    );

DROP POLICY IF EXISTS "staff_chat_voice_delete" ON storage.objects;
CREATE POLICY "staff_chat_voice_delete" ON storage.objects
    FOR DELETE TO authenticated
    USING (
        bucket_id = 'staff-chat-voice'
        AND (split_part(name, '/', 1))::uuid IN (SELECT public.get_user_organizations())
        AND auth.uid()::text = split_part(name, '/', 3)
    );

-- Realtime for updates (edit/delete)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    BEGIN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.staff_messages;
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END;
  END IF;
END $$;
