'use server';

import { createClient } from '@/lib/supabase/server';
import {
  assertOrganization,
  resolveServerAuthContext,
} from '@/lib/auth/context';
import {
  buildMedicalActivityDetail,
  formatMedicalActionLabel,
  isDraftSaveActivity,
  MEDICAL_ACTIVITY_ACTIONS,
} from '@/lib/activity/format-medical-activity';

export async function getMedicalRecordActivityAction(branchId: string, limit = 15) {
  try {
    const ctx = await resolveServerAuthContext();
    if (!ctx) throw new Error('Unauthorized');
    assertOrganization(ctx);

    const supabase = await createClient();

    const { data: logs, error } = await supabase
      .from('audit_logs')
      .select('id, action, resource_type, created_at, actor_user_id, actor_role, after_data')
      .eq('organization_id', ctx.organizationId)
      .eq('branch_id', branchId)
      .in('action', [...MEDICAL_ACTIVITY_ACTIONS])
      .order('created_at', { ascending: false })
      .limit(limit * 2);

    if (error) throw new Error(error.message);

    const filtered = (logs || []).filter((log) => {
      const after = log.after_data as Record<string, unknown> | null;
      return !isDraftSaveActivity(after);
    });

    const actorIds = [
      ...new Set(filtered.map((l) => l.actor_user_id).filter(Boolean)),
    ] as string[];

    const actorMap = new Map<string, string>();
    if (actorIds.length > 0) {
      const { data: actors } = await supabase
        .from('user_profiles')
        .select('id, first_name, last_name')
        .in('id', actorIds);
      for (const a of actors || []) {
        actorMap.set(a.id, `${a.first_name} ${a.last_name}`.trim());
      }
    }

    const activities = filtered.slice(0, limit).map((log) => {
      const after = log.after_data as Record<string, unknown> | null;
      return {
        id: log.id,
        action: log.action,
        actorName: actorMap.get(log.actor_user_id) || 'Staff',
        actorRole: log.actor_role || 'staff',
        resourceType: log.resource_type,
        createdAt: log.created_at,
        summary: buildMedicalActivityDetail(after, log.resource_type),
        label: formatMedicalActionLabel(log.action),
        petName: typeof after?.patient_name === 'string' ? after.patient_name : undefined,
      };
    });

    return { success: true, activities };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to load activity',
      activities: [],
    };
  }
}
