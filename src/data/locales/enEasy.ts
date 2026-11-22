import type { TranslationBundle } from '../../types/check';

export const enEasy: TranslationBundle = {
  brandName: 'Investor Scam Check',
  footerTag: 'Pre-Payment Learning Demo',
  demoBanner:
    'Demo tool only: This checks simple rules on sample text. It cannot check real SEBI lists or bank accounts, and cannot promise any offer is safe.',
  nav: {
    checkMessage: 'Check a message',
    reviewGroupChat: 'Review a group chat',
    checkPayment: 'Check a payment',
    howItWorks: 'How it works',
    about: 'About',
  },
  languageLabel: 'Choose language',
  menuOpen: 'Open menu',
  menuClose: 'Close menu',
  hero: {
    kicker: 'Simple Check Before You Pay · Made for Indian Families',
    title: 'Stop and check before you send money.',
    subtitle:
      'Tricky investment tips often mix four things: a rushed message, a copied SEBI number, a strange web link, and a personal UPI ID. Check all four together in simple words before paying.',
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
    messageSummaryTitle: 'Quick look at all 4 parts',
    paymentSummaryTitle: 'What we checked in this payment',
    highRiskCount: (n) => `${n} Warning signs`,
    cautionCount: (n) => `${n} Warning signs`,
    unverifiedCount: (n) => `${n} Unverified / No signs`,
    notEnteredCount: (n) => `${n} Not provided`,
  },
  checkBasis: {
    patternClues: 'Word clues only · Not an official check',
    formatOnly: 'Number/ID shape check only · Not verified live',
    notProvided: 'Not provided',
    unverifiedLive: 'Live check unavailable · Check officially',
  },
  messageCheck: {
    presetsTitle: 'Try a sample message',
    presetsHint: 'Tap an example to see how it works, or type your own details below.',
    clearBtn: 'Clear all',
    graphTitle: '4 clues checked together',
    graphProgress: (filled) =>
      filled === 0
        ? '0 of 4 clues added — tap any box to start'
        : `${filled} of 4 clues added`,
    nodeEmpty: 'Empty',
    nodeEntered: 'Added',
    nodeFocusHint: (label) => `Go to ${label} box`,
    formTitle: '1. Add what they sent you',
    formSubtitle: 'Put in whatever you have. Even one or two boxes help.',
    cluesCount: (filled) => `${filled} of 4 added`,
    stepperAriaLabel: '4 steps progress',
    steps: {
      message: 'Message',
      sebi: 'SEBI ID',
      link: 'Link',
      payment: 'Payment',
    },
    pillarTitles: {
      message: 'The message and promises',
      sebi: 'SEBI number (market licence)',
      link: 'Website or app link',
      payment: 'UPI ID, bank, or amount',
    },
    fields: {
      messageLabel: 'The investment message (WhatsApp / Telegram / SMS)',
      messagePlaceholder:
        'Paste the message here (for example: "25% fixed profit every month, last day today...")',
      sebiLabel: 'SEBI registration number or company name (Optional)',
      sebiPlaceholder: 'For example: INA000012345 or company name',
      sebiHelper:
        'You can leave this blank if you do not have it. If a number is given, check it on investor.sebi.gov.in.',
      linkLabel: 'Website link or app download link',
      linkPlaceholder: 'For example: https://example.in or app link',
      paymentLabel: 'UPI ID (like name@okaxis) or bank account',
      paymentPlaceholder: 'For example: name@okaxis or bank account number',
      amountLabel: 'Money asked for (₹)',
      amountPlaceholder: 'e.g. 25000',
    },
    submitBtn: 'Check for warning signs',
    checkingBtn: 'Checking now...',
    updatedBadge: 'Updated',
    validationError: 'Please add at least one detail above, or tap a sample example.',
    resultTitle: '2. What we found before you pay',
    tileInspectHint: 'Tap a tile to read the full reason below',
    tileViewing: 'Open below',
    tileSelectPrompt: (title) => `Read ${title}`,
    connectionHeading: 'How all 4 clues fit together',
    pillarsHeading: 'Check each part one by one',
    evidenceLabel: 'Matched words in text:',
    nextStepsHeading: 'Calm steps to take before paying',
    shareBtn: 'Copy summary for family',
    shareCopied: 'Copied for family',
    emptyTitle: 'Ready to check before you pay',
    emptyBody:
      'Add a message, SEBI number, link, or UPI ID on the left — or tap a sample above — to see simple advice here.',
  },
  aiReview: {
    triggerBtn: 'Get a plain-language review',
    loadingBtn: 'Getting AI review...',
    panelTitle: 'Optional AI simple review',
    panelSubtitle:
      'An extra plain-language check using AI. The main rule-based check still works without AI.',
    consentTitle: 'Before we send this message to the AI service',
    consentBody:
      'The message you pasted (after hiding any PIN, OTP, CVV, password, and full bank account or card number) will be sent to the Gemini AI service to write a simple review. It will not be sent to Google Search or saved in any database.',
    consentContinueBtn: 'Continue',
    consentDemoOnlyBtn: 'Use the demo check only',
    unavailableTitle: 'AI review is not available right now',
    unavailableNotConfigured:
      'AI service access is not set up here. You can still use the built-in demo check and official links above.',
    unavailableError:
      'The AI service could not finish this check right now. Your built-in demo check still works.',
    verdictWarningSigns: 'Warning signs found',
    verdictNoListedSigns: 'No listed warning signs found',
    warningSignsHeading: 'Possible warning signs found',
    supportingPhraseLabel: 'Exact phrase found:',
    noSignsFoundNote:
      'Finding no warning signs does NOT prove the message is real, allowed, or safe.',
    nextStepsHeading: 'Simple next steps',
    insufficientEvidenceHeading: 'Not enough information in the text',
    limitationsHeading: 'What AI cannot check',
    limitationsBody:
      'AI only reads the words you pasted. It cannot check real SEBI records, bank accounts, UPI IDs, QR codes, or websites.',
    uncertainNote:
      'AI plain-language reading only — treat this as an extra uncertain opinion, not proof, not a real SEBI check, and not financial advice.',
    localOnlyBadge: 'Built-in rules · Works without AI',
    missingMessageError: 'Please paste or pick a message first to get an AI review.',
    privacyBadge: 'Not saved · No web search',
  },
  printSummary: {
    printBtn: 'Print or save summary',
    familyDocKicker: 'Investor Scam Check · Family Handout',
    messageDocTitle: 'Message & Clue Check Summary',
    paymentDocTitle: 'Payment Check Summary',
    verdictLabel: 'Result',
    findingsLabel: 'Checked clues & phrases',
    missingInfoLabel: 'Missing or unverified details',
    nextStepsLabel: 'Safe next steps',
    aiSectionLabel: 'AI simple review (from this screen)',
    officialLinksLabel: 'Official websites to verify directly',
    privacyExclusionNote:
      'Privacy note: Your full pasted message, PINs, OTPs, passwords, CVVs, IFSC codes, bank numbers, and full personal UPI names are kept out of this printout.',
  },
  officialVerify: {
    title: 'Verify through official sources',
    subtitle:
      'Open real SEBI, RBI, NPCI, and Cyber Crime websites directly to check any adviser, UPI ID, trading app, or fraud help desk.',
    sebiLookupLabel: 'SEBI Registration Lookup',
    sebiLookupDesc:
      'Check registered advisers, brokers, and analysts by name or SEBI number on sebi.gov.in.',
    sebiCheckLabel: 'SEBI Check (UPI, QR & Bank)',
    sebiCheckDesc:
      'Check official @valid UPI IDs, QR codes, and bank accounts on siportal.sebi.gov.in.',
    appsListLabel: 'SEBI Support & Approved Apps',
    appsListDesc:
      'Check SEBI registrations and open official exchange lists of real trading apps.',
    spotScamLabel: 'SEBI Spot Any Scam Guide',
    spotScamDesc: 'Official SEBI tips to spot copycats, VIP groups, and profit promises.',
    fakeAppsPdfLabel: 'Fake Trading App Guide (PDF)',
    fakeAppsPdfDesc: 'SEBI guide on how fake trading apps and .apk downloads work.',
    rbiSafetyLabel: 'RBI Safe Digital Banking',
    rbiSafetyDesc: 'Official RBI advice on keeping PINs/OTPs safe and checking who you pay.',
    npciAwarenessLabel: 'NPCI UPI Fraud Guide',
    npciAwarenessDesc: 'Official UPI rules: your PIN only sends money out, never receives money.',
    cyberCrimeLabel: 'Cyber Crime Portal & 1930',
    cyberCrimeDesc: 'For cyber, UPI, or bank fraud: contact your bank right away, call 1930, and report on cybercrime.gov.in.',
    scoresLabel: 'SEBI SCORES Portal',
    scoresDesc: 'Use scores.sebi.gov.in only for complaints about SEBI-registered companies.',
    guidanceStripTitle: 'Official safety guides & where to report',
    qrUnavailableNote:
      'QR code and screenshot image scanning is unavailable in this demo and is never checked live here.',
    openPortalBtn: 'Open official site',
  },
  paymentCheck: {
    kicker: 'Check Before Paying · UPI, QR Code & Bank Transfer',
    title: 'About to send money? Check the payment first.',
    subtitle:
      'Before typing your UPI PIN or sending bank money, check if the UPI ID, where it came from, and the receiver’s name match.',
    presetsTitle: 'Try a sample payment',
    clearBtn: 'Clear',
    formTitle: 'Payment details',
    fields: {
      methodLabel: 'How are they asking you to pay?',
      methods: {
        upi: 'UPI ID',
        bank_transfer: 'Bank Transfer',
        qr_or_link: 'QR or Pay Link',
      },
      methodHints: {
        upi: 'Send to name@bank ID',
        bank_transfer: 'Bank account + IFSC',
        qr_or_link: 'Scan QR or open link',
      },
      handleLabel: 'UPI ID, bank account number, or link',
      handlePlaceholderUpi: 'e.g. sample.desk@okaxis',
      handlePlaceholderBank: 'e.g. Account number 4001928374',
      handlePlaceholderQr: 'e.g. Payment link or QR message',
      ifscLabel: 'Bank IFSC code (if you have it)',
      ifscPlaceholder: 'e.g. DEMO0001234',
      amountLabel: 'Amount asked for (₹)',
      amountPlaceholder: 'e.g. 25000',
      entityLabel: 'Company or adviser name they gave',
      entityPlaceholder: 'e.g. Sample Wealth Advisory',
      sourceLabel: 'Where did you get this payment request?',
      sources: {
        whatsapp_telegram: 'WhatsApp or Telegram chat / group',
        trading_app: 'An app or website link they sent',
        adviser_claim: 'Someone calling as a SEBI adviser',
        other: 'Other / In person',
      },
      matchLabel: 'In your bank app, does the receiver name match the company name?',
      matches: {
        matches: 'Yes, it shows the exact company name',
        different: 'No, it shows a person’s name or another name',
        unsure: 'Not sure / I have not checked yet',
      },
    },
    submitBtn: 'Check this payment',
    checkingBtn: 'Checking payment...',
    updatedBadge: 'Updated',
    validationError: 'Please type a UPI ID, account, amount, or company name first.',
    resultTitle: 'Payment check & 4-step safety list',
    findingsHeading: 'What to notice',
    checklistHeading: 'Tick these 4 checks before you tap Pay',
    checklistProgress: (checked, total) => `${checked} of ${total} ticked`,
    checklistComplete: 'All 4 checks ticked',
    emptyTitle: 'Check before typing your UPI PIN',
    emptyBody:
      'Enter the UPI ID, bank account, or ₹ amount you are about to pay to see simple warning signs and a 4-step checklist.',
    qrHandoffHeading: 'Check this QR code with SEBI',
    qrHandoffDesc:
      'This demo cannot scan or verify QR codes. Open SEBI Check to upload or scan the QR code and check the payment details yourself.',
    qrHandoffBtn: 'Open SEBI Check',
  },
  presets: {
    message: {
      'guaranteed-whatsapp': {
        title: 'WhatsApp "Fixed Profit" Message',
        subtitle: 'Promises 25% monthly profit + copycat link',
      },
      'pre-ipo-apk': {
        title: 'Pre-IPO App (.apk) & Bank Payment',
        subtitle: 'App file outside Play Store + agent bank transfer',
      },
      'incomplete-advisory': {
        title: 'Polite Message (Missing Proof)',
        subtitle: 'SEBI format looks right, but we cannot confirm who sent it',
      },
    },
    payment: {
      'pay-whatsapp-upi': {
        title: 'UPI Request from Telegram',
        subtitle: '₹25,000 from Telegram to @ybl ID, different name',
      },
      'pay-qr-refund': {
        title: 'QR Code to "Get Profit"',
        subtitle: '₹15,000 QR scan from a chat app link',
      },
      'pay-bank-imps': {
        title: 'Bank Transfer to Unchecked Account',
        subtitle: '₹1,00,000 bank transfer for an adviser fee',
      },
    },
  },
  howItWorks: {
    kicker: 'How It Works',
    title: 'Why checking just one clue is not enough',
    subtitle:
      'Someone can copy a real SEBI licence number onto a message, while sending you to a fake-looking website and a personal UPI ID. Looking at all four clues together makes mismatches easy to spot.',
    diagramTitle: 'The 4 clues we connect',
    steps: [
      {
        num: '01',
        title: 'The Message',
        desc: 'Checks for "guaranteed profit" promises or rushing you to pay today.',
      },
      {
        num: '02',
        title: 'SEBI Licence Number',
        desc: 'Checks if the number looks like a real SEBI code (INA/INH/INZ), and reminds you to check SEBI’s real site.',
      },
      {
        num: '03',
        title: 'Website or App Link',
        desc: 'Warns about .apk app files outside Play Store, short links, and copycat websites.',
      },
      {
        num: '04',
        title: 'Payment Details',
        desc: 'Warns if an investment company asks you to pay a personal UPI ID or a different person’s name.',
      },
    ],
    scopeTitle: 'What this demo can do vs. what you must check yourself',
    canDoTitle: 'What this demo checks',
    canDoList: [
      'Reads your message for rushed deadlines and "fixed profit" promises',
      'Checks if a SEBI number has the standard letter-and-number shape',
      'Spots .apk app files, hidden short links, and lookalike website names',
      'Spots when an investment offer asks for payment to a personal UPI ID',
    ],
    cannotDoTitle: 'What this demo cannot do',
    cannotDoList: [
      'Cannot open live SEBI records to prove who owns a registration number',
      'Cannot check your bank or UPI app to see the real receiver name',
      'Cannot test if a website or trading app is genuine in real time',
      'Never promises that any link, adviser, or payment is safe',
    ],
    patternsTitle: 'Common tricks Indian families see',
    patternTag: 'Common warning sign',
    patterns: [
      {
        title: '"VIP" Stock Tip Groups on WhatsApp',
        desc: 'Groups promising "20–30% profit every month" often copy the name of a famous market expert without permission.',
      },
      {
        title: 'App Files (.apk) Sent on Chat',
        desc: 'Apps installed from chat links (not Google Play or Apple App Store) can show fake profit numbers or read your OTP messages.',
      },
      {
        title: 'Paying Extra "Tax" to Take Money Out',
        desc: 'Real brokers take fees or taxes out of your account automatically. They never ask you to send extra UPI money to unlock a withdrawal.',
      },
    ],
  },
  about: {
    kicker: 'About Investor Scam Check · Educational Demo',
    title: 'Made to help people pause and check clearly before paying.',
    intro:
      'Investor Scam Check is an educational demo built to help first-time investors, older adults, and family members check investment messages calmly together.',
    principlesTitle: 'How we designed this tool',
    principles: [
      {
        title: 'Calm, simple words',
        desc: 'We explain warning signs in everyday language. We do not blame named people or try to scare you.',
      },
      {
        title: 'Honest about what is checked',
        desc: 'When live SEBI or bank records cannot be checked here, we clearly say "Can\'t verify" and never promise safety.',
      },
      {
        title: 'Easy for seniors and families',
        desc: 'Large clear text, icons next to every color, 12 language choices, and a button to copy a summary for family.',
      },
    ],
    directoryTitle: 'Official Indian help websites and phone numbers',
    directoryNote: 'Always type these official addresses yourself in your browser:',
    resources: [
      {
        name: 'SEBI Investor Support & Apps',
        detail: 'investor.sebi.gov.in/Investor-support.html · Check if an adviser, broker, or trading app is really registered.',
      },
      {
        name: 'SEBI SCORES (Registered Firms Only)',
        detail: 'scores.sebi.gov.in · File a complaint only about a SEBI-registered company.',
      },
      {
        name: 'Cyber Crime Helpline (India)',
        detail: 'For UPI, bank, or online fraud: tell your bank right away, call 1930, and report on cybercrime.gov.in.',
      },
      {
        name: 'RBI Sachet Website',
        detail: 'sachet.rbi.org.in · Check or report unauthorized money deposit schemes.',
      },
    ],
  },
  postIncidentHelp: {
    triggerBtn: 'I already paid or shared details',
    triggerHint:
      'Already sent money, shared an OTP/PIN, or tapped a link? See clear next steps without typing any private details.',
    modalTitle: 'I already paid or shared details',
    modalSubtitle:
      'Pick what happened to see calm, simple steps. Do not type your bank number, card number, PIN, OTP, or password here.',
    privacyBadge: 'Nothing saved · No AI used · Official links only',
    selectPrompt: 'Pick what happened:',
    closeBtn: 'Close help guide',
    backToCheckerBtn: 'Back to message checker',
    urgentRuleNote: 'If money has been taken, contact your bank and report it as soon as possible.',
    reportingTitle: 'Report online money fraud fast',
    reportingBody:
      'Call helpline 1930 or report on the official National Cyber Crime Reporting Portal (https://cybercrime.gov.in/).',
    reportingPortalLabel: 'Open Cyber Crime Portal (cybercrime.gov.in)',
    helplineBadge: 'Call 1930',
    sourcesTitle: 'Official RBI, Cyber Crime & SEBI guides',
    rbiPdfLabel: 'RBI Safe Unauthorised Transaction Guide (PDF)',
    cyberPortalLabel: 'National Cyber Crime Portal',
    sebiFakeAppPdfLabel: 'SEBI Fake Trading App Guide (PDF)',
    disclaimerNote:
      'This is general safety help only — not a bank check, legal advice, or a promise that money will come back. This app has not blocked your account, talked to your bank, checked your phone, or filed a report. Nothing you click here is saved or sent to AI.',
    choices: {
      paid: {
        label: 'I sent money or approved a payment.',
        shortHint: 'You paid by UPI, bank transfer, QR code, or approved a request',
        heading: 'What to do if you sent money',
        summary: 'Tell your bank right away and report the payment through official portals.',
        steps: [
          'Contact your bank or payment app right away using its real app, website, or official number you check yourself.',
          'Report online financial fraud at 1930 or https://cybercrime.gov.in/.',
          'Save the chat messages and payment records (like reference IDs and screenshots) for your bank or police.',
        ],
        showReportingCard: true,
      },
      shared_secret: {
        label: 'I shared an OTP, PIN, password, or card detail.',
        shortHint: 'You told someone a secret code, PIN, password, or card info',
        heading: 'What to do if you shared a PIN, OTP, password, or card detail',
        summary: 'Do not share more codes, and ask your bank right away how to lock or protect your account.',
        steps: [
          'Stop sharing any more OTPs, PINs, passwords, or card numbers.',
          'Call or message your bank or payment provider right away through official channels and follow their steps to secure your account or card.',
          'If money was taken, call 1930 and report on https://cybercrime.gov.in/ as soon as possible.',
        ],
        showReportingCard: true,
      },
      clicked_or_installed: {
        label: 'I clicked a link or installed an app.',
        shortHint: 'You opened a link or installed an app from a message',
        heading: 'What to do if you clicked a link or installed an app',
        summary: 'Do not type more details or approve any payment requests.',
        deviceNotCheckedNote:
          'Note: This demo app has NOT checked your phone, computer, or bank account.',
        steps: [
          'Stop typing any personal or bank info, and do not approve any payment pop-ups.',
          'If you typed bank/card details or see missing money, contact your bank through official channels right away and report at 1930 or https://cybercrime.gov.in/.',
          'Read the official SEBI fake trading app guide linked below for clear guidance.',
        ],
        showReportingCard: true,
      },
      not_acted: {
        label: 'I received a suspicious message but have not acted.',
        shortHint: 'You have not paid, shared any code, or installed any app',
        heading: 'What to do if you have not acted',
        summary: 'Good job pausing before acting. Keep avoiding replies or payments.',
        steps: [
          'Do not reply, send money, share OTPs/PINs/passwords, or install apps from the message.',
          'Go back to the message checker to review clues and verify details directly on official SEBI websites.',
        ],
        showReportingCard: false,
        showBackToChecker: true,
      },
    },
  },
  groupChat: {
    kicker: 'Check Many Messages Together · Simple Words',
    title: 'Review a group chat',
    subtitle:
      'Paste several chat messages together to see possible stages and warning signs in simple words. This learning tool cannot prove whether any person, group, company, offer, or message is real or fake.',
    entryHint: 'Got several WhatsApp or Telegram messages? Check the whole thread together.',
    switchSingleBtn: 'Check a message',
    privacyTitle: 'Remove private details before pasting',
    privacyBody:
      'Please take out real names, phone numbers, bank numbers, OTPs, UPI PINs, and passwords before pasting. Detected codes, phone numbers, emails, and bank numbers are hidden automatically and nothing is saved.',
    presetsTitle: 'Try a sample chat (Examples)',
    presetsHint: 'Each button shows an example — suspicious, safety tip, neutral, or mixed.',
    exampleTagSuspicious: 'Risk example',
    exampleTagGenuine: 'Safety example',
    exampleTagMixed: 'Mixed example',
    clearBtn: 'Clear chat',
    inputLabel: 'Paste related chat messages here',
    inputPlaceholder: 'Paste several messages here (names and dates are optional)...',
    formatHintTitle: 'Names and dates are optional (you do not have to add them)',
    formatHintBody: 'You can paste plain lines or add optional names/dates like:',
    formatExamples: [
      '[Day 1] Admin: Welcome to VIP desk...',
      '12 Oct - Member 1: Thanks for profit...',
      'Plain line without any name',
    ],
    demoOnlyBtn: 'Use demo check only',
    checkingBtn: 'Checking chat...',
    aiReviewBtn: 'Get Gemini AI review',
    aiLoadingBtn: 'Getting Gemini review...',
    validationError: 'Please paste at least one chat message or pick an example above.',
    consentTitle: 'Before sending this chat to Gemini',
    consentBody:
      'Your pasted chat (with detected OTPs, PINs, passwords, CVVs, bank/card numbers, phones, emails, and UPI names hidden) will go to the Gemini AI service to make this review. It does not use Google Search and is not saved anywhere.',
    consentContinueBtn: 'Continue',
    consentDemoOnlyBtn: 'Use demo check only',
    unavailableTitle: 'Gemini AI review is not available right now',
    unavailableNotConfigured:
      'AI is not set up on this server right now. Use the local demo check below instead — it works offline.',
    unavailableError:
      'Gemini could not finish right now. Please use the local demo check and official SEBI portals.',
    modeDemoBadge: 'Demo check only (local rules)',
    modeAiBadge: 'Gemini AI review (this session only)',
    privacyBadge: 'Nothing saved · Hidden secrets · No Search',
    verdictWarningSigns: 'Warning signs found',
    verdictNoListedSigns: 'No listed warning signs found',
    noSafeProofNote:
      'Not finding warning signs does NOT prove this chat, group, company, app, or offer is real or safe. Always check official portals yourself.',
    singlePhraseNote:
      'Short context note: Only a small clue was found. One phrase alone does not prove fraud.',
    emptyTitle: 'Ready to check a group chat',
    emptyBody:
      'Paste chat messages on the left (or tap an example) and pick "Use demo check only" or "Get Gemini AI review".',
    copySummaryBtn: 'Copy summary',
    copiedSummaryBtn: 'Summary copied',
    section1SummaryTitle: 'Conversation summary',
    section2StagesTitle: 'Possible stages',
    stagesIntro:
      'These 5 steps are only common patterns, not a fixed rule. A chat may show one, a few, or none.',
    stageSupportedBadge: 'Pattern seen in chat',
    stageNotEnoughInfoBadge: 'Not enough information',
    stageNotEnoughInfoDesc: 'Not enough information in the pasted messages.',
    section3WarningsTitle: 'Warning signs',
    warningSourceLabel: 'From message:',
    warningPhraseLabel: 'Words found:',
    noWarningsBody: 'No listed warning words matched in the messages you pasted.',
    section4UncheckedTitle: 'What could not be checked',
    cannotVerifyDirectlyLabel: 'This app cannot verify this directly',
    section5NextStepsTitle: 'Next steps',
    disclaimerNote:
      'For learning only — cannot prove a person, group, company, offer, or message is real or fake. Nothing pasted here is saved.',
    messageNumberLabel: (n) => `Message ${n}`,
    parsedSummaryLine: (count, hasSpeakers, hasDates) =>
      `Checked ${count} ${count === 1 ? 'message' : 'messages'}${
        !hasSpeakers && !hasDates
          ? ' (no speaker names or dates entered).'
          : ' with the pasted details.'
      }`,
    topicCluesLine: (topics) => `Topics mentioned: ${topics}.`,
    stageTitles: {
      initial_offer: '1. First unsolicited investment offer or social-media contact',
      trust_building: '2. Trust-building with expert claims, praise, or profit screenshots',
      app_or_group_invite: '3. Invite to use a trading app, website, private group, or APK',
      payment_or_recruiting_pressure:
        '4. Pressure to pay more, bring others, pay a fee, or act fast',
      withdrawal_friction: '5. Trouble taking money out or requests for extra fees',
    },
    stageSupportedReason: {
      initial_offer: 'A message gives an investment pitch, quota, or profit promise to check carefully.',
      trust_building:
        'Messages show profit screenshots, praise, or "don’t worry / safe" talk. Screenshots in chats are easy to fake.',
      app_or_group_invite:
        'A message asks people to move to a private group or download an outside app or .apk file.',
      payment_or_recruiting_pressure:
        'Messages push fast payment, extra deposits, adding friends, fees, or sharing PINs/OTPs.',
      withdrawal_friction:
        'A message says withdrawals are blocked or asks for tax/unlock fees before releasing money.',
    },
    warningExplanations: {
      secretRequest: {
        title: 'Asks for OTP, PIN, password, CVV, or screen-share app',
        explanation: 'Never share OTPs, PINs, passwords, or CVVs. Real banks and advisers never ask for them.',
      },
      pinToReceive: {
        title: 'Says you need a PIN or QR scan to receive money',
        explanation: 'Entering a UPI PIN or scanning a QR code always sends money out, never in.',
      },
      guaranteedReturn: {
        title: 'Promises guaranteed or zero-risk profit',
        explanation: 'Real stock-market investments never guarantee fixed profits.',
      },
      multiplierReturn: {
        title: 'Promises very high short-term profits',
        explanation: 'Huge promised returns in days or weeks are a strong reason to stop and verify.',
      },
      urgencyPressure: {
        title: 'Pushes you to pay right away',
        explanation: 'Urgent deadlines try to make you pay before you can check official SEBI lists.',
      },
      vipPitch: {
        title: 'Uses "VIP desk", "block deal", or "pre-IPO quota" claims',
        explanation: 'Always check whether the firm is actually registered on official SEBI pages.',
      },
      offPlatformOrApk: {
        title: 'Invite to private group or outside .apk app download',
        explanation: 'Installing apps from chat links instead of official app stores puts your phone and bank apps at risk.',
      },
      upfrontOrWithdrawalFee: {
        title: 'Asks for a fee or tax to unlock profits or withdrawals',
        explanation: 'Never pay extra fees to release stuck profits — stop and check official sources.',
      },
      testimonialOrProofHype: {
        title: 'Profit screenshots, member praise, or unverified badges',
        explanation: 'Screenshots and praise in a group chat do not prove a firm is real or registered.',
      },
      recruitmentPressure: {
        title: 'Asks you to invest more or bring friends',
        explanation: 'Requests to add friends for rewards or deposit more money need careful checking.',
      },
      unverifiedReassurance: {
        title: 'Says "this is safe", "not a scam", or "do not worry"',
        explanation: 'Saying "do not worry, it is safe" does not prove an investment offer is real.',
      },
    },
    contextUnclearFallback: 'A short excerpt may miss full context; one phrase alone does not prove fraud.',
    uncheckedItems: {
      noSebiId: 'No SEBI registration number was verified here.',
      noAppOrLink: 'No full website or official app-store page was checked.',
      noPaymentHandle: 'No bank recipient name or @valid UPI check was done.',
      noSpeakerOrDates: 'Speaker names and dates are optional and not confirmed.',
      liveSebi:
        'This app cannot verify this directly: Live SEBI registration list (check investor.sebi.gov.in/Investor-support.html).',
      liveSebiCheck:
        'This app cannot verify this directly: Live UPI ID, QR code, or bank account (check siportal.sebi.gov.in/intermediary/sebi-check).',
      liveAppsAndDomain:
        'This app cannot verify this directly: Official trading apps or website safety (check investor.sebi.gov.in/Investor-support.html).',
    },
    nextStepsList: [
      'Stop before paying any money, tapping links, or installing outside apps.',
      'Check the exact company and official trading app on investor.sebi.gov.in/Investor-support.html.',
      'Check UPI IDs, QR codes, or bank details on SEBI Check (siportal.sebi.gov.in/intermediary/sebi-check).',
      'If you already sent money or shared details, contact your bank right away and report at 1930 or https://cybercrime.gov.in/.',
    ],
    presets: {
      'gc-multi-stage': {
        title: 'Multi-Stage VIP Pitch & Fee',
        subtitle: 'Offer -> screenshots -> .apk app -> urgent fee -> withdrawal tax',
      },
      'gc-protective-otp': {
        title: 'Family Safety Tip (OTP/PIN)',
        subtitle: 'Warns never to share OTP/PIN or rush',
      },
      'gc-neutral-discuss': {
        title: 'Normal Investing Chat',
        subtitle: 'Calm chat about index funds and SEBI checks',
      },
      'gc-mixed-chat': {
        title: 'Mixed Tip & Risky Pitch',
        subtitle: 'Safety advice + risky 20% guaranteed offer',
      },
    },
  },
  footer: {
    note: 'Investor Scam Check · Educational Demo · For learning before you pay, not financial or legal advice.',
  },
  analyzer: {
    pitchGuaranteed:
      'Promises "guaranteed" or "zero-risk" profit. Real share market investments never guarantee profit.',
    pitchMultiplier: 'Promises very big returns in a short time (like doubling money quickly).',
    pitchUrgency: 'Rushes you to pay today before you have time to check.',
    pitchVip: 'Uses "VIP group", "block deal", or "pre-IPO quota" words often seen in unverified pitches.',
    pitchGroupApp: 'Asks you to join a private chat group or download an outside app.',
    pitchFees: 'Asks for an upfront fee, tax, or deposit before giving you profits.',
    pitchSecretRequest:
      'Never share your UPI PIN, ATM PIN, OTP, or password with anyone. Real advisers and banks never ask for a PIN or OTP to check your account or send profits.',
    pitchPinToReceive:
      'Typing your UPI PIN or scanning a QR code always sends money out — you never need a PIN or QR scan to receive money, rewards, or refunds.',
    msgNotProvidedLabel: 'Not provided',
    msgNotProvidedHeadline: 'No message typed yet',
    msgNotProvidedDesc:
      'Paste the WhatsApp, Telegram, or SMS message if you have it so we can check for rushing or profit promises.',
    msgHighLabel: 'Warning signs found',
    msgHighHeadline: 'Warning signs found in the message text',
    msgSecretHeadline: 'Asks for a PIN, OTP, or password — never share it',
    msgCautionLabel: 'Warning signs found',
    msgCautionHeadline: 'Asks for a private chat group or an upfront fee',
    msgNoSignsLabel: 'No listed warning signs found',
    msgNoSignsHeadline: 'No listed warning signs found in this message',
    msgNoSignsDesc:
      'Even if no warning words matched, this does NOT prove the message is genuine or safe. Verify the sender directly using official contact numbers on sebi.gov.in.',
    sebiMissingLabel: 'Not provided',
    sebiMissingHeadline: 'No SEBI number or company entered',
    sebiMissingDesc:
      'You left this optional box blank. If you want to check an adviser later, search for them on investor.sebi.gov.in.',
    sebiMissingDemo: 'Demo only: We cannot check live SEBI records here.',
    sebiValidLabel: 'Could not verify — check directly with SEBI',
    sebiValidHeadline: (id) => `Looks like a SEBI number (${id}) — not verified live`,
    sebiValidDesc:
      'Anyone can copy a real SEBI number from Google, and checking the number shape is NOT real verification. Having a SEBI number also does NOT guarantee profits or returns.',
    sebiValidDemo:
      'Demo-only shape check: Verify the company name and official phone number on investor.sebi.gov.in.',
    sebiMismatchLabel: 'Warning signs found',
    sebiMismatchHeadline: 'This number does not look like a standard SEBI licence number',
    sebiMismatchDesc:
      'Real SEBI numbers usually start with INA, INH, INZ, INP, or INM followed by 9 digits. Check the exact number on investor.sebi.gov.in.',
    sebiNameOnlyLabel: 'Could not verify — check directly with SEBI',
    sebiNameOnlyHeadline: 'Company name added, without a SEBI licence number',
    sebiNameOnlyDesc:
      'A company name alone is not proof, and SEBI registration never guarantees profits. Ask for their 12-character SEBI number and look it up on investor.sebi.gov.in.',
    sebiCantVerifyDemo: 'Demo-only shape check: Live SEBI records are not connected here.',
    linkNotProvidedLabel: 'Not provided',
    linkNotProvidedHeadline: 'No website or app link added',
    linkNotProvidedDesc:
      'If they sent you a web link or app download link, paste it here so we can check for common warning signs.',
    linkHighLabel: 'Warning signs found',
    linkApkHeadline: 'Warning clue: link downloads an app file (.apk) outside official stores',
    linkApkDesc:
      'Installing apps from chat links instead of Google Play or Apple App Store can let strangers see your phone or bank OTPs.',
    linkSpoofHeadline: 'Warning clue: web address looks like a copycat of a known brand',
    linkSpoofDesc:
      'This link puts broker or SEBI words inside an unfamiliar web address. A familiar brand name, HTTPS lock icon, or neat website never proves safety — check authorised apps on investor.sebi.gov.in/Investor-support.html.',
    linkDemoDomain: 'Demo only: We cannot check who owns this website here.',
    linkCautionLabel: 'Warning signs found',
    linkShortenerHeadline: 'Short link hides where the website really goes',
    linkShortenerDesc:
      'Short links hide the real web address. Do not type your PAN, password, or bank details on pages from short links.',
    linkHttpHeadline: 'Website uses older http:// instead of secure https://',
    linkHttpDesc:
      'Finance websites should use https://, though HTTPS alone never proves a website is real or approved.',
    linkCantVerifyLabel: 'Not verified by this demo',
    linkCantVerifyHeadline: (host) => `Website noted (${host}) — not verified by this demo`,
    linkCantVerifyDesc:
      'A neat web address, HTTPS lock icon, or famous brand name does NOT prove a site is genuine or safe. Check official links and apps on investor.sebi.gov.in/Investor-support.html.',
    linkDemoReputation: 'Demo only: Live website safety checks are not available here.',
    payNotProvidedLabel: 'Not provided',
    payNotProvidedHeadline: 'No UPI ID, bank account, or amount added',
    payNotProvidedDesc:
      'Add the UPI ID, bank account, or ₹ amount they asked for. Never send investment money to a personal UPI ID.',
    payHighLabel: 'Warning signs found',
    payPersonalUpiHeadline: (upi) => `Personal-style UPI ID (${upi}) asked for an investment`,
    payPersonalAccountHeadline: 'Money asked for in an unverified or personal bank account',
    payPersonalDesc: (amountText) =>
      `Registered companies collect money only through official company channels or SEBI-checked @valid handles — not personal UPI IDs or agent accounts${
        amountText ? ` (especially for ${amountText})` : ''
      }.`,
    payDemoLookup: 'Demo only: We cannot check the real UPI owner or SEBI Check here.',
    payCautionLabel: 'Warning signs found',
    payLargeHeadline: (amount) => `Big payment (${amount}) — check the bank name and amount`,
    payLargeDesc:
      'Before paying this amount, check that your bank app shows the exact registered company name and the exact ₹ amount.',
    payDemoBank: 'Demo only: Live bank name checking is not available here.',
    payValidUpiLabel: 'Could not verify — check directly with SEBI',
    payValidUpiHeadline: (upi) => `SEBI-style @valid ID noted (${upi}) — verify on SEBI Check`,
    payValidUpiDesc:
      'Handles ending in @valid are for SEBI-registered companies, but live checks and real ownership cannot be confirmed here. Check this handle on SEBI Check (siportal.sebi.gov.in) and read the exact receiver name and amount in your bank app.',
    payNonValidUpiHeadline: (upi) =>
      `UPI ID noted (${upi}) — not shown as a SEBI @valid ID`,
    payNonValidUpiDesc:
      'This handle is not shown as a SEBI-validated @valid handle in this demo. Check it directly on SEBI Check before paying, and read the exact receiver name in your bank app.',
    payAmountContextHeadline: (amount) => `Amount noted (${amount}) — neutral info only`,
    payAmountContextDesc:
      'An amount alone does not show a scam or prove safety. Always read the receiver name and exact ₹ amount in your bank app before typing your UPI PIN.',
    payCantVerifyLabel: 'Not verified by this demo',
    payCantVerifyHeadline: 'Payment detail noted — not verified by this demo',
    payCantVerifyDesc:
      'Always read the receiver name and exact ₹ amount inside your bank app before typing your UPI PIN. Sent money is hard to get back.',
    payDemoNotConnected: 'Demo only: Live UPI and bank checks are not connected here.',
    unifiedEmptyTitle: 'Add at least one clue to start',
    unifiedEmptySummary:
      'Paste a message, SEBI number, link, or UPI ID — or tap one of the sample examples above.',
    unifiedEmptyInsight:
      'Checking all four clues together helps spot problems that checking one clue misses.',
    unifiedEmptyStep: 'Add whatever details you received before opening your payment app.',
    unifiedEmptyDemo: 'Demo only: Does not check live SEBI, website, or UPI systems.',
    unifiedHighTitle: 'Warning signs found — pause before sending money',
    unifiedHighSummary: (highCount, cautionCount) =>
      `We found warning signs in ${highCount + cautionCount} ${
        highCount + cautionCount === 1 ? 'part' : 'parts'
      }. Do not send money until you check everything on official websites.`,
    unifiedCautionTitle: 'Warning signs found — check details before sending money',
    unifiedCautionSummary:
      'Some details showed warning signs that need checking before you pay. Always check the company and receiver name separately.',
    unifiedCantVerifyTitle: 'No listed warning signs found — check SEBI’s website yourself',
    unifiedCantVerifySummary:
      'Our simple demo rules did not match any listed warning signs, and this does NOT prove the message, offer, or payee is genuine or safe. Always check directly on SEBI and in your bank app.',
    insightPitchPay: (amountText) =>
      `Mismatch found: The message promises big profits or rushes you, while asking for money${
        amountText ? ` (${amountText})` : ''
      } to a person or unverified account instead of a real company account.`,
    insightPitchUnverifiedPay: (amountText) =>
      `Combined look: The message promises big profits or rushes you alongside a copycat link or unchecked SEBI number, while asking for money${
        amountText ? ` (${amountText})` : ''
      } to an ID we cannot verify here. Check SEBI’s website before paying.`,
    insightLink:
      'Mismatch found: An investment offer with a copycat web link or an .apk app download avoids official app stores and buyer safety rules.',
    insightSebiPay: (sebiId, amountText) =>
      `Mismatch found: They mention a SEBI number (${sebiId}), but ask for money${
        amountText ? ` (${amountText})` : ''
      } in a way that does not look like a regulated company account.`,
    insightGeneralGap:
      'Combined look: When a message, SEBI claim, link, and payment request are checked together, gaps or rushing in any one part are a clear reason to stop and verify.',
    insightUnconfirmed:
      'Combined look: Only basic demo rules ran here. Because real SEBI and UPI records are not connected, treat unverified details as unchecked.',
    unifiedNextSteps: [
      'Wait before paying: Do not send money today, even if someone says the seat or offer will end soon.',
      'Check SEBI yourself: Open investor.sebi.gov.in/Investor-support.html and check the SEBI number, company name, and approved trading app. Remember SEBI registration never guarantees profit.',
      'Check receiver name & @valid ID: Verify UPI IDs, QR codes, or bank details on SEBI Check (siportal.sebi.gov.in), and check the exact receiver name and amount in your bank app before entering your PIN.',
      'Report to the right place: Use SCORES (scores.sebi.gov.in) only for SEBI-registered companies. For general cyber, UPI, or bank fraud — or if you already paid — tell your bank immediately, call 1930, and report on cybercrime.gov.in.',
    ],
    unifiedDemoLimit:
      'Demo only: Checks simple text and ID-shape rules on what you typed. It does not check live SEBI, website, or UPI records, and never promises safety.',
    payCheckEmptyTitle: 'Add payment details to check',
    payCheckEmptySummary:
      'Type the UPI ID, bank account, or ₹ amount you are about to pay — or pick a sample above.',
    payCheckEmptyDemo: 'Demo only: Does not check real bank accounts or UPI IDs.',
    payFindingNameDiffTitle: 'Bank receiver name does not match the company name',
    payFindingNameDiffDesc:
      'If an investment company asks you to pay a random person’s name or a different business, stop right away.',
    payFindingNameUnsureTitle: 'You have not checked the receiver name yet',
    payFindingNameUnsureDesc:
      'Before typing your UPI PIN or bank password, read the verified bank name and exact ₹ amount shown on your phone screen.',
    payFindingNonValidUpiTitle: (suffix) =>
      `UPI ID (@${suffix}) — check directly on SEBI Check`,
    payFindingNonValidUpiDesc:
      'This handle is not shown as a SEBI-validated @valid handle in this demo. Check it directly on SEBI Check before paying, and read the receiver name in your bank app.',
    payFindingValidUpiTitle: '@valid UPI handle noted — still verify on SEBI Check',
    payFindingValidUpiDesc:
      'Seeing "@valid" in text does NOT prove it is real, and live checks or ownership cannot be confirmed here. Check this exact UPI ID on SEBI Check (siportal.sebi.gov.in) and read the receiver name and amount in your bank app before paying.',
    payFindingUpiFormatTitle: 'UPI ID looks incomplete',
    payFindingUpiFormatDesc:
      'A normal UPI ID has an "@" sign (like name@bank). Check carefully who sent it to you.',
    payFindingQrTitle: 'QR codes and chat pay links hide account details first',
    payFindingQrDesc:
      'Never scan a QR code from chat to "receive" profit or a refund. Entering your UPI PIN always sends money out.',
    payFindingBankTitle: 'Direct bank transfer asked outside an official trading app',
    payFindingBankDesc:
      'Regulated brokers take money inside their own official app or website, not via bank accounts sent on chat.',
    payFindingSourceTitle: 'Payment asked inside WhatsApp or Telegram',
    payFindingSourceDesc:
      'Asking for investment transfers inside chat groups is a very common warning sign.',
    payFindingAmountTitle: (amount) => `Amount asked: ${amount} (neutral context)`,
    payFindingAmountDesc:
      'An amount alone does not show a scam or prove safety. Always read the receiver name and exact ₹ amount in your bank app before paying.',
    payFindingAmountContextTitle: (amount) => `Amount in context (${amount})`,
    payFindingAmountContextDesc:
      'An amount alone is not a warning, but because other warning signs were found above (like a name mismatch, chat group, or unverified route), stop before sending this amount and check official SEBI portals first.',
    payFindingLiveTitle: 'Not verified by this demo: real account owner or SEBI Check status',
    payFindingLiveDesc:
      'This demo cannot check NPCI, banks, or SEBI Check live. No warnings here means "unchecked", never "safe".',
    payCheckHighTitle: 'Warning signs found — do not pay yet',
    payCheckHighSummary:
      'The payment ID, where it came from, or the receiver name triggered warning signs. Stop and verify on official broker or SEBI portals.',
    payCheckCautionTitle: 'Warning signs found — check the receiver name and amount first',
    payCheckCautionSummary:
      'Go through all 4 checks below before typing your UPI PIN or bank password.',
    payCheckCantVerifyTitle: 'No listed warning signs found — check receiver officially',
    payCheckCantVerifySummary:
      'Our simple demo rules did not match any listed warning signs, and this does NOT prove the payment request is genuine or safe. Check the exact receiver name and amount inside your bank app.',
    payCheckChecklist: [
      'Does the bank app show the exact registered company name and exact ₹ amount you mean to pay?',
      'Are you paying inside an official broker app/website listed on investor.sebi.gov.in/Investor-support.html?',
      'Did you check the company’s SEBI number on investor.sebi.gov.in and its UPI/QR/bank details on SEBI Check?',
      'Remember: Typing your UPI PIN or scanning a QR only sends money out — you never need a PIN to receive profit or refunds.',
    ],
    payCheckDemoLimit:
      'Demo only: Live bank name, NPCI UPI, and SEBI Check lookups are not available in this demo.',
  },
};
