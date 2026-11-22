import type { ParsedGroupMessage } from '../types/check.ts';
import { redactGroupChatText } from './aiReviewHelpers.ts';

const NON_SPEAKER_PREFIXES =
  /^(?:http|https|otp|pin|upi|cvv|password|passcode|ifsc|sebi|note|warning|alert|disclaimer|message|amount|link|url|tip)$/i;

export function parseOptionalHeaderLine(line: string): {
  dateLabel: string | null;
  speaker: string | null;
  text: string;
  hadHeader: boolean;
} {
  const trimmed = line.trim();

  // 1. WhatsApp style: [12 Oct, 10:15 AM] Speaker: message OR 12/10/2025, 10:15 - Speaker: message
  const waBracket = trimmed.match(
    /^\[([^\]]{2,36})\]\s*([^:\n]{1,36}):\s+(.+)$/
  );
  if (waBracket && !NON_SPEAKER_PREFIXES.test(waBracket[2].trim())) {
    return {
      dateLabel: waBracket[1].trim(),
      speaker: waBracket[2].trim(),
      text: waBracket[3].trim(),
      hadHeader: true,
    };
  }

  const waDash = trimmed.match(
    /^((?:\d{1,2}[/-]\d{1,2}(?:[/-]\d{2,4})?|day\s+\d+|yesterday|today|[a-z]{3,9}\s+\d{1,2})(?:[,\s]+\d{1,2}:\d{2}(?:\s*[ap]m)?)?)\s*[-–—]\s*([^:\n]{1,36}):\s+(.+)$/i
  );
  if (waDash && !NON_SPEAKER_PREFIXES.test(waDash[2].trim())) {
    return {
      dateLabel: waDash[1].trim(),
      speaker: waDash[2].trim(),
      text: waDash[3].trim(),
      hadHeader: true,
    };
  }

  // 2. Bracketed date only without speaker: [Day 1] message
  const dateOnlyBracket = trimmed.match(/^\[([^\]]{2,30})\]\s+(.+)$/);
  if (dateOnlyBracket) {
    return {
      dateLabel: dateOnlyBracket[1].trim(),
      speaker: null,
      text: dateOnlyBracket[2].trim(),
      hadHeader: true,
    };
  }

  // 3. Speaker only: Admin: message
  const speakerOnly = trimmed.match(/^([A-Za-z0-9_ .()@-]{1,32}):\s+(.+)$/);
  if (
    speakerOnly &&
    !NON_SPEAKER_PREFIXES.test(speakerOnly[1].trim()) &&
    !/^https?$/i.test(speakerOnly[1].trim()) &&
    !/^\d+$/.test(speakerOnly[1].trim())
  ) {
    return {
      dateLabel: null,
      speaker: speakerOnly[1].trim(),
      text: speakerOnly[2].trim(),
      hadHeader: true,
    };
  }

  return {
    dateLabel: null,
    speaker: null,
    text: trimmed,
    hadHeader: false,
  };
}

export function parseGroupChatMessages(rawText: string): ParsedGroupMessage[] {
  const normalized = rawText.replace(/\r\n/g, '\n').trim();
  if (!normalized) return [];

  const rawLines = normalized.split('\n');
  const entries: Array<{ speaker: string | null; dateLabel: string | null; text: string }> = [];

  const anyLineHasHeader = rawLines.some((line) => parseOptionalHeaderLine(line).hadHeader);
  const hasBlankLineParagraphs = /\n\s*\n/.test(normalized);

  if (anyLineHasHeader) {
    for (const line of rawLines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      const parsed = parseOptionalHeaderLine(trimmed);
      if (parsed.hadHeader || entries.length === 0) {
        entries.push({
          speaker: parsed.speaker,
          dateLabel: parsed.dateLabel,
          text: parsed.text,
        });
      } else {
        // Continuation line under previous message
        entries[entries.length - 1].text = `${entries[entries.length - 1].text} ${trimmed}`.trim();
      }
    }
  } else if (hasBlankLineParagraphs) {
    const blocks = normalized
      .split(/\n\s*\n+/)
      .map((b) => b.replace(/\s*\n\s*/g, ' ').trim())
      .filter(Boolean);
    for (const block of blocks) {
      entries.push({ speaker: null, dateLabel: null, text: block });
    }
  } else {
    const lines = rawLines.map((l) => l.trim()).filter(Boolean);
    for (const line of lines) {
      entries.push({ speaker: null, dateLabel: null, text: line });
    }
  }

  return entries.slice(0, 60).map((entry, idx) => ({
    index: idx + 1,
    speaker: entry.speaker ? redactGroupChatText(entry.speaker) : null,
    dateLabel: entry.dateLabel ? redactGroupChatText(entry.dateLabel) : null,
    text: redactGroupChatText(entry.text),
  }));
}
