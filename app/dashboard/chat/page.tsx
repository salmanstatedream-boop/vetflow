import { redirect } from 'next/navigation';
import { MessageSquare } from 'lucide-react';
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
  description: 'Private 1:1 staff direct messages.',
};

export default async function ChatPage() {
  const ctx = await resolveServerAuthContext();
  if (!ctx) redirect('/login');

  const denied = guardRoute(ctx, '/dashboard/chat');
  if (denied) return denied;

  const [convos, coworkers] = await Promise.all([
    listStaffConversationsAction(),
    listChatCoworkersAction(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Messages"
        description="Private 1:1 staff messages. Only the two participants can read them."
        icon={MessageSquare}
      />
      <StaffChatClient
        initialConversations={convos.conversations}
        coworkers={coworkers.coworkers}
        currentUserId={ctx.userId}
      />
    </div>
  );
}
