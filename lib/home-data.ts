import type { LucideIcon } from 'lucide-react';
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Bell,
  Building2,
  Calendar,
  CalendarCheck,
  CheckCircle2,
  ClipboardList,
  Clock,
  CreditCard,
  FileText,
  FlaskConical,
  FolderOpen,
  LayoutDashboard,
  Mail,
  MessageSquare,
  Package,
  Receipt,
  Send,
  Shield,
  ShieldCheck,
  Stethoscope,
  TrendingUp,
  Users,
  Heart,
  ThumbsDown,
  TrendingDown,
  DollarSign,
  Search,
  Share2,
  Smartphone,
  Upload,
  UserCheck,
} from 'lucide-react';

export const NAV_LINKS = [
  { label: 'Problem', href: '#problem' },
  { label: 'Solution', href: '#solution' },
  { label: 'Dashboard', href: '#dashboard' },
  { label: 'Pricing', href: '#pricing' },
] as const;

export const SOLUTION_JOURNEY = {
  eyebrow: 'THE SOLUTION',
  headline: ['One Patient Journey. Every Workflow.', 'One Platform.'],
  subheadline:
    'Phoenix OS connects every department and automates every step so your clinic runs smarter, faster and stress-free.',
  steps: [
    {
      id: 'appointment',
      index: 1,
      title: 'Appointment',
      caption: 'Client books an appointment',
      visual: 'appointment' as const,
    },
    {
      id: 'checkin',
      index: 2,
      title: 'Check-in',
      caption: 'Patient check-in & records access',
      visual: 'checkin' as const,
    },
    {
      id: 'aiAnalysis',
      index: 3,
      title: 'AI Analysis',
      caption: 'AI listens, extracts insights instantly',
      visual: 'aiAnalysis' as const,
    },
    {
      id: 'consultation',
      index: 4,
      title: 'Consultation',
      caption: 'SOAP notes & diagnosis with AI assistance',
      visual: 'consultation' as const,
    },
    {
      id: 'treatment',
      index: 5,
      title: 'Treatment',
      caption: 'Prescriptions & lab orders generated',
      visual: 'treatment' as const,
    },
    {
      id: 'billing',
      index: 6,
      title: 'Billing',
      caption: 'Invoices created & payments recorded',
      visual: 'billing' as const,
    },
    {
      id: 'followup',
      index: 7,
      title: 'Follow-up',
      caption: 'Reminders & follow-ups scheduled automatically',
      visual: 'followup' as const,
    },
  ],
  cta: {
    headline: 'Experience the Power of an Intelligent Workflow.',
    sub: 'Phoenix OS brings every step together so your team can focus on exceptional care.',
    button: 'Book a Demo',
  },
} as const;

export type JourneyVisualKey = (typeof SOLUTION_JOURNEY.steps)[number]['visual'];

export const DASHBOARD_PREVIEW = {
  eyebrow: 'DASHBOARD PREVIEW',
  headline: ['Your clinic.', 'One live overview.'],
  subheadline:
    'Every module, every metric, every handoff — visible in a single intelligent workspace built for veterinary teams.',
} as const;

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

export const DASHBOARD_PREVIEW_STACK = [
  { id: 'live', label: 'Live overview', type: 'component' as const, visual: 'live' as const },
  { id: 'doctor', label: 'Doctor view', type: 'component' as const, visual: 'doctor' as const },
  { id: 'reception', label: 'Reception view', type: 'component' as const, visual: 'reception' as const },
] as const;

export const WORKFLOW_STEPS = [
  { id: 'arrival', label: 'Arrival', description: 'Front desk intake' },
  { id: 'appointment', label: 'Appointment / Walk-in', description: 'Queue and scheduling' },
  { id: 'consultation', label: 'Consultation', description: 'Doctor workspace' },
  { id: 'prescription', label: 'Prescription / Labs', description: 'Treatment and orders' },
  { id: 'inventory', label: 'Inventory Update', description: 'Stock and supplies' },
  { id: 'invoice', label: 'Invoice', description: 'Billing and payments' },
  { id: 'records', label: 'Secure Records', description: 'Audit-ready archive' },
] as const;

export const INTERACTIVE_WORKFLOW = {
  eyebrow: 'INTERACTIVE WORKFLOW',
  headline: ['See How Phoenix OS Powers Every', 'Step of Care.'],
  subheadline:
    'From the first appointment to follow-up and beyond, Phoenix OS connects every workflow seamlessly.',
  steps: [
    { id: 'booked', index: 1, title: 'Appointment Booked', caption: 'Owner books online or staff books instantly.' },
    { id: 'checkin', index: 2, title: 'Patient Check-In', caption: 'Quick digital check-in and history capture.' },
    { id: 'listening', index: 3, title: 'AI Starts Listening', caption: 'AI captures the conversation in real time.' },
    { id: 'soap', index: 4, title: 'SOAP Generated', caption: 'AI instantly generates structured SOAP notes.' },
    { id: 'review', index: 5, title: 'Doctor Reviews', caption: 'Doctor reviews and approves with ease.' },
    { id: 'rx', index: 6, title: 'Prescription Created', caption: 'Prescriptions are created and sent digitally.' },
    { id: 'invoice', index: 7, title: 'Invoice Generated', caption: 'Invoices are auto-created and ready to send.' },
    { id: 'followup', index: 8, title: 'Follow-up Scheduled', caption: 'Follow-ups are scheduled before they leave.' },
  ],
  advantages: [
    { title: 'Real-time AI Assistance', description: 'Captures and structures conversations automatically.' },
    { title: 'Zero Double Entry', description: 'Data flows through every step without retyping.' },
    { title: 'Stronger Client Experience', description: 'Faster visits and clearer communication.' },
    { title: 'Better Business Outcomes', description: 'Higher efficiency and measurable growth.' },
  ],
  cta: { headline: 'Experience the Power of an Intelligent Workflow.', sub: 'Phoenix OS brings every step together so your team can focus on exceptional care.', button: 'Book a Demo' },
} as const;

export const FEATURE_ECOSYSTEM = {
  eyebrow: 'FEATURE ECOSYSTEM',
  headline: ['Everything Your Clinic Needs.', 'One Intelligent Ecosystem.'],
  subheadline:
    'Phoenix OS brings every workflow, every team, and every data point together in one seamless operating system.',
  categories: [
    {
      id: 'clinical',
      title: 'Clinical Care',
      tone: 'purple' as const,
      description: 'Streamline patient care from appointment to recovery.',
      features: ['Appointments', 'Patients', 'Medical Records', 'SOAP Notes', 'Diagnostics', 'Treatments', 'Follow-ups', 'Protocols'],
    },
    {
      id: 'ai',
      title: 'AI Intelligence',
      tone: 'purple' as const,
      description: 'AI that thinks, works and helps your team every day.',
      features: ['Voice Assistant', 'AI SOAP', 'Auto Coding', 'Smart Triage', 'AI Insights', 'Predictive Alerts', 'Summary Gen', 'Task Automation'],
    },
    {
      id: 'team',
      title: 'Team & Collaboration',
      tone: 'blue' as const,
      description: 'Empower your team to work together seamlessly.',
      features: ['Staff Roles', 'Task Management', 'Internal Chat', 'Activity Log', 'Approvals', 'Shift & Roster', 'Performance', 'Documents'],
    },
    {
      id: 'business',
      title: 'Business Operations',
      tone: 'blue' as const,
      description: 'Run your clinic efficiently with powerful business tools.',
      features: ['Billing & Invoices', 'Payments', 'Inventory', 'Accounting', 'Expenses', 'Reports', 'Payroll', 'Compliance'],
    },
    {
      id: 'communication',
      title: 'Communication',
      tone: 'purple' as const,
      description: 'Stay connected with pet owners across every channel.',
      features: ['SMS', 'WhatsApp', 'Email', 'Owner Portal', 'Notifications', 'Teleconsult', 'Broadcasts', 'Surveys'],
    },
    {
      id: 'analytics',
      title: 'Analytics & Growth',
      tone: 'purple' as const,
      description: 'Make smarter decisions with real-time insights and analytics.',
      features: ['Dashboards', 'KPIs', 'Financial Reports', 'Patient Trends', 'Performance', 'Custom Reports', 'Forecasting', 'Goal Tracking'],
    },
  ],
  trustBar: [
    { label: 'Secure & Reliable', description: 'Enterprise-grade security and data protection.' },
    { label: 'Cloud Native', description: 'Access your clinic from anywhere, anytime.' },
    { label: 'Always Evolving', description: 'Regular updates with new features and improvements.' },
    { label: '24/7 Support', description: 'Real humans, whenever you need us.' },
    { label: 'Mobile Ready', description: 'Powerful experience on web, tablet and mobile.' },
  ],
} as const;

export const SECURITY_TRUST = {
  eyebrow: 'SECURITY & TRUST',
  headline: ['Security You Can Count On.', 'Trust You Can Feel.'],
  subheadline:
    'Phoenix OS protects your clinic, your clients, and your data with enterprise-grade security built into every layer.',
  features: [
    { id: 'enterprise', title: 'Enterprise-Grade Security', description: 'Multi-layered security with end-to-end encryption at every step.', side: 'left' as const },
    { id: 'cloud', title: 'Secure Cloud Infrastructure', description: 'Hosted on certified cloud infrastructure with redundancy across zones.', side: 'left' as const },
    { id: 'rbac', title: 'Role-Based Access', description: 'Granular permissions ensure the right people see the right information.', side: 'left' as const },
    { id: 'backup', title: 'Automatic Backups', description: 'Continuous backups and disaster recovery keep your data safe.', side: 'right' as const },
    { id: 'audit', title: 'Audit Logs & Monitoring', description: 'Comprehensive audit trails and real-time monitoring for accountability.', side: 'right' as const },
    { id: 'privacy', title: 'Privacy by Design', description: 'Privacy-first principles keep client and patient data confidential.', side: 'right' as const },
  ],
  compliance: ['HIPAA Ready', 'GDPR Aligned', 'Encrypted at Rest', 'SOC 2 Practices', 'RLS Protected'],
  summary: {
    headline: 'Your data is protected. Your trust is earned.',
    sub: 'Phoenix OS is committed to keeping your clinic data secure, available, and compliant.',
    items: [
      { label: 'Data Encrypted', description: 'In transit and at rest using industry-standard encryption.' },
      { label: 'Always Available', description: 'Built for reliability so your clinic never stops.' },
      { label: 'Dedicated Support', description: 'Real humans ready when you need help.' },
      { label: "We're Compliant", description: 'We continuously monitor and exceed standards.' },
    ],
  },
} as const;

export const PLATFORM_EXPANSION = {
  eyebrow: 'PLATFORM EXPANSION',
  headline: ['Built for vet clinics first.', 'Ready for', 'every clinic next.'],
  subheadline: 'One intelligent operating system. Purpose-built experiences for every healthcare specialty.',
  timeline: [
    { label: 'Live Now', clinic: 'Veterinary Clinics', note: 'Available today' },
    { label: 'In Development', clinic: 'Dental Clinics', note: 'Building now' },
    { label: 'Coming Soon', clinic: 'General Practice', note: 'On the roadmap' },
    { label: 'Coming Soon', clinic: 'Specialty Clinics', note: 'On the roadmap' },
  ],
  trustBar: [
    { label: 'Enterprise Security', description: 'Your data is protected with enterprise-grade security.' },
    { label: '99.9% Uptime', description: 'Built for reliability so your clinic never stops.' },
    { label: 'Your Data, Yours', description: 'You own your data. We keep it secure.' },
    { label: 'Real People, Real Support', description: 'Our team is here whenever you need us.' },
  ],
  cta: 'Join the Journey',
} as const;

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
    title: 'Veterinary Clinics',
    status: 'Live Now' as const,
    statusBadge: 'LIVE NOW',
    tone: 'cyan' as const,
    description:
      'Purpose-built for veterinary practices — live today with reception, clinical workflows, and billing in one workspace.',
    extendedDescription:
      'Vets get a dedicated SOAP workspace, lab order tracking, prescription-to-inventory sync, and branded PDF outputs.',
    details: [
      'Pet & owner profiles',
      'SOAP & treatment plans',
      'Vaccination reminders',
      'Lab orders & results',
      'Rx with stock deduction',
      'Branded invoices & docs',
      'Role-based dashboards',
      'Full audit trail',
    ],
    cta: 'Explore Vet Clinic',
  },
  {
    id: 'dental',
    title: 'Dental Clinics',
    status: 'In Development' as const,
    statusBadge: 'IN DEVELOPMENT',
    tone: 'purple' as const,
    description: 'Currently in development — bringing modern dental workflows to the Phoenix OS platform.',
    details: [
      'Dental charting & procedures',
      'Appointment & chair scheduling',
      'X-ray & imaging management',
      'Treatment plans & estimates',
      'Insurance claims',
      'Patient communication',
    ],
    cta: 'Learn more',
  },
  {
    id: 'general',
    title: 'General Practice',
    status: 'Coming Soon' as const,
    statusBadge: 'COMING SOON',
    tone: 'blue' as const,
    description: 'Coming soon — expanding Phoenix OS to support general practice clinics and multi-provider teams.',
    details: [
      'General consultations',
      'Chronic care management',
      'Preventive care reminders',
      'Inventory & pharmacy',
      'Billing & payments',
      'Reports & analytics',
    ],
    cta: 'Notify me',
  },
  {
    id: 'specialty',
    title: 'Specialty Clinics',
    status: 'Coming Soon' as const,
    statusBadge: 'COMING SOON',
    tone: 'orange' as const,
    description: 'Coming soon — advanced tools and specialized workflows for every veterinary specialty.',
    details: [
      'Specialty workflows',
      'Advanced diagnostics',
      'Referral management',
      'Procedure tracking',
      'Multi-location support',
      'Performance insights',
    ],
    cta: 'Notify me',
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
      { label: 'Dashboard', href: '#dashboard' },
      { label: 'Features', href: '#ecosystem' },
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
    subtitle: 'Early-access member',
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
    subtitle: 'Early-access member',
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
    subtitle: 'Early-access member',
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
    subtitle: 'Early-access member',
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
  headline: ['One patient shouldn\'t create', 'chaos.'],
  subheadline:
    'Every clinic runs on too many tools, scattered data, and manual work. Interruptions never stop. Delays cost time. And time costs revenue.',
  scrollHint: 'Scroll to experience a typical morning.',
  costCard: {
    title: 'THE COST OF CHAOS (YEARLY)',
    subtitle: 'Hidden leaks. Real impact. Every single year.',
    total: '$127,500+',
    totalLabel: 'estimated revenue lost to workflow chaos',
    totalFooterLabel: 'TOTAL LOST EVERY YEAR',
    lineItems: [
      { label: 'Missed appointments', amount: '-$24,000' },
      { label: 'Forgotten charges', amount: '-$31,000' },
      { label: 'No follow-ups', amount: '-$19,500' },
      { label: 'Admin & manual work', amount: '-$28,000' },
      { label: 'Double bookings', amount: '-$25,000' },
    ],
  },
  callout: 'And this repeats all day. Every day.',
  flow: [
    {
      id: 'appointments',
      index: '01',
      label: 'Appointments',
      icon: CalendarCheck,
      tone: 'purple' as const,
      chaos: {
        bullets: [
          'Bookings come from multiple platforms, causing double entries and missed slots.',
          'Lost time trying to find the right information.',
          'Confused schedules. Unhappy pet parents.',
        ],
        visual: 'appointments' as const,
      },
    },
    {
      id: 'records',
      index: '02',
      label: 'Patient Records',
      icon: FolderOpen,
      tone: 'orange' as const,
      chaos: {
        bullets: [
          'Patient data is scattered across different systems and files.',
          'Hard to find history when you need it most.',
          'Duplicate records and errors put patients at risk.',
        ],
        visual: 'records' as const,
      },
    },
    {
      id: 'labs',
      index: '03',
      label: 'Laboratory',
      icon: FlaskConical,
      tone: 'purple' as const,
      chaos: {
        bullets: [
          'Lab results arrive from different labs in different formats.',
          'Manual entry and transcription lead to delays and mistakes.',
          'Treatment decisions get delayed when critical results are hard to find.',
        ],
        visual: 'labs' as const,
      },
    },
    {
      id: 'inventory',
      index: '04',
      label: 'Inventory',
      icon: Package,
      tone: 'blue' as const,
      chaos: {
        bullets: [
          'Stock levels aren\'t updated in real-time across locations.',
          'Overstocks and stockouts happen constantly.',
          'Money gets tied up in inventory that\'s not moving.',
        ],
        visual: 'inventory' as const,
      },
    },
    {
      id: 'billing',
      index: '05',
      label: 'Billing',
      icon: DollarSign,
      tone: 'blue' as const,
      chaos: {
        bullets: [
          'Charges, payments, and invoices are scattered across multiple systems.',
          'Insurance claims are delayed or denied due to incomplete information.',
          'Revenue leaks go unnoticed and reconciliation takes hours every day.',
        ],
        visual: 'billing' as const,
      },
    },
    {
      id: 'discharge',
      index: '06',
      label: 'Discharge Notes',
      icon: FileText,
      tone: 'orange' as const,
      chaos: {
        bullets: [
          'Discharge summaries and notes are written manually.',
          'Important details are missed or inconsistently recorded.',
          'Follow-up instructions get lost or aren\'t communicated clearly.',
        ],
        visual: 'discharge' as const,
      },
    },
    {
      id: 'followup',
      index: '07',
      label: 'Follow-up',
      icon: Bell,
      tone: 'orange' as const,
      chaos: {
        bullets: [
          'Reminders and follow-ups rely on memory or sticky notes.',
          'Important follow-ups get missed or delayed.',
          'No clear overview of what\'s due, making it hard to stay consistent.',
        ],
        visual: 'followup' as const,
      },
    },
  ],
  impact: {
    losses: [
      { id: 'time', label: 'Time lost', icon: Clock },
      { id: 'trust', label: 'Trust lost', icon: Users },
      { id: 'revenue', label: 'Revenue lost', icon: TrendingUp },
    ],
    stats: [
      { id: 'admin', value: '2–3 hrs', label: 'lost every day to admin work', tone: 'purple' as const },
      { id: 'errors', value: '30%', label: 'appointments affected by errors', tone: 'orange' as const },
      { id: 'revenue', value: '18%', label: 'revenue lost due to inefficient workflows', tone: 'pink' as const },
    ],
  },
  consequences: [
    { id: 'days', label: 'Longer days', icon: Clock },
    { id: 'stress', label: 'Stressed teams', icon: Users },
    { id: 'clients', label: 'Frustrated clients', icon: ThumbsDown },
    { id: 'growth', label: 'Slower growth', icon: TrendingDown },
    { id: 'care', label: 'Lower quality of care', icon: Heart },
  ],
  cta: {
    lead: "You didn't become a vet to fight",
    highlight: 'broken software.',
    trailing: 'Phoenix OS is built to take the',
    trailingHighlight: 'chaos off your plate.',
    href: '#solution',
  },
} as const;

export type ProblemChaosVisualKey = (typeof PROBLEM_SECTION.flow)[number]['chaos']['visual'];
export type ProblemFlowId = (typeof PROBLEM_SECTION.flow)[number]['id'];

export type SolutionVisualKey =
  | 'appointments'
  | 'records'
  | 'labs'
  | 'inventory'
  | 'billing'
  | 'discharge'
  | 'followup';

export type SolutionTone = 'purple' | 'orange' | 'blue';

export const SOLUTION_SECTION = {
  eyebrow: 'THE SOLUTION',
  headline: ['One platform.', 'Every', 'workflow.'],
  subheadline:
    'Phoenix OS brings every part of your clinic together. Click any module to see how it solves the chaos.',
  rows: [
    {
      id: 'appointments' as const,
      icon: CalendarCheck,
      tabLabel: 'Appointments',
      moduleBadge: 'APPOINTMENTS',
      title: 'Smart scheduling.',
      titleAccent: 'Zero confusion.',
      description: 'Prevent double bookings, reduce no-shows, and keep your day perfectly organized.',
      features: [
        { icon: CalendarCheck, title: 'Real-time availability', description: 'See open slots across doctors instantly.' },
        { icon: Users, title: 'Smart reminders', description: 'Automated SMS / WhatsApp / Email reminders.' },
        { icon: BarChart3, title: 'No more double bookings', description: 'Built-in conflict detection & alerts.' },
        { icon: Clock, title: 'Better patient experience', description: 'Easy rescheduling and follow-ups.' },
      ],
      stats: [
        { icon: Calendar, value: '28', label: 'Appointments', tone: 'purple' as const },
        { icon: Users, value: '5', label: 'Doctors', tone: 'blue' as const },
        { icon: CheckCircle2, value: '92%', label: 'Utilization', tone: 'green' as const },
        { icon: Bell, value: '14', label: 'Reminders Sent', tone: 'orange' as const },
      ],
      visual: 'appointments' as const,
      tone: 'purple' as const,
    },
    {
      id: 'records' as const,
      icon: FolderOpen,
      tabLabel: 'Patient Records',
      moduleBadge: 'PATIENT RECORDS',
      title: 'Everything about your patient,',
      titleAccent: 'in one place.',
      description: 'Complete profiles, medical history, and documents — accessible in seconds.',
      features: [
        { icon: FileText, title: 'Complete patient profile', description: 'All details, history, and contacts.' },
        { icon: Activity, title: 'Medical history timeline', description: 'Track every visit and treatment.' },
        { icon: Upload, title: 'Easy file management', description: 'Upload, organize, and access instantly.' },
        { icon: ShieldCheck, title: 'Secure & accessible', description: 'Role-based access with full security.' },
      ],
      stats: [
        { icon: Users, value: '248', label: 'Total Patients', tone: 'purple' as const },
        { icon: Stethoscope, value: '5', label: 'Active Doctors', tone: 'blue' as const },
        { icon: CheckCircle2, value: '98%', label: 'Record Accuracy', tone: 'green' as const },
      ],
      statsFooter: {
        message:
          'Your data is always secure and compliant. Phoenix OS uses advanced encryption and role-based access to protect every record.',
        icon: Shield,
      },
      visual: 'records' as const,
      tone: 'purple' as const,
    },
    {
      id: 'labs' as const,
      icon: FlaskConical,
      tabLabel: 'Laboratory',
      moduleBadge: 'LABORATORY',
      title: 'Accurate results.',
      titleAccent: 'Faster decisions.',
      description: 'Automated workflows, smart validations, and instant access to critical lab insights.',
      features: [
        { icon: FlaskConical, title: 'Automated workflow', description: 'From sample collection to digital report in one flow.' },
        { icon: ShieldCheck, title: 'Smart validations', description: 'Flag abnormal values before they reach the chart.' },
        { icon: BarChart3, title: 'Real-time insights', description: 'Category trends and turnaround analytics at a glance.' },
        { icon: Bell, title: 'Critical alerts', description: 'Instant notifications for urgent lab results.' },
      ],
      stats: [
        { icon: FlaskConical, value: '25+', label: 'Test Categories', tone: 'purple' as const },
        { icon: Clock, value: '1.8 hrs', label: 'Avg Turnaround', tone: 'blue' as const },
        { icon: CheckCircle2, value: '98%', label: 'Report Accuracy', tone: 'green' as const },
        { icon: Upload, value: '100%', label: 'Digital Reports', tone: 'purple' as const },
      ],
      visual: 'labs' as const,
      tone: 'purple' as const,
    },
    {
      id: 'inventory' as const,
      icon: Package,
      tabLabel: 'Inventory',
      moduleBadge: 'INVENTORY',
      title: 'Right stock.',
      titleAccent: 'Right time.',
      description: 'Real-time tracking, smart reorder alerts, and usage insights across locations.',
      features: [
        { icon: Package, title: 'Real-time tracking', description: 'Live stock levels across every branch and store.' },
        { icon: Bell, title: 'Smart reorder alerts', description: 'Low-stock and expiry warnings before you run out.' },
        { icon: BarChart3, title: 'Usage insights', description: 'See consumption patterns and optimize ordering.' },
        { icon: Share2, title: 'Easy transfers', description: 'Move stock between locations in a few clicks.' },
      ],
      stats: [
        { icon: Package, value: '1,248', label: 'Total Items', tone: 'purple' as const },
        { icon: Building2, value: '3', label: 'Locations', tone: 'blue' as const },
        { icon: CheckCircle2, value: '98%', label: 'Stock Accuracy', tone: 'green' as const },
        { icon: TrendingUp, value: '12%', label: 'Cost Savings', tone: 'orange' as const },
      ],
      visual: 'inventory' as const,
      tone: 'blue' as const,
    },
    {
      id: 'billing' as const,
      icon: Receipt,
      tabLabel: 'Billing',
      moduleBadge: 'BILLING',
      title: 'Every charge.',
      titleAccent: 'Every detail.',
      description: 'Turn visits into invoices automatically — faster billing, clearer payments, zero revenue leaks.',
      features: [
        { icon: Receipt, title: 'Faster invoicing', description: 'Generate invoices from completed visits in one click.' },
        { icon: CreditCard, title: 'Track payments', description: 'Monitor collections, pending balances, and overdue accounts.' },
        { icon: ShieldCheck, title: 'Reduce denials', description: 'Clean claims data with fewer billing errors.' },
        { icon: BarChart3, title: 'Financial clarity', description: 'Revenue trends and payment mode insights at a glance.' },
      ],
      stats: [
        { icon: DollarSign, value: '$124,830', label: 'Billed', tone: 'purple' as const },
        { icon: CheckCircle2, value: '$93,845', label: 'Collected', tone: 'green' as const },
        { icon: Clock, value: '$22,178', label: 'Pending', tone: 'orange' as const },
        { icon: AlertTriangle, value: '$8,823', label: 'Overdue', tone: 'red' as const },
        { icon: TrendingUp, value: '96%', label: 'Claim Success Rate', tone: 'blue' as const },
      ],
      visual: 'billing' as const,
      tone: 'blue' as const,
    },
    {
      id: 'discharge' as const,
      icon: ClipboardList,
      tabLabel: 'Discharge Notes',
      moduleBadge: 'DISCHARGE NOTES',
      title: 'Clear discharge.',
      titleAccent: 'Better recovery.',
      description: 'Create comprehensive discharge summaries in minutes and ensure continuity of care.',
      features: [
        { icon: FileText, title: 'Faster documentation', description: 'Auto-fill patient data and treatment details.' },
        { icon: ClipboardList, title: 'Complete & compliant', description: 'Structured templates for every case.' },
        { icon: Send, title: 'Seamless sharing', description: 'Share notes with patients and referring doctors.' },
        { icon: TrendingUp, title: 'Better outcomes', description: 'Clear instructions lead to faster recovery.' },
      ],
      stats: [
        { icon: ClipboardList, value: '48', label: 'Total Discharges', tone: 'purple' as const },
        { icon: CheckCircle2, value: '43', label: 'Completed', tone: 'blue' as const },
        { icon: Clock, value: '3', label: 'In Progress', tone: 'orange' as const },
        { icon: AlertTriangle, value: '2', label: 'Pending Review', tone: 'red' as const },
      ],
      visual: 'discharge' as const,
      tone: 'purple' as const,
    },
    {
      id: 'followup' as const,
      icon: Bell,
      tabLabel: 'Follow-up',
      moduleBadge: 'FOLLOW-UP',
      title: 'Stay connected.',
      titleAccent: 'Improve outcomes.',
      description: 'Automated reminders and smart scheduling so every patient stays on track after their visit.',
      features: [
        { icon: Bell, title: 'Smart reminders', description: 'Automated follow-ups via SMS, WhatsApp, and email.' },
        { icon: Calendar, title: 'Easy rescheduling', description: 'One-click rescheduling when patients respond.' },
        { icon: ShieldCheck, title: 'Compliance tracking', description: 'Track due, overdue, and completed follow-ups.' },
        { icon: TrendingUp, title: 'Better retention', description: 'Improve return visits with timely outreach.' },
      ],
      stats: [
        { icon: Bell, value: '126', label: 'Due This Week', tone: 'purple' as const },
        { icon: CheckCircle2, value: '92%', label: 'Completion Rate', tone: 'green' as const },
        { icon: Clock, value: '4.2 hrs', label: 'Avg Response Time', tone: 'blue' as const },
        { icon: TrendingUp, value: '+18%', label: 'Retention Increase', tone: 'orange' as const },
      ],
      visual: 'followup' as const,
      tone: 'orange' as const,
    },
  ],
} as const;

export type SolutionRowId = (typeof SOLUTION_SECTION.rows)[number]['id'];

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
