import test from 'node:test'
import assert from 'node:assert/strict';
import { OFFICIAL_PORTAL_LINKS } from '../components/OfficialSourcesCard';
import { getCopy } from '../data/translations';
import { analyzePaymentCheck, analyzeUnifiedCheck } from './analyzer';
import { redactSensitiveText, validateAndSanitizeAiReview } from './aiReviewHelpers';
import { requestAiMessageReview } from './aiReviewServer';
import { buildPrintableMessageSummary, buildPrintablePaymentSummary } from './printSummary';

test('protective OTP warning preserves natural wording and returns No listed warning signs found', async () => {
  const protectiveText =
    'SEBI security reminder: Never share your OTP, UPI PIN, CVV, or password with anyone on phone or chat.';

  const sanitized = redactSensitiveText(protectiveText, { maskPaymentHandles: false });
  assert.equal(sanitized, protectiveText);
  assert.ok(sanitized.includes('with anyone'));

  const demoResult = analyzeUnifiedCheck({
    messageText: protectiveText,
    sebiClaim: '',
    websiteLink: '',
    paymentDetail: '',
    requestedAmountInr: '',
  });
  assert.equal(demoResult.overallLevel, 'cant_verify');
  assert.equal(demoResult.pillars.find((p) => p.id === 'message')?.statusLabel.en, 'No listed warning signs found');

  let receivedMessage = '';
  let receivedInstruction = '';
  const enCopy = getCopy('en');
  const aiRes = await requestAiMessageReview({
    messageText: protectiveText,
    language: 'en',
    labels: {
      verdictWarningSigns: enCopy.aiReview.verdictWarningSigns,
      verdictNoListedSigns: enCopy.aiReview.verdictNoListedSigns,
      noSignsFoundNote: enCopy.aiReview.noSignsFoundNote,
      limitationsBody: enCopy.aiReview.limitationsBody,
      demoDisclaimer: enCopy.footer.note,
    },
    generateJson: async ({ sanitizedMessage, systemInstruction }) => {
      receivedMessage = sanitizedMessage;
      receivedInstruction = systemInstruction;
      return {
        verdict: 'no_listed_signs',
        plainLanguageSummary:
          'This sentence advises recipients never to share their OTP, PIN, CVV, or password.',
        warningSigns: [],
        practicalNextSteps: ['Still verify the sender through official portals before acting.'],
        insufficientEvidenceNote:
          'No SEBI registration ID, website, or payment handle is included to verify.',
      };
    },
  });

  assert.equal(aiRes.ok, true);
  assert.equal(receivedMessage, protectiveText);
  assert.match(receivedInstruction, /honor negation/i);
  if (aiRes.ok) {
    assert.equal(aiRes.review.verdict, 'no_listed_signs');
    assert.equal(aiRes.review.verdictLabel, 'No listed warning signs found');
    assert.equal(aiRes.review.warningSigns.length, 0);
    assert.match(aiRes.review.noSafeProofNote, /does not prove/i);
    assert.ok(aiRes.review.insufficientEvidenceNote);
  }
});

test('real request for OTP/PIN redacts secrets before sending to AI and keeps warning flagged', async () => {
  const suspiciousText =
    'Urgent! Please share your OTP 918273, UPI PIN 4829, and password mySecretPass to claim guaranteed 25% return.';

  const demoResult = analyzeUnifiedCheck({
    messageText: suspiciousText,
    sebiClaim: '',
    websiteLink: '',
    paymentDetail: '',
    requestedAmountInr: '',
  });
  assert.equal(demoResult.overallLevel, 'high_risk');
  assert.equal(demoResult.pillars.find((p) => p.id === 'message')?.statusLabel.en, 'Warning signs found');

  let sentToAi = '';
  const aiRes = await requestAiMessageReview({
    messageText: suspiciousText,
    language: 'en',
    generateJson: async ({ sanitizedMessage }) => {
      sentToAi = sanitizedMessage;
      return {
        verdict: 'warning_signs_found',
        plainLanguageSummary:
          'The sender asks for sensitive banking secrets alongside a guaranteed return claim.',
        warningSigns: [
          {
            title: 'Request for OTP, UPI PIN, and password',
            supportingPhrase: 'share your OTP 918273, UPI PIN 4829, and password mySecretPass',
            explanation: 'Legitimate advisers never ask for OTPs, UPI PINs, or passwords.',
          },
          {
            title: 'Guaranteed profit claim',
            supportingPhrase: 'guaranteed 25% return',
            explanation: 'Market-linked investments cannot guarantee fixed returns.',
          },
        ],
        practicalNextSteps: ['Do not share any PIN, OTP, or password.'],
        insufficientEvidenceNote: '',
      };
    },
  });

  assert.equal(sentToAi.includes('918273'), false);
  assert.equal(sentToAi.includes('4829'), false);
  assert.equal(sentToAi.includes('mySecretPass'), false);

  assert.equal(aiRes.ok, true);
  if (aiRes.ok) {
    assert.equal(aiRes.review.verdict, 'warning_signs_found');
    assert.equal(aiRes.review.verdictLabel, 'Warning signs found');
    const serialized = JSON.stringify(aiRes.review);
    assert.equal(serialized.includes('918273'), false);
    assert.equal(serialized.includes('4829'), false);
    assert.equal(serialized.includes('mySecretPass'), false);
    assert.equal(aiRes.review.warningSigns.length, 2);
  }
});

test('AI review fallback reports unavailable honestly when credentials, quota, or message are missing', async () => {
  const missingKeyRes = await requestAiMessageReview({
    messageText: 'Join VIP stock group today for 30% return.',
    language: 'en',
    apiKey: '',
  });
  assert.deepEqual(missingKeyRes, {
    ok: false,
    available: false,
    reason: 'not_configured',
    message:
      'AI plain-language review is unavailable because server AI credentials are not configured.',
  });

  const quotaRes = await requestAiMessageReview({
    messageText: 'Join VIP stock group today for 30% return.',
    language: 'en',
    apiKey: 'dummy',
    generateJson: async () => {
      const err = new Error('RESOURCE_EXHAUSTED quota exceeded') as Error & { status?: number };
      err.status = 429;
      throw err;
    },
  });
  assert.equal(quotaRes.ok, false);
  if (!quotaRes.ok) {
    assert.equal(quotaRes.available, false);
    assert.equal(quotaRes.reason, 'quota_or_billing');
  }

  const upstreamRes = await requestAiMessageReview({
    messageText: 'Join VIP stock group today for 30% return.',
    language: 'en',
    apiKey: 'dummy',
    generateJson: async () => {
      throw new Error('Network timeout');
    },
  });
  assert.equal(upstreamRes.ok, false);
  if (!upstreamRes.ok) {
    assert.equal(upstreamRes.available, false);
    assert.equal(upstreamRes.reason, 'upstream_error');
  }

  const emptyRes = await requestAiMessageReview({
    messageText: '   ',
    language: 'en',
    apiKey: 'dummy',
  });
  assert.equal(emptyRes.ok, false);
  if (!emptyRes.ok) {
    assert.equal(emptyRes.reason, 'empty_message');
  }
});

test('validateAndSanitizeAiReview scrubs unsafe safety/scam absolutes and masks PIN/OTP', () => {
  const sanitized = validateAndSanitizeAiReview(
    {
      verdict: 'safe',
      plainLanguageSummary:
        'This message looks safe and completely genuine. Their OTP 778899 is valid.',
      warningSigns: [],
      practicalNextSteps: ['Not definitely a scam, check SEBI first.'],
      insufficientEvidenceNote: 'Short message with no registration ID.',
    },
    'en'
  );

  assert.equal(sanitized.verdict, 'no_listed_signs');
  assert.equal(sanitized.verdictLabel, 'No listed warning signs found');
  assert.equal(/looks safe|completely genuine|definitely a scam/i.test(JSON.stringify(sanitized)), false);
  assert.equal(JSON.stringify(sanitized).includes('778899'), false);
});

test('printable message summary excludes raw pasted message, secrets, and personal UPI usernames while keeping clues and official URLs', () => {
  const rawMessage =
    'UNIQUE_RAW_MESSAGE_MARKER: Share your OTP 918273, PIN 4829, password mySecretPass, and send ₹25,000 to ramesh.kumar92@okaxis with IFSC HDFC0001234 and account 987654321012 for 25% guaranteed return.';
  const result = analyzeUnifiedCheck({
    messageText: rawMessage,
    sebiClaim: '',
    websiteLink: '',
    paymentDetail: 'ramesh.kumar92@okaxis',
    requestedAmountInr: '25000',
  });

  const aiSummary = validateAndSanitizeAiReview(
    {
      verdict: 'warning_signs_found',
      plainLanguageSummary:
        'The sender asks for OTP 918273 and promises a guaranteed 25% return to ramesh.kumar92@okaxis.',
      warningSigns: [
        {
          title: 'Secret request',
          supportingPhrase: 'Share your OTP 918273, PIN 4829',
          explanation: 'Never share OTPs or PINs.',
        },
      ],
      practicalNextSteps: ['Pause payment and check SEBI directly.'],
      insufficientEvidenceNote: '',
    },
    'en'
  );

  const printable = buildPrintableMessageSummary(result, 'en', aiSummary);
  const serialized = JSON.stringify(printable);

  assert.equal(serialized.includes('UNIQUE_RAW_MESSAGE_MARKER'), false);
  assert.equal(serialized.includes('918273'), false);
  assert.equal(serialized.includes('4829'), false);
  assert.equal(serialized.includes('mySecretPass'), false);
  assert.equal(serialized.includes('HDFC0001234'), false);
  assert.equal(serialized.includes('987654321012'), false);
  assert.equal(serialized.includes('ramesh.kumar92'), false);
  assert.ok(serialized.includes('[masked]@okaxis'));

  assert.equal(printable.verdictBadge, 'Warning signs found');
  assert.ok(printable.missingInfoNotes.some((n) => n.includes('Not provided')));
  assert.ok(printable.nextSteps.length > 0);
  assert.ok(printable.aiSummary);
  assert.ok(printable.privacyExclusionNote.includes('excluded'));
  assert.match(printable.demoLimitNote, /Demo-only check/i);
  assert.ok(printable.officialLinks.some((l) => l.url === OFFICIAL_PORTAL_LINKS.sebiLookup));
  assert.ok(printable.officialLinks.some((l) => l.url === OFFICIAL_PORTAL_LINKS.sebiCheck));
  assert.ok(printable.officialLinks.some((l) => l.url === OFFICIAL_PORTAL_LINKS.appsList));
  assert.ok(printable.officialLinks.some((l) => l.url === OFFICIAL_PORTAL_LINKS.spotScam));
  assert.ok(printable.officialLinks.some((l) => l.url === OFFICIAL_PORTAL_LINKS.rbiSafety));
  assert.ok(printable.officialLinks.some((l) => l.url === OFFICIAL_PORTAL_LINKS.npciAwareness));
  assert.ok(printable.officialLinks.some((l) => l.url === OFFICIAL_PORTAL_LINKS.cyberCrime));
  assert.ok(printable.officialLinks.some((l) => l.url === OFFICIAL_PORTAL_LINKS.scores));
  assert.ok(printable.findings.every((f) => Boolean(f.checkBasisLabel)));
});

test('printable payment summary excludes IFSC, full bank numbers, and unmasked UPI usernames while retaining official links', () => {
  const paymentResult = analyzePaymentCheck({
    method: 'bank_transfer',
    handleOrAccount: '987654321012',
    ifscCode: 'SBIN0004321',
    amountInr: '75000',
    claimedEntity: 'Delta Wealth Desk',
    recipientMatch: 'different',
    source: 'whatsapp_telegram',
  });

  const printable = buildPrintablePaymentSummary(paymentResult, 'en');
  const serialized = JSON.stringify(printable);

  assert.equal(serialized.includes('987654321012'), false);
  assert.equal(serialized.includes('SBIN0004321'), false);
  assert.equal(printable.verdictBadge, 'Warning signs found');
  assert.ok(printable.findings.length >= 2);
  assert.ok(printable.findings.every((f) => Boolean(f.checkBasisLabel)));
  assert.ok(printable.nextSteps.length >= 3);
  assert.ok(printable.officialLinks.some((l) => l.url === OFFICIAL_PORTAL_LINKS.sebiCheck));
  assert.ok(printable.officialLinks.some((l) => l.url === OFFICIAL_PORTAL_LINKS.cyberCrime));
});

test('redactSensitiveText masks reverse-order PIN/OTP and preserves negated safety statements in AI output', () => {
  const raw = '4829 is my PIN and 918273 is the OTP for account 987654321012.';
  const redacted = redactSensitiveText(raw, { maskPaymentHandles: true });
  assert.equal(redacted.includes('4829'), false);
  assert.equal(redacted.includes('918273'), false);
  assert.equal(redacted.includes('987654321012'), false);
  assert.ok(redacted.includes('[redacted]'));
  assert.ok(redacted.includes('[account redacted]'));

  const aiResult = validateAndSanitizeAiReview(
    {
      verdict: 'no_listed_signs',
      plainLanguageSummary: 'Having an HTTPS link does not mean this is safe.',
      warningSigns: [],
      practicalNextSteps: ['Remember this is not safe automatically; verify on SEBI directly.'],
      insufficientEvidenceNote: 'Short text only.',
    },
    'en'
  );
  assert.match(aiResult.plainLanguageSummary, /does not mean this is safe/i);
  assert.match(aiResult.practicalNextSteps[0], /is not safe automatically/i);
});
