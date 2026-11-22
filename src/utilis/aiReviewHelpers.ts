import type {
  AiMessageReviewResult,
  AiReviewVerdictCode,
  AiWarningSign,
  GroupChatReviewResult,
  GroupChatStageAssessment,
  GroupChatStageId,
  GroupChatWarningSign,
  Language,
} from '../types/check.ts';

export interface LanguageMetadata {
  code: Language;
  englishName: string;
  nativeLabel: string;
}

export const AI_LANGUAGE_META: Record<Language, LanguageMetadata> = {
  en: { code: 'en', englishName: 'English', nativeLabel: 'English' },
  'en-easy': {
    code: 'en-easy',
    englishName: 'Easy English (very short, clear everyday words)',
    nativeLabel: 'Easy English',
  },
  hi: { code: 'hi', englishName: 'Hindi', nativeLabel: 'हिन्दी' },
  mr: { code: 'mr', englishName: 'Marathi', nativeLabel: 'मराठी' },
  ta: { code: 'ta', englishName: 'Tamil', nativeLabel: 'தமிழ்' },
  bn: { code: 'bn', englishName: 'Bengali', nativeLabel: 'বাংলা' },
  te: { code: 'te', englishName: 'Telugu', nativeLabel: 'తెలుగు' },
  kn: { code: 'kn', englishName: 'Kannada', nativeLabel: 'ಕನ್ನಡ' },
  ml: { code: 'ml', englishName: 'Malayalam', nativeLabel: 'മലയാളം' },
  gu: { code: 'gu', englishName: 'Gujarati', nativeLabel: 'ગુજરાતી' },
  pa: { code: 'pa', englishName: 'Punjabi', nativeLabel: 'ਪੰਜਾਬੀ' },
  es: { code: 'es', englishName: 'Spanish', nativeLabel: 'Español' },
};

export interface AiVerdictLabels {
  verdictWarningSigns: string;
  verdictNoListedSigns: string;
  noSignsFoundNote: string;
  limitationsBody: string;
  demoDisclaimer: string;
}

const DEFAULT_EN_LABELS: AiVerdictLabels = {
  verdictWarningSigns: 'Warning signs found',
  verdictNoListedSigns: 'No listed warning signs found',
  noSignsFoundNote:
    'Even when no warning signs are listed, this does NOT prove the message, person, or offer is genuine or safe. Always verify registration and payment details on official SEBI and bank portals.',
  limitationsBody:
    'Live SEBI registration lookup, bank beneficiary verification, UPI/QR scanning, and domain ownership checks are unavailable in this review.',
  demoDisclaimer:
    'Educational pre-payment review only. Never treat an AI or demo check as confirmation of safety or official verification.',
};

const STOPWORDS_AFTER_PASSWORD =
  'with|to|for|or|and|is|are|was|were|on|in|at|from|never|not|anyone|anybody|someone|before|after|unless|until|because|only|please|kindly|here|there|that|this|these|those';

export function redactSensitiveText(
  text: string,
  options: { maskPaymentHandles?: boolean } = {}
): string {
  if (!text) return '';

  let sanitized = text
    // 1. Explicit key[:=]value pairs for PIN/OTP/password/CVV
    .replace(
      /\b(upi\s*pin|atm\s*pin|mpin|tpin|m-pin|t-pin|debit\s*pin|card\s*pin|bank\s*pin|secret\s*pin|4[- ]?digit\s*pin|6[- ]?digit\s*pin|pin|otp|one[- ]?time\s*pass(?:word|code)|password|passcode|cvv)\s*[:=]\s*\S+/gi,
      '$1: [redacted]'
    )
    // 2. Numeric codes immediately following PIN / OTP / CVV (e.g., "OTP 918273", "UPI PIN 4829", "OTP is 449911")
    .replace(
      /\b(upi\s*pin|atm\s*pin|mpin|tpin|m-pin|t-pin|debit\s*pin|card\s*pin|bank\s*pin|secret\s*pin|4[- ]?digit\s*pin|6[- ]?digit\s*pin|pin|otp|one[- ]?time\s*pass(?:word|code)|cvv)(?:\s+(?:is|no\.?|number|code))?\s+\d{3,8}\b/gi,
      '$1 [redacted]'
    )
    // 2b. Numeric codes immediately preceding PIN / OTP / CVV (e.g., "4829 is my PIN", "918273 is the OTP")
    .replace(
      /\b\d{3,8}(?=\s+(?:is|as|for)\s+(?:my|the|your)?\s*(?:upi\s*pin|atm\s*pin|mpin|tpin|m-pin|t-pin|debit\s*pin|card\s*pin|bank\s*pin|secret\s*pin|pin|otp|cvv)\b)/gi,
      '[redacted]'
    )
    // 3. Passwords/passcodes followed directly by a non-stopword credential token
    .replace(
      new RegExp(
        `\\b(password|passcode)(?:\\s+(?:is|to\\s+unlock))?\\s+(?!(?:${STOPWORDS_AFTER_PASSWORD})\\b)[a-zA-Z0-9!@#$%^&*._-]{4,}\\b`,
        'gi'
      ),
      '$1 [redacted]'
    )
    // 4. Card-like 12-19 digit grouped numbers (always redact)
    .replace(/\b(?:\d{4}[-\s]?){3,4}\d{1,4}\b/g, '[card redacted]')
    // 5. Bank account numbers (9 to 18 digits, always redact)
    .replace(/\b\d{9,18}\b/g, '[account redacted]');

  if (options.maskPaymentHandles) {
    sanitized = sanitized
      // Mask IFSC codes
      .replace(/\b[a-z]{4}0[a-z0-9]{6}\b/gi, '[IFSC redacted]')
      // Mask personal part of UPI handles while preserving @provider suffix when helpful
      .replace(/\b([a-zA-Z0-9._-]{2,})@([a-zA-Z0-9]{2,})\b/g, '[masked]@$2');
  }

  return sanitized;
}

export function redactGroupChatText(text: string): string {
  if (!text) return '';

  // 1. First redact email addresses before UPI masking so emails become [email redacted]
  let sanitized = text
    .replace(/\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b/g, '[email redacted]')
    // 2. Redact PAN identifiers (e.g. ABCDE1234F)
    .replace(/\b[A-Z]{5}\d{4}[A-Z]\b/g, '[PAN redacted]')
    // 3. Redact grouped card-like numbers and 12-digit IDs before phone/account patterns
    .replace(/\b(?:\d{4}[-\s]?){3,4}\d{1,4}\b/g, '[card redacted]')
    .replace(/\b\d{4}[\s-]\d{4}[\s-]\d{4}\b/g, '[id redacted]')
    // 4. Redact phone numbers (+country code or standalone 10-digit Indian mobile numbers) before bank account numbers
    .replace(/(?<!\w)\+\d{1,3}[\s-]?(?:\d[\s-]?){7,12}\d\b/g, '[phone redacted]')
    .replace(/(?<!\d)0?[6-9]\d{4}[\s-]?\d{5}(?!\d)/g, '[phone redacted]')
    .replace(/(?<!\d)[6-9]\d{2}[\s-]\d{3}[\s-]\d{4}(?!\d)/g, '[phone redacted]');

  // 5. Redact OTPs, PINs, passwords, CVVs, remaining account numbers, IFSCs, and UPI usernames
  sanitized = redactSensitiveText(sanitized, { maskPaymentHandles: true });

  return sanitized;
}

function scrubUnsafeVerdictClaims(text: string, maskPersonal = false): string {
  const base = maskPersonal ? redactGroupChatText(text) : redactSensitiveText(text);
  return base
    .replace(
      /\b(?:(?:looks?|seems?|appears?|is)\s+(?:100%\s+)?(?:completely\s+|totally\s+)?(?:safe|okay|ok|legitimate|genuine|verified)|(?:completely|totally|100%)\s+(?:safe|genuine|legitimate|verified))\b/gi,
      (match, offset: number, full: string) => {
        const prefix = full.slice(Math.max(0, offset - 50), offset);
        const clausePrefix = prefix.split(/[.!?\n,;]/).pop() ?? prefix;
        if (
          /\b(?:not|never|isn't|aren't|doesn't|does\s+not|do\s+not|don't|cannot|can't|neither|nor|without)\b/i.test(
            clausePrefix
          )
        ) {
          return match;
        }
        return 'requires official verification';
      }
    )
    .replace(/\bdefinitely\s+(?:a\s+)?scam\b/gi, 'shows warning signs that require caution')
    .replace(
      /\b(?:is|are)\s+(?:a\s+)?(?:scam|fraudulent)\b/gi,
      (match, offset: number, full: string) => {
        const prefix = full.slice(Math.max(0, offset - 50), offset);
        const clausePrefix = prefix.split(/[.!?\n,;]/).pop() ?? prefix;
        if (/\b(?:not|never|prove|whether|if|called)\b/i.test(clausePrefix)) {
          return match;
        }
        return 'shows warning signs that need checking';
      }
    )
    .replace(/\s+/g, ' ')
    .trim();
}

export interface RawAiReviewPayload {
  verdict?: unknown;
  plainLanguageSummary?: unknown;
  warningSigns?: unknown;
  practicalNextSteps?: unknown;
  insufficientEvidenceNote?: unknown;
}

export function validateAndSanitizeAiReview(
  raw: RawAiReviewPayload,
  _language: Language,
  labels: AiVerdictLabels = DEFAULT_EN_LABELS
): AiMessageReviewResult {
  const rawSigns = Array.isArray(raw.warningSigns) ? raw.warningSigns : [];
  const warningSigns: AiWarningSign[] = [];
  const seenPhrases = new Set<string>();

  for (const item of rawSigns) {
    if (!item || typeof item !== 'object') continue;
    const record = item as Record<string, unknown>;
    const title = scrubUnsafeVerdictClaims(String(record.title ?? '').trim(), true);
    const rawPhrase = redactGroupChatText(
      String(record.supportingPhrase ?? '')
        .replace(/\s+/g, ' ')
        .trim()
    );
    const supportingPhrase = /\b(?:pin|otp|cvv|password|passcode|mpin|tpin)\b/i.test(rawPhrase)
      ? rawPhrase.replace(/\b\d{4,8}\b(?=\s|$)/g, '[redacted]')
      : rawPhrase;
    const explanation = scrubUnsafeVerdictClaims(String(record.explanation ?? '').trim(), true);

    if (!title || !supportingPhrase || !explanation) continue;
    const key = `${title.toLowerCase()}::${supportingPhrase.toLowerCase()}`;
    if (seenPhrases.has(key)) continue;
    seenPhrases.add(key);

    warningSigns.push({
      title: title.slice(0, 120),
      supportingPhrase: supportingPhrase.slice(0, 220),
      explanation: explanation.slice(0, 420),
    });

    if (warningSigns.length >= 6) break;
  }

  const verdict: AiReviewVerdictCode =
    warningSigns.length > 0 || raw.verdict === 'warning_signs_found'
      ? 'warning_signs_found'
      : 'no_listed_signs';

  const verdictLabel =
    verdict === 'warning_signs_found'
      ? labels.verdictWarningSigns
      : labels.verdictNoListedSigns;

  const rawSummary = scrubUnsafeVerdictClaims(String(raw.plainLanguageSummary ?? '').trim(), true);
  const plainLanguageSummary =
    rawSummary ||
    (verdict === 'warning_signs_found'
      ? labels.verdictWarningSigns
      : labels.noSignsFoundNote);

  const rawSteps = Array.isArray(raw.practicalNextSteps) ? raw.practicalNextSteps : [];
  const practicalNextSteps = rawSteps
    .map((step) => scrubUnsafeVerdictClaims(String(step ?? '').trim(), true))
    .filter((step) => step.length > 0)
    .slice(0, 5);

  const rawInsufficient = scrubUnsafeVerdictClaims(
    String(raw.insufficientEvidenceNote ?? '').trim(),
    true
  );

  return {
    verdict,
    verdictLabel,
    plainLanguageSummary,
    warningSigns,
    practicalNextSteps,
    insufficientEvidenceNote: rawInsufficient ? rawInsufficient : null,
    noSafeProofNote: labels.noSignsFoundNote,
    verificationUnavailableNote: labels.limitationsBody,
    disclaimerNote: labels.demoDisclaimer,
  };
}

export const GROUP_CHAT_STAGE_IDS: GroupChatStageId[] = [
  'initial_offer',
  'trust_building',
  'app_or_group_invite',
  'payment_or_recruiting_pressure',
  'withdrawal_friction',
];

export interface GroupChatAiLabels {
  verdictWarningSigns: string;
  verdictNoListedSigns: string;
  noSafeProofNote: string;
  singlePhraseNote: string;
  stageSupportedBadge: string;
  stageNotEnoughInfoBadge: string;
  stageNotEnoughInfoDesc: string;
  stageTitles: Record<GroupChatStageId, string>;
  cannotVerifyDirectlyLabel: string;
  defaultUncheckedItems: string[];
  defaultNextSteps: string[];
  disclaimerNote: string;
}

const DEFAULT_GROUP_CHAT_EN_LABELS: GroupChatAiLabels = {
  verdictWarningSigns: 'Warning signs found',
  verdictNoListedSigns: 'No listed warning signs found',
  noSafeProofNote:
    'Not finding listed warning signs does NOT prove this conversation, group, company, app, or offer is genuine or safe.',
  singlePhraseNote:
    'A single phrase or incomplete chat is not proof of fraud. Treat noted stages as possible patterns only.',
  stageSupportedBadge: 'Pattern noted in chat',
  stageNotEnoughInfoBadge: 'Not enough information',
  stageNotEnoughInfoDesc: 'Not enough information in the pasted messages.',
  stageTitles: {
    initial_offer: '1. Initial unsolicited investment offer or social-media contact',
    trust_building:
      '2. Trust-building through claimed expertise, testimonials, screenshots, or group activity',
    app_or_group_invite: '3. Invitation to use a trading app, website, private group, or APK',
    payment_or_recruiting_pressure:
      '4. Pressure to invest more, recruit others, pay a fee, or act quickly',
    withdrawal_friction:
      '5. Withdrawal difficulties, additional charges, or requests for more money',
  },
  cannotVerifyDirectlyLabel: 'This app cannot verify this directly',
  defaultUncheckedItems: [
    'This app cannot verify this directly: Live SEBI registration status of any named firm or adviser (check investor.sebi.gov.in/Investor-support.html).',
    'This app cannot verify this directly: UPI IDs, QR codes, or bank account ownership (check siportal.sebi.gov.in/intermediary/sebi-check).',
    'This app cannot verify this directly: Authorised trading apps or external website/APK safety (check investor.sebi.gov.in/Investor-support.html).',
  ],
  defaultNextSteps: [
    'Pause before sending money, clicking unknown links, or installing external apps.',
    'Verify the exact intermediary name, registration ID, and authorised app through investor.sebi.gov.in/Investor-support.html.',
    'Verify any UPI ID, QR code, or bank/IFSC details on SEBI Check (siportal.sebi.gov.in/intermediary/sebi-check).',
    'If money has already been sent or credentials shared, contact your bank immediately and report financial cyber fraud at 1930 or cybercrime.gov.in.',
  ],
  disclaimerNote:
    'Educational screening tool only. Cannot prove that any person, group, company, offer, or message is genuine or fraudulent.',
};

export interface RawGroupChatAiPayload {
  verdict?: unknown;
  conversationSummary?: unknown;
  stages?: unknown;
  warningSigns?: unknown;
  couldNotBeChecked?: unknown;
  nextSteps?: unknown;
  contextUnclearNote?: unknown;
}

export function validateAndSanitizeGroupChatAiReview(
  raw: RawGroupChatAiPayload,
  _language: Language,
  parsedMessageCount: number,
  labels: GroupChatAiLabels = DEFAULT_GROUP_CHAT_EN_LABELS
): GroupChatReviewResult {
  const rawWarnings = Array.isArray(raw.warningSigns) ? raw.warningSigns : [];
  const warningSigns: GroupChatWarningSign[] = [];
  const seenWarn = new Set<string>();

  for (let i = 0; i < rawWarnings.length; i++) {
    const item = rawWarnings[i];
    if (!item || typeof item !== 'object') continue;
    const rec = item as Record<string, unknown>;
    const title = scrubUnsafeVerdictClaims(String(rec.title ?? '').trim(), true);
    const supportingPhrase = redactGroupChatText(
      String(rec.supportingPhrase ?? '').replace(/\s+/g, ' ').trim()
    );
    const sourceMessageLabel = redactGroupChatText(
      String(rec.sourceMessageLabel ?? '').replace(/\s+/g, ' ').trim()
    );
    const explanation = scrubUnsafeVerdictClaims(String(rec.explanation ?? '').trim(), true);
    const contextUnclearNote = scrubUnsafeVerdictClaims(
      String(rec.contextUnclearNote ?? '').trim(),
      true
    );

    if (!title || !supportingPhrase || !explanation) continue;
    const key = `${title.toLowerCase()}::${supportingPhrase.toLowerCase()}`;
    if (seenWarn.has(key)) continue;
    seenWarn.add(key);

    warningSigns.push({
      id: `ai-gc-warn-${i + 1}`,
      title: title.slice(0, 120),
      supportingPhrase: supportingPhrase.slice(0, 220),
      sourceMessageLabel: (sourceMessageLabel || 'Pasted chat').slice(0, 80),
      explanation: explanation.slice(0, 420),
      ...(contextUnclearNote ? { contextUnclearNote: contextUnclearNote.slice(0, 260) } : {}),
    });

    if (warningSigns.length >= 8) break;
  }

  const rawStagesMap = new Map<GroupChatStageId, Record<string, unknown>>();
  if (Array.isArray(raw.stages)) {
    for (const s of raw.stages) {
      if (!s || typeof s !== 'object') continue;
      const rec = s as Record<string, unknown>;
      const stageId = String(rec.id ?? '') as GroupChatStageId;
      if (GROUP_CHAT_STAGE_IDS.includes(stageId)) {
        rawStagesMap.set(stageId, rec);
      }
    }
  }

  const stages: GroupChatStageAssessment[] = GROUP_CHAT_STAGE_IDS.map((stageId) => {
    const rawStage = rawStagesMap.get(stageId);
    const rawStatus = String(rawStage?.status ?? '').toLowerCase();
    const rawPhrases = Array.isArray(rawStage?.supportingPhrases)
      ? rawStage!.supportingPhrases
          .map((p) => redactGroupChatText(String(p ?? '').replace(/\s+/g, ' ').trim()))
          .filter(Boolean)
          .slice(0, 4)
      : [];
    const rawRefs = Array.isArray(rawStage?.messageRefs)
      ? rawStage!.messageRefs
          .map((n) => Number(n))
          .filter((n) => Number.isInteger(n) && n >= 1 && n <= Math.max(1, parsedMessageCount))
      : [];
    const rawExplanation = scrubUnsafeVerdictClaims(String(rawStage?.explanation ?? '').trim(), true);

    const isSupported = rawStatus === 'supported' && rawPhrases.length > 0;

    if (isSupported) {
      return {
        id: stageId,
        title: labels.stageTitles[stageId],
        status: 'supported',
        statusLabel: labels.stageSupportedBadge,
        supportingPhrases: rawPhrases,
        messageRefs: rawRefs,
        explanation: rawExplanation || labels.stageSupportedBadge,
      };
    }

    return {
      id: stageId,
      title: labels.stageTitles[stageId],
      status: 'not_enough_info',
      statusLabel: labels.stageNotEnoughInfoBadge,
      supportingPhrases: [],
      messageRefs: [],
      explanation: labels.stageNotEnoughInfoDesc,
    };
  });

  const verdict: AiReviewVerdictCode =
    warningSigns.length > 0 || raw.verdict === 'warning_signs_found'
      ? 'warning_signs_found'
      : 'no_listed_signs';

  const verdictLabel =
    verdict === 'warning_signs_found'
      ? labels.verdictWarningSigns
      : labels.verdictNoListedSigns;

  const conversationSummary =
    scrubUnsafeVerdictClaims(String(raw.conversationSummary ?? '').trim(), true) ||
    labels.noSafeProofNote;

  const rawUnchecked = Array.isArray(raw.couldNotBeChecked)
    ? raw.couldNotBeChecked
        .map((item) => scrubUnsafeVerdictClaims(String(item ?? '').trim(), true))
        .filter(Boolean)
        .slice(0, 6)
    : [];

  const couldNotBeChecked =
    rawUnchecked.length > 0 ? rawUnchecked : labels.defaultUncheckedItems;

  const rawNextSteps = Array.isArray(raw.nextSteps)
    ? raw.nextSteps
        .map((step) => scrubUnsafeVerdictClaims(String(step ?? '').trim(), true))
        .filter(Boolean)
        .slice(0, 5)
    : [];

  const nextSteps = rawNextSteps.length > 0 ? rawNextSteps : labels.defaultNextSteps;

  const rawContextUnclear = scrubUnsafeVerdictClaims(
    String(raw.contextUnclearNote ?? '').trim(),
    true
  );

  return {
    mode: 'ai',
    verdict,
    verdictLabel,
    conversationSummary,
    stages,
    warningSigns,
    couldNotBeChecked,
    cannotVerifyDirectlyLabel: labels.cannotVerifyDirectlyLabel,
    nextSteps,
    noSafeProofNote: labels.noSafeProofNote,
    contextUnclearNote:
      rawContextUnclear || (warningSigns.length === 1 ? labels.singlePhraseNote : null),
    disclaimerNote: labels.disclaimerNote,
    parsedMessageCount,
  };
}
