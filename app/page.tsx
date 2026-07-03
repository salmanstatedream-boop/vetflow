import type { Metadata } from 'next';
import PhoenixHomePage from '@/components/home/PhoenixHomePage';

const title = 'Phoenix OS — Clinic Operating System';
const description =
  'Phoenix OS is the clinic operating system built for veterinary practices — live today, with dental, general, and specialty care on the roadmap.';

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
