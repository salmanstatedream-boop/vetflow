'use server';

import { resolveServerAuthContext, assertCapability } from '@/lib/auth/context';
import {
  extractConsultFieldsFromTranscript,
  transcribeConsultAudioWithGroq,
  type ConsultVoiceExtract,
} from '@/lib/ai/consult-voice';

export async function extractConsultationFromAudioAction(formData: FormData): Promise<
  | { success: true; transcript: string; fields: ConsultVoiceExtract }
  | { success: false; error: string }
> {
  try {
    const ctx = await resolveServerAuthContext();
    if (!ctx) return { success: false, error: 'Unauthorized.' };
    assertCapability(ctx, 'clinical_queue');

    if (!process.env.GROQ_API_KEY) {
      return {
        success: false,
        error: 'GROQ_API_KEY is not configured. Add it to enable voice fill.',
      };
    }

    const file = formData.get('audio');
    if (!(file instanceof File) || file.size === 0) {
      return { success: false, error: 'No audio recording received.' };
    }
    if (file.size > 25 * 1024 * 1024) {
      return { success: false, error: 'Recording is too large (max 25MB).' };
    }

    const petName = String(formData.get('petName') || '');
    const species = String(formData.get('species') || '');
    const visitReason = String(formData.get('visitReason') || '');

    const transcribed = await transcribeConsultAudioWithGroq(
      file,
      file.name || 'consult.webm'
    );
    if ('error' in transcribed) return { success: false, error: transcribed.error };

    const extracted = await extractConsultFieldsFromTranscript(transcribed.text, {
      petName,
      species,
      visitReason,
    });
    if ('error' in extracted) return { success: false, error: extracted.error };

    return {
      success: true,
      transcript: transcribed.text,
      fields: extracted.fields,
    };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Voice extraction failed.',
    };
  }
}
