import type { Metadata } from 'next';
import PhoenixHomePage from '@/components/home/PhoenixHomePage';

const title = 'Phoenix OS — Clinic Operating System';
const description =
  'Phoenix OS is a secure clinic operating system. Starting with veterinary clinics — appointments, consultations, prescriptions, inventory, invoices, and audit-ready workflows — built to scale across dental, general, and specialty care.';

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    'clinic operating system',
    'veterinary clinic software',
    'clinic management platform',
    'multi-tenant clinic OS',
    'clinic invoicing and inventory',
    'Phoenix OS',
  ],
  openGraph: {
    title,
    description,
    type: 'website',
    siteName: 'Phoenix OS',
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
  },
  alternates: { canonical: '/' },
};

export default function HomePage() {
  return <PhoenixHomePage />;
}
