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
  },
  {
    id: 'growth',
    name: 'Growth',
    description: 'For clinics managing teams, inventory, billing, and reports.',
    highlights: ['Inventory intelligence', 'Role dashboards', 'Audit logs'],
    featured: true,
  },
  {
    id: 'multi',
    name: 'Multi-Clinic',
    description: 'For operators running multiple clinic locations.',
    highlights: ['Multi-location', 'Central oversight', 'Scalable architecture'],
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

export const SECURITY_PREVIEW_IMAGES = [
  'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="240" height="140"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#22D3EE"/><stop offset="1" stop-color="#3B82F6"/></linearGradient></defs><rect width="240" height="140" fill="#0B1020"/><circle cx="120" cy="70" r="40" fill="url(#g)" opacity="0.5"/></svg>'),
  'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="240" height="140"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#3B82F6"/><stop offset="1" stop-color="#8B5CF6"/></linearGradient></defs><rect width="240" height="140" fill="#0B1020"/><rect x="60" y="35" width="120" height="70" rx="12" fill="url(#g)" opacity="0.45"/></svg>'),
  'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="240" height="140"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#8B5CF6"/><stop offset="1" stop-color="#A855F7"/></linearGradient></defs><rect width="240" height="140" fill="#0B1020"/><path d="M40 100 L120 30 L200 100 Z" fill="url(#g)" opacity="0.4"/></svg>'),
  'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="240" height="140"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#22D3EE"/><stop offset="1" stop-color="#8B5CF6"/></linearGradient></defs><rect width="240" height="140" fill="#0B1020"/><rect x="30" y="30" width="80" height="80" rx="8" fill="url(#g)" opacity="0.35"/><rect x="130" y="30" width="80" height="80" rx="8" fill="url(#g)" opacity="0.25"/></svg>'),
  'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="240" height="140"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#3B82F6"/><stop offset="1" stop-color="#22D3EE"/></linearGradient></defs><rect width="240" height="140" fill="#0B1020"/><text x="120" y="78" text-anchor="middle" fill="url(#g)" font-size="28" font-family="sans-serif">PDF</text></svg>'),
  'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="240" height="140"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#A855F7"/><stop offset="1" stop-color="#22D3EE"/></linearGradient></defs><rect width="240" height="140" fill="#0B1020"/><line x1="40" y1="70" x2="200" y2="70" stroke="url(#g)" stroke-width="4"/><circle cx="80" cy="70" r="10" fill="#22D3EE"/><circle cx="160" cy="70" r="10" fill="#8B5CF6"/></svg>'),
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
