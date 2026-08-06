'use server';

import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import {
  assertFeature,
  assertOrganization,
  resolveServerAuthContext,
} from '@/lib/auth/context';

export type StaffChatCoworker = {
  id: string;
  name: string;
  role: string;
};

export type StaffConversationRow = {
  id: string;
  organization_id: string;
  participant_a: string;
  participant_b: string;
  updated_at: string;
  other_user_id: string;
  other_user_name: string;
  last_message?: string | null;
};

export type StaffMessageRow = {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  created_at: string;
};

function displayName(
  profile: { first_name?: string | null; last_name?: string | null } | null | undefined
): string {
  const name = [profile?.first_name, profile?.last_name].filter(Boolean).join(' ').trim();
  return name || 'Staff';
}

function orderedPair(a: string, b: string): [string, string] {
  return a < b ? [a, b] : [b, a];
}

async function assertStaffChat(
  ctx: NonNullable<Awaited<ReturnType<typeof resolveServerAuthContext>>>
) {
  assertOrganization(ctx);
  assertFeature(ctx, 'staff_chat');
}

export async function listChatCoworkersAction(): Promise<{
  success: boolean;
  error?: string;
  coworkers: StaffChatCoworker[];
}> {
  try {
    const ctx = await resolveServerAuthContext();
    if (!ctx) throw new Error('Unauthorized');
    await assertStaffChat(ctx);

    const supabase = await createClient();
    const { data: members, error } = await supabase
      .from('organization_members')
      .select('user_id, role')
      .eq('organization_id', ctx.organizationId!)
      .eq('is_active', true)
      .neq('user_id', ctx.userId);

    if (error) throw new Error(error.message);

    const ids = (members || []).map((m) => m.user_id);
    if (ids.length === 0) return { success: true, coworkers: [] };

    const { data: profiles } = await supabase
      .from('user_profiles')
      .select('id, first_name, last_name')
      .in('id', ids);

    const coworkers = (members || []).map((m) => {
      const profile = profiles?.find((p) => p.id === m.user_id);
      return {
        id: m.user_id,
        name: displayName(profile),
        role: m.role,
      };
    });

    return { success: true, coworkers };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed',
      coworkers: [],
    };
  }
}

export async function listStaffConversationsAction(): Promise<{
  success: boolean;
  error?: string;
  conversations: StaffConversationRow[];
}> {
  try {
    const ctx = await resolveServerAuthContext();
    if (!ctx) throw new Error('Unauthorized');
    await assertStaffChat(ctx);

    const supabase = await createClient();
    const { data, error } = await supabase
      .from('staff_conversations')
      .select('id, organization_id, participant_a, participant_b, updated_at')
      .eq('organization_id', ctx.organizationId!)
      .order('updated_at', { ascending: false });

    if (error) throw new Error(error.message);

    const rows = data || [];
    const otherIds = rows.map((r) =>
      r.participant_a === ctx.userId ? r.participant_b : r.participant_a
    );

    const nameById = new Map<string, string>();
    if (otherIds.length > 0) {
      const { data: profiles } = await supabase
        .from('user_profiles')
        .select('id, first_name, last_name')
        .in('id', otherIds);
      for (const p of profiles || []) {
        nameById.set(p.id, displayName(p));
      }
    }

    const conversations: StaffConversationRow[] = await Promise.all(
      rows.map(async (r) => {
        const otherId =
          r.participant_a === ctx.userId ? r.participant_b : r.participant_a;
        const { data: last } = await supabase
          .from('staff_messages')
          .select('body')
          .eq('conversation_id', r.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        return {
          id: r.id,
          organization_id: r.organization_id,
          participant_a: r.participant_a,
          participant_b: r.participant_b,
          updated_at: r.updated_at,
          other_user_id: otherId,
          other_user_name: nameById.get(otherId) || 'Staff',
          last_message: last?.body ?? null,
        };
      })
    );

    return { success: true, conversations };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed',
      conversations: [],
    };
  }
}

export async function getOrCreateConversationAction(otherUserId: string): Promise<{
  success: boolean;
  error?: string;
  conversationId?: string;
}> {
  try {
    const ctx = await resolveServerAuthContext();
    if (!ctx) throw new Error('Unauthorized');
    await assertStaffChat(ctx);

    if (otherUserId === ctx.userId) throw new Error('Cannot message yourself');

    const supabase = await createClient();
    const { data: member } = await supabase
      .from('organization_members')
      .select('user_id')
      .eq('organization_id', ctx.organizationId!)
      .eq('user_id', otherUserId)
      .eq('is_active', true)
      .maybeSingle();

    if (!member) throw new Error('User is not in your organization');

    const [participant_a, participant_b] = orderedPair(ctx.userId, otherUserId);

    const { data: existing } = await supabase
      .from('staff_conversations')
      .select('id')
      .eq('organization_id', ctx.organizationId!)
      .eq('participant_a', participant_a)
      .eq('participant_b', participant_b)
      .maybeSingle();

    if (existing) {
      return { success: true, conversationId: existing.id };
    }

    const { data: created, error } = await supabase
      .from('staff_conversations')
      .insert({
        organization_id: ctx.organizationId,
        participant_a,
        participant_b,
      })
      .select('id')
      .single();

    if (error) throw new Error(error.message);
    return { success: true, conversationId: created.id };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed',
    };
  }
}

export async function listStaffMessagesAction(conversationId: string): Promise<{
  success: boolean;
  error?: string;
  messages: StaffMessageRow[];
}> {
  try {
    const ctx = await resolveServerAuthContext();
    if (!ctx) throw new Error('Unauthorized');
    await assertStaffChat(ctx);

    const supabase = await createClient();
    const { data: convo } = await supabase
      .from('staff_conversations')
      .select('id')
      .eq('id', conversationId)
      .eq('organization_id', ctx.organizationId!)
      .maybeSingle();

    if (!convo) throw new Error('Conversation not found');

    const { data, error } = await supabase
      .from('staff_messages')
      .select('id, conversation_id, sender_id, body, created_at')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .limit(200);

    if (error) throw new Error(error.message);
    return { success: true, messages: (data || []) as StaffMessageRow[] };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed',
      messages: [],
    };
  }
}

const SendSchema = z.object({
  conversationId: z.string().uuid(),
  body: z.string().min(1).max(4000),
});

export async function sendStaffMessageAction(payload: unknown) {
  try {
    const ctx = await resolveServerAuthContext();
    if (!ctx) throw new Error('Unauthorized');
    await assertStaffChat(ctx);

    const parsed = SendSchema.parse(payload);
    const supabase = await createClient();

    const { data: convo } = await supabase
      .from('staff_conversations')
      .select('id')
      .eq('id', parsed.conversationId)
      .eq('organization_id', ctx.organizationId!)
      .maybeSingle();

    if (!convo) throw new Error('Conversation not found');

    const { data, error } = await supabase
      .from('staff_messages')
      .insert({
        conversation_id: parsed.conversationId,
        sender_id: ctx.userId,
        body: parsed.body.trim(),
      })
      .select('id, conversation_id, sender_id, body, created_at')
      .single();

    if (error) throw new Error(error.message);

    await supabase
      .from('staff_conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', parsed.conversationId);

    return { success: true, message: data as StaffMessageRow };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed',
    };
  }
}
