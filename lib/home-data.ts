import type { LucideIcon } from 'lucide-react';
import {
  Activity,
  Building2,
  CalendarCheck,
  ClipboardList,
  FileText,
  FlaskConical,
  LayoutDashboard,
  Package,
  Pill,
  Receipt,
  Shield,
  Stethoscope,
  Users,
} from 'lucide-react';

export const NAV_LINKS = [
  { label: 'Product', href: '#product' },
  { label: 'Workflows', href: '#workflows' },
  { label: 'Clinic Types', href: '#clinic-types' },
  { label: 'Security', href: '#security' },
  { label: 'Pricing', href: '#pricing' },
] as const;

export const HERO = {
  eyebrow: 'PHOENIX OS',
  headline: ['One operating system.', 'Every clinic workflow.'],
  subheadline:
    'Phoenix OS connects appointments, walk-ins, consultations, inventory, invoices, documents, and audit-ready workflows inside one intelligent clinic workspace.',
  microcopy:
    'Starting with veterinary clinics. Built to scale across dental, general, and specialty care.',
} as const;

export const OS_DEMO = {
  heading: 'The clinic OS that moves with your team.',
  subheadline:
    'Every front-desk action, doctor workflow, invoice, record, and inventory update stays connected in one real-time system.',
  bullets: [
    'Real-time queue and consultation sync',
    'Connected records, inventory, and billing',
    'Audit-ready actions across every step',
  ],
  steps: [
  { id: 'appointment', label: 'Appointment created', detail: 'Walk-in added to live queue' },
  { id: 'record', label: 'Patient record opened', detail: 'History and vitals in one view' },
  { id: 'consultation', label: 'Consultation started', detail: 'SOAP notes and diagnosis workspace' },
  { id: 'prescription', label: 'Prescription added', detail: 'Treatment plan linked to inventory' },
  { id: 'inventory', label: 'Inventory updated', detail: 'Stock movement recorded automatically' },
  { id: 'invoice', label: 'Invoice generated', detail: 'Branded PDF ready for payment' },
  ],
} as const;

export const WORKFLOW_STEPS = [
  { id: 'arrival', label: 'Arrival', description: 'Front desk intake' },
  { id: 'appointment', label: 'Appointment / Walk-in', description: 'Queue and scheduling' },
  { id: 'consultation', label: 'Consultation', description: 'Doctor workspace' },
  { id: 'prescription', label: 'Prescription / Labs', description: 'Treatment and orders' },
  { id: 'inventory', label: 'Inventory Update', description: 'Stock and supplies' },
  { id: 'invoice', label: 'Invoice', description: 'Billing and payments' },
  { id: 'records', label: 'Secure Records', description: 'Audit-ready archive' },
] as const;

export type FeatureItem = {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
};

export const FEATURES: FeatureItem[] = [
  {
    id: 'queue',
    title: 'Live Clinic Queue',
    description:
      'Track walk-ins, appointments, waiting patients, active consultations, and completed visits from one real-time view.',
    icon: Activity,
  },
  {
    id: 'consultation',
    title: 'Smart Consultation Room',
    description:
      'Give doctors a focused workspace for notes, diagnosis, treatment, prescriptions, labs, and patient history.',
    icon: Stethoscope,
  },
  {
    id: 'inventory',
    title: 'Inventory Intelligence',
    description:
      'Connect medicine, stock movement, low-stock alerts, usage, and invoices without manual confusion.',
    icon: Package,
  },
  {
    id: 'billing',
    title: 'Billing & Invoices',
    description:
      'Create clean invoices, service charges, taxes, branded PDFs, and payment-ready records.',
    icon: Receipt,
  },
  {
    id: 'documents',
    title: 'Secure Documents',
    description:
      'Store prescriptions, lab files, reports, clinic documents, and branded outputs securely.',
    icon: FileText,
  },
  {
    id: 'dashboards',
    title: 'Role-Based Dashboards',
    description:
      'Separate views for super admin, clinic admin, receptionist, doctor, and staff.',
    icon: LayoutDashboard,
  },
  {
    id: 'audit',
    title: 'Audit Logs',
    description:
      'Track important system actions so clinic operations stay transparent and secure.',
    icon: ClipboardList,
  },
  {
    id: 'multi-clinic',
    title: 'Multi-Clinic Foundation',
    description:
      'Built for one clinic today and many clinics tomorrow with scalable architecture.',
    icon: Building2,
  },
];

export const CLINIC_TYPES = [
  {
    id: 'vet',
    title: 'Vet Clinic',
    status: 'Available Now' as const,
    description:
      'Built first for veterinary clinics with pet owners, pets, consultations, prescriptions, lab records, inventory, invoices, and audit-ready workflows.',
    details: ['Pet records', 'Prescriptions', 'Lab files', 'Inventory sync'],
  },
  {
    id: 'dental',
    title: 'Dental Clinic',
    status: 'Roadmap' as const,
    description:
      'Designed for dental practices with patient records, appointment flows, treatment notes, billing, and secure documents.',
    details: ['Treatment plans', 'Appointment flows', 'Secure billing'],
  },
  {
    id: 'general',
    title: 'General Clinic',
    status: 'Roadmap' as const,
    description:
      'A flexible clinic operating system for front desk intake, patient records, consultations, invoices, and secure documents.',
    details: ['Flexible intake', 'Patient records', 'Consultation flows'],
  },
  {
    id: 'specialty',
    title: 'Specialty Clinic',
    status: 'Roadmap' as const,
    description:
      'Designed for specialty workflows with configurable processes, secure records, branded outputs, and audit logs.',
    details: ['Configurable workflows', 'Branded outputs', 'Audit logs'],
  },
] as const;

export const SECURITY_ITEMS = [
  { id: 'rbac', label: 'Role-based access', icon: Users },
  { id: 'audit', label: 'Audit history', icon: ClipboardList },
  { id: 'records', label: 'Secure records', icon: FileText },
  { id: 'multi', label: 'Multi-clinic separation', icon: Building2 },
  { id: 'branded', label: 'Branded documents', icon: Receipt },
  { id: 'protected', label: 'Protected workflows', icon: Shield },
] as const;

export const PRICING_TIERS = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'For small clinics starting with core workflows.',
    highlights: ['Live queue', 'Consultations', 'Basic invoicing'],
    details: [
      'Up to 3 staff accounts',
      'Walk-in and appointment queue',
      'Patient records and visit history',
      'Email support',
    ],
  },
  {
    id: 'growth',
    name: 'Growth',
    description: 'For clinics managing teams, inventory, billing, and reports.',
    highlights: ['Inventory intelligence', 'Role dashboards', 'Audit logs'],
    featured: true,
    details: [
      'Unlimited staff with role permissions',
      'Stock alerts linked to prescriptions',
      'Branded invoices and documents',
      'Revenue and activity reports',
      'Priority support',
    ],
  },
  {
    id: 'multi',
    name: 'Multi-Clinic',
    description: 'For operators running multiple clinic locations.',
    highlights: ['Multi-location', 'Central oversight', 'Scalable architecture'],
    details: [
      'Every Growth feature, every branch',
      'Cross-branch reporting and oversight',
      'Per-branch data separation',
      'Dedicated onboarding',
    ],
  },
] as const;

export const FOOTER_COLUMNS = [
  {
    title: 'Product',
    links: [
      { label: 'Features', href: '#product' },
      { label: 'Pricing', href: '#pricing' },
      { label: 'Updates', href: '#' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '#' },
      { label: 'Contact', href: '#' },
      { label: 'Careers', href: '#' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Help Center', href: '#' },
      { label: 'Docs', href: '#' },
      { label: 'Guides', href: '#' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy Policy', href: '#' },
      { label: 'Terms', href: '#' },
    ],
  },
] as const;

export const CLINIC_TYPE_WORDS = ['Vet Clinic', 'Dental Clinic', 'General Clinic', 'Specialty Clinic'] as const;

export const STATS = [
  { id: 'modules', value: 12, suffix: '+', label: 'Modules unified in one OS' },
  { id: 'steps', value: 7, suffix: '', label: 'Workflow steps automated' },
  { id: 'audit', value: 100, suffix: '%', label: 'Actions audit-covered' },
  { id: 'types', value: 4, suffix: '', label: 'Clinic types supported' },
] as const;

export const TRUSTED_MODULES: { id: string; label: string; icon: LucideIcon }[] = [
  { id: 'appointments', label: 'Appointments', icon: CalendarCheck },
  { id: 'consultations', label: 'Consultations', icon: Stethoscope },
  { id: 'prescriptions', label: 'Prescriptions', icon: Pill },
  { id: 'labs', label: 'Lab Orders', icon: FlaskConical },
  { id: 'inventory', label: 'Inventory', icon: Package },
  { id: 'invoicing', label: 'Invoicing', icon: Receipt },
  { id: 'records', label: 'Records', icon: FileText },
  { id: 'audit', label: 'Audit Logs', icon: ClipboardList },
  { id: 'branches', label: 'Multi-Branch', icon: Building2 },
  { id: 'reports', label: 'Reports', icon: Activity },
];

export const TESTIMONIALS = [
  {
    id: 'reception',
    title: 'Front Desk Lead',
    description:
      '"The live queue changed our mornings completely. Walk-ins, appointments, and doctor handoffs finally live in one screen instead of three notebooks."',
  },
  {
    id: 'vet',
    title: 'Lead Veterinarian',
    description:
      '"Consultation notes, prescriptions, and lab orders flow straight into the invoice. I finish records before the pet leaves the room."',
  },
  {
    id: 'owner',
    title: 'Clinic Owner',
    description:
      '"Inventory intelligence and audit logs gave me oversight I never had. I can see every branch, every action, every day."',
  },
  {
    id: 'manager',
    title: 'Practice Manager',
    description:
      '"Onboarding the team took a single afternoon. Roles, permissions, and branded documents worked out of the box."',
  },
] as const;

export const FAQS = [
  {
    question: 'How secure is our clinic and patient data?',
    answer:
      'Phoenix OS is built on role-based access control, multi-tenant clinic separation, encrypted records, and complete audit logs. Every action in the system is traceable to a user, a role, and a timestamp.',
  },
  {
    question: 'Can we migrate from our existing system or paper records?',
    answer:
      'Yes. During onboarding we import your customers, patients, inventory, and historical records. Your team keeps working while data moves across — no downtime, no lost history.',
  },
  {
    question: 'Does it support multiple clinic locations?',
    answer:
      'The Multi-Clinic tier connects every branch under one organization with central oversight, per-branch dashboards, and separated data with shared reporting.',
  },
  {
    question: 'How does pricing work?',
    answer:
      'Plans scale with your clinic: Starter covers core workflows for small teams, Growth adds inventory intelligence and role dashboards, and Multi-Clinic unlocks multi-location oversight. Every tier includes secure, audit-ready workflows.',
  },
  {
    question: 'We are not a vet clinic — can we still use Phoenix OS?',
    answer:
      'Veterinary clinics are fully supported today. Dental, general, and specialty clinic workflows are on the roadmap, built on the same operating core — request access and we will notify you when your clinic type goes live.',
  },
] as const;

export const CTA_AVATARS = [
  { id: 'a1', name: 'Dr. Sarah — Lead Vet', initials: 'SA', color: '#22D3EE' },
  { id: 'a2', name: 'Hamza — Clinic Owner', initials: 'HA', color: '#3B82F6' },
  { id: 'a3', name: 'Maria — Front Desk', initials: 'MA', color: '#8B5CF6' },
  { id: 'a4', name: 'Dr. Ali — Surgeon', initials: 'AL', color: '#A855F7' },
  { id: 'a5', name: 'Zara — Practice Manager', initials: 'ZA', color: '#0EA5E9' },
] as const;

const svgPreview = (body: string) =>
  'data:image/svg+xml,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="140"><rect width="240" height="140" rx="8" fill="#0B1020"/><rect x="0.5" y="0.5" width="239" height="139" rx="8" fill="none" stroke="#22D3EE" stroke-opacity="0.15"/>${body}</svg>`,
  );

/* Mini UI mockups matched to each security item. */
export const SECURITY_PREVIEW_IMAGES = [
  // Role-based access: avatars + role chips
  svgPreview(
    '<circle cx="44" cy="42" r="14" fill="#22D3EE" opacity="0.85"/><text x="44" y="47" text-anchor="middle" fill="#03040A" font-size="11" font-weight="700" font-family="sans-serif">DR</text><rect x="66" y="34" width="64" height="8" rx="4" fill="#F8FAFC" opacity="0.8"/><rect x="66" y="47" width="40" height="6" rx="3" fill="#22D3EE" opacity="0.4"/>' +
    '<circle cx="44" cy="80" r="14" fill="#3B82F6" opacity="0.85"/><text x="44" y="85" text-anchor="middle" fill="#03040A" font-size="11" font-weight="700" font-family="sans-serif">FD</text><rect x="66" y="72" width="76" height="8" rx="4" fill="#F8FAFC" opacity="0.8"/><rect x="66" y="85" width="52" height="6" rx="3" fill="#3B82F6" opacity="0.4"/>' +
    '<circle cx="44" cy="118" r="14" fill="#8B5CF6" opacity="0.85"/><text x="44" y="123" text-anchor="middle" fill="#03040A" font-size="11" font-weight="700" font-family="sans-serif">AD</text><rect x="66" y="110" width="56" height="8" rx="4" fill="#F8FAFC" opacity="0.8"/><rect x="66" y="123" width="34" height="6" rx="3" fill="#8B5CF6" opacity="0.4"/>' +
    '<rect x="160" y="32" width="58" height="18" rx="9" fill="#22D3EE" opacity="0.14"/><text x="189" y="44" text-anchor="middle" fill="#22D3EE" font-size="9" font-family="monospace">DOCTOR</text>' +
    '<rect x="160" y="70" width="58" height="18" rx="9" fill="#3B82F6" opacity="0.14"/><text x="189" y="82" text-anchor="middle" fill="#3B82F6" font-size="9" font-family="monospace">DESK</text>' +
    '<rect x="160" y="108" width="58" height="18" rx="9" fill="#8B5CF6" opacity="0.14"/><text x="189" y="120" text-anchor="middle" fill="#8B5CF6" font-size="9" font-family="monospace">ADMIN</text>',
  ),
  // Audit history: timestamped log rows
  svgPreview(
    '<rect x="20" y="18" width="90" height="8" rx="4" fill="#F8FAFC" opacity="0.7"/>' +
    '<circle cx="30" cy="49" r="4" fill="#22D3EE"/><rect x="42" y="45" width="98" height="7" rx="3.5" fill="#94A3B8" opacity="0.55"/><rect x="168" y="45" width="48" height="7" rx="3.5" fill="#22D3EE" opacity="0.3"/>' +
    '<circle cx="30" cy="74" r="4" fill="#3B82F6"/><rect x="42" y="70" width="118" height="7" rx="3.5" fill="#94A3B8" opacity="0.55"/><rect x="168" y="70" width="48" height="7" rx="3.5" fill="#3B82F6" opacity="0.3"/>' +
    '<circle cx="30" cy="99" r="4" fill="#8B5CF6"/><rect x="42" y="95" width="84" height="7" rx="3.5" fill="#94A3B8" opacity="0.55"/><rect x="168" y="95" width="48" height="7" rx="3.5" fill="#8B5CF6" opacity="0.3"/>' +
    '<circle cx="30" cy="124" r="4" fill="#22C55E"/><rect x="42" y="120" width="104" height="7" rx="3.5" fill="#94A3B8" opacity="0.55"/><rect x="168" y="120" width="48" height="7" rx="3.5" fill="#22C55E" opacity="0.3"/>',
  ),
  // Secure records: locked file card
  svgPreview(
    '<path d="M70 30 h56 l18 18 v58 a6 6 0 0 1 -6 6 h-68 a6 6 0 0 1 -6 -6 v-70 a6 6 0 0 1 6 -6 z" fill="#101A33" stroke="#3B82F6" stroke-opacity="0.5"/><path d="M126 30 v18 h18 z" fill="#3B82F6" opacity="0.4"/>' +
    '<rect x="78" y="60" width="48" height="6" rx="3" fill="#94A3B8" opacity="0.55"/><rect x="78" y="72" width="60" height="6" rx="3" fill="#94A3B8" opacity="0.4"/><rect x="78" y="84" width="38" height="6" rx="3" fill="#94A3B8" opacity="0.3"/>' +
    '<rect x="140" y="88" width="34" height="26" rx="6" fill="#22D3EE"/><rect x="148" y="76" width="18" height="18" rx="9" fill="none" stroke="#22D3EE" stroke-width="4"/><circle cx="157" cy="100" r="4" fill="#03040A"/>',
  ),
  // Multi-clinic separation: two tenant panels
  svgPreview(
    '<rect x="18" y="28" width="92" height="84" rx="8" fill="#101A33" stroke="#22D3EE" stroke-opacity="0.4"/><rect x="28" y="40" width="40" height="7" rx="3.5" fill="#22D3EE" opacity="0.7"/><rect x="28" y="56" width="66" height="6" rx="3" fill="#94A3B8" opacity="0.45"/><rect x="28" y="68" width="52" height="6" rx="3" fill="#94A3B8" opacity="0.35"/><rect x="28" y="88" width="30" height="12" rx="6" fill="#22D3EE" opacity="0.2"/>' +
    '<rect x="130" y="28" width="92" height="84" rx="8" fill="#101A33" stroke="#8B5CF6" stroke-opacity="0.4"/><rect x="140" y="40" width="40" height="7" rx="3.5" fill="#8B5CF6" opacity="0.7"/><rect x="140" y="56" width="66" height="6" rx="3" fill="#94A3B8" opacity="0.45"/><rect x="140" y="68" width="52" height="6" rx="3" fill="#94A3B8" opacity="0.35"/><rect x="140" y="88" width="30" height="12" rx="6" fill="#8B5CF6" opacity="0.2"/>' +
    '<line x1="120" y1="24" x2="120" y2="116" stroke="#F8FAFC" stroke-opacity="0.15" stroke-dasharray="4 4"/>',
  ),
  // Branded documents: invoice PDF mock
  svgPreview(
    '<rect x="62" y="16" width="116" height="108" rx="8" fill="#101A33" stroke="#22D3EE" stroke-opacity="0.35"/>' +
    '<circle cx="80" cy="34" r="7" fill="#22D3EE"/><rect x="94" y="30" width="52" height="8" rx="4" fill="#F8FAFC" opacity="0.8"/>' +
    '<rect x="76" y="52" width="88" height="6" rx="3" fill="#94A3B8" opacity="0.5"/><rect x="76" y="64" width="72" height="6" rx="3" fill="#94A3B8" opacity="0.4"/><rect x="76" y="76" width="80" height="6" rx="3" fill="#94A3B8" opacity="0.3"/>' +
    '<line x1="76" y1="92" x2="164" y2="92" stroke="#22D3EE" stroke-opacity="0.3"/>' +
    '<rect x="76" y="100" width="36" height="9" rx="4.5" fill="#94A3B8" opacity="0.5"/><rect x="126" y="98" width="38" height="14" rx="7" fill="#22D3EE" opacity="0.85"/><text x="145" y="108" text-anchor="middle" fill="#03040A" font-size="9" font-weight="700" font-family="sans-serif">PAID</text>',
  ),
  // Protected workflows: shielded flow steps
  svgPreview(
    '<rect x="20" y="56" width="48" height="28" rx="6" fill="#101A33" stroke="#22D3EE" stroke-opacity="0.5"/><rect x="28" y="66" width="32" height="7" rx="3.5" fill="#22D3EE" opacity="0.6"/>' +
    '<line x1="68" y1="70" x2="96" y2="70" stroke="#3B82F6" stroke-opacity="0.5" stroke-dasharray="4 4"/>' +
    '<path d="M120 44 l22 8 v18 c0 14 -10 22 -22 27 c-12 -5 -22 -13 -22 -27 v-18 z" fill="#3B82F6" opacity="0.25" stroke="#3B82F6" stroke-opacity="0.7"/><path d="M112 70 l6 7 l12 -13" fill="none" stroke="#22D3EE" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>' +
    '<line x1="144" y1="70" x2="172" y2="70" stroke="#3B82F6" stroke-opacity="0.5" stroke-dasharray="4 4"/>' +
    '<rect x="172" y="56" width="48" height="28" rx="6" fill="#101A33" stroke="#8B5CF6" stroke-opacity="0.5"/><rect x="180" y="66" width="32" height="7" rx="3.5" fill="#8B5CF6" opacity="0.6"/>',
  ),
] as const;

export const PHOENIX_NODES = [
  {
    id: 'vet',
    label: 'Vet Clinic',
    detail: 'Pet records, prescriptions, and inventory in one flow.',
    x: 290,
    y: 78,
    color: '#22D3EE',
    icon: 'stethoscope' as const,
    live: true,
  },
  {
    id: 'dental',
    label: 'Dental Clinic',
    detail: 'Treatment notes, appointments, and secure billing.',
    x: 290,
    y: 322,
    color: '#3B82F6',
    icon: 'smile' as const,
    live: false,
  },
  {
    id: 'general',
    label: 'General Clinic',
    detail: 'Flexible intake, records, and consultation workflows.',
    x: 110,
    y: 322,
    color: '#8B5CF6',
    icon: 'heart-pulse' as const,
    live: false,
  },
  {
    id: 'specialty',
    label: 'Specialty Clinic',
    detail: 'Configurable processes with audit-ready records.',
    x: 110,
    y: 78,
    color: '#A855F7',
    icon: 'sparkles' as const,
    live: false,
  },
] as const;
