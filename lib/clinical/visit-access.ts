import type { SupabaseClient } from '@supabase/supabase-js';
import { assertBranchAccess, type resolveServerAuthContext } from '@/lib/auth/context';

type AuthCtx = NonNullable<Awaited<ReturnType<typeof resolveServerAuthContext>>>;

export type ClinicalVisitRow = {
  id: string;
  status: string;
  branch_id: string;
  consult_paused_at?: string | null;
  consult_pause_accumulated_sec?: number | null;
};

/** Load a visit for draft/pause/resume; clinic admins may access any org visit in their branches. */
export async function assertClinicalVisitAccess(
  supabase: SupabaseClient,
  ctx: AuthCtx,
  visitId: string,
  options?: { requireStatus?: string }
): Promise<ClinicalVisitRow> {
  const isAdmin = ctx.role === 'clinic_admin';

  const selectFields = isAdmin
    ? 'id, status, branch_id, consult_paused_at, consult_pause_accumulated_sec, visit_assignments ( doctor_id )'
    : 'id, status, branch_id, consult_paused_at, consult_pause_accumulated_sec, visit_assignments!inner ( doctor_id )';

  let query = supabase
    .from('visits')
    .select(selectFields)
    .eq('id', visitId)
    .eq('organization_id', ctx.organizationId!);

  if (!isAdmin) {
    query = query.eq('visit_assignments.doctor_id', ctx.userId);
  }

  const { data: visit, error } = await query.single();

  if (error || !visit) {
    throw new Error(
      isAdmin ? 'Visit not found or access denied.' : 'Visit not found or you are not the assigned doctor.'
    );
  }

  assertBranchAccess(ctx, visit.branch_id as string);

  if (options?.requireStatus && visit.status !== options.requireStatus) {
    throw new Error(`Visit must be in ${options.requireStatus} status.`);
  }

  return visit as ClinicalVisitRow;
}
