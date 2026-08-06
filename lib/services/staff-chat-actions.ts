'use server';

import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import {
  assertCapability,
  assertFeature,
  assertOrganization,
  resolveServerAuthContext,
} from '@/lib/auth/context';

const STAFF_CHAT_VOICE_BUCKET = 'staff-chat-voice';

export type StaffChatCoworker = {
  id: string;
  name: string;
  role: string;
};

export type StaffMessageType = 'text' | 'voice' | 'system';
export type StaffConversationType = 'dm' | 'group';

export type StaffConversationRow = {
  id: string;
  organization_id: string;
  type: StaffConversationType;
  title: string | null;
  participant_a: string | null;
  participant_b: string | null;
  updated_at: string;
  other_user_id: string | null;
  other_user_name: string;
  member_count: number;
  last_message?: string | null;
};

export type StaffMessageRow = {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  created_at: string;
  message_type: StaffMessageType;
  edited_at: string | null;
  deleted_at: string | null;
  audio_path: string | null;
  audio_duration_sec: number | null;
  audio_url?: string | null;
};

const MESSAGE_SELECT =
  'id, conversation_id, sender_id, body, created_at, message_type, edited_at, deleted_at, audio_path, audio_duration_sec';

function displayName(
  profile: { first_name?: string | null; last_name?: string | null } | null | undefined
): string {
  const name = [profile?.first_name, profile?.last_name].filter(Boolean).join(' ').trim();
  return name || 'Staff';
}

function orderedPair(a: string, b: string): [string, string] {
  return a < b ? [a, b] : [b, a];
}

function previewForMessage(row: {
  body: string | null;
  message_type: string | null;
  deleted_at: string | null;
}): string {
  if (row.deleted_at) return 'Message deleted';
  if (row.message_type === 'voice') return 'Voice message';
  const body = (row.body || '').trim();
  return body || 'No messages yet';
}

function mapMessage(
  row: Record<string, unknown>,
  audioUrl?: string | null
): StaffMessageRow {
  return {
    id: row.id as string,
    conversation_id: row.conversation_id as string,
    sender_id: row.sender_id as string,
    body: (row.body as string) || '',
    created_at: row.created_at as string,
    message_type: (row.message_type as StaffMessageType) || 'text',
    edited_at: (row.edited_at as string | null) ?? null,
    deleted_at: (row.deleted_at as string | null) ?? null,
    audio_path: (row.audio_path as string | null) ?? null,
    audio_duration_sec:
      row.audio_duration_sec == null ? null : Number(row.audio_duration_sec),
    audio_url: audioUrl ?? null,
  };
}

async function assertStaffChat(
  ctx: NonNullable<Awaited<ReturnType<typeof resolveServerAuthContext>>>
) {
  assertOrganization(ctx);
  assertFeature(ctx, 'staff_chat');
}

async function assertConversationAccess(
  conversationId: string,
  organizationId: string,
  userId: string
) {
  const supabase = await createClient();
  const { data: membership, error: memberError } = await supabase
    .from('staff_conversation_members')
    .select('conversation_id, hidden')
    .eq('conversation_id', conversationId)
    .eq('user_id', userId)
    .maybeSingle();

  if (memberError) throw new Error(memberError.message);
  if (!membership) throw new Error('Conversation not found');

  const { data: convo, error } = await supabase
    .from('staff_conversations')
    .select(
      'id, organization_id, type, title, participant_a, participant_b, created_by'
    )
    .eq('id', conversationId)
    .eq('organization_id', organizationId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!convo) throw new Error('Conversation not found');
  return { ...convo, hidden: membership.hidden };
}

async function ensureDmMembers(
  conversationId: string,
  participantA: string,
  participantB: string
) {
  const supabase = await createClient();
  await supabase.from('staff_conversation_members').upsert(
    [
      { conversation_id: conversationId, user_id: participantA, hidden: false },
      { conversation_id: conversationId, user_id: participantB, hidden: false },
    ],
    { onConflict: 'conversation_id,user_id', ignoreDuplicates: true }
  );
}

async function signedAudioUrl(audioPath: string | null): Promise<string | null> {
  if (!audioPath) return null;
  const supabase = await createClient();
  const { data } = await supabase.storage
    .from(STAFF_CHAT_VOICE_BUCKET)
    .createSignedUrl(audioPath, 60 * 60);
  return data?.signedUrl ?? null;
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
    const { data: memberships, error: memError } = await supabase
      .from('staff_conversation_members')
      .select('conversation_id, hidden')
      .eq('user_id', ctx.userId)
      .eq('hidden', false);

    if (memError) throw new Error(memError.message);

    const convoIds = (memberships || []).map((m) => m.conversation_id);
    if (convoIds.length === 0) return { success: true, conversations: [] };

    const { data, error } = await supabase
      .from('staff_conversations')
      .select(
        'id, organization_id, type, title, participant_a, participant_b, updated_at'
      )
      .eq('organization_id', ctx.organizationId!)
      .in('id', convoIds)
      .order('updated_at', { ascending: false });

    if (error) throw new Error(error.message);

    const rows = data || [];
    const allMemberIds = rows.map((r) => r.id);

    const { data: allMembers } = await supabase
      .from('staff_conversation_members')
      .select('conversation_id, user_id')
      .in('conversation_id', allMemberIds);

    const membersByConvo = new Map<string, string[]>();
    for (const m of allMembers || []) {
      const list = membersByConvo.get(m.conversation_id) || [];
      list.push(m.user_id);
      membersByConvo.set(m.conversation_id, list);
    }

    const peerIds = new Set<string>();
    for (const r of rows) {
      if (r.type === 'dm') {
        const other =
          r.participant_a === ctx.userId ? r.participant_b : r.participant_a;
        if (other) peerIds.add(other);
      }
    }

    const nameById = new Map<string, string>();
    if (peerIds.size > 0) {
      const { data: profiles } = await supabase
        .from('user_profiles')
        .select('id, first_name, last_name')
        .in('id', [...peerIds]);
      for (const p of profiles || []) {
        nameById.set(p.id, displayName(p));
      }
    }

    const lastByConvo = new Map<
      string,
      { body: string | null; message_type: string | null; deleted_at: string | null }
    >();

    if (allMemberIds.length > 0) {
      const { data: recentMessages } = await supabase
        .from('staff_messages')
        .select('conversation_id, body, message_type, deleted_at, created_at')
        .in('conversation_id', allMemberIds)
        .order('created_at', { ascending: false })
        .limit(Math.min(allMemberIds.length * 3, 150));

      for (const msg of recentMessages || []) {
        if (!lastByConvo.has(msg.conversation_id)) {
          lastByConvo.set(msg.conversation_id, {
            body: msg.body,
            message_type: msg.message_type,
            deleted_at: msg.deleted_at,
          });
        }
      }
    }

    const conversations: StaffConversationRow[] = rows.map((r) => {
      const type = (r.type as StaffConversationType) || 'dm';
      const memberIds = membersByConvo.get(r.id) || [];
      const last = lastByConvo.get(r.id) ?? null;

      if (type === 'group') {
        return {
          id: r.id,
          organization_id: r.organization_id,
          type,
          title: r.title,
          participant_a: r.participant_a,
          participant_b: r.participant_b,
          updated_at: r.updated_at,
          other_user_id: null,
          other_user_name: r.title?.trim() || 'Group',
          member_count: memberIds.length,
          last_message: last ? previewForMessage(last) : null,
        };
      }

      const otherId =
        r.participant_a === ctx.userId ? r.participant_b : r.participant_a;
      return {
        id: r.id,
        organization_id: r.organization_id,
        type,
        title: null,
        participant_a: r.participant_a,
        participant_b: r.participant_b,
        updated_at: r.updated_at,
        other_user_id: otherId,
        other_user_name: otherId ? nameById.get(otherId) || 'Staff' : 'Staff',
        member_count: memberIds.length || 2,
        last_message: last ? previewForMessage(last) : null,
      };
    });

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
      .select('id, participant_a, participant_b')
      .eq('organization_id', ctx.organizationId!)
      .eq('type', 'dm')
      .eq('participant_a', participant_a)
      .eq('participant_b', participant_b)
      .maybeSingle();

    if (existing) {
      await ensureDmMembers(existing.id, participant_a, participant_b);
      await supabase
        .from('staff_conversation_members')
        .update({ hidden: false })
        .eq('conversation_id', existing.id)
        .eq('user_id', ctx.userId);
      return { success: true, conversationId: existing.id };
    }

    const { data: created, error } = await supabase
      .from('staff_conversations')
      .insert({
        organization_id: ctx.organizationId,
        type: 'dm',
        participant_a,
        participant_b,
        created_by: ctx.userId,
      })
      .select('id')
      .single();

    if (error) throw new Error(error.message);

    const { error: memberInsertError } = await supabase
      .from('staff_conversation_members')
      .insert([
        { conversation_id: created.id, user_id: participant_a, hidden: false },
        { conversation_id: created.id, user_id: participant_b, hidden: false },
      ]);

    if (memberInsertError) throw new Error(memberInsertError.message);

    return { success: true, conversationId: created.id };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed',
    };
  }
}

const CreateGroupSchema = z.object({
  title: z.string().trim().min(1).max(80),
  memberIds: z.array(z.string().uuid()).min(1).max(50),
});

export async function createStaffGroupAction(payload: unknown): Promise<{
  success: boolean;
  error?: string;
  conversationId?: string;
}> {
  try {
    const ctx = await resolveServerAuthContext();
    if (!ctx) throw new Error('Unauthorized');
    await assertStaffChat(ctx);
    assertCapability(ctx, 'manage_staff');

    const parsed = CreateGroupSchema.parse(payload);
    const uniqueMemberIds = [...new Set(parsed.memberIds)].filter(
      (id) => id !== ctx.userId
    );
    if (uniqueMemberIds.length < 1) {
      throw new Error('Add at least one coworker to the group');
    }

    const supabase = await createClient();
    const { data: orgMembers, error: orgError } = await supabase
      .from('organization_members')
      .select('user_id')
      .eq('organization_id', ctx.organizationId!)
      .eq('is_active', true)
      .in('user_id', uniqueMemberIds);

    if (orgError) throw new Error(orgError.message);
    if ((orgMembers || []).length !== uniqueMemberIds.length) {
      throw new Error('All members must be active staff in your organization');
    }

    const { data: created, error } = await supabase
      .from('staff_conversations')
      .insert({
        organization_id: ctx.organizationId,
        type: 'group',
        title: parsed.title.trim(),
        created_by: ctx.userId,
        participant_a: null,
        participant_b: null,
      })
      .select('id')
      .single();

    if (error) throw new Error(error.message);

    const memberRows = [ctx.userId, ...uniqueMemberIds].map((user_id) => ({
      conversation_id: created.id,
      user_id,
      hidden: false,
    }));

    const { error: memberError } = await supabase
      .from('staff_conversation_members')
      .insert(memberRows);

    if (memberError) throw new Error(memberError.message);

    return { success: true, conversationId: created.id };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed',
    };
  }
}

const AddMembersSchema = z.object({
  conversationId: z.string().uuid(),
  memberIds: z.array(z.string().uuid()).min(1).max(50),
});

export async function addStaffGroupMembersAction(payload: unknown): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const ctx = await resolveServerAuthContext();
    if (!ctx) throw new Error('Unauthorized');
    await assertStaffChat(ctx);
    assertCapability(ctx, 'manage_staff');

    const parsed = AddMembersSchema.parse(payload);
    const convo = await assertConversationAccess(
      parsed.conversationId,
      ctx.organizationId!,
      ctx.userId
    );
    if (convo.type !== 'group') throw new Error('Not a group conversation');

    const uniqueIds = [...new Set(parsed.memberIds)].filter(
      (id) => id !== ctx.userId
    );
    if (uniqueIds.length === 0) return { success: true };

    const supabase = await createClient();
    const { data: orgMembers, error: orgError } = await supabase
      .from('organization_members')
      .select('user_id')
      .eq('organization_id', ctx.organizationId!)
      .eq('is_active', true)
      .in('user_id', uniqueIds);

    if (orgError) throw new Error(orgError.message);
    if ((orgMembers || []).length !== uniqueIds.length) {
      throw new Error('All members must be active staff in your organization');
    }

    const { error } = await supabase.from('staff_conversation_members').upsert(
      uniqueIds.map((user_id) => ({
        conversation_id: parsed.conversationId,
        user_id,
        hidden: false,
      })),
      { onConflict: 'conversation_id,user_id', ignoreDuplicates: true }
    );

    if (error) throw new Error(error.message);
    return { success: true };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed',
    };
  }
}

export async function hideStaffConversationAction(conversationId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const ctx = await resolveServerAuthContext();
    if (!ctx) throw new Error('Unauthorized');
    await assertStaffChat(ctx);
    await assertConversationAccess(conversationId, ctx.organizationId!, ctx.userId);

    const supabase = await createClient();
    const { error } = await supabase
      .from('staff_conversation_members')
      .update({ hidden: true })
      .eq('conversation_id', conversationId)
      .eq('user_id', ctx.userId);

    if (error) throw new Error(error.message);
    return { success: true };
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
    await assertConversationAccess(conversationId, ctx.organizationId!, ctx.userId);

    const supabase = await createClient();
    const { data, error } = await supabase
      .from('staff_messages')
      .select(MESSAGE_SELECT)
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .limit(200);

    if (error) throw new Error(error.message);

    const messages = (data || []).map((row) =>
      mapMessage(row as Record<string, unknown>, null)
    );

    return { success: true, messages };
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
    await assertConversationAccess(
      parsed.conversationId,
      ctx.organizationId!,
      ctx.userId
    );

    const supabase = await createClient();
    const { data, error } = await supabase
      .from('staff_messages')
      .insert({
        conversation_id: parsed.conversationId,
        sender_id: ctx.userId,
        body: parsed.body.trim(),
        message_type: 'text',
      })
      .select(MESSAGE_SELECT)
      .single();

    if (error) throw new Error(error.message);

    await supabase
      .from('staff_conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', parsed.conversationId);

    // Unhide for sender if previously hidden
    await supabase
      .from('staff_conversation_members')
      .update({ hidden: false })
      .eq('conversation_id', parsed.conversationId)
      .eq('user_id', ctx.userId);

    return { success: true, message: mapMessage(data as Record<string, unknown>) };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed',
    };
  }
}

const EditSchema = z.object({
  messageId: z.string().uuid(),
  body: z.string().min(1).max(4000),
});

export async function editStaffMessageAction(payload: unknown) {
  try {
    const ctx = await resolveServerAuthContext();
    if (!ctx) throw new Error('Unauthorized');
    await assertStaffChat(ctx);

    const parsed = EditSchema.parse(payload);
    const supabase = await createClient();

    const { data: existing, error: loadError } = await supabase
      .from('staff_messages')
      .select(MESSAGE_SELECT)
      .eq('id', parsed.messageId)
      .maybeSingle();

    if (loadError) throw new Error(loadError.message);
    if (!existing) throw new Error('Message not found');
    if (existing.sender_id !== ctx.userId) throw new Error('Forbidden');
    if (existing.deleted_at) throw new Error('Cannot edit a deleted message');
    if (existing.message_type !== 'text') throw new Error('Only text messages can be edited');

    await assertConversationAccess(
      existing.conversation_id,
      ctx.organizationId!,
      ctx.userId
    );

    const { data, error } = await supabase
      .from('staff_messages')
      .update({
        body: parsed.body.trim(),
        edited_at: new Date().toISOString(),
      })
      .eq('id', parsed.messageId)
      .eq('sender_id', ctx.userId)
      .select(MESSAGE_SELECT)
      .single();

    if (error) throw new Error(error.message);
    return { success: true, message: mapMessage(data as Record<string, unknown>) };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed',
    };
  }
}

export async function deleteStaffMessageAction(messageId: string) {
  try {
    const ctx = await resolveServerAuthContext();
    if (!ctx) throw new Error('Unauthorized');
    await assertStaffChat(ctx);

    const supabase = await createClient();
    const { data: existing, error: loadError } = await supabase
      .from('staff_messages')
      .select(MESSAGE_SELECT)
      .eq('id', messageId)
      .maybeSingle();

    if (loadError) throw new Error(loadError.message);
    if (!existing) throw new Error('Message not found');
    if (existing.sender_id !== ctx.userId) throw new Error('Forbidden');
    if (existing.deleted_at) {
      return { success: true, message: mapMessage(existing as Record<string, unknown>) };
    }

    await assertConversationAccess(
      existing.conversation_id,
      ctx.organizationId!,
      ctx.userId
    );

    if (existing.audio_path) {
      await supabase.storage
        .from(STAFF_CHAT_VOICE_BUCKET)
        .remove([existing.audio_path]);
    }

    const { data, error } = await supabase
      .from('staff_messages')
      .update({
        body: '',
        deleted_at: new Date().toISOString(),
        audio_path: null,
        audio_duration_sec: null,
      })
      .eq('id', messageId)
      .eq('sender_id', ctx.userId)
      .select(MESSAGE_SELECT)
      .single();

    if (error) throw new Error(error.message);

    await supabase
      .from('staff_conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', existing.conversation_id);

    return { success: true, message: mapMessage(data as Record<string, unknown>) };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed',
    };
  }
}

const VoiceMetaSchema = z.object({
  conversationId: z.string().uuid(),
  durationSec: z.number().min(0.5).max(120),
  mimeType: z.string().min(1).max(100),
});

export async function sendStaffVoiceMessageAction(formData: FormData) {
  try {
    const ctx = await resolveServerAuthContext();
    if (!ctx) throw new Error('Unauthorized');
    await assertStaffChat(ctx);

    const meta = VoiceMetaSchema.parse({
      conversationId: formData.get('conversationId'),
      durationSec: Number(formData.get('durationSec')),
      mimeType: String(formData.get('mimeType') || 'audio/webm'),
    });

    const file = formData.get('audio');
    if (!(file instanceof File)) throw new Error('Audio file required');
    if (file.size > 5 * 1024 * 1024) throw new Error('Voice note must be under 5MB');

    await assertConversationAccess(
      meta.conversationId,
      ctx.organizationId!,
      ctx.userId
    );

    const supabase = await createClient();
    const messageId = crypto.randomUUID();
    const ext = meta.mimeType.includes('ogg')
      ? 'ogg'
      : meta.mimeType.includes('mp4')
        ? 'm4a'
        : meta.mimeType.includes('mpeg')
          ? 'mp3'
          : 'webm';
    const audioPath = `${ctx.organizationId}/${meta.conversationId}/${ctx.userId}/${messageId}.${ext}`;

    const buffer = await file.arrayBuffer();
    const { error: uploadError } = await supabase.storage
      .from(STAFF_CHAT_VOICE_BUCKET)
      .upload(audioPath, buffer, {
        contentType: meta.mimeType,
        upsert: false,
      });

    if (uploadError) throw new Error(uploadError.message);

    const { data, error } = await supabase
      .from('staff_messages')
      .insert({
        id: messageId,
        conversation_id: meta.conversationId,
        sender_id: ctx.userId,
        body: '',
        message_type: 'voice',
        audio_path: audioPath,
        audio_duration_sec: meta.durationSec,
      })
      .select(MESSAGE_SELECT)
      .single();

    if (error) {
      await supabase.storage.from(STAFF_CHAT_VOICE_BUCKET).remove([audioPath]);
      throw new Error(error.message);
    }

    await supabase
      .from('staff_conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', meta.conversationId);

    const audioUrl = await signedAudioUrl(audioPath);
    return {
      success: true,
      message: mapMessage(data as Record<string, unknown>, audioUrl),
    };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed',
    };
  }
}

export async function getStaffVoiceSignedUrlAction(messageId: string) {
  try {
    const ctx = await resolveServerAuthContext();
    if (!ctx) throw new Error('Unauthorized');
    await assertStaffChat(ctx);

    const supabase = await createClient();
    const { data: existing, error } = await supabase
      .from('staff_messages')
      .select('id, conversation_id, audio_path, deleted_at, message_type')
      .eq('id', messageId)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!existing || existing.message_type !== 'voice' || existing.deleted_at) {
      throw new Error('Voice note not found');
    }

    await assertConversationAccess(
      existing.conversation_id,
      ctx.organizationId!,
      ctx.userId
    );
    const url = await signedAudioUrl(existing.audio_path);
    if (!url) throw new Error('Failed to sign audio URL');
    return { success: true, url };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed',
      url: null as string | null,
    };
  }
}
