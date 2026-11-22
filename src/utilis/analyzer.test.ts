import test from 'node:test'
import assert from 'node:assert/strict';
import {
  analyzeUnifiedCheck,
  analyzePaymentCheck,
  buildFamilySummaryText,
  getCheckBasisLabel,
  parseAmountInr,
  formatInr,
  analyzeLinkPillar,
  analyzeMessagePillar,
} from './analyzer';
import { LANGUAGE_OPTIONS, TRANSLATIONS, getBcp47, getCopy } from '../data/translations';
import { MESSAGE_DEMO_PRESETS, PAYMENT_DEMO_PRESETS } from '../data/presets';
import { OFFICIAL_PORTAL_LINKS } from '../components/OfficialSourcesCard';

test('parseAmountInr and formatInr handle Indian formatting cleanly', () => {
  assert.equal(parseAmountInr('₹25,000'), 25000);
  assert.equal(parseAmountInr('50000/-'), 50000);
  assert.equal(parseAmountInr(''), null);
  assert.equal(formatInr(125000), '₹1,25,000');
});

test('unified check returns insufficient_data when all fields are empty', () => {
  const result = analyzeUnifiedCheck({
    messageText: '',
    sebiClaim: '',
    websiteLink: '',
    paymentDetail: '',
    requestedAmountInr: '',
  });
  assert.equal(result.overallLevel, 'insufficient_data');
  assert.equal(result.detectedSignalsCount, 0);
});

test('unified check detects connected high-risk indicators across pitch and lookalike link while keeping non-@valid UPI unverified', () => {
  const result = analyzeUnifiedCheck({
    messageText: 'Join our VIP group today only! 25% guaranteed monthly profit, send ₹25,000 fast.',
    sebiClaim: 'INA000099999',
    websiteLink: 'https://zerodha-vip-trade.in/app',
    paymentDetail: 'wealthdesk88@okaxis',
    requestedAmountInr: '25000',
  });

  assert.equal(result.overallLevel, 'high_risk');
  assert.equal(result.detectedSignalsCount, 2);
  const sebiPillar = result.pillars.find((p) => p.id === 'sebi');
  const payPillar = result.pillars.find((p) => p.id === 'payment');
  assert.equal(sebiPillar?.status, 'cant_verify');
  assert.equal(payPillar?.status, 'cant_verify');
  assert.ok(result.connectionInsight.en.includes('not verified'));
});

test('unified check detects .apk download links as high_risk', () => {
  const result = analyzeUnifiedCheck({
    messageText: 'Install our institutional trading terminal for block deals.',
    sebiClaim: '',
    websiteLink: 'https://example-portal.in/tradesetup.apk',
    paymentDetail: '',
    requestedAmountInr: '',
  });

  assert.equal(result.overallLevel, 'high_risk');
  const linkPillar = result.pillars.find((p) => p.id === 'link');
  assert.equal(linkPillar?.status, 'high_risk');
});

test('unified check never promises safety when calm text and valid SEBI format are entered', () => {
  const result = analyzeUnifiedCheck({
    messageText: 'Hello, here is our quarterly equity research brochure for review.',
    sebiClaim: 'INH000012345',
    websiteLink: 'https://example-advisory.in',
    paymentDetail: '',
    requestedAmountInr: '',
  });

  assert.equal(result.overallLevel, 'cant_verify');
  assert.ok(result.overallSummary.en.includes('does NOT prove'));
  assert.ok(result.overallSummary['en-easy'].toLowerCase().includes('does not prove'));
});

test('payment check flags recipient mismatch and WhatsApp source as high_risk while keeping @ybl unverified and amount as context', () => {
  const result = analyzePaymentCheck({
    method: 'upi',
    handleOrAccount: 'ramesh.kumar92@ybl',
    ifscCode: '',
    amountInr: '50000',
    claimedEntity: 'Apex Wealth Advisory Pvt Ltd',
    recipientMatch: 'different',
    source: 'whatsapp_telegram',
  });

  assert.equal(result.overallLevel, 'high_risk');
  assert.ok(result.findings.some((f) => f.id === 'name-mismatch'));
  assert.ok(result.findings.some((f) => f.id === 'non-valid-upi' && f.status === 'cant_verify'));
  assert.equal(result.findings.some((f) => f.id === 'personal-upi'), false);
  const amountFinding = result.findings.find((f) => f.id === 'amount-context');
  assert.equal(amountFinding?.status, 'cant_verify');
  assert.equal(amountFinding?.checkBasis, 'pattern_clues');
  assert.match(amountFinding?.title.en ?? '', /context/i);
  assert.ok(result.findings.some((f) => f.id === 'cant-verify-live'));
});

test('message-only submission works with blank SEBI/link/payment and shows neutral Not provided', () => {
  const result = analyzeUnifiedCheck({
    messageText: 'Hello, here is our quarterly equity newsletter for your review.',
    sebiClaim: '',
    websiteLink: '',
    paymentDetail: '',
    requestedAmountInr: '',
  });

  assert.equal(result.overallLevel, 'cant_verify');
  assert.equal(result.detectedSignalsCount, 0);

  const msgPillar = result.pillars.find((p) => p.id === 'message');
  const sebiPillar = result.pillars.find((p) => p.id === 'sebi');
  const linkPillar = result.pillars.find((p) => p.id === 'link');
  const payPillar = result.pillars.find((p) => p.id === 'payment');

  assert.equal(msgPillar?.status, 'cant_verify');
  assert.equal(sebiPillar?.status, 'not_provided');
  assert.equal(sebiPillar?.statusLabel.en, 'Not provided');
  assert.equal(linkPillar?.status, 'not_provided');
  assert.equal(payPillar?.status, 'not_provided');
});

test('message requesting UPI PIN, OTP, or password warns never to share and never repeats secrets', () => {
  const result = analyzeUnifiedCheck({
    messageText: 'Please share your UPI PIN 4829, OTP 918273, and password mySecretPass to unlock profits.',
    sebiClaim: 'OTP 918273',
    websiteLink: '',
    paymentDetail: 'pin: 4829',
    requestedAmountInr: '',
  });

  assert.equal(result.overallLevel, 'high_risk');
  const msgPillar = result.pillars.find((p) => p.id === 'message');
  assert.equal(msgPillar?.status, 'high_risk');
  assert.match(msgPillar?.headline.en ?? '', /never share/i);
  assert.match(msgPillar?.explanation.en ?? '', /never share your UPI PIN/i);

  const serialized = JSON.stringify(result);
  assert.equal(serialized.includes('4829'), false);
  assert.equal(serialized.includes('918273'), false);
  assert.equal(serialized.includes('mySecretPass'), false);
  assert.ok(msgPillar?.evidencePhrases && msgPillar.evidencePhrases.length > 0);
  assert.ok(msgPillar?.warnings?.some((w) => w.id === 'secret-request'));

  const copiedSummary = buildFamilySummaryText(result, 'en');
  assert.equal(copiedSummary.includes('4829'), false);
  assert.equal(copiedSummary.includes('918273'), false);
  assert.equal(copiedSummary.includes('mySecretPass'), false);
});

test('protective warnings and neutral UPI/OTP discussions do not trigger false-positive alerts', () => {
  const genuineMessages = [
    'SEBI alert: Never share your OTP, UPI PIN, ATM PIN, CVV, or password with anyone.',
    'Banks and brokers never ask for your ATM PIN, CVV, MPIN, 6-digit PIN, OTP, or banking password.',
    'Your bank sends a one-time OTP by SMS to confirm logins. UPI and OTP help verify payments inside your official bank app.',
    'Stock market returns are not guaranteed and depend on market performance.',
    'Be careful whenever someone promises a guaranteed return — regulated investments carry market risk.',
    'Do not rush to pay or send money immediately. Take your time and verify registration first.',
    'Do not pay any unlock fee or registration fee to unknown Telegram groups. No guaranteed return exists in equities.',
    'Your quarterly GST invoice and tax statement are ready. Thank you for joining our investor webinar.',
  ];

  for (const messageText of genuineMessages) {
    const result = analyzeUnifiedCheck({
      messageText,
      sebiClaim: '',
      websiteLink: '',
      paymentDetail: '',
      requestedAmountInr: '',
    });
    const msgPillar = result.pillars.find((p) => p.id === 'message');
    assert.equal(result.overallLevel, 'cant_verify', `Expected cant_verify for: ${messageText}`);
    assert.equal(result.detectedSignalsCount, 0, `Expected 0 signals for: ${messageText}`);
    assert.equal(msgPillar?.status, 'cant_verify', `Expected message cant_verify for: ${messageText}`);
    assert.equal(msgPillar?.statusLabel.en, 'No listed warning signs found');
    assert.equal(msgPillar?.evidencePhrases, undefined);
    assert.equal(msgPillar?.warnings, undefined);
    assert.match(msgPillar?.explanation.en ?? '', /does NOT prove this message is genuine or safe/i);
    assert.equal(/looks safe|looks okay/i.test(JSON.stringify(result)), false);
  }
});

test('every flagged message warning provides a short trigger phrase and plain-language explanation', () => {
  const suspiciousText =
    'Please share your OTP 449911 to unlock 25% guaranteed monthly profit! Offer closes today only, pay immediately.';
  const result = analyzeUnifiedCheck({
    messageText: suspiciousText,
    sebiClaim: '',
    websiteLink: '',
    paymentDetail: '',
    requestedAmountInr: '',
  });

  assert.equal(result.overallLevel, 'high_risk');
  const msgPillar = result.pillars.find((p) => p.id === 'message');
  assert.equal(msgPillar?.status, 'high_risk');
  assert.equal(msgPillar?.statusLabel.en, 'Warning signs found');
  assert.ok(msgPillar?.warnings && msgPillar.warnings.length >= 3);
  for (const w of msgPillar?.warnings ?? []) {
    assert.ok(w.phrase.length > 0 && w.phrase.length < suspiciousText.length);
    assert.ok(w.explanation.en.trim().length > 20);
    assert.equal(w.phrase.includes('449911'), false);
  }
});

test('evasive reassurance phrases like "this is safe" or "do not worry" do not hide real risks', () => {
  const result = analyzeUnifiedCheck({
    messageText: 'Do not worry, this is safe! Share your UPI PIN 449911 to unlock 25% guaranteed return.',
    sebiClaim: '',
    websiteLink: '',
    paymentDetail: '',
    requestedAmountInr: '',
  });

  assert.equal(result.overallLevel, 'high_risk');
  const msgPillar = result.pillars.find((p) => p.id === 'message');
  assert.equal(msgPillar?.status, 'high_risk');
  assert.ok(msgPillar?.warnings?.some((w) => w.id === 'secret-request'));
  assert.ok(msgPillar?.warnings?.some((w) => w.id === 'guaranteed-return'));
  assert.equal(JSON.stringify(result).includes('449911'), false);
  assert.equal(buildFamilySummaryText(result, 'en').includes('449911'), false);

  const disclaimerPitch = analyzeUnifiedCheck({
    messageText: 'This is not a scam, 25% guaranteed monthly return — act fast today only!',
    sebiClaim: '',
    websiteLink: '',
    paymentDetail: '',
    requestedAmountInr: '',
  });
  const pitchPillar = disclaimerPitch.pillars.find((p) => p.id === 'message');
  assert.equal(disclaimerPitch.overallLevel, 'high_risk');
  assert.ok(pitchPillar?.evidencePhrases?.some((p) => /guaranteed/i.test(p)));
  assert.ok(pitchPillar?.evidencePhrases?.some((p) => /act fast/i.test(p)));
});

test('mixed protective and suspicious sentences evaluate each sentence in context', () => {
  const result = analyzeUnifiedCheck({
    messageText:
      'Never share your ATM PIN or OTP with callers. Join our VIP group today only for 20% guaranteed monthly profit!',
    sebiClaim: '',
    websiteLink: '',
    paymentDetail: '',
    requestedAmountInr: '',
  });

  assert.equal(result.overallLevel, 'high_risk');
  const msgPillar = result.pillars.find((p) => p.id === 'message');
  assert.equal(msgPillar?.warnings?.some((w) => w.id === 'secret-request'), false);
  assert.ok(msgPillar?.warnings?.some((w) => w.id === 'guaranteed-return'));
  assert.ok(msgPillar?.warnings?.some((w) => w.id === 'urgency'));
});

test('multilingual genuine and suspicious messages are classified accurately', () => {
  const hiGenuine = analyzeUnifiedCheck({
    messageText:
      'कभी भी अपना OTP या UPI PIN किसी को न बताएं। शेयर बाजार में रिटर्न गारंटीड नहीं होता, जल्दबाजी में पैसे न भेजें।',
    sebiClaim: '',
    websiteLink: '',
    paymentDetail: '',
    requestedAmountInr: '',
  });
  assert.equal(hiGenuine.overallLevel, 'cant_verify');
  assert.equal(hiGenuine.detectedSignalsCount, 0);
  assert.equal(
    hiGenuine.pillars.find((p) => p.id === 'message')?.statusLabel.hi,
    getCopy('hi').statusTags.cantVerifyBadge
  );

  const hiSuspicious = analyzeUnifiedCheck({
    messageText: 'आज ही जुड़ें! 25% गारंटीड मुनाफा, तुरंत पैसे भेजें और अपना OTP साझा करें।',
    sebiClaim: '',
    websiteLink: '',
    paymentDetail: '',
    requestedAmountInr: '',
  });
  assert.equal(hiSuspicious.overallLevel, 'high_risk');
  assert.ok(
    (hiSuspicious.pillars.find((p) => p.id === 'message')?.warnings?.length ?? 0) >= 2
  );

  const esGenuine = analyzeUnifiedCheck({
    messageText:
      'Nunca compartas tu OTP ni tu contraseña con nadie. Los rendimientos no están garantizados.',
    sebiClaim: '',
    websiteLink: '',
    paymentDetail: '',
    requestedAmountInr: '',
  });
  assert.equal(esGenuine.overallLevel, 'cant_verify');
  assert.equal(esGenuine.detectedSignalsCount, 0);

  const esSuspicious = analyzeUnifiedCheck({
    messageText: 'Envía tu OTP ahora para recibir 20% retorno garantizado hoy mismo.',
    sebiClaim: '',
    websiteLink: '',
    paymentDetail: '',
    requestedAmountInr: '',
  });
  assert.equal(esSuspicious.overallLevel, 'high_risk');
  assert.ok(
    esSuspicious.pillars.find((p) => p.id === 'message')?.warnings?.some((w) => w.id === 'secret-request')
  );
});

test('all 12 languages have complete UI copy, presets, BCP-47 tags, officialVerify links, and analyzer localization', () => {
  assert.equal(LANGUAGE_OPTIONS.length, 12);
  assert.equal(getBcp47('en-easy'), 'en');
  assert.equal(getBcp47('ml'), 'ml');

  const unified = analyzeUnifiedCheck(MESSAGE_DEMO_PRESETS[0].input);
  const payment = analyzePaymentCheck(PAYMENT_DEMO_PRESETS[0].input);

  for (const opt of LANGUAGE_OPTIONS) {
    const bundle = getCopy(opt.code);
    assert.ok(TRANSLATIONS[opt.code], `Missing translation bundle for ${opt.code}`);
    assert.ok(bundle.hero.title.trim().length > 0, `Empty hero title for ${opt.code}`);
    assert.ok(bundle.nav.checkMessage.trim().length > 0, `Empty nav for ${opt.code}`);
    assert.ok(bundle.demoBanner.trim().length > 0, `Empty demoBanner for ${opt.code}`);
    assert.ok(bundle.about.resources.length === 4, `Missing resources for ${opt.code}`);
    assert.ok(bundle.howItWorks.steps.length === 4, `Missing steps for ${opt.code}`);

    assert.ok(bundle.messageCheck.fields.sebiLabel.includes('('), `Missing optional marker in sebiLabel for ${opt.code}`);
    assert.ok(bundle.messageCheck.fields.sebiHelper.trim().length > 0, `Empty sebiHelper for ${opt.code}`);
    assert.ok(bundle.messageCheck.evidenceLabel.trim().length > 0, `Empty evidenceLabel for ${opt.code}`);
    assert.equal(
      bundle.analyzer.sebiMissingLabel,
      bundle.analyzer.msgNotProvidedLabel,
      `sebiMissingLabel should match neutral Not provided label for ${opt.code}`
    );
    assert.equal(bundle.statusTags.highRiskVerdict, bundle.statusTags.cautionVerdict, `Mismatch flagged verdict for ${opt.code}`);
    assert.equal(bundle.statusTags.highRiskBadge, bundle.statusTags.cautionBadge, `Mismatch flagged badge for ${opt.code}`);
    assert.equal(bundle.analyzer.msgHighLabel, bundle.statusTags.highRiskBadge, `msgHighLabel mismatch for ${opt.code}`);
    assert.equal(bundle.analyzer.msgCautionLabel, bundle.statusTags.highRiskBadge, `msgCautionLabel mismatch for ${opt.code}`);
    assert.equal(bundle.analyzer.sebiMismatchLabel, bundle.statusTags.highRiskBadge, `sebiMismatchLabel mismatch for ${opt.code}`);
    assert.equal(bundle.analyzer.linkHighLabel, bundle.statusTags.highRiskBadge, `linkHighLabel mismatch for ${opt.code}`);
    assert.equal(bundle.analyzer.linkCautionLabel, bundle.statusTags.highRiskBadge, `linkCautionLabel mismatch for ${opt.code}`);
    assert.equal(bundle.analyzer.payHighLabel, bundle.statusTags.highRiskBadge, `payHighLabel mismatch for ${opt.code}`);
    assert.equal(bundle.analyzer.payCautionLabel, bundle.statusTags.highRiskBadge, `payCautionLabel mismatch for ${opt.code}`);

    assert.equal(bundle.statusTags.cantVerifyVerdict, bundle.statusTags.cantVerifyBadge, `Mismatch clean verdict/badge for ${opt.code}`);
    assert.equal(bundle.analyzer.msgNoSignsLabel, bundle.statusTags.cantVerifyBadge, `msgNoSignsLabel mismatch for ${opt.code}`);
    assert.ok(bundle.statusTags.notVerifiedBadge.trim().length > 0, `Empty notVerifiedBadge for ${opt.code}`);
    assert.equal(bundle.analyzer.sebiValidLabel.trim().length > 0, true, `Empty sebiValidLabel for ${opt.code}`);
    assert.ok(bundle.analyzer.sebiNameOnlyLabel.trim().length > 0, `Empty sebiNameOnlyLabel for ${opt.code}`);
    assert.ok(bundle.analyzer.linkCantVerifyLabel.trim().length > 0, `Empty linkCantVerifyLabel for ${opt.code}`);
    assert.ok(bundle.analyzer.payCantVerifyLabel.trim().length > 0, `Empty payCantVerifyLabel for ${opt.code}`);
    assert.ok(bundle.analyzer.payValidUpiLabel.trim().length > 0, `Empty payValidUpiLabel for ${opt.code}`);
    assert.ok(bundle.analyzer.payValidUpiHeadline('test@validbank').trim().length > 0, `Empty payValidUpiHeadline for ${opt.code}`);
    assert.ok(bundle.analyzer.payValidUpiDesc.trim().length > 0, `Empty payValidUpiDesc for ${opt.code}`);
    assert.ok(bundle.analyzer.payNonValidUpiHeadline('test@okaxis').trim().length > 0, `Empty payNonValidUpiHeadline for ${opt.code}`);
    assert.ok(bundle.analyzer.payNonValidUpiDesc.trim().length > 0, `Empty payNonValidUpiDesc for ${opt.code}`);
    assert.ok(bundle.analyzer.payAmountContextHeadline('₹25,000').trim().length > 0, `Empty payAmountContextHeadline for ${opt.code}`);
    assert.ok(bundle.analyzer.payAmountContextDesc.trim().length > 0, `Empty payAmountContextDesc for ${opt.code}`);
    assert.ok(bundle.analyzer.insightPitchUnverifiedPay('₹25,000').trim().length > 0, `Empty insightPitchUnverifiedPay for ${opt.code}`);
    assert.ok(bundle.analyzer.payFindingValidUpiTitle.trim().length > 0, `Empty payFindingValidUpiTitle for ${opt.code}`);
    assert.ok(bundle.analyzer.payFindingValidUpiDesc.trim().length > 0, `Empty payFindingValidUpiDesc for ${opt.code}`);
    assert.ok(bundle.analyzer.payFindingNonValidUpiTitle('okaxis').trim().length > 0, `Empty payFindingNonValidUpiTitle for ${opt.code}`);
    assert.ok(bundle.analyzer.payFindingNonValidUpiDesc.trim().length > 0, `Empty payFindingNonValidUpiDesc for ${opt.code}`);
    assert.ok(bundle.analyzer.payFindingAmountContextTitle('₹25,000').trim().length > 0, `Empty payFindingAmountContextTitle for ${opt.code}`);
    assert.ok(bundle.analyzer.payFindingAmountContextDesc.trim().length > 0, `Empty payFindingAmountContextDesc for ${opt.code}`);

    assert.ok(bundle.checkBasis.patternClues.trim().length > 0, `Empty checkBasis.patternClues for ${opt.code}`);
    assert.ok(bundle.checkBasis.formatOnly.trim().length > 0, `Empty checkBasis.formatOnly for ${opt.code}`);
    assert.ok(bundle.checkBasis.notProvided.trim().length > 0, `Empty checkBasis.notProvided for ${opt.code}`);
    assert.ok(bundle.checkBasis.unverifiedLive.trim().length > 0, `Empty checkBasis.unverifiedLive for ${opt.code}`);

    assert.ok(bundle.analyzer.pitchSecretRequest.trim().length > 0, `Empty pitchSecretRequest for ${opt.code}`);
    assert.ok(bundle.analyzer.pitchPinToReceive.trim().length > 0, `Empty pitchPinToReceive for ${opt.code}`);
    assert.ok(bundle.analyzer.msgSecretHeadline.trim().length > 0, `Empty msgSecretHeadline for ${opt.code}`);
    assert.ok(bundle.analyzer.msgNoSignsLabel.trim().length > 0, `Empty msgNoSignsLabel for ${opt.code}`);
    assert.ok(bundle.analyzer.msgNoSignsHeadline.trim().length > 0, `Empty msgNoSignsHeadline for ${opt.code}`);
    assert.ok(bundle.analyzer.msgNoSignsDesc.trim().length > 0, `Empty msgNoSignsDesc for ${opt.code}`);
    assert.equal(/looks safe|looks okay/i.test(JSON.stringify(bundle)), false, `Unsafe phrasing in ${opt.code}`);
    assert.ok(buildFamilySummaryText(unified, opt.code).length > 50);

    assert.ok(bundle.officialVerify.title.trim().length > 0, `Empty officialVerify.title for ${opt.code}`);
    assert.ok(bundle.officialVerify.subtitle.trim().length > 0, `Empty officialVerify.subtitle for ${opt.code}`);
    assert.ok(bundle.officialVerify.sebiLookupLabel.trim().length > 0, `Empty sebiLookupLabel for ${opt.code}`);
    assert.ok(bundle.officialVerify.sebiLookupDesc.trim().length > 0, `Empty sebiLookupDesc for ${opt.code}`);
    assert.ok(bundle.officialVerify.sebiCheckLabel.trim().length > 0, `Empty sebiCheckLabel for ${opt.code}`);
    assert.ok(bundle.officialVerify.sebiCheckDesc.trim().length > 0, `Empty sebiCheckDesc for ${opt.code}`);
    assert.ok(bundle.officialVerify.appsListLabel.trim().length > 0, `Empty appsListLabel for ${opt.code}`);
    assert.ok(bundle.officialVerify.appsListDesc.trim().length > 0, `Empty appsListDesc for ${opt.code}`);
    assert.ok(bundle.officialVerify.spotScamLabel.trim().length > 0, `Empty spotScamLabel for ${opt.code}`);
    assert.ok(bundle.officialVerify.spotScamDesc.trim().length > 0, `Empty spotScamDesc for ${opt.code}`);
    assert.ok(bundle.officialVerify.fakeAppsPdfLabel.trim().length > 0, `Empty fakeAppsPdfLabel for ${opt.code}`);
    assert.ok(bundle.officialVerify.fakeAppsPdfDesc.trim().length > 0, `Empty fakeAppsPdfDesc for ${opt.code}`);
    assert.ok(bundle.officialVerify.rbiSafetyLabel.trim().length > 0, `Empty rbiSafetyLabel for ${opt.code}`);
    assert.ok(bundle.officialVerify.rbiSafetyDesc.trim().length > 0, `Empty rbiSafetyDesc for ${opt.code}`);
    assert.ok(bundle.officialVerify.npciAwarenessLabel.trim().length > 0, `Empty npciAwarenessLabel for ${opt.code}`);
    assert.ok(bundle.officialVerify.npciAwarenessDesc.trim().length > 0, `Empty npciAwarenessDesc for ${opt.code}`);
    assert.ok(bundle.officialVerify.cyberCrimeLabel.trim().length > 0, `Empty cyberCrimeLabel for ${opt.code}`);
    assert.ok(bundle.officialVerify.cyberCrimeDesc.trim().length > 0, `Empty cyberCrimeDesc for ${opt.code}`);
    assert.ok(bundle.officialVerify.scoresLabel.trim().length > 0, `Empty scoresLabel for ${opt.code}`);
    assert.ok(bundle.officialVerify.scoresDesc.trim().length > 0, `Empty scoresDesc for ${opt.code}`);
    assert.ok(bundle.officialVerify.guidanceStripTitle.trim().length > 0, `Empty guidanceStripTitle for ${opt.code}`);
    assert.ok(bundle.officialVerify.qrUnavailableNote.trim().length > 0, `Empty qrUnavailableNote for ${opt.code}`);
    assert.ok(bundle.officialVerify.openPortalBtn.trim().length > 0, `Empty openPortalBtn for ${opt.code}`);

    assert.ok(bundle.messageCheck.graphTitle.trim().length > 0, `Empty graphTitle for ${opt.code}`);
    assert.ok(bundle.messageCheck.graphProgress(0).trim().length > 0, `Empty graphProgress(0) for ${opt.code}`);
    assert.ok(bundle.messageCheck.graphProgress(3).trim().length > 0, `Empty graphProgress(3) for ${opt.code}`);
    assert.ok(bundle.messageCheck.nodeEmpty.trim().length > 0, `Empty nodeEmpty for ${opt.code}`);
    assert.ok(bundle.messageCheck.nodeEntered.trim().length > 0, `Empty nodeEntered for ${opt.code}`);
    assert.ok(
      bundle.messageCheck.nodeFocusHint(bundle.messageCheck.steps.link).trim().length > 0,
      `Empty nodeFocusHint for ${opt.code}`
    );
    assert.ok(bundle.messageCheck.tileInspectHint.trim().length > 0, `Empty tileInspectHint for ${opt.code}`);
    assert.ok(bundle.messageCheck.tileViewing.trim().length > 0, `Empty tileViewing for ${opt.code}`);
    assert.ok(
      bundle.messageCheck.tileSelectPrompt(bundle.messageCheck.pillarTitles.sebi).trim().length > 0,
      `Empty tileSelectPrompt for ${opt.code}`
    );
    assert.ok(bundle.paymentCheck.fields.methodHints.upi.trim().length > 0, `Empty upi hint for ${opt.code}`);
    assert.ok(
      bundle.paymentCheck.fields.methodHints.bank_transfer.trim().length > 0,
      `Empty bank_transfer hint for ${opt.code}`
    );
    assert.ok(
      bundle.paymentCheck.fields.methodHints.qr_or_link.trim().length > 0,
      `Empty qr_or_link hint for ${opt.code}`
    );
    assert.ok(bundle.footerTag.trim().length > 0, `Empty footerTag for ${opt.code}`);
    assert.equal(
      /hackathon|arthaton|हॅकाथॉन|हैकाथॉन|হ্যাকাথন|హ్యాకథాన్|ಹ್ಯಾಕಥಾನ್|ഹാക്കത്തോൺ|હેકાથોન|ਹੈਕਾਥੌਨ|ஹேக்கத்தான்/i.test(
        JSON.stringify(bundle)
      ),
      false,
      `Hackathon branding must be removed from ${opt.code}`
    );
    assert.ok(bundle.paymentCheck.qrHandoffHeading.trim().length > 0, `Empty qrHandoffHeading for ${opt.code}`);
    assert.ok(bundle.paymentCheck.qrHandoffDesc.trim().length > 0, `Empty qrHandoffDesc for ${opt.code}`);
    assert.ok(bundle.paymentCheck.qrHandoffBtn.trim().length > 0, `Empty qrHandoffBtn for ${opt.code}`);
    assert.ok(
      bundle.paymentCheck.checklistProgress(2, 4).trim().length > 0,
      `Empty checklistProgress for ${opt.code}`
    );
    assert.ok(
      bundle.paymentCheck.checklistComplete.trim().length > 0,
      `Empty checklistComplete for ${opt.code}`
    );

    for (const preset of MESSAGE_DEMO_PRESETS) {
      assert.ok(preset.title[opt.code]?.trim().length > 0, `Empty preset title ${preset.id} for ${opt.code}`);
      assert.ok(preset.subtitle[opt.code]?.trim().length > 0, `Empty preset subtitle ${preset.id} for ${opt.code}`);
    }
    for (const preset of PAYMENT_DEMO_PRESETS) {
      assert.ok(preset.title[opt.code]?.trim().length > 0, `Empty pay preset title ${preset.id} for ${opt.code}`);
      assert.ok(preset.subtitle[opt.code]?.trim().length > 0, `Empty pay preset subtitle ${preset.id} for ${opt.code}`);
    }

    assert.ok(unified.overallTitle[opt.code]?.trim().length > 0, `Empty unified overallTitle for ${opt.code}`);
    assert.ok(unified.overallSummary[opt.code]?.trim().length > 0, `Empty unified overallSummary for ${opt.code}`);
    assert.ok(unified.connectionInsight[opt.code]?.trim().length > 0, `Empty connectionInsight for ${opt.code}`);
    for (const pillar of unified.pillars) {
      assert.ok(pillar.statusLabel[opt.code]?.trim().length > 0);
      assert.ok(pillar.headline[opt.code]?.trim().length > 0);
      assert.ok(pillar.explanation[opt.code]?.trim().length > 0);
    }

    assert.ok(payment.overallTitle[opt.code]?.trim().length > 0, `Empty payment overallTitle for ${opt.code}`);
    assert.ok(payment.overallSummary[opt.code]?.trim().length > 0, `Empty payment overallSummary for ${opt.code}`);
    assert.ok(payment.checklist.every((item) => item[opt.code]?.trim().length > 0));

    assert.ok(bundle.aiReview.triggerBtn.trim().length > 0, `Empty aiReview.triggerBtn for ${opt.code}`);
    assert.ok(bundle.aiReview.loadingBtn.trim().length > 0, `Empty aiReview.loadingBtn for ${opt.code}`);
    assert.ok(bundle.aiReview.panelTitle.trim().length > 0, `Empty aiReview.panelTitle for ${opt.code}`);
    assert.ok(bundle.aiReview.panelSubtitle.trim().length > 0, `Empty aiReview.panelSubtitle for ${opt.code}`);
    assert.ok(bundle.aiReview.consentTitle.trim().length > 0, `Empty aiReview.consentTitle for ${opt.code}`);
    assert.ok(bundle.aiReview.consentBody.trim().length > 0, `Empty aiReview.consentBody for ${opt.code}`);
    assert.ok(bundle.aiReview.consentContinueBtn.trim().length > 0, `Empty consentContinueBtn for ${opt.code}`);
    assert.ok(bundle.aiReview.consentDemoOnlyBtn.trim().length > 0, `Empty consentDemoOnlyBtn for ${opt.code}`);
    assert.ok(bundle.aiReview.unavailableTitle.trim().length > 0, `Empty unavailableTitle for ${opt.code}`);
    assert.ok(bundle.aiReview.unavailableNotConfigured.trim().length > 0, `Empty unavailableNotConfigured for ${opt.code}`);
    assert.ok(bundle.aiReview.unavailableError.trim().length > 0, `Empty unavailableError for ${opt.code}`);
    assert.ok(bundle.aiReview.verdictWarningSigns.trim().length > 0, `Empty verdictWarningSigns for ${opt.code}`);
    assert.ok(bundle.aiReview.verdictNoListedSigns.trim().length > 0, `Empty verdictNoListedSigns for ${opt.code}`);
    assert.ok(bundle.aiReview.noSignsFoundNote.trim().length > 0, `Empty noSignsFoundNote for ${opt.code}`);
    assert.ok(bundle.aiReview.limitationsBody.trim().length > 0, `Empty limitationsBody for ${opt.code}`);
    assert.ok(bundle.aiReview.uncertainNote.trim().length > 0, `Empty aiReview.uncertainNote for ${opt.code}`);
    assert.ok(bundle.aiReview.localOnlyBadge.trim().length > 0, `Empty aiReview.localOnlyBadge for ${opt.code}`);
    assert.ok(bundle.aiReview.missingMessageError.trim().length > 0, `Empty missingMessageError for ${opt.code}`);
    assert.ok(bundle.aiReview.privacyBadge.trim().length > 0, `Empty privacyBadge for ${opt.code}`);

    assert.ok(bundle.printSummary.printBtn.trim().length > 0, `Empty printBtn for ${opt.code}`);
    assert.ok(bundle.printSummary.familyDocKicker.trim().length > 0, `Empty familyDocKicker for ${opt.code}`);
    assert.ok(bundle.printSummary.messageDocTitle.trim().length > 0, `Empty messageDocTitle for ${opt.code}`);
    assert.ok(bundle.printSummary.paymentDocTitle.trim().length > 0, `Empty paymentDocTitle for ${opt.code}`);
    assert.ok(bundle.printSummary.privacyExclusionNote.trim().length > 0, `Empty privacyExclusionNote for ${opt.code}`);
  }
});

test('PIN-to-receive and QR-to-receive lures flag high_risk while protective PIN guidance does not', () => {
  const lure = analyzeUnifiedCheck({
    messageText: 'Scan this QR code and enter your UPI PIN to receive your ₹15,000 refund immediately.',
    sebiClaim: '',
    websiteLink: '',
    paymentDetail: '',
    requestedAmountInr: '',
  });
  assert.equal(lure.overallLevel, 'high_risk');
  const msgPillar = lure.pillars.find((p) => p.id === 'message');
  assert.equal(msgPillar?.status, 'high_risk');
  assert.ok(msgPillar?.warnings?.some((w) => w.id === 'pin-to-receive'));

  const protective = analyzeUnifiedCheck({
    messageText: 'NPCI reminder: Entering your UPI PIN always sends money out — you never need a PIN to receive money.',
    sebiClaim: '',
    websiteLink: '',
    paymentDetail: '',
    requestedAmountInr: '',
  });
  assert.equal(protective.overallLevel, 'cant_verify');
  assert.equal(protective.detectedSignalsCount, 0);
});

test('@valid UPI handles are classified as format_only and unverified — never proven genuine', () => {
  const unified = analyzeUnifiedCheck({
    messageText: '',
    sebiClaim: '',
    websiteLink: '',
    paymentDetail: 'broker.desk@validhdfc',
    requestedAmountInr: '',
  });
  const payPillar = unified.pillars.find((p) => p.id === 'payment');
  assert.equal(payPillar?.status, 'cant_verify');
  assert.equal(payPillar?.checkBasis, 'format_only');
  assert.equal(payPillar?.statusLabel.en, 'Could not verify — check directly with SEBI');
  assert.match(payPillar?.explanation.en ?? '', /siportal\.sebi\.gov\.in/i);

  const payment = analyzePaymentCheck({
    method: 'upi',
    handleOrAccount: 'broker.desk@validhdfc',
    ifscCode: '',
    amountInr: '5000',
    claimedEntity: 'Sample Registered Broker',
    recipientMatch: 'matches',
    source: 'other',
  });
  assert.equal(payment.overallLevel, 'cant_verify');
  const validFinding = payment.findings.find((f) => f.id === 'valid-upi-unverified');
  assert.ok(validFinding);
  assert.equal(validFinding?.checkBasis, 'format_only');
  assert.match(validFinding?.detail.en ?? '', /NOT live proof/i);
});

test('clean HTTPS domain clarifies HTTPS never proves legitimacy and checkBasis labels map cleanly', () => {
  const result = analyzeUnifiedCheck({
    messageText: '',
    sebiClaim: '',
    websiteLink: 'https://example-broker.in',
    paymentDetail: '',
    requestedAmountInr: '',
  });
  const linkPillar = result.pillars.find((p) => p.id === 'link');
  assert.equal(linkPillar?.status, 'cant_verify');
  assert.equal(linkPillar?.checkBasis, 'unverified_live');
  assert.equal(linkPillar?.statusLabel.en, 'Not verified by this demo');
  assert.match(linkPillar?.explanation.en ?? '', /HTTPS padlock.*does NOT prove/i);

  const enCopy = getCopy('en');
  assert.equal(getCheckBasisLabel('pattern_clues', enCopy), enCopy.checkBasis.patternClues);
  assert.equal(getCheckBasisLabel('format_only', enCopy), enCopy.checkBasis.formatOnly);
  assert.equal(getCheckBasisLabel('unverified_live', enCopy), enCopy.checkBasis.unverifiedLive);
  assert.equal(getCheckBasisLabel('not_provided', enCopy), enCopy.checkBasis.notProvided);
});

test('OFFICIAL_PORTAL_LINKS exposes all 9 official Indian regulator and reporting portals', () => {
  assert.equal(
    OFFICIAL_PORTAL_LINKS.appsList,
    'https://investor.sebi.gov.in/Investor-support.html'
  );
  assert.equal(OFFICIAL_PORTAL_LINKS.spotScam, 'https://investor.sebi.gov.in/spot-any-scam.html');
  assert.equal(
    OFFICIAL_PORTAL_LINKS.fakeAppsPdf,
    'https://investor.sebi.gov.in/pdf/Fake%20trading%20app%20scam%20Landscape.pdf'
  );
  assert.equal(
    OFFICIAL_PORTAL_LINKS.sebiCheck,
    'https://siportal.sebi.gov.in/intermediary/sebi-check'
  );
  assert.equal(
    OFFICIAL_PORTAL_LINKS.rbiSafety,
    'https://www.rbi.org.in/Scripts/BS_PressReleaseDisplay.aspx?prid=53185'
  );
  assert.equal(OFFICIAL_PORTAL_LINKS.npciAwareness, 'https://www.npci.org.in/fraud-awareness');
  assert.equal(OFFICIAL_PORTAL_LINKS.cyberCrime, 'https://cybercrime.gov.in/');
  assert.equal(OFFICIAL_PORTAL_LINKS.scores, 'https://scores.sebi.gov.in/');
});

test('requested amount alone (₹25,000 / ₹50,000 / ₹1,00,000) is neutral context and never triggers a warning', () => {
  for (const amountVal of ['25000', '50000', '100000']) {
    const unified = analyzeUnifiedCheck({
      messageText: '',
      sebiClaim: '',
      websiteLink: '',
      paymentDetail: '',
      requestedAmountInr: amountVal,
    });
    const payPillar = unified.pillars.find((p) => p.id === 'payment');
    assert.equal(unified.overallLevel, 'cant_verify', `Unified check flagged amount ${amountVal}`);
    assert.equal(unified.detectedSignalsCount, 0);
    assert.equal(payPillar?.status, 'cant_verify');
    assert.equal(payPillar?.statusLabel.en, 'Not verified by this demo');
    assert.match(payPillar?.explanation.en ?? '', /does not indicate a scam/i);

    const payment = analyzePaymentCheck({
      method: 'upi',
      handleOrAccount: '',
      ifscCode: '',
      amountInr: amountVal,
      claimedEntity: '',
      recipientMatch: 'unsure',
      source: 'other',
    });
    assert.equal(payment.overallLevel, 'cant_verify', `Payment check flagged amount ${amountVal}`);
    const amountFinding = payment.findings.find((f) => f.id === 'amount-context');
    assert.equal(amountFinding?.status, 'cant_verify');
    assert.equal(amountFinding?.statusLabel?.en, 'Not verified by this demo');
  }
});

test('UPI suffixes (@ybl, @okaxis, @oksbi, @paytm, @okicici) are never mislabeled as personal handles and point to SEBI Check', () => {
  const handles = [
    'broker.desk@ybl',
    'sample.firm@okaxis',
    'desk.equity@oksbi',
    'demo.service@paytm',
    'client.care@okicici',
  ];

  for (const handle of handles) {
    const unified = analyzeUnifiedCheck({
      messageText: 'Please verify our quarterly research membership.',
      sebiClaim: '',
      websiteLink: '',
      paymentDetail: handle,
      requestedAmountInr: '25000',
    });
    const payPillar = unified.pillars.find((p) => p.id === 'payment');
    assert.equal(unified.overallLevel, 'cant_verify', `Unexpected flag for ${handle}`);
    assert.equal(payPillar?.status, 'cant_verify');
    assert.equal(payPillar?.checkBasis, 'unverified_live');
    assert.equal(payPillar?.statusLabel.en, 'Not verified by this demo');
    assert.equal(/personal/i.test(payPillar?.headline.en ?? ''), false, `Mislabeled ${handle} as personal`);
    assert.match(payPillar?.explanation.en ?? '', /SEBI Check/i);

    const payment = analyzePaymentCheck({
      method: 'upi',
      handleOrAccount: handle,
      ifscCode: '',
      amountInr: '25000',
      claimedEntity: 'Sample Advisory Ltd',
      recipientMatch: 'matches',
      source: 'other',
    });
    assert.equal(payment.overallLevel, 'cant_verify', `Payment check flagged ${handle}`);
    const nonValidFinding = payment.findings.find((f) => f.id === 'non-valid-upi');
    assert.ok(nonValidFinding, `Missing non-valid-upi finding for ${handle}`);
    assert.equal(nonValidFinding?.status, 'cant_verify');
    assert.equal(nonValidFinding?.statusLabel?.en, 'Not verified by this demo');
    assert.match(nonValidFinding?.detail.en ?? '', /not shown as a SEBI-validated @valid/i);
  }
});

test('explicit personal/agent account wording with an investment pitch still flags high_risk', () => {
  const result = analyzeUnifiedCheck({
    messageText: 'Urgent block deal! Deposit ₹50,000 today only for 20% guaranteed return.',
    sebiClaim: '',
    websiteLink: '',
    paymentDetail: 'IMPS to Agent Savings Account 400192837412',
    requestedAmountInr: '50000',
  });
  const payPillar = result.pillars.find((p) => p.id === 'payment');
  assert.equal(result.overallLevel, 'high_risk');
  assert.equal(payPillar?.status, 'high_risk');
  assert.equal(payPillar?.statusLabel.en, 'Warning signs found');
});
test('official subdomains are not flagged but lookalikes still are', () => {
  assert.notEqual(analyzeLinkPillar('kite.zerodha.com').status, 'high_risk');
  assert.notEqual(analyzeLinkPillar('login.hdfcsec.com').status, 'high_risk');
  for (const bad of ['evil-zerodha.com', 'zerodha.com.evil.in', 'zer0dha-trade.com', 'z3rodha.in', 'nseindla.com', 'hdfcsec.in', 'groww-pro.top']) {
    assert.equal(analyzeLinkPillar(bad).status, 'high_risk', bad);
  }
  assert.equal(analyzeLinkPillar('mysite.xyz').status, 'caution');
});

test('new scam stories are flagged high risk', () => {
  const scams = [
    'This is CBI. Your Aadhaar is linked to money laundering. Transfer 50000 to safe account immediately.',
    'You are under digital arrest. Do not tell anyone. Stay on video call until we verify your account.',
    'Earn Rs 5000 daily by liking YouTube videos. Deposit Rs 1000 to unlock higher tasks. Message on WhatsApp.',
    'Part time job work from home, rate hotels and earn commission. Recharge 2000 to complete the next task.',
    'I am a trader from Singapore. My uncle is an analyst with internal info. Invest in this crypto platform, withdraw anytime, daily 3% returns.',
    'Watch Nirmala Sitharaman recommend our AI trading bot, earn 3 lakh monthly with 21000 investment',
    'Bhai 100% pakka profit milega, aaj hi paisa daalo, Telegram group join karo',
    'Sir hamare ipo allotment ke liye 5000 rupay bhejo, guaranteed listing gain 200%',
    'Zero risk hai bhai, paisa double ho jayega, abhi payment karo',
  ];
  for (const text of scams) assert.equal(analyzeMessagePillar(text).status, 'high_risk', text);
});

test('awareness text and ordinary messages are not flagged', () => {
  const safe = [
    'Beware: police and CBI never ask you to transfer money to a safe account. Digital arrest is a scam. Call 1930.',
    'Scammers often offer part time jobs to like videos and earn daily, then ask you to deposit money to unlock tasks. Do not pay.',
    'Fraudsters promote crypto platforms with daily 3% returns and withdraw anytime claims. Do not invest.',
    'Finance Minister announced a new savings scheme in the Budget speech. Details on the finance ministry website.',
    'Police arrested two men for cyber fraud in Lucknow, a case was registered at the cyber cell.',
    'You can earn a salary of 50000 per month as a software engineer after BTech CSE.',
    'Aaj hi office se jaldi nikalna hai, kal milte hain.',
    'Your SIP of Rs 5000 in HDFC Flexi Cap fund will be debited on 5 Dec. Mutual fund investments are subject to market risks.',
  ];
  for (const text of safe) assert.equal(analyzeMessagePillar(text).status, 'cant_verify', text);
});



