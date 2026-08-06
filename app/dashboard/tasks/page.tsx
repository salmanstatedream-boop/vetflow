import { redirect } from 'next/navigation';
import { ListTodo } from 'lucide-react';
import { resolveServerAuthContext } from '@/lib/auth/context';
import { guardRoute } from '@/lib/auth/page-guards';
import { hasCapability } from '@/lib/auth/capabilities';
import {
  listOrgStaffForTasksAction,
  listStaffTasksAction,
} from '@/lib/services/staff-task-actions';
import PageHeader from '@/components/ui/premium/PageHeader';
import StaffTasksClient from '@/components/tasks/StaffTasksClient';

export const metadata = {
  title: 'Tasks',
  description: 'Staff tasks and internal tickets.',
};

export default async function TasksPage() {
  const ctx = await resolveServerAuthContext();
  if (!ctx) redirect('/login');

  const denied = guardRoute(ctx, '/dashboard/tasks');
  if (denied) return denied;

  const canCreate = hasCapability(ctx.role, 'manage_staff');
  const [tasksRes, staffRes] = await Promise.all([
    listStaffTasksAction(),
    canCreate ? listOrgStaffForTasksAction() : Promise.resolve({ success: true as const, staff: [] }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tasks"
        description="Assign work, track status, and keep updates in one thread."
        icon={ListTodo}
      />
      <StaffTasksClient
        initialTasks={tasksRes.tasks}
        staff={staffRes.staff}
        currentUserId={ctx.userId}
        canCreate={canCreate}
      />
    </div>
  );
}
