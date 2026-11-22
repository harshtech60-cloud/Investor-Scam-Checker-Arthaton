import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';
import type {
  AiReviewApiResponse,
  AiReviewUnavailableReason,
  Language,
} from '../types/check.ts';
import {
  AI_LANGUAGE_META,
  type AiVerdictLabels,
  type RawAiReviewPayload,
  redactGroupChatText,
  validateAndSanitizeAiReview,
} from './aiReviewHelpers.ts';

export interface RequestAiMessageReviewParams {
  messageText: string;
  language: Language;
  labels?: AiVerdictLabels;
  apiKey?: string;
  generateJson?: (args: {
    sanitizedMessage: string;
    language: Language;
    systemInstruction: string;
  }) => Promise<RawAiReviewPayload>;
}

const AI_REVIEW_RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    verdict: {
      type: Type.STRING,
      enum: ['warning_signs_found', 'no_listed_signs'],
      description:
        'Use "warning_signs_found" when specific risk indicators appear, or "no_listed_signs" otherwise.',
    },
    plainLanguageSummary: {
      type: Type.STRING,
      description:
        'Calm 2-3 sentence summary in plain language explaining what the message asks or states without calling it safe or accusing named individuals.',
    },
    warningSigns: {
      type: Type.ARRAY,
      description: 'Detected warning signs. Return an empty array if verdict is no_listed_signs.',
      items: {
        type: Type.OBJECT,
        properties: {
          title: {
            type: Type.STRING,
            description: 'Short plain-language heading for the warning sign.',
          },
          supportingPhrase: {
            type: Type.STRING,
            description:
              'Exact short supporting quote copied from the sanitized message text. Keep any [redacted] placeholders and never echo numeric secrets.',
          },
          explanation: {
            type: Type.STRING,
            description: 'Simple 1-2 sentence explanation in the requested language.',
          },
        },
        required: ['title', 'supportingPhrase', 'explanation'],
      },
    },
    practicalNextSteps: {
      type: Type.ARRAY,
      description: '2 to 4 calm, practical next steps for verification or safety.',
      items: { type: Type.STRING },
    },
    insufficientEvidenceNote: {
      type: Type.STRING,
      description:
        'Clear note explaining what evidence is missing if the pasted text is too short or lacks verifiable company/registration/payment details. Use empty string if text is detailed enough.',
    },
  },
  required: [
    'verdict',
    'plainLanguageSummary',
    'warningSigns',
    'practicalNextSteps',
    'insufficientEvidenceNote',
  ],
};

export function buildAiSystemInstruction(language: Language): string {
  const meta = AI_LANGUAGE_META[language] ?? AI_LANGUAGE_META.en;
  return [
    `You are an educational financial-scam awareness assistant helping Indian retail investors and their families pause and inspect suspicious messages.`,
    `Write ALL JSON text values in ${meta.englishName} (${meta.nativeLabel}).`,
    `Assess each sentence carefully in context and honor negation:`,
    `- Protective advice such as "Never share your OTP, UPI PIN, or password" or "Banks never ask for your PIN" is a safety warning, NOT a warning sign of asking for a secret.`,
    `- Neutral descriptions such as "Your bank sends an OTP to confirm logins" are descriptive, NOT a warning sign.`,
    `- Explaining "Stock market returns are not guaranteed" or warning "Beware of guaranteed returns" is NOT a profit guarantee pitch.`,
    `- Telling someone "Do not rush to pay" is anti-urgency safety advice, NOT urgency pressure.`,
    `- Flag real requests for an OTP/PIN/CVV/password/remote-access app, claims that you must enter a UPI PIN or scan a QR code to receive money or refunds, guaranteed or unusually high return promises, urgent payment pressure ("today only", "pay immediately"), VIP/pre-IPO lures, off-platform Telegram/WhatsApp/APK install requests, or upfront unlock/tax fees — even if accompanied by "don't worry" or "this is safe".`,
    `Official guidance boundaries (SEBI, RBI, NPCI):`,
    `- Never treat an "@valid" UPI mention, HTTPS padlock, familiar brand name, or polished brochure as proof of legitimacy or safety. Explain that "@valid" handles and claimed SEBI numbers must still be verified directly on SEBI Check (siportal.sebi.gov.in) or investor.sebi.gov.in, and that SEBI registration never guarantees investment performance or returns.`,
    `- Emphasize checking the bank-verified recipient name and exact amount before approving any UPI or bank transfer.`,
    `- Direct complaints about SEBI-registered intermediaries to SEBI SCORES (scores.sebi.gov.in); for general cyber, UPI, or banking fraud — or if money was already sent — advise contacting the bank/payment provider immediately, dialing 1930, and reporting on cybercrime.gov.in.`,
    `Strict safety and honesty boundaries:`,
    `- Never call any person, company, app, or message "safe", "genuine", "verified", or definitively "a scam".`,
    `- Never claim you checked live SEBI, NPCI, UPI, bank, or website records — state clearly that live verification is unavailable here.`,
    `- Never invent confidence scores, probabilities, or risk percentages.`,
    `- Never output raw PINs, OTPs, passwords, CVVs, or full bank account/card numbers; preserve "[redacted]" markers.`,
    `- When text does not contain enough evidence to judge registration or legitimacy, state that clearly in insufficientEvidenceNote.`,
  ].join('\n');
}

export function classifyUnavailableReason(error: unknown): AiReviewUnavailableReason {
  const msg = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
  const status =
    typeof error === 'object' && error !== null && 'status' in error
      ? Number((error as { status?: unknown }).status)
      : NaN;

  if (
    status === 402 ||
    status === 403 ||
    status === 429 ||
    /quota|billing|resource_exhausted|permission|api key not valid/i.test(msg)
  ) {
    return 'quota_or_billing';
  }
  return 'upstream_error';
}

export async function requestAiMessageReview({
  messageText,
  language,
  labels,
  apiKey = process.env.GEMINI_API_KEY,
  generateJson,
}: RequestAiMessageReviewParams): Promise<AiReviewApiResponse> {
  const trimmed = typeof messageText === 'string' ? messageText.trim() : '';
  if (!trimmed) {
    return {
      ok: false,
      available: false,
      reason: 'empty_message',
      message: 'Please paste a message before requesting a plain-language AI review.',
    };
  }

  // Redact OTPs, PINs, passwords, CVVs, account/card numbers, phones, emails, PANs, IFSCs, and UPI usernames before sending anywhere
  const sanitizedMessage = redactGroupChatText(trimmed).slice(0, 4000);
  const systemInstruction = buildAiSystemInstruction(language);

  if (!generateJson && (!apiKey || !apiKey.trim())) {
    return {
      ok: false,
      available: false,
      reason: 'not_configured',
      message:
        'AI plain-language review is unavailable because server AI credentials are not configured.',
    };
  }

  try {
    let rawPayload: RawAiReviewPayload;

    if (generateJson) {
      rawPayload = await generateJson({
        sanitizedMessage,
        language,
        systemInstruction,
      });
    } else {
      const ai = new GoogleGenAI({
        apiKey: apiKey!.trim(),
        httpOptions: {
          timeout: 10000,
          headers: { 'User-Agent': 'aistudio-build' },
        },
      });

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: `Analyze this pasted investment or payment message for warning signs in context:\n\n${sanitizedMessage}`,
        config: {
          systemInstruction,
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          responseMimeType: 'application/json',
          responseSchema: AI_REVIEW_RESPONSE_SCHEMA,
        },
      });

      const responseText = response.text;
      if (!responseText) {
        return {
          ok: false,
          available: false,
          reason: 'upstream_error',
          message: 'AI review returned an empty response and is temporarily unavailable.',
        };
      }
      rawPayload = JSON.parse(responseText) as RawAiReviewPayload;
    }

    const review = validateAndSanitizeAiReview(rawPayload, language, labels);
    return {
      ok: true,
      review,
    };
  } catch (error) {
    const reason = classifyUnavailableReason(error);
    return {
      ok: false,
      available: false,
      reason,
      message:
        reason === 'quota_or_billing'
          ? 'AI plain-language review is unavailable due to API quota or billing limits.'
          : 'AI plain-language review is temporarily unavailable. Please use the demo check and official SEBI portals.',
    };
  }
}
