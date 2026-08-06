import { redirect } from 'next/navigation';
import { MessageSquare } from 'lucide-react';
import { hasCapability } from '@/lib/auth/capabilities';
import { resolveServerAuthContext } from '@/lib/auth/context';
import { guardRoute } from '@/lib/auth/page-guards';
import {
  listChatCoworkersAction,
  listStaffConversationsAction,
} from '@/lib/services/staff-chat-actions';
import PageHeader from '@/components/ui/premium/PageHeader';
import StaffChatClient from '@/components/chat/StaffChatClient';

export const metadata = {
  title: 'Messages',
  description: 'Staff direct messages and group chat.',
};

export default async function ChatPage({
  searchParams,
}: {
  searchParams: Promise<{ c?: string }>;
}) {
  const ctx = await resolveServerAuthContext();
  if (!ctx) redirect('/login');

  const denied = guardRoute(ctx, '/dashboard/chat');
  if (denied) return denied;

  const params = await searchParams;
  const requestedId =
    typeof params.c === 'string' && params.c.length > 0 ? params.c : null;

  const [convos, coworkers] = await Promise.all([
    listStaffConversationsAction(),
    listChatCoworkersAction(),
  ]);

  const canCreateGroup =
    hasCapability(ctx.role, 'manage_staff') || ctx.role === 'clinic_admin';

  const initialActiveId =
    requestedId &&
    convos.conversations.some((c) => c.id === requestedId)
      ? requestedId
      : undefined;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Messages"
        description="Direct messages and clinic group chats for your team."
        icon={MessageSquare}
      />
      <StaffChatClient
        initialConversations={convos.conversations}
        coworkers={coworkers.coworkers}
        currentUserId={ctx.userId}
        canCreateGroup={canCreateGroup}
        initialActiveId={initialActiveId}
      />
    </div>
  );
}
