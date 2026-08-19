'use server';

import { z } from 'zod';
import {
  assertOrganization,
  resolveServerAuthContext,
} from '@/lib/auth/context';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { notifyOwner } from '@/lib/services/owner-care';

export type OwnerInboxThread = {
  id: string;
  organizationId: string;
  customerId: string;
  customerName: string;
  lastMessageAt: string | null;
  lastMessage: string | null;
  unreadCount: number;
};

export type OwnerInboxMessage = {
  id: string;
  body: string;
  senderType: 'owner' | 'staff';
  createdAt: string;
};

export async function listOwnerInboxThreadsAction() {
  try {
    const ctx = await resolveServerAuthContext();
    if (!ctx) throw new Error('Unauthorized');
    assertOrganization(ctx);

    const supabase = await createClient();
    const { data: threads, error } = await supabase
      .from('owner_clinic_threads')
      .select(
        `
        id, organization_id, customer_id, last_message_at,
        customers ( first_name, last_name )
      `
      )
      .eq('organization_id', ctx.organizationId)
      .order('last_message_at', { ascending: false });

    if (error) throw new Error(error.message);

    const ids = (threads || []).map((t) => t.id as string);
    const unreadByThread = new Map<string, number>();
    const lastByThread = new Map<string, string>();

    if (ids.length) {
      const admin = await createAdminClient();
      const [{ data: unread }, { data: lastMsgs }] = await Promise.all([
        admin
          .from('owner_clinic_messages')
          .select('thread_id')
          .in('thread_id', ids)
          .eq('sender_type', 'owner')
          .is('read_at', null),
        admin
          .from('owner_clinic_messages')
          .select('thread_id, body, created_at')
          .in('thread_id', ids)
          .order('created_at', { ascending: false }),
      ]);
      for (const row of unread || []) {
        const tid = row.thread_id as string;
        unreadByThread.set(tid, (unreadByThread.get(tid) || 0) + 1);
      }
      for (const m of lastMsgs || []) {
        if (!lastByThread.has(m.thread_id as string)) {
          lastByThread.set(m.thread_id as string, m.body as string);
        }
      }
    }

    const list: OwnerInboxThread[] = (threads || []).map((t) => {
      const cust = t.customers as
        | { first_name: string; last_name: string }
        | { first_name: string; last_name: string }[]
        | null;
      const c = Array.isArray(cust) ? cust[0] : cust;
      return {
        id: t.id as string,
        organizationId: t.organization_id as string,
        customerId: t.customer_id as string,
        customerName: c ? `${c.first_name} ${c.last_name}`.trim() : 'Owner',
        lastMessageAt: (t.last_message_at as string) || null,
        lastMessage: lastByThread.get(t.id as string) || null,
        unreadCount: unreadByThread.get(t.id as string) || 0,
      };
    });

    return { success: true as const, threads: list };
  } catch (err: any) {
    return { success: false as const, error: err.message || 'Failed to load inbox', threads: [] as OwnerInboxThread[] };
  }
}

export async function listOwnerInboxMessagesAction(threadId: string) {
  try {
    const ctx = await resolveServerAuthContext();
    if (!ctx) throw new Error('Unauthorized');
    assertOrganization(ctx);

    const supabase = await createClient();
    const { data: thread } = await supabase
      .from('owner_clinic_threads')
      .select('id')
      .eq('id', threadId)
      .eq('organization_id', ctx.organizationId)
      .maybeSingle();
    if (!thread) throw new Error('Thread not found');

    const { data, error } = await supabase
      .from('owner_clinic_messages')
      .select('id, body, sender_type, created_at')
      .eq('thread_id', threadId)
      .order('created_at', { ascending: true })
      .limit(200);
    if (error) throw new Error(error.message);

    const admin = await createAdminClient();
    await admin
      .from('owner_clinic_messages')
      .update({ read_at: new Date().toISOString() })
      .eq('thread_id', threadId)
      .eq('sender_type', 'owner')
      .is('read_at', null);


    return {
      success: true as const,
      messages: (data || []).map((m) => ({
        id: m.id as string,
        body: m.body as string,
        senderType: m.sender_type as 'owner' | 'staff',
        createdAt: m.created_at as string,
      })),
    };
  } catch (err: any) {
    return {
      success: false as const,
      error: err.message || 'Failed to load messages',
      messages: [] as OwnerInboxMessage[],
    };
  }
}

const ReplySchema = z.object({
  threadId: z.string().uuid(),
  body: z.string().trim().min(1).max(4000),
});

export async function replyOwnerInboxAction(payload: unknown) {
  try {
    const ctx = await resolveServerAuthContext();
    if (!ctx) throw new Error('Unauthorized');
    assertOrganization(ctx);
    const parsed = ReplySchema.parse(payload);

    const supabase = await createClient();
    const { data: thread } = await supabase
      .from('owner_clinic_threads')
      .select(
        `
        id, user_id, organization_id,
        customers ( first_name, last_name )
      `
      )
      .eq('id', parsed.threadId)
      .eq('organization_id', ctx.organizationId)
      .maybeSingle();
    if (!thread) throw new Error('Thread not found');

    const now = new Date().toISOString();
    const { data: msg, error } = await supabase
      .from('owner_clinic_messages')
      .insert({
        thread_id: parsed.threadId,
        organization_id: ctx.organizationId,
        sender_type: 'staff',
        sender_user_id: ctx.userId,
        body: parsed.body,
        created_at: now,
      })
      .select('id, body, sender_type, created_at')
      .single();
    if (error) throw new Error(error.message);

    await supabase
      .from('owner_clinic_threads')
      .update({ last_message_at: now })
      .eq('id', parsed.threadId);

    const ownerUserId = thread.user_id as string | null;
    if (ownerUserId) {
      await notifyOwner({
        userId: ownerUserId,
        organizationId: ctx.organizationId,
        kind: 'owner_message',
        title: 'New message from clinic',
        body: parsed.body.slice(0, 120),
        data: { threadId: parsed.threadId },
      });
    }

    return {
      success: true as const,
      message: {
        id: msg.id as string,
        body: msg.body as string,
        senderType: msg.sender_type as 'owner' | 'staff',
        createdAt: msg.created_at as string,
      },
    };
  } catch (err: any) {
    return { success: false as const, error: err.message || 'Failed to send reply' };
  }
}
