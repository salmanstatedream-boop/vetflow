import { ZodError } from 'zod';

/** User-facing message from a Zod validation failure. */
export function formatZodError(err: unknown): string {
  if (err instanceof ZodError) {
    const first = err.issues[0];
    if (!first) return 'Validation failed. Please check your entries.';
    const path = first.path.length > 0 ? `${first.path.join('.')}: ` : '';
    if (first.code === 'invalid_value') {
      return `${path}${first.message}`.replace(/^lineItems\.\d+\.type: /, 'Line item type: ');
    }
    return `${path}${first.message}`;
  }
  if (err instanceof Error) return err.message;
  return 'An unexpected error occurred.';
}
