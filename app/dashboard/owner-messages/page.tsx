import { redirect } from 'next/navigation';
import { MessagesSquare } from 'lucide-react';
import { resolveServerAuthContext } from '@/lib/auth/context';
import { guardRoute } from '@/lib/auth/page-guards';
import { listOwnerInboxThreadsAction } from '@/lib/services/owner-inbox-actions';
import PageHeader from '@/components/ui/premium/PageHeader';
import OwnerInboxClient from '@/components/chat/OwnerInboxClient';

export const metadata = {
  title: 'Owner messages',
  description: 'Chat with pet owners from Phoenix Care.',
};

export default async function OwnerMessagesPage() {
  const ctx = await resolveServerAuthContext();
  if (!ctx) redirect('/login');

  const denied = guardRoute(ctx, '/dashboard/owner-messages');
  if (denied) return denied;

  const res = await listOwnerInboxThreadsAction();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Owner messages"
        description="Reply to Phoenix Care customers. Staff messages appear in the owner app chat."
        icon={MessagesSquare}
      />
      {!res.success ? (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/10 text-destructive text-sm p-4">
          {res.error}
        </div>
      ) : (
        <OwnerInboxClient initialThreads={res.threads} />
      )}
    </div>
  );
}
