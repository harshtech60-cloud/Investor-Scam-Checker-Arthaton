import type { TranslationBundle } from '../../types/check';

export const en: TranslationBundle = {
  brandName: 'Investor Scam Check',
  footerTag: 'Educational Pre-Payment Demo',
  demoBanner:
    'Demo prototype: Uses sample rules only. Does not connect to live SEBI registries, verify bank accounts, or guarantee that any offer is safe.',
  nav: {
    checkMessage: 'Check a message',
    reviewGroupChat: 'Review a group chat',
    checkPayment: 'Check a payment',
    howItWorks: 'How it works',
    about: 'About',
  },
  languageLabel: 'Select language',
  menuOpen: 'Open navigation menu',
  menuClose: 'Close navigation menu',
  hero: {
    kicker: 'Pre-Payment Verification Guide · Built for Indian Families',
    title: 'Pause before you pay. Connect every clue in one check.',
    subtitle:
      'Suspicious investment tips often mix an urgent message, a copied SEBI ID, a lookalike link, and a personal payment handle. Review all four together in plain language before sending money.',
  },
  statusTags: {
    highRiskVerdict: 'Warning signs found',
    cautionVerdict: 'Warning signs found',
    cantVerifyVerdict: 'No listed warning signs found',
    highRiskBadge: 'Warning signs found',
    cautionBadge: 'Warning signs found',
    cantVerifyBadge: 'No listed warning signs found',
    notVerifiedBadge: 'Not verified by this demo',
    notProvidedBadge: 'Not provided',
  },
  breakdown: {
    messageSummaryTitle: '4-part check summary',
    paymentSummaryTitle: 'Payment signals reviewed',
    highRiskCount: (n) => `${n} Warning signs`,
    cautionCount: (n) => `${n} Warning signs`,
    unverifiedCount: (n) => `${n} Unverified / No signs`,
    notEnteredCount: (n) => `${n} Not provided`,
  },
  checkBasis: {
    patternClues: 'Pattern clues only · Not official verification',
    formatOnly: 'Format check only · Live lookup unavailable',
    notProvided: 'Not provided',
    unverifiedLive: 'Live check unavailable · Verify directly',
  },
  messageCheck: {
    presetsTitle: 'Try a realistic demo example',
    presetsHint: 'Tap an example to see how the four details connect, or enter your own below.',
    clearBtn: 'Clear form',
    graphTitle: '4 clues, one connected check',
    graphProgress: (filled) =>
      filled === 0
        ? '0 of 4 clues added — tap any node to start'
        : `${filled} of 4 clues added`,
    nodeEmpty: 'Empty',
    nodeEntered: 'Added',
    nodeFocusHint: (label) => `Focus ${label} field`,
    formTitle: '1. Enter the details you received',
    formSubtitle: 'Fill whatever you have — even one or two fields help surface risk indicators.',
    cluesCount: (filled) => `${filled}/4 clues`,
    stepperAriaLabel: 'Four-part check progress',
    steps: {
      message: 'Message',
      sebi: 'SEBI ID',
      link: 'Link',
      payment: 'Payment',
    },
    pillarTitles: {
      message: 'Message & Promises',
      sebi: 'Claimed SEBI Registration',
      link: 'Website or App Link',
      payment: 'Payment Handle & Request',
    },
    fields: {
      messageLabel: 'Investment message or pitch (WhatsApp / Telegram / SMS)',
      messagePlaceholder:
        'Paste the message text here (e.g. "25% guaranteed monthly return, limited seats today only...")',
      sebiLabel: 'Claimed SEBI registration number or company name (Optional)',
      sebiPlaceholder: 'e.g. INA000012345 or firm name',
      sebiHelper:
        'You may leave this blank if you do not have one. If a number is shared, verify it directly on investor.sebi.gov.in.',
      linkLabel: 'Website or app download link',
      linkPlaceholder: 'e.g. https://example.in or app download link',
      paymentLabel: 'UPI ID, bank account, or payment request',
      paymentPlaceholder: 'e.g. name@okaxis or IMPS account details',
      amountLabel: 'Amount requested (₹)',
      amountPlaceholder: 'e.g. 25000',
    },
    submitBtn: 'Review risk indicators',
    checkingBtn: 'Reviewing clues...',
    updatedBadge: 'Updated',
    validationError:
      'Please enter at least one detail (message, SEBI claim, link, or payment) or choose a demo example.',
    resultTitle: '2. Connected pre-payment review',
    tileInspectHint: 'Select any tile to expand and jump to its explanation',
    tileViewing: 'Expanded',
    tileSelectPrompt: (title) => `Inspect ${title}`,
    connectionHeading: 'How these details connect',
    pillarsHeading: 'Four-part breakdown',
    evidenceLabel: 'Matched phrase in text:',
    nextStepsHeading: 'Calm next steps before you pay',
    shareBtn: 'Copy family summary',
    shareCopied: 'Copied for family',
    emptyTitle: 'Ready to review before you pay',
    emptyBody:
      'Fill in the message, claimed SEBI ID, link, or payment request on the left — or tap a demo example above — to see a plain-language breakdown here.',
  },
  aiReview: {
    triggerBtn: 'Get a plain-language review',
    loadingBtn: 'Getting AI review...',
    panelTitle: 'Optional AI plain-language review',
    panelSubtitle:
      'Additional sentence-by-sentence reading via AI. The rule-based check above always runs locally without AI.',
    consentTitle: 'Before sending this message to the AI service',
    consentBody:
      'Your pasted message text (with detected PINs, OTPs, CVVs, passwords, and full bank account or card numbers redacted) will be sent to the Gemini AI service to produce a plain-language review. It is not sent to Google Search grounding and is not saved in any database.',
    consentContinueBtn: 'Continue',
    consentDemoOnlyBtn: 'Use the demo check only',
    unavailableTitle: 'AI review is unavailable right now',
    unavailableNotConfigured:
      'No server AI credentials are active in this environment. You can still use the local rule-based check and official verification portals above.',
    unavailableError:
      'The AI service could not complete this review right now. Your local rule-based check remains active and usable.',
    verdictWarningSigns: 'Warning signs found',
    verdictNoListedSigns: 'No listed warning signs found',
    warningSignsHeading: 'Possible warning signs noted',
    supportingPhraseLabel: 'Supporting phrase:',
    noSignsFoundNote:
      'Not seeing warning signs does not prove this message is genuine, authorised, or safe.',
    nextStepsHeading: 'Practical next steps',
    insufficientEvidenceHeading: 'Insufficient evidence note',
    limitationsHeading: 'Verification limits',
    limitationsBody:
      'This AI reading checks wording and context only. It cannot verify live SEBI registrations, bank accounts, UPI IDs, QR codes, or websites.',
    uncertainNote:
      'AI plain-language interpretation only — treat as an additional uncertain reading, not proof, not a live SEBI lookup, and not financial advice.',
    localOnlyBadge: 'Local pattern rules · Runs without AI',
    missingMessageError:
      'Paste or select a message above before requesting an AI plain-language review.',
    privacyBadge: 'Not saved in DB · No Search grounding',
  },
  printSummary: {
    printBtn: 'Print or save summary',
    familyDocKicker: 'Investor Scam Check · Printable Family Summary',
    messageDocTitle: 'Pre-Payment Message & Clue Review Summary',
    paymentDocTitle: 'Pre-Transfer Payment Check Summary',
    verdictLabel: 'Check result',
    findingsLabel: 'Reviewed clues & evidence phrases',
    missingInfoLabel: 'Missing or unverified information',
    nextStepsLabel: 'Practical next steps',
    aiSectionLabel: 'AI plain-language review (session only)',
    officialLinksLabel: 'Verify directly on official portals',
    privacyExclusionNote:
      'Privacy protection: Raw pasted messages, UPI PINs, OTPs, passwords, CVVs, IFSC codes, full bank account/card numbers, and unmasked personal UPI usernames are excluded from this printable summary by default.',
  },
  officialVerify: {
    title: 'Verify through official sources',
    subtitle:
      'Open official SEBI, RBI, NPCI, and Cyber Crime portals directly to check any adviser, payment handle, trading app, or fraud report route.',
    sebiLookupLabel: 'SEBI Registration Lookup',
    sebiLookupDesc:
      'Verify registered advisers, brokers, and analysts by name or INA/INH/INZ ID on sebi.gov.in.',
    sebiCheckLabel: 'SEBI Check (UPI, QR & Bank)',
    sebiCheckDesc:
      'Validate official @valid UPI handles, QR codes, and bank/IFSC details on siportal.sebi.gov.in.',
    appsListLabel: 'SEBI Investor Support & Apps',
    appsListDesc:
      'Verify intermediary registrations and open official exchange directories for authorised trading apps.',
    spotScamLabel: 'SEBI Spot Any Scam Guide',
    spotScamDesc:
      'Official SEBI checklist on spotting investment scams, impersonation, and guaranteed-return pitches.',
    fakeAppsPdfLabel: 'SEBI Fake Trading App Guide (PDF)',
    fakeAppsPdfDesc:
      'Official SEBI landscape guide explaining how cloned trading apps and off-store .apk scams work.',
    rbiSafetyLabel: 'RBI Safe Digital Banking',
    rbiSafetyDesc:
      'Official RBI practices on safeguarding PINs/OTPs and checking recipient details before paying.',
    npciAwarenessLabel: 'NPCI UPI Fraud Awareness',
    npciAwarenessDesc:
      'Official UPI guidance: PINs only send money out and never receive refunds or rewards.',
    cyberCrimeLabel: 'National Cyber Crime Portal (1930)',
    cyberCrimeDesc:
      'For cyber, UPI, or banking fraud: contact your bank immediately, dial 1930, and report on cybercrime.gov.in.',
    scoresLabel: 'SEBI SCORES Portal',
    scoresDesc:
      'Lodge formal complaints strictly involving SEBI-registered intermediaries on scores.sebi.gov.in.',
    guidanceStripTitle: 'Official guidance, safe banking & fraud reporting',
    qrUnavailableNote:
      'QR & screenshot image scanning is unavailable in this demo and is never verified live here.',
    openPortalBtn: 'Open official portal',
  },
  paymentCheck: {
    kicker: 'Pre-Transfer Check · UPI, QR & Bank Transfer',
    title: 'About to send money? Check the payment request first.',
    subtitle:
      'Before entering your UPI PIN or confirming an IMPS/NEFT transfer, review whether the payment handle, source, and recipient name make sense together.',
    presetsTitle: 'Try a payment scenario',
    clearBtn: 'Clear',
    formTitle: 'Payment request details',
    fields: {
      methodLabel: 'How are you asked to pay?',
      methods: {
        upi: 'UPI / VPA',
        bank_transfer: 'Bank IMPS/NEFT',
        qr_or_link: 'QR / Pay Link',
      },
      methodHints: {
        upi: 'Pay to name@bank handle',
        bank_transfer: 'Account + IFSC transfer',
        qr_or_link: 'Scan QR or tap pay link',
      },
      handleLabel: 'UPI ID, Account Number, or Payment Link',
      handlePlaceholderUpi: 'e.g. sample.desk@okaxis',
      handlePlaceholderBank: 'e.g. Account number 4001928374',
      handlePlaceholderQr: 'e.g. Payment link or QR source',
      ifscLabel: 'IFSC Code (optional)',
      ifscPlaceholder: 'e.g. DEMO0001234',
      amountLabel: 'Amount requested (₹)',
      amountPlaceholder: 'e.g. 25000',
      entityLabel: 'Claimed company / adviser',
      entityPlaceholder: 'e.g. Sample Wealth Advisory',
      sourceLabel: 'Where did this payment request come from?',
      sources: {
        whatsapp_telegram: 'WhatsApp or Telegram group / chat',
        trading_app: 'Downloaded trading app or web portal',
        adviser_claim: 'Claimed SEBI adviser or caller',
        other: 'Other / In-person',
      },
      matchLabel: 'Does the bank-verified recipient name match the claimed company?',
      matches: {
        matches: 'Yes, matches exact company name',
        different: 'No, shows a personal or different name',
        unsure: "Not sure / haven't checked yet",
      },
    },
    submitBtn: 'Check payment risk indicators',
    checkingBtn: 'Reviewing payment...',
    updatedBadge: 'Updated',
    validationError: 'Please enter a payment handle, amount, or claimed entity name first.',
    resultTitle: 'Payment review & pre-transfer checklist',
    findingsHeading: 'What stands out',
    checklistHeading: 'Check these 4 points before tapping Pay',
    checklistProgress: (checked, total) => `${checked} of ${total} checked`,
    checklistComplete: 'All 4 checks reviewed',
    emptyTitle: 'Check before entering your UPI PIN',
    emptyBody:
      'Enter the UPI ID, bank account, or ₹ amount you are about to pay to inspect common warning signs and a 4-point safety checklist.',
    qrHandoffHeading: 'Check this QR code with SEBI',
    qrHandoffDesc:
      'This demo does not scan or verify QR codes. Open SEBI Check to upload or scan the QR code and verify the payment details directly.',
    qrHandoffBtn: 'Open SEBI Check',
  },
  presets: {
    message: {
      'guaranteed-whatsapp': {
        title: 'WhatsApp "Guaranteed Return" Tip',
        subtitle: 'Claims 25% monthly profit + lookalike link',
      },
      'pre-ipo-apk': {
        title: 'Pre-IPO App (.apk) & Bank Transfer',
        subtitle: 'Direct .apk install link + agent bank transfer',
      },
      'incomplete-advisory': {
        title: 'Calm Advisory Pitch (Incomplete Details)',
        subtitle: 'Valid-looking SEBI format, but live status unverified',
      },
    },
    payment: {
      'pay-whatsapp-upi': {
        title: 'UPI Request from Telegram Group',
        subtitle: '₹25,000 via Telegram to @ybl handle, different name',
      },
      'pay-qr-refund': {
        title: 'QR Code to "Receive Profit"',
        subtitle: '₹15,000 QR scan from claimed trading app',
      },
      'pay-bank-imps': {
        title: 'IMPS Transfer to Unconfirmed Account',
        subtitle: '₹1,00,000 bank transfer for claimed advisory fee',
      },
    },
  },
  howItWorks: {
    kicker: 'How It Works',
    title: "Why checking one clue alone isn't enough",
    subtitle:
      'An impersonator can copy a real SEBI registration number onto a polished brochure — while quietly sending you to a lookalike website and a personal UPI ID. Looking at all four clues together exposes mismatches.',
    diagramTitle: 'The 4-part connection',
    steps: [
      {
        num: '01',
        title: 'The Pitch & Promises',
        desc: 'We look for guaranteed returns, daily/monthly profit promises, or "closing today" pressure.',
      },
      {
        num: '02',
        title: 'Claimed SEBI Registration',
        desc: "Checks whether a registration ID matches standard SEBI format (INA/INH/INZ) and reminds you how to verify it directly on SEBI's portal.",
      },
      {
        num: '03',
        title: 'Website or App Link',
        desc: 'Flags direct .apk installs, shortened redirect links, and lookalike broker domains.',
      },
      {
        num: '04',
        title: 'Payment Handle & Flow',
        desc: 'Highlights consumer UPI handles, individual savings accounts, or recipient name mismatches.',
      },
    ],
    scopeTitle: 'What this demo checks vs. what requires official verification',
    canDoTitle: 'Included in this demo',
    canDoList: [
      'Plain-language analysis of urgency, guaranteed-return claims, and fee lures',
      'SEBI registration format pattern check (INA / INH / INZ)',
      'Link checks for .apk app downloads, shorteners, and lookalike phrasing',
      'Cross-checking pitch context against personal UPI handles or bank requests',
    ],
    cannotDoTitle: 'Unavailable in demo (verify officially)',
    cannotDoList: [
      "Live lookup against SEBI's registered intermediary database",
      'Live NPCI / bank beneficiary name verification for UPI IDs',
      'Real-time website domain age, SSL certificate, or broker app verification',
      'Any guarantee or promise that an adviser, link, or payment is safe',
    ],
    patternsTitle: 'Common patterns Indian retail investors encounter',
    patternTag: 'Common risk pattern',
    patterns: [
      {
        title: 'Fake "VIP Institutional" WhatsApp Groups',
        desc: 'Messages promising "20–30% monthly profit" or "upper-circuit tips", often using copied names of well-known analysts.',
      },
      {
        title: 'Sideloaded Trading Apps (.apk)',
        desc: 'Links sent on chat to install an app outside Google Play or Apple App Store, showing fabricated profit screens to encourage larger deposits.',
      },
      {
        title: '"Tax" or "Unlock Fee" Before Withdrawal',
        desc: 'Asking for extra ₹ deposits before letting you withdraw your own funds — regulated brokers deduct applicable taxes automatically, never via separate UPI transfers.',
      },
    ],
  },
  about: {
    kicker: 'About Investor Scam Check · Educational Demo',
    title: 'Designed for calm, accessible decisions before money leaves your account.',
    intro:
      'Investor Scam Check is an educational demo built to help first-time investors, senior citizens, and family members slow down and check suspicious investment pitches together.',
    principlesTitle: 'Our design principles',
    principles: [
      {
        title: 'Calm & non-alarmist',
        desc: 'We highlight specific risk indicators in plain language — never accusing named persons or creating panic.',
      },
      {
        title: 'Honest about limits',
        desc: 'Whenever live SEBI or bank records cannot be checked in this demo, we clearly display "Can\'t verify" and never promise safety.',
      },
      {
        title: 'Built for families & seniors',
        desc: 'Large readable type, accessible status icons alongside colour, multilingual support, and one-tap shareable summaries.',
      },
    ],
    directoryTitle: 'Official Indian verification & reporting resources',
    directoryNote: 'Always type official portal addresses directly or open them from trusted bookmarks:',
    resources: [
      {
        name: 'SEBI Investor Support & Trading Apps',
        detail: 'investor.sebi.gov.in/Investor-support.html · Verify registered advisers, brokers, and authorised trading-app links.',
      },
      {
        name: 'SEBI SCORES (Registered Intermediaries Only)',
        detail: 'scores.sebi.gov.in · Lodge complaints strictly involving SEBI-registered intermediaries.',
      },
      {
        name: 'National Cyber Crime Helpline & Portal',
        detail: 'For general cyber, UPI, or banking fraud: contact your bank immediately, dial 1930, and report on cybercrime.gov.in.',
      },
      {
        name: 'RBI Sachet Portal',
        detail: 'sachet.rbi.org.in · Check or report unauthorized deposit-taking schemes.',
      },
    ],
  },
  postIncidentHelp: {
    triggerBtn: 'I already paid or shared details',
    triggerHint:
      'Sent money, shared an OTP/PIN, tapped a link, or installed an app? Follow calm next steps here without entering private details.',
    modalTitle: 'I already paid or shared details',
    modalSubtitle:
      'Choose what happened so far to see calm, plain-language steps. No account numbers, PINs, OTPs, or incident details are collected here.',
    privacyBadge: 'Nothing saved · No AI used · Official routes only',
    selectPrompt: 'What happened?',
    closeBtn: 'Close help guide',
    backToCheckerBtn: 'Back to message checker',
    urgentRuleNote: 'If money has been taken, contact your bank and report it as soon as possible.',
    reportingTitle: 'Report online financial fraud promptly',
    reportingBody:
      'Call the National Cyber Crime Helpline 1930 or file a report directly on the official National Cyber Crime Reporting Portal (https://cybercrime.gov.in/).',
    reportingPortalLabel: 'Open National Cyber Crime Portal (cybercrime.gov.in)',
    helplineBadge: 'Helpline: 1930',
    sourcesTitle: 'Official RBI, Cyber Crime & SEBI guidance',
    rbiPdfLabel: 'RBI Unauthorised Electronic Transactions Guide (PDF)',
    cyberPortalLabel: 'National Cyber Crime Reporting Portal',
    sebiFakeAppPdfLabel: 'SEBI Fake Trading App Scam Guide (PDF)',
    disclaimerNote:
      'General safety guidance only — not a bank investigation, legal opinion, guarantee of fund recovery, or recovery timeline. This demo has not contacted any bank, blocked any account, verified any transaction, checked your device, filed a report, saved your choice, or sent anything to AI.',
    choices: {
      paid: {
        label: 'I sent money or approved a payment.',
        shortHint: 'UPI, bank transfer, QR scan, or payment approval already happened',
        heading: 'Steps if you sent money or approved a payment',
        summary:
          'Act quickly through your bank’s official channels and official cyber-crime reporting routes.',
        steps: [
          'Contact your bank or payment provider immediately using its official mobile app, official website, or a phone number you independently verify (never a helpline number sent in the suspicious message).',
          'Report online financial fraud at 1930 or https://cybercrime.gov.in/ as soon as possible.',
          'Keep relevant chat messages, phone numbers, payment screenshots, and bank/UPI transaction records safely for your bank or authorities.',
        ],
        showReportingCard: true,
      },
      shared_secret: {
        label: 'I shared an OTP, PIN, password, or card detail.',
        shortHint: 'Credentials, card details, or verification codes were shared',
        heading: 'Steps if you shared an OTP, PIN, password, or card detail',
        summary:
          'Stop sharing any further codes and ask your bank or payment provider directly to secure your account.',
        steps: [
          'Do not share any more OTPs, UPI PINs, ATM PINs, passwords, CVVs, or card details with anyone.',
          'Contact your bank or payment provider immediately through its official app, website, or verified customer care number and follow its instructions to secure the affected account, UPI access, or card.',
          'Check your recent statements inside your official banking app. If any money was taken, contact your bank immediately and report at 1930 or https://cybercrime.gov.in/.',
        ],
        showReportingCard: true,
      },
      clicked_or_installed: {
        label: 'I clicked a link or installed an app.',
        shortHint: 'Tapped an unfamiliar link or installed an .apk / external app',
        heading: 'Steps if you clicked a link or installed an app',
        summary:
          'Stop interacting with the link or app and contact your bank officially if any financial detail was entered.',
        deviceNotCheckedNote:
          'Important: This web app has NOT scanned or checked your phone, computer, or bank account.',
        steps: [
          'Do not enter any more personal or banking information, and do not approve any incoming payment or collect requests.',
          'If you entered financial details or notice an unauthorised transaction, contact your bank or payment provider immediately through official channels and report at 1930 or https://cybercrime.gov.in/.',
          'Review SEBI’s official Fake Trading App guidance below for common warning signs around off-store apps and remote-access tools.',
        ],
        showReportingCard: true,
      },
      not_acted: {
        label: 'I received a suspicious message but have not acted.',
        shortHint: 'No money sent, no codes shared, and no app installed',
        heading: 'Steps when you have not acted yet',
        summary:
          'Staying paused keeps you in control. You can double-check any claims directly with official portals.',
        steps: [
          'Do not reply to the sender, do not send money or a "test payment", do not share OTPs/PINs/passwords, and do not install apps from links.',
          'If you want to inspect the message wording, claimed SEBI number, link, or payment handle, return to the message checker and verify any registration or handle directly on official SEBI portals.',
        ],
        showReportingCard: false,
        showBackToChecker: true,
      },
    },
  },
  groupChat: {
    kicker: 'Multi-Message Screening · Plain-Language Pattern Review',
    title: 'Review a group chat',
    subtitle:
      'Paste several related messages together to see possible stages and warning signs in plain language. This educational screening tool cannot prove whether any person, group, company, offer, or message is genuine or fraudulent.',
    entryHint: 'Received a multi-message Telegram or WhatsApp thread? Check all messages together.',
    switchSingleBtn: 'Check a message',
    privacyTitle: 'Remove private details before pasting',
    privacyBody:
      'Please remove real names, phone numbers, bank account numbers, OTPs, UPI PINs, passwords, and personal IDs before pasting. Any detected secrets, account numbers, phone numbers, or emails are automatically redacted before display, copying, or optional Gemini review, and nothing is saved.',
    presetsTitle: 'Try a sample conversation (Examples)',
    presetsHint: 'Each option loads an illustrative example — suspicious, protective, neutral, or mixed.',
    exampleTagSuspicious: 'Suspicious example',
    exampleTagGenuine: 'Genuine safety example',
    exampleTagMixed: 'Mixed example',
    clearBtn: 'Clear chat',
    inputLabel: 'Paste related chat messages together',
    inputPlaceholder:
      'Paste one or more messages here (speaker names and dates are optional)...',
    formatHintTitle: 'Optional speaker labels and approximate dates (neither is required)',
    formatHintBody:
      'You can paste plain lines or paragraphs directly, or include optional labels/dates like:',
    formatExamples: [
      '[Day 1] Admin: Welcome to VIP desk...',
      '12 Oct - Member 1: Thanks for profit...',
      'Plain unlabelled message line',
    ],
    demoOnlyBtn: 'Use demo check only',
    checkingBtn: 'Reviewing conversation...',
    aiReviewBtn: 'Get Gemini AI review',
    aiLoadingBtn: 'Getting Gemini review...',
    validationError: 'Please paste at least one chat message or choose an example above.',
    consentTitle: 'Before sending this conversation to Gemini',
    consentBody:
      'Your pasted conversation text (with detected OTPs, PINs, passwords, CVVs, account/card numbers, phone numbers, emails, and personal UPI handles redacted) will be processed by the Gemini AI service to produce this structured review. It is not sent to Google Search grounding and is not saved in any database, log, or persistent storage.',
    consentContinueBtn: 'Continue',
    consentDemoOnlyBtn: 'Use demo check only',
    unavailableTitle: 'Gemini AI review is unavailable right now',
    unavailableNotConfigured:
      'No server AI credentials are active in this environment. Use the local demo check below instead — your conversation stays offline in your browser.',
    unavailableError:
      'The Gemini service could not complete this review right now. Please use the local demo check and official SEBI portals.',
    modeDemoBadge: 'Demo check only (local rules)',
    modeAiBadge: 'Gemini AI review (session only)',
    privacyBadge: 'Not saved · Redacted before AI · No Search grounding',
    verdictWarningSigns: 'Warning signs found',
    verdictNoListedSigns: 'No listed warning signs found',
    noSafeProofNote:
      'Not finding listed warning signs does NOT prove this conversation, group, company, app, or offer is genuine or safe. Always verify registration and payment details directly on official portals.',
    singlePhraseNote:
      'Context note: Evidence here is limited or based on a single phrase. A single suspicious phrase or partial excerpt does not prove fraud on its own.',
    emptyTitle: 'Ready to screen a group conversation',
    emptyBody:
      'Paste related messages on the left (or select an example above) and choose "Use demo check only" or "Get Gemini AI review".',
    copySummaryBtn: 'Copy summary',
    copiedSummaryBtn: 'Summary copied',
    section1SummaryTitle: 'Conversation summary',
    section2StagesTitle: 'Possible stages',
    stagesIntro:
      'These 5 stages describe possible patterns — not a fixed scam script. A chat may show one stage, several, or none.',
    stageSupportedBadge: 'Pattern noted in chat',
    stageNotEnoughInfoBadge: 'Not enough information',
    stageNotEnoughInfoDesc: 'Not enough information in the pasted messages.',
    section3WarningsTitle: 'Warning signs',
    warningSourceLabel: 'Source message:',
    warningPhraseLabel: 'Supporting phrase:',
    noWarningsBody:
      'No listed warning signs were matched in the wording you pasted.',
    section4UncheckedTitle: 'What could not be checked',
    cannotVerifyDirectlyLabel: 'This app cannot verify this directly',
    section5NextStepsTitle: 'Next steps',
    disclaimerNote:
      'Educational screening tool only — cannot prove that a person, group, company, offer, or message is genuine or fraudulent. Nothing pasted here is saved.',
    messageNumberLabel: (n) => `Message ${n}`,
    parsedSummaryLine: (count, hasSpeakers, hasDates) =>
      `Reviewed ${count} ${count === 1 ? 'message' : 'messages'}${
        !hasSpeakers && !hasDates
          ? ' (optional speaker labels and dates were not provided).'
          : hasSpeakers && hasDates
            ? ' with speaker labels and date markers.'
            : hasSpeakers
              ? ' with speaker labels (no date markers).'
              : ' with date markers (no speaker labels).'
      }`,
    topicCluesLine: (topics) => `Topics and requests mentioned include: ${topics}.`,
    stageTitles: {
      initial_offer: '1. Initial unsolicited investment offer or social-media contact',
      trust_building:
        '2. Trust-building through claimed expertise, testimonials, screenshots, or group activity',
      app_or_group_invite:
        '3. Invitation to use a trading app, website, private group, or APK',
      payment_or_recruiting_pressure:
        '4. Pressure to invest more, recruit others, pay a fee, or act quickly',
      withdrawal_friction:
        '5. Withdrawal difficulties, additional charges, or requests for more money',
    },
    stageSupportedReason: {
      initial_offer:
        'A message promotes an investment group, quota, or high return promise that deserves verification.',
      trust_building:
        'Messages cite profit screenshots, praise, claimed credentials, or reassurance ("safe" / "don’t worry"). Treat reassurance and screenshots cautiously.',
      app_or_group_invite:
        'A message invites members to move to a private chat group or install an external trading app or .apk file.',
      payment_or_recruiting_pressure:
        'Messages push urgent payment, extra capital, recruitment, fees, or sensitive PIN/OTP sharing.',
      withdrawal_friction:
        'A message mentions blocked/frozen withdrawals or asks for extra tax/unlock fees before releasing funds.',
    },
    warningExplanations: {
      secretRequest: {
        title: 'Request for OTP, PIN, password, CVV, or remote access',
        explanation:
          'Never share OTPs, UPI/ATM PINs, passwords, or CVVs. Real advisers and banks never ask for these.',
      },
      pinToReceive: {
        title: 'Claim that PIN or QR scan is needed to receive money',
        explanation:
          'Entering your UPI PIN or scanning a QR code always sends money out — never to receive profits or refunds.',
      },
      guaranteedReturn: {
        title: 'Promise of guaranteed or risk-free returns',
        explanation:
          'Regulated stock-market investments cannot promise fixed or risk-free profits.',
      },
      multiplierReturn: {
        title: 'Unusually high short-term return or multiplier claim',
        explanation:
          'Large promised returns in days or months warrant pausing and verifying independently.',
      },
      urgencyPressure: {
        title: 'Urgency or deadline pressure to pay quickly',
        explanation:
          'Deadlines like "today only" pressure people into paying before checking official records.',
      },
      vipPitch: {
        title: 'Exclusive "VIP desk", "block deal", or "pre-IPO quota" claim',
        explanation:
          'Exclusive quota wording is common in unverified pitches; verify any firm directly with SEBI.',
      },
      offPlatformOrApk: {
        title: 'Off-platform group or external app / .apk download invite',
        explanation:
          'Downloading trading apps outside Google Play/App Store or moving to private chats bypasses investor protections.',
      },
      upfrontOrWithdrawalFee: {
        title: 'Upfront fee, tax, or charge requested to unlock or withdraw funds',
        explanation:
          'Paying extra fees or taxes outside regulated accounts to release withdrawals is a major warning sign to pause.',
      },
      testimonialOrProofHype: {
        title: 'Group profit screenshots, testimonials, or unverified certification claims',
        explanation:
          'Screenshots and praise inside a group chat cannot prove genuine trades or SEBI registration.',
      },
      recruitmentPressure: {
        title: 'Pressure to deposit more money or recruit others',
        explanation:
          'Requests to top up deposits or bring friends for bonuses require independent verification before paying.',
      },
      unverifiedReassurance: {
        title: 'Sender reassurance ("this is safe", "not a scam", "do not worry")',
        explanation:
          'Calling a pitch "safe" or "not a scam" in chat does not prove legitimacy when paired with requests or return promises.',
      },
    },
    contextUnclearFallback:
      'Context may be incomplete in a short chat excerpt; a single phrase alone does not prove fraud.',
    uncheckedItems: {
      noSebiId:
        'No SEBI registration number was verified here (and speaker claims cannot prove registration).',
      noAppOrLink: 'No complete official website or store listing details were available to inspect.',
      noPaymentHandle: 'No verified bank beneficiary name or @valid UPI confirmation was provided.',
      noSpeakerOrDates:
        'Speaker identities and exact dates are unconfirmed or optional in pasted text.',
      liveSebi:
        'This app cannot verify this directly: Live SEBI intermediary registration status (check investor.sebi.gov.in/Investor-support.html).',
      liveSebiCheck:
        'This app cannot verify this directly: Live UPI ID, QR code, or bank/IFSC details (check siportal.sebi.gov.in/intermediary/sebi-check).',
      liveAppsAndDomain:
        'This app cannot verify this directly: Official authorised trading apps or live website/APK safety (check investor.sebi.gov.in/Investor-support.html).',
    },
    nextStepsList: [
      'Pause before sending any money, clicking unknown links, or installing .apk / external trading apps.',
      'Verify the exact company or adviser registration and authorised trading app on investor.sebi.gov.in/Investor-support.html, and read SEBI’s Spot Any Scam & Fake Trading App guides.',
      'Check any UPI ID, QR code, or bank/IFSC details directly on SEBI Check (siportal.sebi.gov.in/intermediary/sebi-check) before paying.',
      'If money was already sent or credentials shared, contact your bank immediately through official channels and report financial cyber fraud at 1930 or https://cybercrime.gov.in/.',
    ],
    presets: {
      'gc-multi-stage': {
        title: 'Multi-Stage VIP Pitch & Fee Hold',
        subtitle: 'Offer -> screenshots -> .apk app -> urgent fee -> withdrawal tax',
      },
      'gc-protective-otp': {
        title: 'Family Safety Warning (OTP/PIN)',
        subtitle: 'Protective reminders never to share OTP/PIN or rush',
      },
      'gc-neutral-discuss': {
        title: 'Neutral Investing Discussion',
        subtitle: 'Balanced index fund & official portal discussion',
      },
      'gc-mixed-chat': {
        title: 'Mixed Safety Tip & Risky Pitch',
        subtitle: 'One member warns on OTP while moderator pushes 20% profit',
      },
    },
  },
  footer: {
    note: 'Investor Scam Check · Educational Demo · Pre-payment risk awareness tool, not financial or legal advice.',
  },
  analyzer: {
    pitchGuaranteed:
      'Promises guaranteed or risk-free returns, which registered market investments cannot guarantee.',
    pitchMultiplier: 'Mentions unusually high short-term percentage or multiplier returns.',
    pitchUrgency: 'Uses time pressure or urgency to push a quick payment before you can verify.',
    pitchVip:
      'Uses exclusive "VIP desk", "block deal", or "pre-IPO quota" wording commonly seen in unverified pitches.',
    pitchGroupApp: 'Asks to move to a private chat group or install an external app.',
    pitchFees: 'Mentions upfront fees, margin top-ups, or charges before releasing profits.',
    pitchSecretRequest:
      'Never share your UPI PIN, ATM PIN, OTP, CVV, or password with anyone. Legitimate advisers and banks never ask for these to verify your account or release profits.',
    pitchPinToReceive:
      'Entering your UPI PIN or scanning a QR code always sends money out — you never need a PIN or QR scan to receive money, rewards, or refunds.',
    msgNotProvidedLabel: 'Not provided',
    msgNotProvidedHeadline: 'No investment message entered',
    msgNotProvidedDesc:
      'Paste the WhatsApp, Telegram, or SMS message if you have it so we can look for pressure tactics or return promises.',
    msgHighLabel: 'Warning signs found',
    msgHighHeadline: 'Warning signs detected in message wording',
    msgSecretHeadline: 'Message asks for a PIN, OTP, CVV, or password — never share these',
    msgCautionLabel: 'Warning signs found',
    msgCautionHeadline: 'Off-platform group or upfront fee request mentioned',
    msgNoSignsLabel: 'No listed warning signs found',
    msgNoSignsHeadline: 'No listed warning signs found in text',
    msgNoSignsDesc:
      'Not matching our listed keywords does NOT prove this message is genuine or safe. Fraudulent or impersonated messages can sound polite. Always verify the sender on sebi.gov.in.',
    sebiMissingLabel: 'Not provided',
    sebiMissingHeadline: 'No SEBI registration or company entered',
    sebiMissingDesc:
      'Optional field left blank. If someone asks you to invest, look up registered advisers directly on investor.sebi.gov.in.',
    sebiMissingDemo: 'Demo-only check: Live SEBI registry lookup is unavailable here.',
    sebiValidLabel: 'Could not verify — check directly with SEBI',
    sebiValidHeadline: (id) => `Format matches SEBI ID pattern (${id}) — not verified live`,
    sebiValidDesc:
      'Anyone can copy a real registration number from the internet, and a pattern match is NOT live verification. SEBI registration by itself also does not guarantee investment performance or returns.',
    sebiValidDemo:
      'Demo-only format check: Verify the exact name, certificate, and official contact details on investor.sebi.gov.in.',
    sebiMismatchLabel: 'Warning signs found',
    sebiMismatchHeadline: 'Claimed registration does not match standard SEBI ID format',
    sebiMismatchDesc:
      'Standard SEBI registration numbers usually start with INA, INH, INZ, INP, or INM followed by 9 digits. Verify the exact certificate on investor.sebi.gov.in.',
    sebiNameOnlyLabel: 'Could not verify — check directly with SEBI',
    sebiNameOnlyHeadline: 'Entity name entered without a standard SEBI registration number',
    sebiNameOnlyDesc:
      'A company or adviser name alone cannot confirm registration, and SEBI registration never guarantees returns. Ask for their 12-character SEBI number and verify it on investor.sebi.gov.in.',
    sebiCantVerifyDemo: 'Demo-only format check: Live SEBI intermediary records are not connected.',
    linkNotProvidedLabel: 'Not provided',
    linkNotProvidedHeadline: 'No website or app link entered',
    linkNotProvidedDesc:
      'If the message includes a website, login portal, or app download link, paste it to check for common warning clues.',
    linkHighLabel: 'Warning signs found',
    linkApkHeadline: 'Direct app download (.apk) or unverified install link clue',
    linkApkDesc:
      'Warning clue: Installing trading apps from links outside Google Play Store or Apple App Store can expose your phone, SMS OTPs, and bank apps to unauthorized access.',
    linkSpoofHeadline: 'Lookalike domain or unusual web address clue',
    linkSpoofDesc:
      'Warning clue: This address places brand or market words inside an unfamiliar domain. Never treat a familiar name, HTTPS padlock, or polished page as proof of legitimacy — check authorised apps via investor.sebi.gov.in/Investor-support.html.',
    linkDemoDomain: 'Demo-only check: Live domain ownership and SSL checks are unavailable here.',
    linkCautionLabel: 'Warning signs found',
    linkShortenerHeadline: 'Shortened or chat-redirect link hides the final destination',
    linkShortenerDesc:
      'Short links hide where you will land. Avoid entering login details, PAN, or bank information on pages reached through shortened links.',
    linkHttpHeadline: 'Link uses unencrypted http:// rather than https://',
    linkHttpDesc:
      'Financial portals should use encrypted https:// — though remember HTTPS alone only encrypts the connection and never proves a site is authorised or safe.',
    pitchAuthorityThreat:
      'The message claims a police, CBI, customs or other agency case against you. Real agencies do not arrest people over a call or video call, and there is no such thing as a "digital arrest". Hang up and call the agency on its official number.',
    pitchSafeAccount:
      'You are told to move money to a "safe", "verification" or government account. No real bank, police force or regulator asks you to do this. Stop and call 1930 or your bank using the number on your card.',
    pitchTaskFraud:
      'This looks like a task or part-time job scam: small early payouts for liking videos or rating products, then requests to deposit money to unlock higher tasks. The money you deposit is not returned.',
    pitchCryptoPlatform:
      'A trading or crypto platform that promises daily returns or easy withdrawals, or a stranger with "inside" information, is a common pattern in investment scams. Fake apps show fake profits until you try to withdraw.',
    pitchDeepfake:
      'Scammers use fake or edited videos of well-known people to make an app or platform look endorsed. Real endorsements do not ask you to join a private chat or deposit money through a link.',
    linkTldHeadline:
      'Web address ends in a cheap, high-abuse extension',
    linkTldDesc:
      'Extensions such as .top, .xyz, .vip or .click are cheap to register and common in throwaway scam sites. Real brokers use their own well-known domains, so check the name on investor.sebi.gov.in before trusting this link.',
    linkCantVerifyLabel: 'Not verified by this demo',
    linkCantVerifyHeadline: (host) => `Domain noted (${host}) — not verified by this demo`,
    linkCantVerifyDesc:
      'A clean web address, HTTPS padlock, or familiar brand name does NOT prove a platform is genuine or safe. Verify authorised sites and trading apps via investor.sebi.gov.in/Investor-support.html.',
    linkDemoReputation: 'Demo-only check: Live website reputation and WHOIS lookup are unavailable.',
    payNotProvidedLabel: 'Not provided',
    payNotProvidedHeadline: 'No UPI ID, bank account, or payment amount entered',
    payNotProvidedDesc:
      'Add the UPI handle, bank account, or ₹ amount being requested. Never transfer investment funds to an individual’s personal handle.',
    payHighLabel: 'Warning signs found',
    payPersonalUpiHeadline: (upi) => `Personal-style UPI handle (${upi}) for an investment pitch`,
    payPersonalAccountHeadline: 'Transfer requested to an unverified or individual account',
    payPersonalDesc: (amountText) =>
      `SEBI-registered intermediaries collect funds only through verified corporate channels or SEBI-validated @valid handles — not personal handles${
        amountText ? ` (especially for ${amountText})` : ''
      }.`,
    payDemoLookup: 'Demo-only check: Live UPI account holder and SEBI Check lookups are unavailable.',
    payCautionLabel: 'Warning signs found',
    payLargeHeadline: (amount) =>
      `Pre-payment check for ${amount} — verify recipient name and amount carefully`,
    payLargeDesc:
      'Before confirming any transfer of this size, verify inside your banking app that the verified beneficiary name matches the exact registered company name and confirm the exact ₹ amount.',
    payDemoBank: 'Demo-only check: Live NPCI / bank beneficiary verification is unavailable.',
    payValidUpiLabel: 'Could not verify — check directly with SEBI',
    payValidUpiHeadline: (upi) => `SEBI-style @valid handle noted (${upi}) — verify on SEBI Check`,
    payValidUpiDesc:
      'Handles ending in @valid are intended for SEBI-registered intermediaries, but live validation and ownership cannot be confirmed here. Verify this exact handle on SEBI Check (siportal.sebi.gov.in) and confirm the bank-displayed recipient name and exact amount before approving.',
    payNonValidUpiHeadline: (upi) =>
      `UPI handle noted (${upi}) — not shown as a SEBI-validated @valid handle`,
    payNonValidUpiDesc:
      'This handle is not shown as a SEBI-validated @valid handle in this demo. Check it directly on SEBI Check before paying, and confirm the bank-verified recipient name inside your banking app.',
    payAmountContextHeadline: (amount) => `Requested amount noted (${amount}) — neutral context`,
    payAmountContextDesc:
      'An amount alone does not indicate a scam or confirm safety. Always verify the recipient name and exact ₹ amount inside your banking app before entering your UPI PIN.',
    payCantVerifyLabel: 'Not verified by this demo',
    payCantVerifyHeadline: 'Payment handle noted — recipient identity is not verified by this demo',
    payCantVerifyDesc:
      'Always confirm the exact bank-verified recipient name and ₹ amount inside your banking app before entering your UPI PIN. Entering your PIN only sends money out.',
    payDemoNotConnected: 'Demo-only check: Live UPI / bank account verification is not connected.',
    unifiedEmptyTitle: 'Enter at least one detail to begin',
    unifiedEmptySummary:
      'Paste the message, claimed SEBI number, website link, or UPI/payment request — or pick one of the realistic examples above.',
    unifiedEmptyInsight:
      'Connecting all four pieces helps reveal mismatches that a single check might miss.',
    unifiedEmptyStep: 'Paste whatever details you received before opening your payment app.',
    unifiedEmptyDemo: 'Demo-only assessment: No live SEBI, domain, or UPI checks are performed.',
    unifiedHighTitle: 'Warning signs found — pause before sending money',
    unifiedHighSummary: (highCount, cautionCount) =>
      `We spotted warning signs across ${highCount + cautionCount} ${
        highCount + cautionCount === 1 ? 'area' : 'areas'
      } of the details you shared. Do not transfer funds until you verify every detail through official channels.`,
    unifiedCautionTitle: 'Warning signs found — verify details before sending money',
    unifiedCautionSummary:
      'Some details triggered warning signs that need independent verification before you pay. Always confirm registration and payee identity separately.',
    unifiedCantVerifyTitle: 'No listed warning signs found — verify via official portals',
    unifiedCantVerifySummary:
      'No listed warning signs were matched by our demo rules, and this does NOT prove the message, offer, or payee is genuine or safe. Always verify directly with SEBI and your bank app.',
    insightPitchPay: (amountText) =>
      `Connected mismatch: The message makes strong profit or urgency claims and uses an unverified SEBI claim or lookalike link, while asking for payment${
        amountText ? ` (${amountText})` : ''
      } to an individual or non-corporate account rather than a verified intermediary channel.`,
    insightPitchUnverifiedPay: (amountText) =>
      `Connected review: The message makes strong profit or urgency claims alongside a lookalike link or unverified SEBI claim, while requesting payment${
        amountText ? ` (${amountText})` : ''
      } to a handle that is not verified here. Check every detail on official SEBI portals before paying.`,
    insightLink:
      'Connected mismatch: An investment pitch paired with a lookalike web link or direct .apk download file often bypasses official broker apps and investor protections.',
    insightSebiPay: (sebiId, amountText) =>
      `Connected mismatch: A SEBI-style registration (${sebiId}) is cited, yet the payment destination${
        amountText ? ` (${amountText})` : ''
      } does not look like a regulated corporate/SEBI-validated channel.`,
    insightGeneralGap:
      'Connected review: When an investment pitch, registration claim, link, and payment request are checked together, gaps or urgency in any one part are a strong reason to pause.',
    insightUnconfirmed:
      'Connected review: Only limited risk signals were matched by demo rules. Because live SEBI and UPI registries are not connected here, treat every unverified detail as unconfirmed.',
    unifiedNextSteps: [
      'Pause before paying: Do not send money right away, even if told a "seat", "IPO quota", or "offer" will expire today.',
      'Check SEBI directly: Visit investor.sebi.gov.in/Investor-support.html yourself and match the registration number, company name, official contact, and authorised trading app. Remember SEBI registration never guarantees returns.',
      'Confirm payee & @valid handles: Verify UPI IDs, QR codes, or bank/IFSC details on SEBI Check (siportal.sebi.gov.in), and confirm the exact recipient name and ₹ amount in your payment app before entering your PIN.',
      'Use the right reporting route: For complaints against SEBI-registered intermediaries use SCORES (scores.sebi.gov.in). For general cyber, UPI, or banking fraud — or if money was already sent — contact your bank immediately, dial 1930, and report on cybercrime.gov.in.',
    ],
    unifiedDemoLimit:
      'Demo-only check: Uses transparent pattern and format checks on entered text. Does not query live SEBI, domain, or NPCI/UPI systems, and never guarantees safety.',
    payCheckEmptyTitle: 'Enter payment details to review',
    payCheckEmptySummary:
      'Enter the UPI ID, bank account, or amount you are about to pay — or select a realistic example above.',
    payCheckEmptyDemo: 'Demo-only check: Does not verify live bank accounts or UPI IDs.',
    payFindingNameDiffTitle: 'Account holder name does not match the claimed firm',
    payFindingNameDiffDesc:
      'When an investment platform or adviser asks you to pay an unrelated individual’s name or a completely different business, stop immediately.',
    payFindingNameUnsureTitle: 'Beneficiary name has not been confirmed yet',
    payFindingNameUnsureDesc:
      'Before entering your PIN or password, check the bank-verified recipient name and exact ₹ amount displayed on your UPI or NetBanking screen.',
    payFindingNonValidUpiTitle: (suffix) =>
      `UPI handle (@${suffix}) — check directly on SEBI Check`,
    payFindingNonValidUpiDesc:
      'This handle is not shown as a SEBI-validated @valid handle in this demo. Check it directly on SEBI Check before paying, and confirm the recipient name inside your banking app.',
    payFindingValidUpiTitle: '@valid UPI format noted — must still be verified on SEBI Check',
    payFindingValidUpiDesc:
      'Having "@valid" in text is NOT live proof of authenticity, and live validation and ownership cannot be confirmed here. Always verify the exact handle on SEBI Check (siportal.sebi.gov.in) and confirm the recipient name and exact amount in your payment app.',
    payFindingUpiFormatTitle: 'UPI ID format looks incomplete',
    payFindingUpiFormatDesc:
      'A standard UPI ID includes an "@" symbol (for example, name@bank). Double-check who provided this handle.',
    payFindingQrTitle: 'QR codes or chat payment links hide account details until scan',
    payFindingQrDesc:
      'Never scan a QR code sent over chat to "receive" a refund or profit — scanning a QR and entering your PIN always sends money out.',
    payFindingBankTitle: 'Direct IMPS/NEFT transfer requested outside an official trading app',
    payFindingBankDesc:
      'Regulated brokers accept funds through verified exchange-linked payment gateways inside their official app or website — not via bank account numbers shared on chat.',
    payFindingSourceTitle: 'Payment requested via WhatsApp or Telegram',
    payFindingSourceDesc:
      'Requests to transfer investment money from chat groups are a frequent indicator of impersonation or unauthorized schemes.',
    payFindingAmountTitle: (amount) => `Requested amount: ${amount} (neutral context)`,
    payFindingAmountDesc:
      'An amount alone does not indicate risk or establish safety. Confirm the registered recipient name and exact ₹ amount inside your banking app before paying.',
    payFindingAmountContextTitle: (amount) => `Requested amount in context (${amount})`,
    payFindingAmountContextDesc:
      'An amount alone does not signal a scam, but because independent warning signs were flagged above (such as recipient mismatch, chat source, or an unofficial route), pause before sending this amount and verify directly on official SEBI portals.',
    payFindingLiveTitle: "Not verified by this demo: live account holder or SEBI Check status",
    payFindingLiveDesc:
      'This tool cannot query NPCI, bank records, or SEBI Check live. Treat an absence of warnings here as "unverified", never as "safe".',
    payCheckHighTitle: 'Warning signs found — do not tap Pay yet',
    payCheckHighSummary:
      'The combination of payment handle, source, or recipient name triggered warning signs. Pause and verify through official broker/SEBI channels.',
    payCheckCautionTitle: 'Warning signs found — confirm recipient and amount before paying',
    payCheckCautionSummary:
      'Check every item in the pre-payment checklist below before entering your UPI PIN or banking password.',
    payCheckCantVerifyTitle: 'No listed warning signs found — verify recipient officially',
    payCheckCantVerifySummary:
      'No listed warning signs were matched by demo rules, which does NOT prove this payment request is genuine or safe. Confirm the exact recipient name and amount inside your bank app.',
    payCheckChecklist: [
      'Does the bank/UPI app show the exact registered company name and the exact ₹ amount you intend to pay?',
      'Are you paying inside an official broker app or website listed via investor.sebi.gov.in/Investor-support.html (not a chat link)?',
      'Have you verified the firm’s SEBI number on investor.sebi.gov.in and its UPI/QR/bank details on SEBI Check?',
      'Remember: Entering your UPI PIN or scanning a QR code only sends money out — it is never needed to receive profits or refunds.',
    ],
    payCheckDemoLimit:
      'Demo-only check: Live bank beneficiary lookup, NPCI VPA verification, and SEBI Check lookups are unavailable in this demo.',
  },
};
