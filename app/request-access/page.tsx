import Link from 'next/link';
import RequestAccessLayout from '@/components/request-access/RequestAccessLayout';
import RequestAccessForm from '@/components/request-access/RequestAccessForm';

export default function RequestAccessPage() {
  return (
    <RequestAccessLayout
      title="Request"
      titleAccent="access"
      footer={
        <>
          Already have an account?{' '}
          <Link href="/login" className="text-primary font-semibold hover:underline">
            Sign In
          </Link>
        </>
      }
    >
      <RequestAccessForm />
    </RequestAccessLayout>
  );
}
