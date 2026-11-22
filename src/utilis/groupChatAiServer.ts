import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';
import type {
  AiReviewUnavailableReason,
  GroupChatAiApiResponse,
  Language,
} from '../types/check.ts';
import {
  AI_LANGUAGE_META,
  type GroupChatAiLabels,
  type RawGroupChatAiPayload,
  redactGroupChatText,
  validateAndSanitizeGroupChatAiReview,
} from './aiReviewHelpers.ts';
import { parseGroupChatMessages } from './groupChatParser.ts';

export interface RequestGroupChatAiReviewParams {
  conversationText: string;
  language: Language;
  labels?: GroupChatAiLabels;
  apiKey?: string;
  generateJson?: (args: {
    sanitizedConversation: string;
    parsedMessageCount: number;
    language: Language;
    systemInstruction: string;
  }) => Promise<RawGroupChatAiPayload>;
}

const GROUP_CHAT_AI_RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    verdict: {
      type: Type.STRING,
      enum: ['warning_signs_found', 'no_listed_signs'],
      description:
        'Use "warning_signs_found" when concrete risk indicators appear, or "no_listed_signs" otherwise.',
    },
    conversationSummary: {
      type: Type.STRING,
      description:
        'Neutral 2-3 sentence summary describing what the messages state or request without accusing speakers or calling any offer safe or a scam.',
    },
    stages: {
      type: Type.ARRAY,
      description:
        'Assess each of the 5 possible stages: initial_offer, trust_building, app_or_group_invite, payment_or_recruiting_pressure, withdrawal_friction. Only mark status="supported" when text directly supports it; otherwise mark status="not_enough_info".',
      items: {
        type: Type.OBJECT,
        properties: {
          id: {
            type: Type.STRING,
            enum: [
              'initial_offer',
              'trust_building',
              'app_or_group_invite',
              'payment_or_recruiting_pressure',
              'withdrawal_friction',
            ],
          },
          status: {
            type: Type.STRING,
            enum: ['supported', 'not_enough_info'],
          },
          supportingPhrases: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          messageRefs: {
            type: Type.ARRAY,
            items: { type: Type.INTEGER },
          },
          explanation: {
            type: Type.STRING,
          },
        },
        required: ['id', 'status', 'supportingPhrases', 'messageRefs', 'explanation'],
      },
    },
    warningSigns: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          supportingPhrase: { type: Type.STRING },
          sourceMessageLabel: { type: Type.STRING },
          explanation: { type: Type.STRING },
          contextUnclearNote: { type: Type.STRING },
        },
        required: ['title', 'supportingPhrase', 'sourceMessageLabel', 'explanation'],
      },
    },
    couldNotBeChecked: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    nextSteps: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    contextUnclearNote: {
      type: Type.STRING,
    },
  },
  required: [
    'verdict',
    'conversationSummary',
    'stages',
    'warningSigns',
    'couldNotBeChecked',
    'nextSteps',
    'contextUnclearNote',
  ],
};

export function buildGroupChatAiSystemInstruction(language: Language): string {
  const meta = AI_LANGUAGE_META[language] ?? AI_LANGUAGE_META.en;
  return [
    'You are an educational investor-awareness assistant reviewing a multi-message conversation excerpt.',
    `Write ALL JSON text values in ${meta.englishName} (${meta.nativeLabel}) using short, clear sentences suitable for first-time investors and older adults.`,
    'Conversation stage guidance (possible patterns ONLY — never a fixed script):',
    '1. initial_offer: Initial unsolicited investment offer or social-media contact.',
    '2. trust_building: Trust-building through claimed expertise, testimonials, profit screenshots, or group activity.',
    '3. app_or_group_invite: Invitation to use a trading app, website, private group, or APK.',
    '4. payment_or_recruiting_pressure: Pressure to invest more, recruit others, pay a fee, or act quickly.',
    '5. withdrawal_friction: Withdrawal difficulties, additional charges, or requests for more money.',
    'Rules for accuracy, context, and fairness:',
    '- A chat may show one stage, several, or none. Mark any unsupported or unclear stage as status="not_enough_info". Never invent missing stages.',
    '- Never infer guilt from speaker role labels, writing style, language, identity, or group membership.',
    '- Honor negation and context: "Never share your OTP, PIN, or password" is a protective safety warning, NOT a warning sign.',
    '- Treat neutral mentions of UPI, OTPs, returns, trading apps, or SEBI as neutral unless message meaning shows concern.',
    '- Do NOT treat "this is safe", "not a scam", or "do not worry" as proof a message is genuine.',
    '- Do NOT treat a single suspicious phrase as proof of fraud; note clearly when context is unclear or evidence is incomplete.',
    '- Never call any person, group, company, message, app, or offer "safe", "genuine", "verified", "fraudulent", or "a scam".',
    '- Never invent confidence scores or pretend to perform live checks. State "This app cannot verify this directly" for live SEBI/app/UPI/domain verification and cite official sources: investor.sebi.gov.in/spot-any-scam.html, investor.sebi.gov.in/pdf/Fake%20trading%20app%20scam%20Landscape.pdf, investor.sebi.gov.in/Investor-support.html, siportal.sebi.gov.in/intermediary/sebi-check, and cybercrime.gov.in (1930).',
    '- Preserve all [redacted] placeholders and never output OTPs, PINs, passwords, CVVs, account/card numbers, phones, emails, or personal UPI usernames.',
  ].join('\n');
}

function classifyUnavailableReason(error: unknown): AiReviewUnavailableReason {
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

export async function requestGroupChatAiReview({
  conversationText,
  language,
  labels,
  apiKey = process.env.GEMINI_API_KEY,
  generateJson,
}: RequestGroupChatAiReviewParams): Promise<GroupChatAiApiResponse> {
  const trimmed = typeof conversationText === 'string' ? conversationText.trim() : '';
  if (!trimmed) {
    return {
      ok: false,
      available: false,
      reason: 'empty_message',
      message: 'Please paste a conversation before requesting a Gemini review.',
    };
  }

  // Redact secrets and personal identifiers BEFORE formatting prompt or sending to Gemini
  const parsed = parseGroupChatMessages(trimmed);
  const formattedLines = parsed.map((m) => {
    const meta = [m.speaker, m.dateLabel].filter(Boolean).join(' · ');
    return meta ? `[Message ${m.index} | ${meta}]: ${m.text}` : `[Message ${m.index}]: ${m.text}`;
  });
  const sanitizedConversation = redactGroupChatText(formattedLines.join('\n')).slice(0, 6500);
  const systemInstruction = buildGroupChatAiSystemInstruction(language);

  if (!generateJson && (!apiKey || !apiKey.trim())) {
    return {
      ok: false,
      available: false,
      reason: 'not_configured',
      message:
        'Gemini review is unavailable because server AI credentials are not configured. You can use the local demo check instead.',
    };
  }

  try {
    let rawPayload: RawGroupChatAiPayload;

    if (generateJson) {
      rawPayload = await generateJson({
        sanitizedConversation,
        parsedMessageCount: parsed.length,
        language,
        systemInstruction,
      });
    } else {
      const ai = new GoogleGenAI({
        apiKey: apiKey!.trim(),
        httpOptions: {
          timeout: 12000,
          headers: { 'User-Agent': 'aistudio-build' },
        },
      });

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: `Review these redacted conversation messages together:\n\n${sanitizedConversation}`,
        config: {
          systemInstruction,
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          responseMimeType: 'application/json',
          responseSchema: GROUP_CHAT_AI_RESPONSE_SCHEMA,
        },
      });

      const responseText = response.text;
      if (!responseText) {
        return {
          ok: false,
          available: false,
          reason: 'upstream_error',
          message: 'Gemini returned an empty response. Please use the local demo check.',
        };
      }
      rawPayload = JSON.parse(responseText) as RawGroupChatAiPayload;
    }

    const review = validateAndSanitizeGroupChatAiReview(
      rawPayload,
      language,
      parsed.length,
      labels
    );

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
          ? 'Gemini review is unavailable due to API quota or billing limits. Use the local demo check instead.'
          : 'Gemini review is temporarily unavailable. Use the local demo check and official verification portals.',
    };
  }
}
