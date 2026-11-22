import type { ExtractedScreenshot } from '../types/check';

export const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
export const ALLOWED_IMAGE_MIME = new Set(['image/jpeg', 'image/png', 'image/webp']);

const SEBI_ID = /^IN[AHMPZ]\d{9}$/i;
const UPI_ID = /^[a-zA-Z0-9._-]{2,}@[a-zA-Z0-9]{2,}$/;

function cleanList(value: unknown, keep: (s: string) => boolean): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((v): v is string => typeof v === 'string')
    .map((s) => s.trim())
    .filter((s) => s && keep(s))
    .slice(0, 5);
}

/** Treat the model output as untrusted: keep only well-formed values so a bad read cannot fill the form with junk. */
export function sanitizeExtracted(raw: Record<string, unknown>): ExtractedScreenshot {
  return {
    messageText: typeof raw.messageText === 'string' ? raw.messageText.trim().slice(0, 4000) : '',
    links: cleanList(raw.links, (s) => s.length <= 300),
    upiIds: cleanList(raw.upiIds, (s) => UPI_ID.test(s)),
    sebiNumbers: cleanList(raw.sebiNumbers, (s) => SEBI_ID.test(s)).map((s) => s.toUpperCase()),
    amountInr: typeof raw.amountInr === 'string' ? raw.amountInr.replace(/[^\d.]/g, '').slice(0, 12) : '',
  };
}

/** Rough decoded size of a base64 string without decoding it. */
export function base64ByteLength(b64: string): number {
  const padding = b64.endsWith('==') ? 2 : b64.endsWith('=') ? 1 : 0;
  return Math.floor((b64.length * 3) / 4) - padding;
}
