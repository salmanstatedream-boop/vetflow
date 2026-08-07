-- One-time rebaseline so historical chat/tasks do not keep red dots lit forever.
-- Only activity after this timestamp will create unread notifications.

UPDATE public.staff_conversation_members
SET last_read_at = timezone('utc'::text, now())
WHERE last_read_at IS NULL
   OR last_read_at < timezone('utc'::text, now());

INSERT INTO public.staff_user_activity (user_id, tasks_seen_at, updated_at)
SELECT DISTINCT t.assignee_id, timezone('utc'::text, now()), timezone('utc'::text, now())
FROM public.staff_tasks t
WHERE t.assignee_id IS NOT NULL
ON CONFLICT (user_id) DO UPDATE
SET
  tasks_seen_at = timezone('utc'::text, now()),
  updated_at = timezone('utc'::text, now());
