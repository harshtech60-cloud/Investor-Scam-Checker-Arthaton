import type {
  GroupChatReviewResult,
  GroupChatStageAssessment,
  GroupChatStageId,
  GroupChatWarningSign,
  Language,
  ParsedGroupMessage,
} from '../types/check';
import { getCopy } from '../data/translations';
import { GROUP_CHAT_STAGE_IDS, redactGroupChatText } from './aiReviewHelpers';
import {
  ANTI_RUSH_CLAUSE,
  EDUCATIONAL_WARNING_CLAUSE,
  FEES_PATTERN,
  GROUP_APP_PATTERN,
  MULTIPLIER_PROMISE_PATTERN,
  NON_GUARANTEED_RETURN_CLAUSE,
  RETURN_PROMISE_PATTERN,
  SEBI_REGEX,
  UPI_REGEX,
  URGENCY_PRESSURE_PATTERN,
  VIP_PATTERN,
  detectPinToReceivePhrase,
  detectSecretRequestPhrase,
  splitSentencesAndClauses,
  stripSenderReassurance,
} from './analyzer';
import { parseGroupChatMessages, parseOptionalHeaderLine } from './groupChatParser.ts';
export { parseGroupChatMessages, parseOptionalHeaderLine };

const INITIAL_OFFER_PATTERN =
  /\b(?:unsolicited|added\s+(?:you|me|us)?\s*to\s+(?:this|the|our)?\s*(?:stock|trading|ipo|vip|investment)\s*group|welcome\s+to\s+(?:our|the)?\s*(?:vip|trading|stock|profit|wealth)\s*(?:group|desk|club)|daily\s+(?:profit|returns?|calls?|tips?)|block\s+deal\s+allocation|institutional\s+quota|pre[- ]?ipo\s+(?:allotment|quota)|upper[- ]?circuit\s+picks?|free\s+(?:stock|intraday|options)\s+tips)\b/i;

const TRUST_BUILDING_PATTERN =
  /\b(?:profit\s+screenshot|booked\s+(?:₹|rs\.?|inr)?\s*[\d,]+\s*(?:profit|today)|earned\s+(?:₹|rs\.?|inr)?\s*[\d,]+|100%\s+accuracy|accurate\s+calls?|never\s+misses?|thanks?\s+(?:to\s+)?(?:sir|mentor|guruji|admin|mam|ma'am)|joined\s+last\s+week\s+and\s+(?:doubled|earned|made)|sebi\s+(?:certified|approved|verified)\s+(?:vip|desk|group|mentor)|verified\s+by\s+sebi)\b/i;

const APK_OR_EXTERNAL_LINK_PATTERN =
  /\.(?:apk)(?:$|[?#/\s])|\b(?:install|download)\s+(?:our|this|the)?\s*(?:private|special|institutional|pro|vip)?\s*(?:trading\s+)?(?:app|apk|portal)\b|https?:\/\/[^\s]+/i;

const SAFE_OFFICIAL_APP_MENTION =
  /\b(?:google\s+play\s+store|apple\s+app\s+store|official\s+broker\s+app|investor\.sebi\.gov\.in|sebi\.gov\.in|cybercrime\.gov\.in|rbi\.org\.in|npci\.org\.in|scores\.sebi\.gov\.in|siportal\.sebi\.gov\.in)\b/i;

const RECRUIT_OR_MORE_CAPITAL_PATTERN =
  /\b(?:add\s+\d+\s+friends?|refer\s+(?:friends?|others?|members?)|referral\s+(?:bonus|commission)|recruit\s+(?:more|members)|upgrade\s+(?:your\s+)?(?:vip\s+)?tier|invest\s+(?:minimum|at\s+least|more)|top[- ]?up\s+(?:your\s+)?(?:margin|account)|send\s+(?:₹|rs\.?|inr)\s*[\d,]+\s+(?:now|today|immediately))\b/i;

const WITHDRAWAL_FRICTION_PATTERN =
  /\b(?:withdrawal\s+(?:is\s+)?(?:stuck|pending|frozen|blocked|locked|held|on\s+hold|failed)|cannot\s+withdraw|can't\s+withdraw|unable\s+to\s+withdraw|account\s+(?:is\s+)?(?:frozen|locked|blocked)|release\s+(?:your\s+)?(?:funds?|profit|profits|withdrawal)|unlock\s+(?:your\s+)?(?:withdrawal|profit|funds?|account)|pay\s+(?:\d+\s*%\s*)?(?:tax|gst|commission|unlock\s+fee|processing\s+fee|verification\s+fee|security\s+deposit)\s+(?:first|before|to\s+(?:withdraw|release|unlock)))\b/i;

const REASSURANCE_CLAIM_PATTERN =
  /\b(?:this\s+is\s+(?:100%\s+)?(?:completely\s+|totally\s+)?safe|not\s+a\s+scam|no\s+scam|do\s+not\s+worry|don't\s+worry|100%\s+genuine\s+(?:and\s+)?safe)\b/i;


function formatMessageSourceLabel(
  msg: ParsedGroupMessage,
  messageNumberLabel: (n: number) => string
): string {
  const base = messageNumberLabel(msg.index);
  const metaParts = [msg.speaker, msg.dateLabel].filter(Boolean) as string[];
  if (metaParts.length === 0) return base;
  return `${base} (${metaParts.join(' · ')})`;
}

export function analyzeGroupChat(rawText: string, language: Language): GroupChatReviewResult {
  const copy = getCopy(language);
  const gc = copy.groupChat;
  const messages = parseGroupChatMessages(rawText);

  const stageMatches = new Map<
    GroupChatStageId,
    { phrases: Set<string>; refs: Set<number> }
  >(
    GROUP_CHAT_STAGE_IDS.map((id) => [
      id,
      { phrases: new Set<string>(), refs: new Set<number>() },
    ])
  );

  const warningSigns: GroupChatWarningSign[] = [];
  const seenWarnings = new Set<string>();

  const addStageEvidence = (stageId: GroupChatStageId, phrase: string, msgIndex: number) => {
    const clean = redactGroupChatText(phrase.replace(/\s+/g, ' ').trim());
    if (!clean) return;
    const entry = stageMatches.get(stageId)!;
    if (entry.phrases.size < 4) entry.phrases.add(clean);
    entry.refs.add(msgIndex);
  };

  const addWarning = (
    id: string,
    phrase: string,
    msg: ParsedGroupMessage,
    spec: { title: string; explanation: string },
    contextUnclearNote?: string
  ) => {
    const cleanPhrase = redactGroupChatText(phrase.replace(/\s+/g, ' ').trim());
    if (!cleanPhrase) return;
    const key = `${id}:${msg.index}:${cleanPhrase.toLowerCase()}`;
    if (seenWarnings.has(key) || warningSigns.length >= 12) return;
    seenWarnings.add(key);

    warningSigns.push({
      id,
      title: spec.title,
      supportingPhrase: cleanPhrase.slice(0, 180),
      sourceMessageLabel: formatMessageSourceLabel(msg, gc.messageNumberLabel),
      explanation: spec.explanation,
      ...(contextUnclearNote ? { contextUnclearNote } : {}),
    });
  };

  let sawSebiClaim = false;
  let sawLinkOrApp = false;
  let sawPaymentHandle = false;
  let sawAnySpeakers = false;
  let sawAnyDates = false;

  const detectedTopics = new Set<string>();

  for (const msg of messages) {
    if (msg.speaker) sawAnySpeakers = true;
    if (msg.dateLabel) sawAnyDates = true;
    if (SEBI_REGEX.test(msg.text) || /\bsebi\b/i.test(msg.text)) sawSebiClaim = true;
    if (/https?:\/\/|\.[a-z]{2,}\/|\.(?:apk)\b/i.test(msg.text)) sawLinkOrApp = true;
    if (UPI_REGEX.test(msg.text) || /\b(?:imps|neft|rtgs|bank account|ifsc|upi)\b/i.test(msg.text)) {
      sawPaymentHandle = true;
    }

    const units = splitSentencesAndClauses(msg.text);
    for (const unit of units) {
      const rawClause = unit.raw;
      const cleaned = stripSenderReassurance(rawClause);
      if (!cleaned) continue;

      const isEducationalWarning = EDUCATIONAL_WARNING_CLAUSE.test(cleaned);
      const isAntiRush = ANTI_RUSH_CLAUSE.test(cleaned);
      const isNonGuaranteed =
        NON_GUARANTEED_RETURN_CLAUSE.test(cleaned) ||
        (unit.isQuestion && !/\b(?:earn|get|make|unlock|join|pay|deposit)\b/i.test(cleaned));

      // 1. Secret requests vs protective warnings / neutral mentions
      const pinReceive = detectPinToReceivePhrase(rawClause);
      if (pinReceive) {
        addWarning('pin-to-receive', pinReceive, msg, gc.warningExplanations.pinToReceive);
        addStageEvidence('payment_or_recruiting_pressure', pinReceive, msg.index);
        detectedTopics.add('payment/PIN request');
      } else {
        const secretReq = detectSecretRequestPhrase(rawClause);
        if (secretReq) {
          addWarning('secret-request', secretReq, msg, gc.warningExplanations.secretRequest);
          addStageEvidence('payment_or_recruiting_pressure', secretReq, msg.index);
          detectedTopics.add('OTP/PIN/credential request');
        }
      }

      // 2. Return promises vs explaining returns are not guaranteed
      if (!isNonGuaranteed) {
        const guaranteed = cleaned.match(RETURN_PROMISE_PATTERN)?.[0];
        if (guaranteed) {
          addWarning('guaranteed-return', guaranteed, msg, gc.warningExplanations.guaranteedReturn);
          addStageEvidence('initial_offer', guaranteed, msg.index);
          detectedTopics.add('return promises');
        }

        const multiplier = cleaned.match(MULTIPLIER_PROMISE_PATTERN)?.[0];
        if (multiplier) {
          addWarning('multiplier-return', multiplier, msg, gc.warningExplanations.multiplierReturn);
          addStageEvidence('initial_offer', multiplier, msg.index);
          detectedTopics.add('high return figures');
        }
      }

      // 3. Initial unsolicited offer / VIP pitch (skip protective warnings)
      if (!isEducationalWarning) {
        const initOffer = cleaned.match(INITIAL_OFFER_PATTERN)?.[0];
        if (initOffer) {
          addStageEvidence('initial_offer', initOffer, msg.index);
          detectedTopics.add('investment group pitch');
        }

        const vipMatch = cleaned.match(VIP_PATTERN)?.[0];
        if (vipMatch) {
          addWarning('vip-pitch', vipMatch, msg, gc.warningExplanations.vipPitch);
          addStageEvidence('initial_offer', vipMatch, msg.index);
          detectedTopics.add('VIP/quota claims');
        }
      }

      // 4. Trust-building (testimonials, profit screenshots, SEBI-verified desk claims)
      if (!isEducationalWarning) {
        const trustMatch = cleaned.match(TRUST_BUILDING_PATTERN)?.[0];
        if (trustMatch) {
          addWarning(
            'trust-hype',
            trustMatch,
            msg,
            gc.warningExplanations.testimonialOrProofHype
          );
          addStageEvidence('trust_building', trustMatch, msg.index);
          detectedTopics.add('profit screenshots or testimonials');
        }
      }

      // 5. Invitation to trading app, website, private group, or APK (ignore safe Play Store / official portal references)
      if (!isEducationalWarning && !SAFE_OFFICIAL_APP_MENTION.test(cleaned)) {
        const groupAppMatch = cleaned.match(GROUP_APP_PATTERN)?.[0];
        if (groupAppMatch) {
          addWarning(
            'off-platform-group',
            groupAppMatch,
            msg,
            gc.warningExplanations.offPlatformOrApk
          );
          addStageEvidence('app_or_group_invite', groupAppMatch, msg.index);
          detectedTopics.add('private group or app invitation');
        } else {
          const apkLinkMatch = cleaned.match(APK_OR_EXTERNAL_LINK_PATTERN)?.[0];
          if (apkLinkMatch && /\.apk|\b(?:install|download)\b/i.test(cleaned)) {
            addWarning(
              'apk-or-app-link',
              apkLinkMatch,
              msg,
              gc.warningExplanations.offPlatformOrApk
            );
            addStageEvidence('app_or_group_invite', apkLinkMatch, msg.index);
            detectedTopics.add('external app/APK link');
          }
        }
      }

      // 6. Urgency / capital / recruiting pressure
      if (!isAntiRush && !isEducationalWarning) {
        const urgencyMatch = cleaned.match(URGENCY_PRESSURE_PATTERN)?.[0];
        if (urgencyMatch) {
          addWarning('urgency-pressure', urgencyMatch, msg, gc.warningExplanations.urgencyPressure);
          addStageEvidence('payment_or_recruiting_pressure', urgencyMatch, msg.index);
          detectedTopics.add('urgent payment pressure');
        }
      }

      if (!isEducationalWarning) {
        const recruitMatch = cleaned.match(RECRUIT_OR_MORE_CAPITAL_PATTERN)?.[0];
        if (recruitMatch) {
          addWarning(
            'recruit-or-topup',
            recruitMatch,
            msg,
            gc.warningExplanations.recruitmentPressure
          );
          addStageEvidence('payment_or_recruiting_pressure', recruitMatch, msg.index);
          detectedTopics.add('recruiting or deposit requests');
        }
      }

      // 7. Withdrawal difficulties, taxes, unlock/upfront fees
      if (!isEducationalWarning) {
        const withdrawalMatch = cleaned.match(WITHDRAWAL_FRICTION_PATTERN)?.[0];
        if (withdrawalMatch) {
          addWarning(
            'withdrawal-friction',
            withdrawalMatch,
            msg,
            gc.warningExplanations.upfrontOrWithdrawalFee
          );
          addStageEvidence('withdrawal_friction', withdrawalMatch, msg.index);
          detectedTopics.add('withdrawal hold or fee demand');
        } else {
          const feeMatch = cleaned.match(FEES_PATTERN)?.[0];
          if (feeMatch) {
            addWarning(
              'upfront-fee',
              feeMatch,
              msg,
              gc.warningExplanations.upfrontOrWithdrawalFee
            );
            if (/withdraw|unlock|release|tax|gst|margin/i.test(feeMatch)) {
              addStageEvidence('withdrawal_friction', feeMatch, msg.index);
            } else {
              addStageEvidence('payment_or_recruiting_pressure', feeMatch, msg.index);
            }
            detectedTopics.add('upfront or unlock fee mention');
          }
        }
      }

      // 8. Reassurance claims alongside any stage/warning evidence
      if (!isEducationalWarning) {
        const reassuranceMatch = rawClause.match(REASSURANCE_CLAIM_PATTERN)?.[0];
        const msgHasPitchOrRequest =
          RETURN_PROMISE_PATTERN.test(cleaned) ||
          URGENCY_PRESSURE_PATTERN.test(cleaned) ||
          FEES_PATTERN.test(cleaned) ||
          WITHDRAWAL_FRICTION_PATTERN.test(cleaned) ||
          GROUP_APP_PATTERN.test(cleaned) ||
          Boolean(detectSecretRequestPhrase(rawClause)) ||
          Boolean(detectPinToReceivePhrase(rawClause));

        if (reassuranceMatch && msgHasPitchOrRequest) {
          addStageEvidence('trust_building', reassuranceMatch, msg.index);
          addWarning(
            'unverified-reassurance',
            reassuranceMatch,
            msg,
            gc.warningExplanations.unverifiedReassurance,
            gc.contextUnclearFallback
          );
        }
      }
    }
  }

  // Build ordered 5-stage output (only supported stages get 'supported'; others 'not_enough_info')
  const stages: GroupChatStageAssessment[] = GROUP_CHAT_STAGE_IDS.map((stageId) => {
    const data = stageMatches.get(stageId)!;
    if (data.phrases.size > 0) {
      return {
        id: stageId,
        title: gc.stageTitles[stageId],
        status: 'supported',
        statusLabel: gc.stageSupportedBadge,
        supportingPhrases: Array.from(data.phrases),
        messageRefs: Array.from(data.refs).sort((a, b) => a - b),
        explanation: gc.stageSupportedReason[stageId],
      };
    }

    return {
      id: stageId,
      title: gc.stageTitles[stageId],
      status: 'not_enough_info',
      statusLabel: gc.stageNotEnoughInfoBadge,
      supportingPhrases: [],
      messageRefs: [],
      explanation: gc.stageNotEnoughInfoDesc,
    };
  });

  const verdict = warningSigns.length > 0 ? 'warning_signs_found' : 'no_listed_signs';
  const verdictLabel =
    verdict === 'warning_signs_found' ? gc.verdictWarningSigns : gc.verdictNoListedSigns;

  const baseSummary = gc.parsedSummaryLine(messages.length, sawAnySpeakers, sawAnyDates);
  const topicsSummary =
    detectedTopics.size > 0
      ? ` ${gc.topicCluesLine(Array.from(detectedTopics).join(', '))}`
      : '';
  const conversationSummary = `${baseSummary}${topicsSummary}`.trim();

  const couldNotBeChecked: string[] = [];
  if (!sawSebiClaim) couldNotBeChecked.push(gc.uncheckedItems.noSebiId);
  if (!sawLinkOrApp) couldNotBeChecked.push(gc.uncheckedItems.noAppOrLink);
  if (!sawPaymentHandle) couldNotBeChecked.push(gc.uncheckedItems.noPaymentHandle);
  if (!sawAnySpeakers || !sawAnyDates) couldNotBeChecked.push(gc.uncheckedItems.noSpeakerOrDates);
  couldNotBeChecked.push(
    gc.uncheckedItems.liveSebi,
    gc.uncheckedItems.liveSebiCheck,
    gc.uncheckedItems.liveAppsAndDomain
  );

  // If only 1 warning sign or very brief text, surface explicit incomplete-evidence note
  const contextUnclearNote =
    warningSigns.length === 1 || (messages.length <= 1 && warningSigns.length > 0)
      ? gc.singlePhraseNote
      : null;

  return {
    mode: 'demo',
    verdict,
    verdictLabel,
    conversationSummary,
    stages,
    warningSigns,
    couldNotBeChecked,
    cannotVerifyDirectlyLabel: gc.cannotVerifyDirectlyLabel,
    nextSteps: gc.nextStepsList,
    noSafeProofNote: gc.noSafeProofNote,
    contextUnclearNote,
    disclaimerNote: gc.disclaimerNote,
    parsedMessageCount: messages.length,
  };
}

export function buildGroupChatCopySummary(
  result: GroupChatReviewResult,
  language: Language
): string {
  const copy = getCopy(language);
  const gc = copy.groupChat;

  const supportedStages = result.stages.filter((s) => s.status === 'supported');
  const stageLines = result.stages.map((s) => {
    if (s.status === 'supported') {
      const refs = s.messageRefs.length > 0 ? ` [${s.messageRefs.map((r) => `#${r}`).join(', ')}]` : '';
      return `- ${s.title}: ${s.statusLabel}${refs} — ${s.supportingPhrases.map((p) => `"${p}"`).join(', ')}`;
    }
    return `- ${s.title}: ${s.statusLabel}`;
  });

  const warningLines =
    result.warningSigns.length > 0
      ? result.warningSigns.map(
          (w) =>
            `- ${w.title} (${w.sourceMessageLabel}): "${w.supportingPhrase}" — ${w.explanation}`
        )
      : [`- ${gc.verdictNoListedSigns}. ${result.noSafeProofNote}`];

  return redactGroupChatText(
    [
      `${copy.brandName} — ${gc.title}`,
      `${copy.printSummary.verdictLabel}: ${result.verdictLabel} (${result.mode === 'ai' ? gc.modeAiBadge : gc.modeDemoBadge})`,
      '',
      `1. ${gc.section1SummaryTitle}`,
      result.conversationSummary,
      '',
      `2. ${gc.section2StagesTitle} (${supportedStages.length}/5)`,
      ...stageLines,
      '',
      `3. ${gc.section3WarningsTitle}`,
      ...warningLines,
      '',
      `4. ${gc.section4UncheckedTitle}`,
      ...result.couldNotBeChecked.map((item) => `- ${item}`),
      '',
      `5. ${gc.section5NextStepsTitle}`,
      ...result.nextSteps.map((step, i) => `${i + 1}. ${step}`),
      '',
      'Official SEBI & Cyber Crime Portals:',
      '- https://investor.sebi.gov.in/spot-any-scam.html',
      '- https://investor.sebi.gov.in/pdf/Fake%20trading%20app%20scam%20Landscape.pdf',
      '- https://investor.sebi.gov.in/Investor-support.html',
      '- https://siportal.sebi.gov.in/intermediary/sebi-check',
      '- https://cybercrime.gov.in/ (Helpline 1930)',
      '',
      result.disclaimerNote,
    ].join('\n')
  );
}
