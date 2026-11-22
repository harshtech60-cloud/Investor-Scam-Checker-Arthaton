import type {
  AiMessageReviewResult,
  Language,
  PaymentCheckResult,
  PrintableSummaryData,
  UnifiedCheckResult,
} from '../types/check';
import { getCopy } from '../data/translations';
import { OFFICIAL_PORTAL_LINKS } from '../components/OfficialSourcesCard';
import { redactGroupChatText } from './aiReviewHelpers';
import { getCheckBasisLabel } from './analyzer';

function sanitizePrintableList(items: string[]): string[] {
  return Array.from(
    new Set(
      items
        .map((item) => redactGroupChatText(item).trim())
        .filter((item) => item.length > 0)
    )
  );
}

export function buildPrintableMessageSummary(
  result: UnifiedCheckResult,
  language: Language,
  aiReview?: AiMessageReviewResult | null
): PrintableSummaryData {
  const copy = getCopy(language);
  const ov = copy.officialVerify;

  const missingInfoNotes: string[] = [];
  const findings = result.pillars.map((pillar) => {
    const area = copy.messageCheck.pillarTitles[pillar.id];
    const statusLabel = pillar.statusLabel[language];
    const headline = redactGroupChatText(pillar.headline[language]);
    const evidencePhrases = sanitizePrintableList(
      pillar.evidencePhrases ?? (pillar.warnings ? pillar.warnings.map((w) => w.phrase) : [])
    );
    const note = pillar.isDemoOnlyNote
      ? redactGroupChatText(pillar.isDemoOnlyNote[language])
      : undefined;

    if (pillar.status === 'not_provided') {
      missingInfoNotes.push(`${area}: ${statusLabel}`);
    } else if (pillar.status === 'cant_verify') {
      missingInfoNotes.push(
        `${area}: ${redactGroupChatText(pillar.explanation[language])}`
      );
    }

    return {
      area,
      statusLabel,
      checkBasisLabel: getCheckBasisLabel(pillar.checkBasis, copy),
      headline,
      evidencePhrases,
      note,
    };
  });

  if (result.overallLevel === 'cant_verify' && missingInfoNotes.length === 0) {
    missingInfoNotes.push(result.overallSummary[language]);
  }

  return {
    checkType: 'message',
    docTitle: copy.printSummary.messageDocTitle,
    verdictBadge:
      result.overallLevel === 'cant_verify'
        ? copy.statusTags.cantVerifyVerdict
        : copy.statusTags.highRiskVerdict,
    verdictHeadline: redactGroupChatText(result.overallTitle[language]),
    verdictSummary: redactGroupChatText(result.overallSummary[language]),
    connectionNote: redactGroupChatText(result.connectionInsight[language]),
    findings,
    missingInfoNotes: Array.from(new Set(missingInfoNotes)),
    nextSteps: result.nextSteps.map((step) => redactGroupChatText(step[language])),
    aiSummary: aiReview
      ? {
          verdictLabel: aiReview.verdictLabel,
          summary: redactGroupChatText(aiReview.plainLanguageSummary),
          warningSigns: aiReview.warningSigns.map((sign) => ({
            title: redactGroupChatText(sign.title),
            supportingPhrase: redactGroupChatText(sign.supportingPhrase),
            explanation: redactGroupChatText(sign.explanation),
          })),
          practicalNextSteps: aiReview.practicalNextSteps.map((step) =>
            redactGroupChatText(step)
          ),
          insufficientEvidenceNote: aiReview.insufficientEvidenceNote
            ? redactGroupChatText(aiReview.insufficientEvidenceNote)
            : null,
          noSafeProofNote: aiReview.noSafeProofNote,
          verificationUnavailableNote: aiReview.verificationUnavailableNote,
        }
      : undefined,
    privacyExclusionNote: copy.printSummary.privacyExclusionNote,
    demoLimitNote: result.demoLimitNote[language],
    officialLinks: [
      {
        label: ov.sebiLookupLabel,
        url: OFFICIAL_PORTAL_LINKS.sebiLookup,
        desc: ov.sebiLookupDesc,
      },
      {
        label: ov.sebiCheckLabel,
        url: OFFICIAL_PORTAL_LINKS.sebiCheck,
        desc: ov.sebiCheckDesc,
      },
      {
        label: ov.appsListLabel,
        url: OFFICIAL_PORTAL_LINKS.appsList,
        desc: ov.appsListDesc,
      },
      {
        label: ov.spotScamLabel,
        url: OFFICIAL_PORTAL_LINKS.spotScam,
        desc: ov.spotScamDesc,
      },
      {
        label: ov.rbiSafetyLabel,
        url: OFFICIAL_PORTAL_LINKS.rbiSafety,
        desc: ov.rbiSafetyDesc,
      },
      {
        label: ov.npciAwarenessLabel,
        url: OFFICIAL_PORTAL_LINKS.npciAwareness,
        desc: ov.npciAwarenessDesc,
      },
      {
        label: ov.cyberCrimeLabel,
        url: OFFICIAL_PORTAL_LINKS.cyberCrime,
        desc: ov.cyberCrimeDesc,
      },
      {
        label: ov.scoresLabel,
        url: OFFICIAL_PORTAL_LINKS.scores,
        desc: ov.scoresDesc,
      },
    ],
  };
}

export function buildPrintablePaymentSummary(
  result: PaymentCheckResult,
  language: Language
): PrintableSummaryData {
  const copy = getCopy(language);
  const ov = copy.officialVerify;

  const statusLabels = {
    high_risk: copy.statusTags.highRiskBadge,
    caution: copy.statusTags.cautionBadge,
    cant_verify: copy.statusTags.cantVerifyBadge,
    not_provided: copy.statusTags.notProvidedBadge,
  } as const;

  const missingInfoNotes: string[] = [];
  const findings = result.findings.map((item) => {
    if (item.status === 'cant_verify') {
      missingInfoNotes.push(
        `${item.title[language]}: ${redactGroupChatText(item.detail[language])}`
      );
    }

    return {
      area: item.title[language],
      statusLabel: item.statusLabel
        ? item.statusLabel[language]
        : item.status === 'cant_verify'
          ? copy.analyzer.payCantVerifyLabel
          : statusLabels[item.status],
      checkBasisLabel: getCheckBasisLabel(item.checkBasis, copy),
      headline: redactGroupChatText(item.detail[language]),
      evidencePhrases: item.evidencePhrase
        ? sanitizePrintableList([item.evidencePhrase])
        : [],
    };
  });

  return {
    checkType: 'payment',
    docTitle: copy.printSummary.paymentDocTitle,
    verdictBadge:
      result.overallLevel === 'cant_verify'
        ? copy.statusTags.cantVerifyVerdict
        : copy.statusTags.highRiskVerdict,
    verdictHeadline: redactGroupChatText(result.overallTitle[language]),
    verdictSummary: redactGroupChatText(result.overallSummary[language]),
    findings,
    missingInfoNotes: Array.from(new Set(missingInfoNotes)),
    nextSteps: result.checklist.map((step) => redactGroupChatText(step[language])),
    privacyExclusionNote: copy.printSummary.privacyExclusionNote,
    demoLimitNote: result.demoLimitNote[language],
    officialLinks: [
      {
        label: ov.sebiLookupLabel,
        url: OFFICIAL_PORTAL_LINKS.sebiLookup,
        desc: ov.sebiLookupDesc,
      },
      {
        label: ov.sebiCheckLabel,
        url: OFFICIAL_PORTAL_LINKS.sebiCheck,
        desc: ov.sebiCheckDesc,
      },
      {
        label: ov.appsListLabel,
        url: OFFICIAL_PORTAL_LINKS.appsList,
        desc: ov.appsListDesc,
      },
      {
        label: ov.spotScamLabel,
        url: OFFICIAL_PORTAL_LINKS.spotScam,
        desc: ov.spotScamDesc,
      },
      {
        label: ov.rbiSafetyLabel,
        url: OFFICIAL_PORTAL_LINKS.rbiSafety,
        desc: ov.rbiSafetyDesc,
      },
      {
        label: ov.npciAwarenessLabel,
        url: OFFICIAL_PORTAL_LINKS.npciAwareness,
        desc: ov.npciAwarenessDesc,
      },
      {
        label: ov.cyberCrimeLabel,
        url: OFFICIAL_PORTAL_LINKS.cyberCrime,
        desc: ov.cyberCrimeDesc,
      },
      {
        label: ov.scoresLabel,
        url: OFFICIAL_PORTAL_LINKS.scores,
        desc: ov.scoresDesc,
      },
    ],
  };
}
