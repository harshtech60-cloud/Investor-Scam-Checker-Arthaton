export type Language =
  | 'en'
  | 'en-easy'
  | 'hi'
  | 'mr'
  | 'ta'
  | 'bn'
  | 'te'
  | 'kn'
  | 'ml'
  | 'gu'
  | 'pa'
  | 'es';

export interface LanguageOption {
  code: Language;
  bcp47: string;
  nativeLabel: string;
  englishName: string;
}

export type NavSection =
  | 'check-message'
  | 'group-chat'
  | 'check-payment'
  | 'how-it-works'
  | 'about';

export type PostIncidentChoice =
  | 'paid'
  | 'shared_secret'
  | 'clicked_or_installed'
  | 'not_acted';

export type RiskLevel = 'high_risk' | 'caution' | 'cant_verify' | 'insufficient_data';

export type PillarStatus = 'high_risk' | 'caution' | 'cant_verify' | 'not_provided';

export type CheckBasis = 'pattern_clues' | 'format_only' | 'not_provided' | 'unverified_live';

export type LocalizedText = Record<Language, string>;

export interface MessageCheckInput {
  messageText: string;
  sebiClaim: string;
  websiteLink: string;
  paymentDetail: string;
  requestedAmountInr: string;
}

export type PaymentMethod = 'upi' | 'bank_transfer' | 'qr_or_link';
export type RecipientMatch = 'matches' | 'different' | 'unsure';
export type PaymentSource = 'whatsapp_telegram' | 'trading_app' | 'adviser_claim' | 'other';

export interface PaymentCheckInput {
  method: PaymentMethod;
  handleOrAccount: string;
  ifscCode: string;
  amountInr: string;
  claimedEntity: string;
  recipientMatch: RecipientMatch;
  source: PaymentSource;
}

export interface PillarWarningDetail {
  id: string;
  phrase: string;
  explanation: LocalizedText;
}

export interface PillarFinding {
  id: 'message' | 'sebi' | 'link' | 'payment';
  status: PillarStatus;
  checkBasis?: CheckBasis;
  statusLabel: LocalizedText;
  headline: LocalizedText;
  explanation: LocalizedText;
  isDemoOnlyNote?: LocalizedText;
  extractedDetail?: string;
  evidencePhrases?: string[];
  warnings?: PillarWarningDetail[];
}

export interface UnifiedCheckResult {
  overallLevel: RiskLevel;
  overallTitle: LocalizedText;
  overallSummary: LocalizedText;
  connectionInsight: LocalizedText;
  pillars: PillarFinding[];
  nextSteps: LocalizedText[];
  detectedSignalsCount: number;
  demoLimitNote: LocalizedText;
}

export interface PaymentFindingItem {
  id: string;
  status: PillarStatus;
  statusLabel?: LocalizedText;
  checkBasis?: CheckBasis;
  title: LocalizedText;
  detail: LocalizedText;
  evidencePhrase?: string;
}

export interface PaymentCheckResult {
  overallLevel: RiskLevel;
  overallTitle: LocalizedText;
  overallSummary: LocalizedText;
  findings: PaymentFindingItem[];
  checklist: LocalizedText[];
  demoLimitNote: LocalizedText;
}

export interface MessageDemoPreset {
  id: string;
  title: LocalizedText;
  subtitle: LocalizedText;
  input: MessageCheckInput;
}

export interface PaymentDemoPreset {
  id: string;
  title: LocalizedText;
  subtitle: LocalizedText;
  input: PaymentCheckInput;
}

export type AiReviewVerdictCode = 'warning_signs_found' | 'no_listed_signs';

export interface AiWarningSign {
  title: string;
  supportingPhrase: string;
  explanation: string;
}

export interface AiMessageReviewResult {
  verdict: AiReviewVerdictCode;
  verdictLabel: string;
  plainLanguageSummary: string;
  warningSigns: AiWarningSign[];
  practicalNextSteps: string[];
  insufficientEvidenceNote: string | null;
  noSafeProofNote: string;
  verificationUnavailableNote: string;
  disclaimerNote: string;
}

export type AiReviewUnavailableReason =
  | 'not_configured'
  | 'quota_or_billing'
  | 'upstream_error'
  | 'empty_message';

export type AiReviewApiResponse =
  | {
      ok: true;
      review: AiMessageReviewResult;
    }
  | {
      ok: false;
      available: false;
      reason: AiReviewUnavailableReason;
      message: string;
    };

export interface ExtractedScreenshot {
  messageText: string;
  links: string[];
  upiIds: string[];
  sebiNumbers: string[];
  amountInr: string;
}

export type ScreenshotApiResponse =
  | { ok: true; extracted: ExtractedScreenshot }
  | {
      ok: false;
      reason: AiReviewUnavailableReason | 'bad_image' | 'rate_limited';
      message: string;
    };

export type GroupChatStageId =
  | 'initial_offer'
  | 'trust_building'
  | 'app_or_group_invite'
  | 'payment_or_recruiting_pressure'
  | 'withdrawal_friction';

export interface ParsedGroupMessage {
  index: number;
  speaker: string | null;
  dateLabel: string | null;
  text: string;
}

export interface GroupChatStageAssessment {
  id: GroupChatStageId;
  title: string;
  status: 'supported' | 'not_enough_info';
  statusLabel: string;
  supportingPhrases: string[];
  messageRefs: number[];
  explanation: string;
}

export interface GroupChatWarningSign {
  id: string;
  title: string;
  supportingPhrase: string;
  sourceMessageLabel: string;
  explanation: string;
  contextUnclearNote?: string;
}

export interface GroupChatReviewResult {
  mode: 'demo' | 'ai';
  verdict: AiReviewVerdictCode;
  verdictLabel: string;
  conversationSummary: string;
  stages: GroupChatStageAssessment[];
  warningSigns: GroupChatWarningSign[];
  couldNotBeChecked: string[];
  cannotVerifyDirectlyLabel: string;
  nextSteps: string[];
  noSafeProofNote: string;
  contextUnclearNote: string | null;
  disclaimerNote: string;
  parsedMessageCount: number;
}

export type GroupChatAiApiResponse =
  | {
      ok: true;
      review: GroupChatReviewResult;
    }
  | {
      ok: false;
      available: false;
      reason: AiReviewUnavailableReason;
      message: string;
    };

export interface GroupChatPreset {
  id: string;
  isSuspiciousExample: boolean;
  title: LocalizedText;
  subtitle: LocalizedText;
  conversationText: string;
}

export interface PrintableSummaryFinding {
  area: string;
  statusLabel: string;
  checkBasisLabel?: string;
  headline: string;
  evidencePhrases: string[];
  note?: string;
}

export interface PrintableSummaryData {
  checkType: 'message' | 'payment';
  docTitle: string;
  verdictBadge: string;
  verdictHeadline: string;
  verdictSummary: string;
  connectionNote?: string;
  findings: PrintableSummaryFinding[];
  missingInfoNotes: string[];
  nextSteps: string[];
  aiSummary?: {
    verdictLabel: string;
    summary: string;
    warningSigns: AiWarningSign[];
    practicalNextSteps: string[];
    insufficientEvidenceNote: string | null;
    noSafeProofNote: string;
    verificationUnavailableNote: string;
  };
  privacyExclusionNote: string;
  demoLimitNote: string;
  officialLinks: Array<{
    label: string;
    url: string;
    desc: string;
  }>;
}

export interface TranslationBundle {
  brandName: string;
  footerTag: string;
  demoBanner: string;
  nav: {
    checkMessage: string;
    reviewGroupChat: string;
    checkPayment: string;
    howItWorks: string;
    about: string;
  };
  languageLabel: string;
  menuOpen: string;
  menuClose: string;
  hero: {
    kicker: string;
    title: string;
    subtitle: string;
  };
  statusTags: {
    highRiskVerdict: string;
    cautionVerdict: string;
    cantVerifyVerdict: string;
    highRiskBadge: string;
    cautionBadge: string;
    cantVerifyBadge: string;
    notVerifiedBadge: string;
    notProvidedBadge: string;
  };
  breakdown: {
    messageSummaryTitle: string;
    paymentSummaryTitle: string;
    highRiskCount: (n: number) => string;
    cautionCount: (n: number) => string;
    unverifiedCount: (n: number) => string;
    notEnteredCount: (n: number) => string;
  };
  checkBasis: {
    patternClues: string;
    formatOnly: string;
    notProvided: string;
    unverifiedLive: string;
  };
  messageCheck: {
    presetsTitle: string;
    presetsHint: string;
    clearBtn: string;
    graphTitle: string;
    graphProgress: (filled: number) => string;
    nodeEmpty: string;
    nodeEntered: string;
    nodeFocusHint: (label: string) => string;
    formTitle: string;
    formSubtitle: string;
    cluesCount: (filled: number) => string;
    stepperAriaLabel: string;
    steps: {
      message: string;
      sebi: string;
      link: string;
      payment: string;
    };
    pillarTitles: {
      message: string;
      sebi: string;
      link: string;
      payment: string;
    };
    fields: {
      messageLabel: string;
      messagePlaceholder: string;
      sebiLabel: string;
      sebiPlaceholder: string;
      sebiHelper: string;
      linkLabel: string;
      linkPlaceholder: string;
      paymentLabel: string;
      paymentPlaceholder: string;
      amountLabel: string;
      amountPlaceholder: string;
    };
    submitBtn: string;
    checkingBtn: string;
    updatedBadge: string;
    validationError: string;
    resultTitle: string;
    tileInspectHint: string;
    tileViewing: string;
    tileSelectPrompt: (title: string) => string;
    connectionHeading: string;
    pillarsHeading: string;
    evidenceLabel: string;
    nextStepsHeading: string;
    shareBtn: string;
    shareCopied: string;
    emptyTitle: string;
    emptyBody: string;
  };
  aiReview: {
    triggerBtn: string;
    loadingBtn: string;
    panelTitle: string;
    panelSubtitle: string;
    consentTitle: string;
    consentBody: string;
    consentContinueBtn: string;
    consentDemoOnlyBtn: string;
    unavailableTitle: string;
    unavailableNotConfigured: string;
    unavailableError: string;
    verdictWarningSigns: string;
    verdictNoListedSigns: string;
    warningSignsHeading: string;
    supportingPhraseLabel: string;
    noSignsFoundNote: string;
    nextStepsHeading: string;
    insufficientEvidenceHeading: string;
    limitationsHeading: string;
    limitationsBody: string;
    uncertainNote: string;
    localOnlyBadge: string;
    missingMessageError: string;
    privacyBadge: string;
  };
  printSummary: {
    printBtn: string;
    familyDocKicker: string;
    messageDocTitle: string;
    paymentDocTitle: string;
    verdictLabel: string;
    findingsLabel: string;
    missingInfoLabel: string;
    nextStepsLabel: string;
    aiSectionLabel: string;
    officialLinksLabel: string;
    privacyExclusionNote: string;
  };
  officialVerify: {
    title: string;
    subtitle: string;
    sebiLookupLabel: string;
    sebiLookupDesc: string;
    sebiCheckLabel: string;
    sebiCheckDesc: string;
    appsListLabel: string;
    appsListDesc: string;
    spotScamLabel: string;
    spotScamDesc: string;
    fakeAppsPdfLabel: string;
    fakeAppsPdfDesc: string;
    rbiSafetyLabel: string;
    rbiSafetyDesc: string;
    npciAwarenessLabel: string;
    npciAwarenessDesc: string;
    cyberCrimeLabel: string;
    cyberCrimeDesc: string;
    scoresLabel: string;
    scoresDesc: string;
    guidanceStripTitle: string;
    qrUnavailableNote: string;
    openPortalBtn: string;
  };
  paymentCheck: {
    kicker: string;
    title: string;
    subtitle: string;
    presetsTitle: string;
    clearBtn: string;
    formTitle: string;
    fields: {
      methodLabel: string;
      methods: {
        upi: string;
        bank_transfer: string;
        qr_or_link: string;
      };
      methodHints: {
        upi: string;
        bank_transfer: string;
        qr_or_link: string;
      };
      handleLabel: string;
      handlePlaceholderUpi: string;
      handlePlaceholderBank: string;
      handlePlaceholderQr: string;
      ifscLabel: string;
      ifscPlaceholder: string;
      amountLabel: string;
      amountPlaceholder: string;
      entityLabel: string;
      entityPlaceholder: string;
      sourceLabel: string;
      sources: {
        whatsapp_telegram: string;
        trading_app: string;
        adviser_claim: string;
        other: string;
      };
      matchLabel: string;
      matches: {
        matches: string;
        different: string;
        unsure: string;
      };
    };
    submitBtn: string;
    checkingBtn: string;
    updatedBadge: string;
    validationError: string;
    resultTitle: string;
    findingsHeading: string;
    checklistHeading: string;
    checklistProgress: (checked: number, total: number) => string;
    checklistComplete: string;
    emptyTitle: string;
    emptyBody: string;
    qrHandoffHeading: string;
    qrHandoffDesc: string;
    qrHandoffBtn: string;
  };
  presets: {
    message: Record<string, { title: string; subtitle: string }>;
    payment: Record<string, { title: string; subtitle: string }>;
  };
  howItWorks: {
    kicker: string;
    title: string;
    subtitle: string;
    diagramTitle: string;
    steps: Array<{ num: string; title: string; desc: string }>;
    scopeTitle: string;
    canDoTitle: string;
    canDoList: string[];
    cannotDoTitle: string;
    cannotDoList: string[];
    patternsTitle: string;
    patternTag: string;
    patterns: Array<{ title: string; desc: string }>;
  };
  about: {
    kicker: string;
    title: string;
    intro: string;
    principlesTitle: string;
    principles: Array<{ title: string; desc: string }>;
    directoryTitle: string;
    directoryNote: string;
    resources: Array<{ name: string; detail: string }>;
  };
  postIncidentHelp: {
    triggerBtn: string;
    triggerHint: string;
    modalTitle: string;
    modalSubtitle: string;
    privacyBadge: string;
    selectPrompt: string;
    closeBtn: string;
    backToCheckerBtn: string;
    urgentRuleNote: string;
    reportingTitle: string;
    reportingBody: string;
    reportingPortalLabel: string;
    helplineBadge: string;
    sourcesTitle: string;
    rbiPdfLabel: string;
    cyberPortalLabel: string;
    sebiFakeAppPdfLabel: string;
    disclaimerNote: string;
    choices: Record<
      PostIncidentChoice,
      {
        label: string;
        shortHint: string;
        heading: string;
        summary: string;
        steps: string[];
        deviceNotCheckedNote?: string;
        showReportingCard: boolean;
        showBackToChecker?: boolean;
      }
    >;
  };
  groupChat: {
    kicker: string;
    title: string;
    subtitle: string;
    entryHint: string;
    switchSingleBtn: string;
    privacyTitle: string;
    privacyBody: string;
    presetsTitle: string;
    presetsHint: string;
    exampleTagSuspicious: string;
    exampleTagGenuine: string;
    exampleTagMixed: string;
    clearBtn: string;
    inputLabel: string;
    inputPlaceholder: string;
    formatHintTitle: string;
    formatHintBody: string;
    formatExamples: string[];
    demoOnlyBtn: string;
    checkingBtn: string;
    aiReviewBtn: string;
    aiLoadingBtn: string;
    validationError: string;
    consentTitle: string;
    consentBody: string;
    consentContinueBtn: string;
    consentDemoOnlyBtn: string;
    unavailableTitle: string;
    unavailableNotConfigured: string;
    unavailableError: string;
    modeDemoBadge: string;
    modeAiBadge: string;
    privacyBadge: string;
    verdictWarningSigns: string;
    verdictNoListedSigns: string;
    noSafeProofNote: string;
    singlePhraseNote: string;
    emptyTitle: string;
    emptyBody: string;
    copySummaryBtn: string;
    copiedSummaryBtn: string;
    section1SummaryTitle: string;
    section2StagesTitle: string;
    stagesIntro: string;
    stageSupportedBadge: string;
    stageNotEnoughInfoBadge: string;
    section3WarningsTitle: string;
    warningSourceLabel: string;
    warningPhraseLabel: string;
    noWarningsBody: string;
    section4UncheckedTitle: string;
    cannotVerifyDirectlyLabel: string;
    section5NextStepsTitle: string;
    disclaimerNote: string;
    messageNumberLabel: (n: number) => string;
    parsedSummaryLine: (count: number, hasSpeakers: boolean, hasDates: boolean) => string;
    topicCluesLine: (topics: string) => string;
    stageTitles: Record<GroupChatStageId, string>;
    stageNotEnoughInfoDesc: string;
    stageSupportedReason: Record<GroupChatStageId, string>;
    warningExplanations: {
      secretRequest: { title: string; explanation: string };
      pinToReceive: { title: string; explanation: string };
      guaranteedReturn: { title: string; explanation: string };
      multiplierReturn: { title: string; explanation: string };
      urgencyPressure: { title: string; explanation: string };
      vipPitch: { title: string; explanation: string };
      offPlatformOrApk: { title: string; explanation: string };
      upfrontOrWithdrawalFee: { title: string; explanation: string };
      testimonialOrProofHype: { title: string; explanation: string };
      recruitmentPressure: { title: string; explanation: string };
      unverifiedReassurance: { title: string; explanation: string };
    };
    contextUnclearFallback: string;
    uncheckedItems: {
      noSebiId: string;
      noAppOrLink: string;
      noPaymentHandle: string;
      noSpeakerOrDates: string;
      liveSebi: string;
      liveSebiCheck: string;
      liveAppsAndDomain: string;
    };
    nextStepsList: string[];
    presets: Record<string, { title: string; subtitle: string }>;
  };
  footer: {
    note: string;
  };
  analyzer: {
    pitchGuaranteed: string;
    pitchMultiplier: string;
    pitchUrgency: string;
    pitchVip: string;
    pitchGroupApp: string;
    pitchFees: string;
    pitchSecretRequest: string;
    pitchPinToReceive: string;
    msgNotProvidedLabel: string;
    msgNotProvidedHeadline: string;
    msgNotProvidedDesc: string;
    msgHighLabel: string;
    msgHighHeadline: string;
    msgSecretHeadline: string;
    msgCautionLabel: string;
    msgCautionHeadline: string;
    msgNoSignsLabel: string;
    msgNoSignsHeadline: string;
    msgNoSignsDesc: string;
    sebiMissingLabel: string;
    sebiMissingHeadline: string;
    sebiMissingDesc: string;
    sebiMissingDemo: string;
    sebiValidLabel: string;
    sebiValidHeadline: (id: string) => string;
    sebiValidDesc: string;
    sebiValidDemo: string;
    sebiMismatchLabel: string;
    sebiMismatchHeadline: string;
    sebiMismatchDesc: string;
    sebiNameOnlyLabel: string;
    sebiNameOnlyHeadline: string;
    sebiNameOnlyDesc: string;
    sebiCantVerifyDemo: string;
    linkNotProvidedLabel: string;
    linkNotProvidedHeadline: string;
    linkNotProvidedDesc: string;
    linkHighLabel: string;
    linkApkHeadline: string;
    linkApkDesc: string;
    linkSpoofHeadline: string;
    linkSpoofDesc: string;
    linkDemoDomain: string;
    linkCautionLabel: string;
    linkShortenerHeadline: string;
    linkShortenerDesc: string;
    linkHttpHeadline: string;
    linkHttpDesc: string;
    pitchAuthorityThreat?: string;
    pitchSafeAccount?: string;
    pitchTaskFraud?: string;
    pitchCryptoPlatform?: string;
    pitchDeepfake?: string;
    linkTldHeadline?: string;
    linkTldDesc?: string;
    linkCantVerifyLabel: string;
    linkCantVerifyHeadline: (host: string) => string;
    linkCantVerifyDesc: string;
    linkDemoReputation: string;
    payNotProvidedLabel: string;
    payNotProvidedHeadline: string;
    payNotProvidedDesc: string;
    payHighLabel: string;
    payPersonalUpiHeadline: (upi: string) => string;
    payPersonalAccountHeadline: string;
    payPersonalDesc: (amountText: string) => string;
    payDemoLookup: string;
    payCautionLabel: string;
    payLargeHeadline: (amount: string) => string;
    payLargeDesc: string;
    payDemoBank: string;
    payValidUpiLabel: string;
    payValidUpiHeadline: (upi: string) => string;
    payValidUpiDesc: string;
    payNonValidUpiHeadline: (upi: string) => string;
    payNonValidUpiDesc: string;
    payAmountContextHeadline: (amount: string) => string;
    payAmountContextDesc: string;
    payCantVerifyLabel: string;
    payCantVerifyHeadline: string;
    payCantVerifyDesc: string;
    payDemoNotConnected: string;
    unifiedEmptyTitle: string;
    unifiedEmptySummary: string;
    unifiedEmptyInsight: string;
    unifiedEmptyStep: string;
    unifiedEmptyDemo: string;
    unifiedHighTitle: string;
    unifiedHighSummary: (highCount: number, cautionCount: number) => string;
    unifiedCautionTitle: string;
    unifiedCautionSummary: string;
    unifiedCantVerifyTitle: string;
    unifiedCantVerifySummary: string;
    insightPitchPay: (amountText: string) => string;
    insightPitchUnverifiedPay: (amountText: string) => string;
    insightLink: string;
    insightSebiPay: (sebiId: string, amountText: string) => string;
    insightGeneralGap: string;
    insightUnconfirmed: string;
    unifiedNextSteps: string[];
    unifiedDemoLimit: string;
    payCheckEmptyTitle: string;
    payCheckEmptySummary: string;
    payCheckEmptyDemo: string;
    payFindingNameDiffTitle: string;
    payFindingNameDiffDesc: string;
    payFindingNameUnsureTitle: string;
    payFindingNameUnsureDesc: string;
    payFindingNonValidUpiTitle: (suffix: string) => string;
    payFindingNonValidUpiDesc: string;
    payFindingValidUpiTitle: string;
    payFindingValidUpiDesc: string;
    payFindingUpiFormatTitle: string;
    payFindingUpiFormatDesc: string;
    payFindingQrTitle: string;
    payFindingQrDesc: string;
    payFindingBankTitle: string;
    payFindingBankDesc: string;
    payFindingSourceTitle: string;
    payFindingSourceDesc: string;
    payFindingAmountTitle: (amount: string) => string;
    payFindingAmountDesc: string;
    payFindingAmountContextTitle: (amount: string) => string;
    payFindingAmountContextDesc: string;
    payFindingLiveTitle: string;
    payFindingLiveDesc: string;
    payCheckHighTitle: string;
    payCheckHighSummary: string;
    payCheckCautionTitle: string;
    payCheckCautionSummary: string;
    payCheckCantVerifyTitle: string;
    payCheckCantVerifySummary: string;
    payCheckChecklist: string[];
    payCheckDemoLimit: string;
  };
}
