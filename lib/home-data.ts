import type { LucideIcon } from 'lucide-react';
import {
  Activity,
  Bell,
  Building2,
  CalendarCheck,
  ClipboardList,
  Clock,
  FileText,
  FlaskConical,
  FolderOpen,
  Grid3x3,
  Infinity,
  LayoutDashboard,
  MessageSquare,
  MousePointerClick,
  Package,
  Receipt,
  Shield,
  Stethoscope,
  TrendingUp,
  Users,
  DollarSign,
} from 'lucide-react';

export const NAV_LINKS = [
  { label: 'Problem', href: '#problem' },
  { label: 'Solution', href: '#solution' },
  { label: 'Product', href: '#product' },
  { label: 'Workflows', href: '#workflows' },
  { label: 'Pricing', href: '#pricing' },
] as const;

export const HERO = {
  eyebrow: 'PHOENIX OS',
  headline: ['One operating system.', 'Built for vet practices.'],
  subheadline:
    'Run your entire veterinary clinic from one screen — less admin, calmer mornings, and a team that always knows what happens next.',
  microcopy:
    'Vet clinics live today. Dental, general, and specialty care on the roadmap.',
} as const;

export const EARLY_ACCESS = {
  eyebrow: 'EARLY ACCESS',
  headline: 'Be among the first vet clinics on Phoenix OS.',
  subtext:
    'We are onboarding a limited group of veterinary practices. Request access to join the early cohort and shape the platform with us.',
  cta: 'Request Early Access',
  note: 'No credit card · Onboarding support included',
} as const;

export const OS_DEMO = {
  heading: 'Your whole team, one live workspace.',
  subheadline:
    'When reception updates the queue, the vet sees it instantly. When treatment finishes, billing is already half done. No chasing, no duplicate entry.',
  bullets: [
    'Everyone sees the same live patient status',
    'Handoffs happen in seconds, not sticky notes',
    'Owners get visibility without micromanaging',
  ],
  steps: [
    { id: 'appointment', label: 'Created', detail: 'Added to live queue' },
    { id: 'record', label: 'Opened', detail: 'History in one view' },
    { id: 'consultation', label: 'Started', detail: 'Notes workspace ready' },
    { id: 'prescription', label: 'Added', detail: 'Treatment linked' },
    { id: 'inventory', label: 'Updated', detail: 'Stock recorded' },
    { id: 'invoice', label: 'Generated', detail: 'PDF ready' },
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

const svgPreview = (body: string) =>
  'data:image/svg+xml,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="140"><rect width="240" height="140" rx="8" fill="#0B1020"/><rect x="0.5" y="0.5" width="239" height="139" rx="8" fill="none" stroke="#22D3EE" stroke-opacity="0.15"/>${body}</svg>`,
  );

export type FeatureItem = {
  id: string;
  title: string;
  description: string;
  previewImage: string;
  icon: LucideIcon;
};

const featurePreviewById = {
  queue: svgPreview(
    '<rect x="16" y="22" width="208" height="22" rx="6" fill="#101A33" stroke="#22D3EE" stroke-opacity="0.35"/><circle cx="32" cy="33" r="5" fill="#22D3EE"/><rect x="46" y="29" width="72" height="7" rx="3.5" fill="#F8FAFC" opacity="0.75"/><rect x="160" y="29" width="48" height="8" rx="4" fill="#22D3EE" opacity="0.25"/>' +
    '<rect x="16" y="54" width="208" height="22" rx="6" fill="#101A33" stroke="#3B82F6" stroke-opacity="0.3"/><circle cx="32" cy="65" r="5" fill="#3B82F6"/><rect x="46" y="61" width="88" height="7" rx="3.5" fill="#F8FAFC" opacity="0.65"/><rect x="160" y="61" width="48" height="8" rx="4" fill="#3B82F6" opacity="0.2"/>' +
    '<rect x="16" y="86" width="208" height="22" rx="6" fill="#101A33" stroke="#8B5CF6" stroke-opacity="0.25"/><circle cx="32" cy="97" r="5" fill="#8B5CF6"/><rect x="46" y="93" width="64" height="7" rx="3.5" fill="#F8FAFC" opacity="0.55"/><rect x="160" y="93" width="48" height="8" rx="4" fill="#22C55E" opacity="0.25"/>',
  ),
  consultation: svgPreview(
    '<rect x="14" y="18" width="212" height="104" rx="8" fill="#101A33" stroke="#22D3EE" stroke-opacity="0.35"/>' +
    '<text x="24" y="36" fill="#22D3EE" font-size="9" font-family="monospace">SOAP</text>' +
    '<rect x="24" y="44" width="80" height="6" rx="3" fill="#94A3B8" opacity="0.5"/><rect x="24" y="56" width="120" height="6" rx="3" fill="#94A3B8" opacity="0.4"/><rect x="24" y="68" width="96" height="6" rx="3" fill="#94A3B8" opacity="0.35"/>' +
    '<rect x="24" y="84" width="56" height="14" rx="7" fill="#22D3EE" opacity="0.2"/><rect x="88" y="84" width="56" height="14" rx="7" fill="#3B82F6" opacity="0.15"/><rect x="152" y="84" width="62" height="14" rx="7" fill="#8B5CF6" opacity="0.15"/>',
  ),
  inventory: svgPreview(
    '<rect x="20" y="24" width="200" height="92" rx="8" fill="#101A33" stroke="#22D3EE" stroke-opacity="0.3"/>' +
    '<rect x="32" y="38" width="120" height="10" rx="4" fill="#22D3EE" opacity="0.55"/><rect x="32" y="56" width="90" height="10" rx="4" fill="#3B82F6" opacity="0.4"/><rect x="32" y="74" width="60" height="10" rx="4" fill="#8B5CF6" opacity="0.35"/>' +
    '<rect x="162" y="36" width="44" height="20" rx="6" fill="#EF4444" opacity="0.2" stroke="#EF4444" stroke-opacity="0.5"/><text x="184" y="50" text-anchor="middle" fill="#EF4444" font-size="8" font-family="monospace">LOW</text>',
  ),
  billing: svgPreview(
    '<rect x="52" y="14" width="136" height="112" rx="8" fill="#101A33" stroke="#22D3EE" stroke-opacity="0.35"/>' +
    '<rect x="68" y="30" width="72" height="8" rx="4" fill="#F8FAFC" opacity="0.8"/><rect x="68" y="48" width="104" height="6" rx="3" fill="#94A3B8" opacity="0.45"/><rect x="68" y="60" width="88" height="6" rx="3" fill="#94A3B8" opacity="0.4"/><rect x="68" y="72" width="96" height="6" rx="3" fill="#94A3B8" opacity="0.35"/>' +
    '<line x1="68" y1="88" x2="172" y2="88" stroke="#22D3EE" stroke-opacity="0.3"/><rect x="68" y="98" width="40" height="10" rx="5" fill="#94A3B8" opacity="0.4"/><rect x="130" y="96" width="42" height="14" rx="7" fill="#22D3EE" opacity="0.85"/>',
  ),
  documents: svgPreview(
    '<path d="M70 30 h56 l18 18 v58 a6 6 0 0 1 -6 6 h-68 a6 6 0 0 1 -6 -6 v-70 a6 6 0 0 1 6 -6 z" fill="#101A33" stroke="#3B82F6" stroke-opacity="0.5"/><path d="M126 30 v18 h18 z" fill="#3B82F6" opacity="0.4"/>' +
    '<rect x="78" y="60" width="48" height="6" rx="3" fill="#94A3B8" opacity="0.55"/><rect x="78" y="72" width="60" height="6" rx="3" fill="#94A3B8" opacity="0.4"/><rect x="78" y="84" width="38" height="6" rx="3" fill="#94A3B8" opacity="0.3"/>' +
    '<rect x="140" y="88" width="34" height="26" rx="6" fill="#22D3EE"/><rect x="148" y="76" width="18" height="18" rx="9" fill="none" stroke="#22D3EE" stroke-width="4"/><circle cx="157" cy="100" r="4" fill="#03040A"/>',
  ),
  dashboards: svgPreview(
    '<rect x="18" y="28" width="64" height="84" rx="8" fill="#101A33" stroke="#22D3EE" stroke-opacity="0.4"/><rect x="28" y="40" width="40" height="7" rx="3.5" fill="#22D3EE" opacity="0.7"/><rect x="28" y="56" width="44" height="6" rx="3" fill="#94A3B8" opacity="0.45"/>' +
    '<rect x="88" y="28" width="64" height="84" rx="8" fill="#101A33" stroke="#3B82F6" stroke-opacity="0.4"/><rect x="98" y="40" width="40" height="7" rx="3.5" fill="#3B82F6" opacity="0.7"/><rect x="98" y="56" width="44" height="6" rx="3" fill="#94A3B8" opacity="0.45"/>' +
    '<rect x="158" y="28" width="64" height="84" rx="8" fill="#101A33" stroke="#8B5CF6" stroke-opacity="0.4"/><rect x="168" y="40" width="40" height="7" rx="3.5" fill="#8B5CF6" opacity="0.7"/><rect x="168" y="56" width="44" height="6" rx="3" fill="#94A3B8" opacity="0.45"/>',
  ),
  audit: svgPreview(
    '<rect x="20" y="18" width="90" height="8" rx="4" fill="#F8FAFC" opacity="0.7"/>' +
    '<circle cx="30" cy="49" r="4" fill="#22D3EE"/><rect x="42" y="45" width="98" height="7" rx="3.5" fill="#94A3B8" opacity="0.55"/><rect x="168" y="45" width="48" height="7" rx="3.5" fill="#22D3EE" opacity="0.3"/>' +
    '<circle cx="30" cy="74" r="4" fill="#3B82F6"/><rect x="42" y="70" width="118" height="7" rx="3.5" fill="#94A3B8" opacity="0.55"/><rect x="168" y="70" width="48" height="7" rx="3.5" fill="#3B82F6" opacity="0.3"/>' +
    '<circle cx="30" cy="99" r="4" fill="#8B5CF6"/><rect x="42" y="95" width="84" height="7" rx="3.5" fill="#94A3B8" opacity="0.55"/><rect x="168" y="95" width="48" height="7" rx="3.5" fill="#8B5CF6" opacity="0.3"/>',
  ),
  appointments: svgPreview(
    '<rect x="14" y="20" width="212" height="100" rx="8" fill="#101A33" stroke="#22D3EE" stroke-opacity="0.3"/>' +
    '<rect x="24" y="32" width="28" height="24" rx="4" fill="#22D3EE" opacity="0.2"/><rect x="56" y="32" width="28" height="24" rx="4" fill="#3B82F6" opacity="0.15"/><rect x="88" y="32" width="28" height="24" rx="4" fill="#8B5CF6" opacity="0.15"/><rect x="120" y="32" width="28" height="24" rx="4" fill="#22D3EE" opacity="0.25"/>' +
    '<rect x="24" y="64" width="124" height="8" rx="4" fill="#94A3B8" opacity="0.4"/><rect x="24" y="80" width="96" height="8" rx="4" fill="#94A3B8" opacity="0.35"/><rect x="156" y="72" width="58" height="22" rx="6" fill="#22D3EE" opacity="0.2"/><text x="185" y="86" text-anchor="middle" fill="#22D3EE" font-size="8" font-family="monospace">REMIND</text>',
  ),
  'multi-clinic': svgPreview(
    '<rect x="18" y="28" width="92" height="84" rx="8" fill="#101A33" stroke="#22D3EE" stroke-opacity="0.4"/><rect x="28" y="40" width="40" height="7" rx="3.5" fill="#22D3EE" opacity="0.7"/><rect x="28" y="56" width="66" height="6" rx="3" fill="#94A3B8" opacity="0.45"/>' +
    '<rect x="130" y="28" width="92" height="84" rx="8" fill="#101A33" stroke="#8B5CF6" stroke-opacity="0.4"/><rect x="140" y="40" width="40" height="7" rx="3.5" fill="#8B5CF6" opacity="0.7"/><rect x="140" y="56" width="66" height="6" rx="3" fill="#94A3B8" opacity="0.45"/>' +
    '<line x1="120" y1="24" x2="120" y2="116" stroke="#F8FAFC" stroke-opacity="0.15" stroke-dasharray="4 4"/>',
  ),
} as const;

export const FEATURE_PREVIEW_IMAGES = featurePreviewById;

export const FEATURES: FeatureItem[] = [
  {
    id: 'queue',
    title: 'Live Clinic Queue',
    description:
      'Stop juggling three notebooks at the front desk — see who is waiting, who is with the vet, and who is ready to leave in one glance.',
    previewImage: featurePreviewById.queue,
    icon: Activity,
  },
  {
    id: 'consultation',
    title: 'Smart Consultation Room',
    description:
      'Give vets a calm, focused screen for SOAP notes and treatment decisions without hunting through scattered files.',
    previewImage: featurePreviewById.consultation,
    icon: Stethoscope,
  },
  {
    id: 'inventory',
    title: 'Inventory Intelligence',
    description:
      'Know what is running low before a procedure starts — stock moves with prescriptions so counts stay honest.',
    previewImage: featurePreviewById.inventory,
    icon: Package,
  },
  {
    id: 'billing',
    title: 'Billing & Invoices',
    description:
      'Turn a finished visit into a branded invoice in minutes, with taxes and line items already filled in.',
    previewImage: featurePreviewById.billing,
    icon: Receipt,
  },
  {
    id: 'documents',
    title: 'Secure Documents',
    description:
      'Keep lab results, discharge sheets, and clinic paperwork in one protected place — searchable when you need them.',
    previewImage: featurePreviewById.documents,
    icon: FileText,
  },
  {
    id: 'dashboards',
    title: 'Role-Based Dashboards',
    description:
      'Reception sees the queue, vets see cases, owners see revenue — each role gets exactly what they need.',
    previewImage: featurePreviewById.dashboards,
    icon: LayoutDashboard,
  },
  {
    id: 'audit',
    title: 'Audit Logs',
    description:
      'Answer "who changed this?" in seconds — every sensitive action is logged with user, role, and timestamp.',
    previewImage: featurePreviewById.audit,
    icon: ClipboardList,
  },
  {
    id: 'appointments',
    title: 'Appointments & Reminders',
    description:
      'Fill the schedule without double-booking — send reminders so fewer visits slip through the cracks.',
    previewImage: featurePreviewById.appointments,
    icon: CalendarCheck,
  },
  {
    id: 'multi-clinic',
    title: 'Multi-Clinic Foundation',
    description:
      'Open a second branch without starting from scratch — each location stays separate with shared oversight.',
    previewImage: featurePreviewById['multi-clinic'],
    icon: Building2,
  },
];

export const CLINIC_TYPES = [
  {
    id: 'vet',
    title: 'Vet Clinic',
    status: 'Available Now' as const,
    description:
      'Purpose-built for veterinary practices — live today with reception, clinical workflows, and billing in one workspace.',
    extendedDescription:
      'Vets get a dedicated SOAP workspace, lab order tracking, prescription-to-inventory sync, and branded PDF outputs. Every role — reception, doctor, practice manager, and owner — sees a dashboard tailored to their day.',
    details: [
      'Pet & owner profiles',
      'SOAP & treatment plans',
      'Vaccination reminders',
      'Lab orders & results',
      'Rx with stock deduction',
      'Branded invoices & documents',
      'Role-based dashboards',
      'Full audit trail',
    ],
  },
  {
    id: 'dental',
    title: 'Dental Clinic',
    status: 'Under Development' as const,
    description: 'Under development — launching on the Phoenix OS roadmap.',
    details: [] as const,
  },
  {
    id: 'general',
    title: 'General Clinic',
    status: 'Under Development' as const,
    description: 'Under development — launching on the Phoenix OS roadmap.',
    details: [] as const,
  },
  {
    id: 'specialty',
    title: 'Specialty Clinic',
    status: 'Under Development' as const,
    description: 'Under development — launching on the Phoenix OS roadmap.',
    details: [] as const,
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
    description: 'For solo vets and small teams getting off paper and spreadsheets.',
    highlights: ['Up to 3 staff', 'Core vet modules', 'Email support'],
    details: [
      'Up to 3 staff accounts',
      'Patient records and visit history',
      'Branded invoice templates',
      'Email support',
    ],
  },
  {
    id: 'growth',
    name: 'Growth',
    description: 'For growing practices with more staff, stock, and reporting needs.',
    highlights: ['Unlimited staff', 'Priority support', 'Revenue reports'],
    featured: true,
    details: [
      'Unlimited staff with role permissions',
      'Stock alerts and usage tracking',
      'Revenue and activity reports',
      'Branded documents',
      'Priority support',
    ],
  },
  {
    id: 'multi',
    name: 'Multi-Clinic',
    description: 'For operators running two or more clinic locations.',
    highlights: ['Every branch covered', 'Central oversight', 'Dedicated onboarding'],
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
      { label: 'Problem', href: '#problem' },
      { label: 'Solution', href: '#solution' },
      { label: 'Features', href: '#product' },
      { label: 'Pricing', href: '#pricing' },
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

export const CLINIC_TYPE_WORDS = ['Vet Clinics', 'More clinic types soon'] as const;

export const STATS = [
  { id: 'modules', value: 12, suffix: '+', label: 'Modules unified in one OS' },
  { id: 'sync', value: 100, suffix: '%', label: 'Real-time sync across roles' },
  { id: 'audit', value: 100, suffix: '%', label: 'Actions audit-covered' },
  { id: 'types', value: 1, suffix: '', label: 'Vet clinics live today' },
] as const;

export const TRUSTED_MODULES: { id: string; label: string; icon: LucideIcon }[] = [
  { id: 'desk', label: 'Front Desk', icon: CalendarCheck },
  { id: 'vet', label: 'Veterinarian', icon: Stethoscope },
  { id: 'manager', label: 'Practice Manager', icon: LayoutDashboard },
  { id: 'owner', label: 'Clinic Owner', icon: Building2 },
  { id: 'noshows', label: 'Fewer no-shows', icon: Clock },
  { id: 'checkout', label: 'Faster checkout', icon: TrendingUp },
  { id: 'visibility', label: 'Owner visibility', icon: Activity },
  { id: 'onboarding', label: 'Quick onboarding', icon: Users },
];

export const TESTIMONIALS = [
  {
    id: 'reception',
    title: 'Front Desk Lead',
    subtitle: 'Early-access clinic',
    description:
      'Our mornings used to be chaos. Now I know exactly who is waiting, who the vet is seeing, and who is ready to pay — without shouting down the hallway.',
    image:
      'data:image/svg+xml,' +
      encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#22D3EE"/><stop offset="100%" stop-color="#3B82F6"/></linearGradient></defs><rect width="400" height="400" fill="#0B1020"/><rect width="400" height="400" fill="url(#g)" opacity="0.35"/><text x="200" y="210" text-anchor="middle" fill="#F8FAFC" font-size="28" font-family="sans-serif" font-weight="700">Front Desk</text></svg>',
      ),
  },
  {
    id: 'vet',
    title: 'Lead Veterinarian',
    subtitle: 'Early-access clinic',
    description:
      'I used to stay late finishing paperwork. Now my notes are done before the pet leaves — I actually get home on time.',
    image:
      'data:image/svg+xml,' +
      encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#3B82F6"/><stop offset="100%" stop-color="#8B5CF6"/></linearGradient></defs><rect width="400" height="400" fill="#0B1020"/><rect width="400" height="400" fill="url(#g)" opacity="0.35"/><text x="200" y="210" text-anchor="middle" fill="#F8FAFC" font-size="28" font-family="sans-serif" font-weight="700">Veterinarian</text></svg>',
      ),
  },
  {
    id: 'owner',
    title: 'Clinic Owner',
    subtitle: 'Early-access clinic',
    description:
      'For the first time I can see what is happening across the practice without standing over everyone\'s shoulder. That peace of mind is worth everything.',
    image:
      'data:image/svg+xml,' +
      encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#F97316"/><stop offset="100%" stop-color="#8B5CF6"/></linearGradient></defs><rect width="400" height="400" fill="#0B1020"/><rect width="400" height="400" fill="url(#g)" opacity="0.35"/><text x="200" y="210" text-anchor="middle" fill="#F8FAFC" font-size="28" font-family="sans-serif" font-weight="700">Clinic Owner</text></svg>',
      ),
  },
  {
    id: 'manager',
    title: 'Practice Manager',
    subtitle: 'Early-access clinic',
    description:
      'We onboarded the whole team in one afternoon. Nobody needed a manual — they just logged in and started working.',
    image:
      'data:image/svg+xml,' +
      encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#22D3EE"/><stop offset="100%" stop-color="#A855F7"/></linearGradient></defs><rect width="400" height="400" fill="#0B1020"/><rect width="400" height="400" fill="url(#g)" opacity="0.35"/><text x="200" y="210" text-anchor="middle" fill="#F8FAFC" font-size="26" font-family="sans-serif" font-weight="700">Practice Mgr</text></svg>',
      ),
  },
] as const;

export const PROBLEM_SECTION = {
  eyebrow: 'THE PROBLEM',
  headline: ['Running a clinic is', 'hard enough.', 'Software shouldn\'t make it harder.'],
  subheadline:
    'Veterinary teams juggle too many tools, too much data, and endless manual work — every single day.',
  flow: [
    {
      id: 'appointments',
      label: 'Appointments',
      problem: 'Bookings come from multiple platforms, causing double entries and missed slots.',
      outcome: 'Lost time. Confused schedules. Unhappy pet parents.',
      icon: CalendarCheck,
      tone: 'purple' as const,
    },
    {
      id: 'records',
      label: 'Patient Records',
      problem: 'Patient data is scattered across different systems and files.',
      outcome: 'Hard to find information. Risk of errors and duplicates.',
      icon: FolderOpen,
      tone: 'orange' as const,
    },
    {
      id: 'labs',
      label: 'Laboratory',
      problem: 'Lab results arrive from different labs in different formats.',
      outcome: 'Manual entry. Delayed updates. Treatment decisions get slower.',
      icon: FlaskConical,
      tone: 'purple' as const,
    },
    {
      id: 'inventory',
      label: 'Inventory',
      problem: 'Stock levels aren\'t updated in real-time across locations.',
      outcome: 'Stockouts. Overstocks. Money stuck in inventory.',
      icon: Package,
      tone: 'blue' as const,
    },
    {
      id: 'billing',
      label: 'Billing',
      problem: 'Charges, payments, and invoices managed in multiple places.',
      outcome: 'Missed charges. Revenue leaks every day.',
      icon: DollarSign,
      tone: 'blue' as const,
    },
    {
      id: 'discharge',
      label: 'Discharge Notes',
      problem: 'Discharge summaries and notes are written manually.',
      outcome: 'Takes too long. Inconsistent follow-ups.',
      icon: FileText,
      tone: 'orange' as const,
    },
    {
      id: 'followup',
      label: 'Follow-up',
      problem: 'Reminders and follow-ups rely on memory or sticky notes.',
      outcome: 'Missed follow-ups. Lost patients. Lost trust.',
      icon: Bell,
      tone: 'orange' as const,
    },
  ],
  summary: [
    {
      id: 'tools',
      title: 'Too Many Tools',
      description: 'Switch between multiple apps, tabs, and logins all day long.',
      icon: Grid3x3,
    },
    {
      id: 'time',
      title: 'Wasted Time',
      description: 'Hours lost to manual data entry, paperwork, and follow-ups.',
      icon: FileText,
    },
    {
      id: 'comms',
      title: 'Communication Gaps',
      description: 'Missed messages, lost updates, and unclear patient history.',
      icon: MessageSquare,
    },
    {
      id: 'revenue',
      title: 'Revenue Leakage',
      description: 'Missed appointments, unbilled services, and no-shows hurt growth.',
      icon: TrendingUp,
    },
    {
      id: 'burnout',
      title: 'Team Burnout',
      description: 'Overworked teams lead to stress and high turnover.',
      icon: Users,
    },
  ],
  stats: [
    { id: 'admin', value: '2–3 hrs', label: 'lost every day to admin work', icon: Clock },
    { id: 'systems', value: '6+', label: 'different systems used daily', icon: Grid3x3 },
    { id: 'clicks', value: '1000+', label: 'clicks before lunch', icon: MousePointerClick },
    { id: 'interrupts', value: '∞', label: 'interruptions every single day', icon: Infinity },
  ],
} as const;

export const SOLUTION_SECTION = {
  eyebrow: 'THE SOLUTION',
  headline: ['How Phoenix OS', 'solves these', 'problems'],
  subheadline:
    'Phoenix OS brings everything together in one intelligent platform. No more switching, no more chasing — just seamless clinical workflows.',
  rows: [
    {
      id: 'appointments',
      problem: 'Lost time. Confused schedules.',
      title: 'Smart Scheduling. Zero Confusion.',
      description: 'AI-powered scheduling that keeps every role aligned.',
      bullets: ['Smart availability & resources', 'Automated reminders', 'Real-time updates for the whole team'],
      preview: featurePreviewById.appointments,
      tone: 'purple' as const,
    },
    {
      id: 'records',
      problem: 'Hard to find information. Risk of errors.',
      title: 'Unified Patient Intelligence.',
      description: 'Every record, visit, and document in one searchable profile.',
      bullets: ['Complete medical history', 'Smart search & filters', 'Secure cloud storage'],
      preview: featurePreviewById.consultation,
      tone: 'orange' as const,
    },
    {
      id: 'labs',
      problem: 'Manual entry. Delayed updates.',
      title: 'Lab Results, Instantly.',
      description: 'Results flow into the chart without retyping.',
      bullets: ['Auto-import & parse', 'Real-time notifications', 'Historical trends & insights'],
      preview: featurePreviewById.documents,
      tone: 'purple' as const,
    },
    {
      id: 'inventory',
      problem: 'Stockouts. Overstocks. Money stuck.',
      title: 'Inventory That Thinks Ahead.',
      description: 'Stock moves with treatment so counts stay honest.',
      bullets: ['Low stock & expiry alerts', 'Usage analytics', 'Auto reorder suggestions'],
      preview: featurePreviewById.inventory,
      tone: 'blue' as const,
    },
    {
      id: 'billing',
      problem: 'Missed charges. Revenue leaks.',
      title: 'Billing That Captures Everything.',
      description: 'Turn visits into invoices without duplicate entry.',
      bullets: ['One-click invoicing', 'Treatment-to-invoice automation', 'Payment tracking & history'],
      preview: featurePreviewById.billing,
      tone: 'blue' as const,
    },
    {
      id: 'discharge',
      problem: 'Takes too long. Inconsistent follow-ups.',
      title: 'AI-Generated, Always Consistent.',
      description: 'Structured discharge notes and care instructions in minutes.',
      bullets: ['AI SOAP notes & summaries', 'Custom templates', 'Consistent & professional'],
      preview: featurePreviewById.consultation,
      tone: 'orange' as const,
    },
    {
      id: 'followup',
      problem: 'Missed follow-ups. Lost patients.',
      title: 'Never Miss a Follow-up Again.',
      description: 'Automated reminders keep patients on track.',
      bullets: ['Automated SMS / WhatsApp / Email', 'Task assignment', 'Better patient retention'],
      preview: featurePreviewById.appointments,
      tone: 'orange' as const,
    },
  ],
  connected: {
    title: 'One Platform. Everything Connected.',
    subtitle: 'Your Team, Unstuck.',
    pillars: [
      { id: 'all', title: 'All-in-One Platform', description: 'No more switching between apps.' },
      { id: 'sync', title: 'Real-time Sync', description: 'Across all departments.' },
      { id: 'ai', title: 'AI-Powered', description: 'Smarter every day.' },
      { id: 'secure', title: 'Secure & Compliant', description: 'Your data, always protected.' },
    ],
  },
} as const;

export const FAQS = [
  {
    question: 'How secure is our clinic and patient data?',
    answer:
      'Role-based access, encrypted records, multi-tenant separation, and a complete audit trail. Every sensitive action is traceable to a user, role, and timestamp.',
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
      'Starter fits solo vets and small teams. Growth adds unlimited staff, reporting, and priority support. Multi-Clinic is for operators with two or more branches. Request access and we will recommend the right tier.',
  },
  {
    question: 'We are not a vet clinic — can we still use Phoenix OS?',
    answer:
      'Veterinary clinics are fully supported today. Dental, general, and specialty clinic types are under development on the same operating core — request access and we will notify you when yours goes live.',
  },
] as const;

export const CTA_AVATARS = [
  { id: 'a1', name: 'Dr. Sarah — Lead Vet', initials: 'SA', color: '#22D3EE' },
  { id: 'a2', name: 'Hamza — Clinic Owner', initials: 'HA', color: '#3B82F6' },
  { id: 'a3', name: 'Maria — Front Desk', initials: 'MA', color: '#8B5CF6' },
  { id: 'a4', name: 'Dr. Ali — Surgeon', initials: 'AL', color: '#A855F7' },
  { id: 'a5', name: 'Zara — Practice Manager', initials: 'ZA', color: '#0EA5E9' },
] as const;

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
    detail:
      'Full vet practice OS — pet profiles, SOAP notes, lab orders, Rx-to-stock sync, branded documents, and role dashboards. Available now.',
    x: 290,
    y: 78,
    color: '#22D3EE',
    icon: 'stethoscope' as const,
    live: true,
  },
  {
    id: 'dental',
    label: 'Dental Clinic',
    detail: 'Under development',
    x: 290,
    y: 322,
    color: '#3B82F6',
    icon: 'smile' as const,
    live: false,
  },
  {
    id: 'general',
    label: 'General Clinic',
    detail: 'Under development',
    x: 110,
    y: 322,
    color: '#8B5CF6',
    icon: 'heart-pulse' as const,
    live: false,
  },
  {
    id: 'specialty',
    label: 'Specialty Clinic',
    detail: 'Under development',
    x: 110,
    y: 78,
    color: '#A855F7',
    icon: 'sparkles' as const,
    live: false,
  },
] as const;
