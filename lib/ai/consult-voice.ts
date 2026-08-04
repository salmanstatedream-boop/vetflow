import { chatCompletion } from '@/lib/ai/llm-client';

export type ConsultVoiceExtract = {
  chiefComplaint?: string;
  history?: string;
  examinationFindings?: string;
  diagnosis?: string;
  treatmentPlan?: string;
  followUpRecommendation?: string;
  temperatureC?: number;
  heartRateBpm?: number;
  respiratoryRate?: number;
  weightKg?: number;
  bodyConditionScore?: number;
  dehydrationPercent?: number;
  signVomiting?: boolean;
  signAnorexia?: boolean;
  signDiarrhoea?: boolean;
  signConstipation?: boolean;
  signVaccination?: boolean;
  signDeworming?: boolean;
  prescriptionItems?: Array<{
    medicineName: string;
    dosage?: string;
    frequency?: string;
    duration?: string;
    instructions?: string;
  }>;
};

function getGroqKey(): string | null {
  return process.env.GROQ_API_KEY || null;
}

export async function transcribeConsultAudioWithGroq(
  audio: Blob | ArrayBuffer,
  filename = 'consult.webm'
): Promise<{ text: string } | { error: string }> {
  const apiKey = getGroqKey();
  if (!apiKey) {
    return { error: 'GROQ_API_KEY is not configured.' };
  }

  const form = new FormData();
  const blob =
    audio instanceof Blob
      ? audio
      : new Blob([audio], { type: 'audio/webm' });
  form.append('file', blob, filename);
  form.append('model', process.env.GROQ_TRANSCRIBE_MODEL || 'whisper-large-v3-turbo');
  form.append('response_format', 'json');
  form.append('temperature', '0');

  const res = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}` },
    body: form,
  });

  if (!res.ok) {
    const errText = await res.text();
    return { error: `Groq transcription failed: ${res.status} ${errText.slice(0, 240)}` };
  }

  const json = (await res.json()) as { text?: string };
  const text = (json.text || '').trim();
  if (!text) return { error: 'No speech detected in the recording.' };
  return { text };
}

function parseJsonObject(raw: string): Record<string, unknown> | null {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const body = (fenced?.[1] || raw).trim();
  try {
    const parsed = JSON.parse(body);
    return parsed && typeof parsed === 'object' ? (parsed as Record<string, unknown>) : null;
  } catch {
    const start = body.indexOf('{');
    const end = body.lastIndexOf('}');
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(body.slice(start, end + 1)) as Record<string, unknown>;
      } catch {
        return null;
      }
    }
    return null;
  }
}

export async function extractConsultFieldsFromTranscript(
  transcript: string,
  context?: { petName?: string; species?: string; visitReason?: string }
): Promise<{ fields: ConsultVoiceExtract } | { error: string }> {
  const system = `You are a veterinary clinical scribe. Extract structured consultation fields from a doctor's spoken notes.
Return ONLY a JSON object with any of these keys when present:
chiefComplaint, history, examinationFindings, diagnosis, treatmentPlan, followUpRecommendation (strings),
temperatureC (body temperature in °F / Fahrenheit), heartRateBpm, respiratoryRate, weightKg, bodyConditionScore, dehydrationPercent (numbers),
signVomiting, signAnorexia, signDiarrhoea, signConstipation, signVaccination, signDeworming (booleans),
prescriptionItems (array of { medicineName, dosage, frequency, duration, instructions }).
Do not invent facts. Omit unknown keys. No markdown.`;

  const user = `Patient: ${context?.petName || 'unknown'} (${context?.species || 'unknown species'})
Visit reason: ${context?.visitReason || 'n/a'}

Transcript:
"""
${transcript}
"""`;

  const result = await chatCompletion(
    [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
    { maxTokens: 1600, temperature: 0.1 }
  );

  if ('error' in result) return { error: result.error };

  const parsed = parseJsonObject(result.content);
  if (!parsed) return { error: 'AI returned unreadable field data. Try recording again.' };

  return { fields: parsed as ConsultVoiceExtract };
}
