import { APP_URL } from './supabase';
import { supabase } from './supabase';

async function authHeaders() {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error('Not signed in');
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = await authHeaders();
  const res = await fetch(`${APP_URL}${path}`, {
    ...init,
    headers: { ...headers, ...(init?.headers || {}) },
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.success === false) {
    throw new Error(json.error || `Request failed (${res.status})`);
  }
  return json as T;
}

export type OwnerClinic = {
  linkId: string;
  customerId: string;
  organizationId: string;
  clinicName: string;
  clinicSlug: string | null;
  clinicPhone: string | null;
  clinicAddress: string | null;
  emergencyCallPrompt: string | null;
  afterHoursNote: string | null;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
};

export type OwnerMe = {
  success: true;
  user: { id: string; email?: string | null; phone?: string | null };
  isStaff: boolean;
  isOwner: boolean;
  defaultMode: 'owner' | 'staff' | 'none';
  staffOrgs: {
    organizationId: string;
    role: string;
    name: string;
    slug: string | null;
  }[];
  clinics: OwnerClinic[];
};

export type OwnerPet = {
  id: string;
  name: string;
  species: string | null;
  breed: string | null;
  color: string | null;
  gender: string | null;
  dateOfBirth: string | null;
  weightKg: number | null;
  microchipNumber: string | null;
  allergies: string | null;
  medicalNotes: string | null;
  customerId: string;
  organizationId: string;
  clinicName: string;
  clinicSlug: string | null;
  photoUrl?: string | null;
};

export type OwnerAppointment = {
  id: string;
  preferredDate: string;
  preferredTime: string;
  reason: string;
  status: string;
  source: string;
  patientName: string;
  patientSpecies: string | null;
  patientId: string | null;
  customerId: string | null;
  organizationId: string;
  clinicName: string;
  clinicSlug: string | null;
};

export type HistoryVisit = {
  id: string;
  reason: string | null;
  status: string;
  visitPurpose?: string | null;
  checkedInAt: string;
  completedAt: string | null;
  isEmergency: boolean;
  isSurgery?: boolean;
  notes: {
    chiefComplaint?: string;
    diagnosis?: string;
    treatmentPlan?: string;
    followUp?: string;
    temperatureC?: number | null;
    heartRate?: number | null;
    respiratoryRate?: number | null;
    weightKg?: number | null;
    visitType?: string | null;
    procedureNotes?: string | null;
    postOpMedication?: string | null;
  } | null;
  prescriptions: {
    id: string;
    createdAt: string;
    items: {
      medicineName?: string;
      dosage?: string;
      frequency?: string;
      duration?: string;
      instructions?: string;
    }[];
  }[];
  vaccines: {
    name: string;
    lotNumber: string | null;
    administeredAt: string | null;
    nextDueDate: string | null;
  }[];
  deworming?: {
    name: string;
    detail: string | null;
    administeredAt: string | null;
  }[];
};

export type ExternalPrescription = {
  id: string;
  clinicName: string;
  notes: string | null;
  takenAt: string | null;
  storagePath: string | null;
  fileName: string | null;
  createdAt: string;
};

export type MessageThread = {
  id: string;
  organizationId: string;
  customerId: string;
  clinicName: string;
  lastMessage: string | null;
  lastMessageAt: string;
  unreadCount: number;
};

export type ChatMessage = {
  id: string;
  body: string;
  senderType: 'owner' | 'staff';
  createdAt: string;
};

export type OwnerNotification = {
  id: string;
  kind: string;
  title: string;
  body: string;
  readAt: string | null;
  createdAt: string;
};

export type CareJourney = {
  visitId: string;
  reason: string;
  status: string;
  stageLabel: string;
  activeIndex: number;
  clinicName: string;
  steps: { title: string; subtitle?: string }[];
};

export const ownerApi = {
  me: () => request<OwnerMe>('/api/owner/me'),
  pets: () => request<{ success: true; pets: OwnerPet[] }>('/api/owner/pets'),
  history: (id: string) =>
    request<{
      success: true;
      pet: OwnerPet & {
        color?: string | null;
        microchipNumber?: string | null;
        allergies?: string | null;
        medicalNotes?: string | null;
        customerId?: string;
      };
      history: HistoryVisit[];
    }>(`/api/owner/pets/${id}/history`),
  metrics: (id: string) =>
    request<{
      success: true;
      pet: { id: string; name: string; dateOfBirth: string | null };
      series: {
        date: string;
        weightKg: number | null;
        bodyConditionScore: number | null;
        temperatureC: number | null;
        heartRateBpm: number | null;
        respiratoryRate: number | null;
        ageYears: number | null;
      }[];
    }>(`/api/owner/pets/${id}/metrics`),
  externalPrescriptions: (id: string) =>
    request<{ success: true; prescriptions: ExternalPrescription[] }>(
      `/api/owner/pets/${id}/external-prescriptions`
    ),
  addExternalPrescription: (
    id: string,
    payload: {
      clinicName: string;
      notes?: string;
      takenAt?: string;
      fileBase64?: string;
      fileName?: string;
      contentType?: string;
    }
  ) =>
    request<{ success: true; prescription: ExternalPrescription }>(
      `/api/owner/pets/${id}/external-prescriptions`,
      { method: 'POST', body: JSON.stringify(payload) }
    ),
  petPhoto: (id: string) =>
    request<{ success: true; photoUrl: string | null }>(`/api/owner/pets/${id}/photo`),
  uploadPetPhoto: (
    id: string,
    payload: { fileBase64: string; fileName?: string; contentType?: string }
  ) =>
    request<{ success: true; photoUrl: string | null; documentId: string }>(
      `/api/owner/pets/${id}/photo`,
      { method: 'POST', body: JSON.stringify(payload) }
    ),
  careJourney: (id: string) =>
    request<{ success: true; active: CareJourney | null }>(
      `/api/owner/pets/${id}/care-journey`
    ),
  appointments: () =>
    request<{ success: true; appointments: OwnerAppointment[] }>(
      '/api/owner/appointments'
    ),
  book: (payload: {
    patientId: string;
    preferredDate: string;
    preferredTime: string;
    reason: string;
  }) =>
    request<{ success: true }>('/api/owner/appointments', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  cancelAppointment: (id: string) =>
    request<{ success: true }>(`/api/owner/appointments/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ action: 'cancel' }),
    }),
  rescheduleAppointment: (
    id: string,
    preferredDate: string,
    preferredTime: string
  ) =>
    request<{ success: true }>(`/api/owner/appointments/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        action: 'reschedule',
        preferredDate,
        preferredTime,
      }),
    }),
  acceptInvite: (token: string) =>
    request<{ success: true }>('/api/owner/invites/accept', {
      method: 'POST',
      body: JSON.stringify({ token }),
    }),
  messageThreads: () =>
    request<{ success: true; threads: MessageThread[] }>('/api/owner/messages'),
  openThread: (organizationId: string, customerId?: string) =>
    request<{ success: true; threadId: string }>('/api/owner/messages', {
      method: 'POST',
      body: JSON.stringify({ organizationId, customerId }),
    }),
  threadMessages: (threadId: string) =>
    request<{ success: true; messages: ChatMessage[] }>(
      `/api/owner/messages/${threadId}`
    ),
  sendMessage: (threadId: string, body: string) =>
    request<{ success: true; message: ChatMessage }>(
      `/api/owner/messages/${threadId}`,
      { method: 'POST', body: JSON.stringify({ body }) }
    ),
  notifications: () =>
    request<{
      success: true;
      notifications: OwnerNotification[];
      unreadCount: number;
    }>('/api/owner/notifications'),
  markNotificationsRead: (all = true, ids?: string[]) =>
    request<{ success: true }>('/api/owner/notifications', {
      method: 'PATCH',
      body: JSON.stringify(all ? { all: true } : { ids }),
    }),
  bridgeStaffSession: async () => {
    const { data } = await supabase.auth.getSession();
    const session = data.session;
    if (!session) throw new Error('Not signed in');
    const headers = await authHeaders();
    const res = await fetch(`${APP_URL}/api/mobile/session`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        accessToken: session.access_token,
        refreshToken: session.refresh_token,
      }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || json.success === false) {
      throw new Error(json.error || 'Failed to open dashboard');
    }
    return json as { success: true; dashboardPath: string };
  },
};
