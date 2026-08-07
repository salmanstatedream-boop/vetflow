'use server';

import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import {
  assertCapability,
  assertFeature,
  assertOrganization,
  resolveServerAuthContext,
} from '@/lib/auth/context';
import { hasCapability } from '@/lib/auth/capabilities';

export type StaffTaskStatus = 'open' | 'in_progress' | 'done';

export type StaffTaskRow = {
  id: string;
  title: string;
  body: string | null;
  status: StaffTaskStatus;
  created_by: string;
  assignee_id: string;
  branch_id: string | null;
  created_at: string;
  updated_at: string;
  assignee_name?: string;
  creator_name?: string;
};

export type StaffTaskReplyRow = {
  id: string;
  task_id: string;
  author_id: string;
  body: string;
  created_at: string;
  author_name?: string;
};

export type StaffOption = {
  id: string;
  name: string;
  role: string;
};

function displayName(
  profile: { first_name?: string | null; last_name?: string | null } | null | undefined
): string {
  const name = [profile?.first_name, profile?.last_name].filter(Boolean).join(' ').trim();
  return name || 'Staff';
}

async function assertStaffTasks(ctx: NonNullable<Awaited<ReturnType<typeof resolveServerAuthContext>>>) {
  assertOrganization(ctx);
  assertFeature(ctx, 'staff_tasks');
}

export async function listOrgStaffForTasksAction(): Promise<{
  success: boolean;
  error?: string;
  staff: StaffOption[];
}> {
  try {
    const ctx = await resolveServerAuthContext();
    if (!ctx) throw new Error('Unauthorized');
    await assertStaffTasks(ctx);

    const supabase = await createClient();
    const { data: members, error } = await supabase
      .from('organization_members')
      .select('user_id, role')
      .eq('organization_id', ctx.organizationId!)
      .eq('is_active', true);

    if (error) throw new Error(error.message);

    const ids = (members || []).map((m) => m.user_id);
    if (ids.length === 0) return { success: true, staff: [] };

    const { data: profiles } = await supabase
      .from('user_profiles')
      .select('id, first_name, last_name')
      .in('id', ids);

    const staff = (members || []).map((m) => {
      const profile = profiles?.find((p) => p.id === m.user_id);
      return {
        id: m.user_id,
        name: displayName(profile),
        role: m.role,
      };
    });

    return { success: true, staff };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed',
      staff: [],
    };
  }
}

export async function listStaffTasksAction(opts?: {
  assignedToMe?: boolean;
  markSeen?: boolean;
}): Promise<{ success: boolean; error?: string; tasks: StaffTaskRow[] }> {
  try {
    const ctx = await resolveServerAuthContext();
    if (!ctx) throw new Error('Unauthorized');
    await assertStaffTasks(ctx);

    const supabase = await createClient();
    let query = supabase
      .from('staff_tasks')
      .select(
        'id, title, body, status, created_by, assignee_id, branch_id, created_at, updated_at'
      )
      .eq('organization_id', ctx.organizationId!)
      .order('updated_at', { ascending: false });

    if (opts?.assignedToMe) {
      query = query.eq('assignee_id', ctx.userId);
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);

    const tasks = (data || []) as StaffTaskRow[];
    const userIds = [...new Set(tasks.flatMap((t) => [t.assignee_id, t.created_by]))];
    if (userIds.length > 0) {
      const { data: profiles } = await supabase
        .from('user_profiles')
        .select('id, first_name, last_name')
        .in('id', userIds);
      const nameById = new Map<string, string>(
      (profiles || []).map((p) => [p.id as string, displayName(p)])
    );
      for (const task of tasks) {
        task.assignee_name = nameById.get(task.assignee_id) ?? 'Staff';
        task.creator_name = nameById.get(task.created_by) ?? 'Staff';
      }
    }

    if (opts?.markSeen) {
      const now = new Date().toISOString();
      void supabase.from('staff_user_activity').upsert(
        {
          user_id: ctx.userId,
          tasks_seen_at: now,
          updated_at: now,
        },
        { onConflict: 'user_id' }
      );
    }

    return { success: true, tasks };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed',
      tasks: [],
    };
  }
}

export async function getStaffTaskAction(
  taskId: string,
  opts?: { markRead?: boolean }
): Promise<{
  success: boolean;
  error?: string;
  task: StaffTaskRow | null;
  replies: StaffTaskReplyRow[];
}> {
  try {
    const ctx = await resolveServerAuthContext();
    if (!ctx) throw new Error('Unauthorized');
    await assertStaffTasks(ctx);

    const supabase = await createClient();
    const [taskRes, repliesRes] = await Promise.all([
      supabase
        .from('staff_tasks')
        .select(
          'id, title, body, status, created_by, assignee_id, branch_id, created_at, updated_at'
        )
        .eq('id', taskId)
        .eq('organization_id', ctx.organizationId!)
        .maybeSingle(),
      supabase
        .from('staff_task_replies')
        .select('id, task_id, author_id, body, created_at')
        .eq('task_id', taskId)
        .order('created_at', { ascending: true }),
    ]);

    if (taskRes.error) throw new Error(taskRes.error.message);
    if (!taskRes.data) throw new Error('Task not found');
    if (repliesRes.error) throw new Error(repliesRes.error.message);

    const task = taskRes.data;
    const replies = repliesRes.data;

    const authorIds = [
      ...new Set([
        task.assignee_id,
        task.created_by,
        ...(replies || []).map((r) => r.author_id),
      ]),
    ];
    const { data: profiles } = await supabase
      .from('user_profiles')
      .select('id, first_name, last_name')
      .in('id', authorIds);
    const nameById = new Map<string, string>(
      (profiles || []).map((p) => [p.id as string, displayName(p)])
    );

    const taskRow = task as StaffTaskRow;
    taskRow.assignee_name = nameById.get(task.assignee_id) ?? 'Staff';
    taskRow.creator_name = nameById.get(task.created_by) ?? 'Staff';

    const replyRows: StaffTaskReplyRow[] = ((replies || []) as StaffTaskReplyRow[]).map((r) => ({
      ...r,
      author_name: nameById.get(r.author_id) ?? 'Staff',
    }));

    if (opts?.markRead) {
      const now = new Date().toISOString();
      void supabase.from('staff_task_reads').upsert(
        {
          user_id: ctx.userId,
          task_id: taskId,
          last_read_at: now,
        },
        { onConflict: 'user_id,task_id' }
      );
    }

    return { success: true, task: taskRow, replies: replyRows };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed',
      task: null,
      replies: [],
    };
  }
}

const CreateTaskSchema = z.object({
  title: z.string().min(1).max(255),
  body: z.string().max(5000).optional().or(z.literal('')),
  assigneeId: z.string().uuid(),
});

export async function createStaffTaskAction(payload: unknown) {
  try {
    const ctx = await resolveServerAuthContext();
    if (!ctx) throw new Error('Unauthorized');
    await assertStaffTasks(ctx);
    assertCapability(ctx, 'manage_staff');

    const parsed = CreateTaskSchema.parse(payload);
    const supabase = await createClient();

    const { data: member } = await supabase
      .from('organization_members')
      .select('user_id')
      .eq('organization_id', ctx.organizationId!)
      .eq('user_id', parsed.assigneeId)
      .eq('is_active', true)
      .maybeSingle();

    if (!member) throw new Error('Assignee must be an active org member');

    const { data, error } = await supabase
      .from('staff_tasks')
      .insert({
        organization_id: ctx.organizationId,
        branch_id: ctx.activeBranchId,
        title: parsed.title.trim(),
        body: parsed.body?.trim() || null,
        assignee_id: parsed.assigneeId,
        created_by: ctx.userId,
        status: 'open',
      })
      .select(
        'id, title, body, status, created_by, assignee_id, branch_id, created_at, updated_at'
      )
      .single();

    if (error) throw new Error(error.message);
    return { success: true, task: data as StaffTaskRow };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed',
    };
  }
}

const UpdateStatusSchema = z.object({
  taskId: z.string().uuid(),
  status: z.enum(['open', 'in_progress', 'done']),
});

export async function updateStaffTaskStatusAction(payload: unknown) {
  try {
    const ctx = await resolveServerAuthContext();
    if (!ctx) throw new Error('Unauthorized');
    await assertStaffTasks(ctx);

    const parsed = UpdateStatusSchema.parse(payload);
    const supabase = await createClient();

    const { data: existing, error: loadError } = await supabase
      .from('staff_tasks')
      .select('id, assignee_id, created_by')
      .eq('id', parsed.taskId)
      .eq('organization_id', ctx.organizationId!)
      .maybeSingle();

    if (loadError) throw new Error(loadError.message);
    if (!existing) throw new Error('Task not found');

    const canManage =
      existing.assignee_id === ctx.userId ||
      existing.created_by === ctx.userId ||
      hasCapability(ctx.role, 'manage_staff');
    if (!canManage) throw new Error('Forbidden');

    const { error } = await supabase
      .from('staff_tasks')
      .update({ status: parsed.status })
      .eq('id', parsed.taskId)
      .eq('organization_id', ctx.organizationId!);

    if (error) throw new Error(error.message);
    return { success: true };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed',
    };
  }
}

const ReplySchema = z.object({
  taskId: z.string().uuid(),
  body: z.string().min(1).max(5000),
});

export async function addStaffTaskReplyAction(payload: unknown) {
  try {
    const ctx = await resolveServerAuthContext();
    if (!ctx) throw new Error('Unauthorized');
    await assertStaffTasks(ctx);

    const parsed = ReplySchema.parse(payload);
    const supabase = await createClient();

    const { data: task } = await supabase
      .from('staff_tasks')
      .select('id')
      .eq('id', parsed.taskId)
      .eq('organization_id', ctx.organizationId!)
      .maybeSingle();

    if (!task) throw new Error('Task not found');

    const { data, error } = await supabase
      .from('staff_task_replies')
      .insert({
        task_id: parsed.taskId,
        author_id: ctx.userId,
        body: parsed.body.trim(),
      })
      .select('id, task_id, author_id, body, created_at')
      .single();

    if (error) throw new Error(error.message);

    void supabase
      .from('staff_tasks')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', parsed.taskId);

    return { success: true, reply: data as StaffTaskReplyRow };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed',
    };
  }
}
