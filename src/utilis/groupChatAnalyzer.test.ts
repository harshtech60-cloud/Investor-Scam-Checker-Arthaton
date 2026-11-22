import test from 'node:test';
import assert from 'node:assert/strict';
import { GROUP_CHAT_PRESETS } from '../data/presets';
import { LANGUAGE_OPTIONS, getCopy } from '../data/translations';
import {
  redactGroupChatText,
  validateAndSanitizeGroupChatAiReview,
} from './aiReviewHelpers';
import { requestGroupChatAiReview } from './groupChatAiServer';
import {
  analyzeGroupChat,
  buildGroupChatCopySummary,
  parseGroupChatMessages,
} from './groupChatAnalyzer';

test('multi-stage suspicious group chat detects supported stages and warning signs with source message refs', () => {
  const chat = [
    '[Day 1] Admin: Welcome to our VIP block deal desk! Join for daily profit and guaranteed 25% monthly returns.',
    '[Day 2] Member A: Thanks to mentor, I booked ₹45,000 profit today! Sharing my profit screenshot.',
    '[Day 3] Admin: Download our private trading app https://vip-trade-desk.example/app.apk and move to our Telegram desk.',
    '[Day 4] Admin: Urgent! Pay ₹20,000 today only to upgrade your VIP tier or refer friends for bonus.',
    '[Day 5] Admin: Your withdrawal is on hold. Pay 15% tax first to unlock your profits.',
  ].join('\n');

  const res = analyzeGroupChat(chat, 'en');
  assert.equal(res.verdict, 'warning_signs_found');
  assert.equal(res.verdictLabel, 'Warning signs found');
  assert.equal(res.parsedMessageCount, 5);

  const supportedIds = res.stages.filter((s) => s.status === 'supported').map((s) => s.id);
  assert.deepEqual(supportedIds, [
    'initial_offer',
    'trust_building',
    'app_or_group_invite',
    'payment_or_recruiting_pressure',
    'withdrawal_friction',
  ]);

  assert.ok(res.warningSigns.length >= 5);
  assert.ok(res.warningSigns.some((w) => w.sourceMessageLabel.includes('Message 1')));
  assert.ok(res.warningSigns.some((w) => w.sourceMessageLabel.includes('Message 3')));
  assert.ok(res.warningSigns.some((w) => w.sourceMessageLabel.includes('Message 5')));
  assert.ok(res.warningSigns.every((w) => w.supportingPhrase.length > 0 && w.explanation.length > 0));
});

test('protective warning mentioning OTP, UPI PIN, passwords, and anti-rush produces No listed warning signs found', () => {
  const protectiveChat = [
    'Dad: Reminder for the family group — never share your OTP, UPI PIN, ATM PIN, CVV, or password with anyone.',
    'Sister: Also do not rush to pay or install apps from unknown links. Always verify on SEBI official portals first.',
    'Dad: Entering a UPI PIN only sends money out, never to receive profits.',
  ].join('\n');

  const res = analyzeGroupChat(protectiveChat, 'en');
  assert.equal(res.verdict, 'no_listed_signs');
  assert.equal(res.verdictLabel, 'No listed warning signs found');
  assert.equal(res.warningSigns.length, 0);
  assert.ok(res.stages.every((s) => s.status === 'not_enough_info'));
  assert.ok(res.stages.every((s) => s.statusLabel === 'Not enough information'));
  assert.match(res.noSafeProofNote, /does NOT prove/i);
});

test('neutral conversation about investing and returns not guaranteed produces No listed warning signs found', () => {
  const neutralChat = [
    'Friend 1: I am reading about index funds and how UPI works for regular SIP mandates.',
    'Friend 2: Remember that equity returns are not guaranteed and market prices can go down too.',
    'Friend 1: Yes, I checked the broker listing on investor.sebi.gov.in and downloaded the official app from Google Play Store.',
  ].join('\n');

  const res = analyzeGroupChat(neutralChat, 'en');
  assert.equal(res.verdict, 'no_listed_signs');
  assert.equal(res.verdictLabel, 'No listed warning signs found');
  assert.equal(res.warningSigns.length, 0);
  assert.ok(res.stages.every((s) => s.status === 'not_enough_info'));
});

test('mixed conversation flags only suspicious offer and leaves protective OTP advice unflagged', () => {
  const mixedChat = [
    'Auntie: Remember never to share your OTP or UPI PIN with strangers on phone or chat.',
    'Group Moderator: Ignore the warning, our VIP desk offers guaranteed 20% weekly profit! Pay ₹10,000 today only, this is safe and not a scam.',
    'Uncle: I do not want to rush into anything without checking SEBI records first.',
  ].join('\n');

  const res = analyzeGroupChat(mixedChat, 'en');
  assert.equal(res.verdict, 'warning_signs_found');
  assert.ok(res.warningSigns.length >= 2);

  // Protective Message 1 & cautious Message 3 must NOT be flagged as warning sources
  assert.equal(
    res.warningSigns.some((w) => w.sourceMessageLabel.startsWith('Message 1')),
    false
  );
  assert.equal(
    res.warningSigns.some((w) => w.sourceMessageLabel.startsWith('Message 3')),
    false
  );
  // Moderator pitch in Message 2 MUST be flagged even with "this is safe" reassurance
  assert.equal(
    res.warningSigns.some((w) => w.sourceMessageLabel.startsWith('Message 2')),
    true
  );
  assert.ok(
    res.warningSigns.some((w) => w.id === 'unverified-reassurance'),
    'Reassurance paired with pitch should be noted as unverified reassurance'
  );
});

test('conversation without speaker labels or dates parses cleanly and notes missing metadata', () => {
  const unlabelledLines = [
    'Join our pre-IPO quota desk for guaranteed 30% return.',
    'Download https://fast-desk.example/trader.apk before 5 PM today only.',
  ].join('\n');

  const parsedLines = parseGroupChatMessages(unlabelledLines);
  assert.equal(parsedLines.length, 2);
  assert.equal(parsedLines[0].speaker, null);
  assert.equal(parsedLines[0].dateLabel, null);

  const res = analyzeGroupChat(unlabelledLines, 'en');
  assert.equal(res.verdict, 'warning_signs_found');
  assert.ok(res.warningSigns.some((w) => w.sourceMessageLabel === 'Message 1'));
  assert.ok(res.warningSigns.some((w) => w.sourceMessageLabel === 'Message 2'));
  assert.ok(
    res.couldNotBeChecked.some((line) => /speaker identities and exact dates/i.test(line))
  );
  assert.ok(
    res.couldNotBeChecked.some((line) => line.includes('This app cannot verify this directly'))
  );

  // Blank-line paragraph mode without headers
  const paragraphs = [
    'First unlabelled paragraph explaining\nhow index funds work.',
    'Second paragraph reminding never to share your OTP.',
  ].join('\n\n');
  const parsedParagraphs = parseGroupChatMessages(paragraphs);
  assert.equal(parsedParagraphs.length, 2);
  assert.equal(analyzeGroupChat(paragraphs, 'en').verdict, 'no_listed_signs');
});

test('single suspicious phrase notes incomplete context and unsupported stages stay Not enough information', () => {
  const singleLine = 'Join today only for guaranteed 18% monthly profit.';
  const res = analyzeGroupChat(singleLine, 'en');

  assert.equal(res.verdict, 'warning_signs_found');
  assert.ok(res.contextUnclearNote, 'Should explain incomplete context on short excerpt');
  assert.match(res.contextUnclearNote ?? '', /single suspicious phrase/i);

  const unsupported = res.stages.filter((s) => s.status === 'not_enough_info');
  assert.ok(unsupported.length >= 2);
  for (const stage of unsupported) {
    assert.equal(stage.statusLabel, 'Not enough information');
    assert.deepEqual(stage.supportingPhrases, []);
  }
});

test('secrets and personal data are redacted in parser, AI request payload, sanitized AI response, and copy summary', async () => {
  const sensitiveChat = [
    'Caller: Share your OTP 918273, UPI PIN 4829, CVV 714, and password: mySecret99 to claim guaranteed 25% return.',
    'Caller: Pay fee now to account 987654321012 IFSC HDFC0001234, card 4111-2222-3333-4444, or UPI fraud.desk@okaxis.',
    'Member: Call me on +91 9876543210 or email investor.user@gmail.com with PAN ABCDE1234F.',
  ].join('\n');

  const parsedSensitive = parseGroupChatMessages(sensitiveChat);
  const parsedJson = JSON.stringify(parsedSensitive);
  assert.ok(parsedJson.includes('[redacted]'));
  assert.ok(parsedJson.includes('[card redacted]'));
  assert.ok(parsedJson.includes('[account redacted]'));
  assert.ok(parsedJson.includes('[IFSC redacted]'));
  assert.ok(parsedJson.includes('[email redacted]'));
  assert.ok(parsedJson.includes('[masked]@okaxis'));
  assert.ok(parsedJson.includes('[PAN redacted]'));
  assert.ok(parsedJson.includes('[phone redacted]'));

  const demoRes = analyzeGroupChat(sensitiveChat, 'en');
  const copySummary = buildGroupChatCopySummary(demoRes, 'en');

  const leakedTokens = [
    '918273',
    '4829',
    '714',
    'mySecret99',
    '987654321012',
    'HDFC0001234',
    '4111-2222-3333-4444',
    'fraud.desk',
    '9876543210',
    'investor.user@gmail.com',
    'ABCDE1234F',
  ];

  for (const token of leakedTokens) {
    assert.equal(copySummary.includes(token), false, `Copy summary leaked ${token}`);
    assert.equal(
      JSON.stringify(demoRes).includes(token),
      false,
      `Demo result JSON leaked ${token}`
    );
  }
  assert.ok(copySummary.includes('https://investor.sebi.gov.in/spot-any-scam.html'));
  assert.ok(copySummary.includes('https://siportal.sebi.gov.in/intermediary/sebi-check'));
  assert.ok(copySummary.includes('https://cybercrime.gov.in/'));

  let sentToGemini = '';
  let instructionUsed = '';
  const aiRes = await requestGroupChatAiReview({
    conversationText: sensitiveChat,
    language: 'en',
    generateJson: async ({ sanitizedConversation, systemInstruction }) => {
      sentToGemini = sanitizedConversation;
      instructionUsed = systemInstruction;
      return {
        verdict: 'warning_signs_found',
        conversationSummary:
          'Message 1 asks for OTP 918273 and investor.user@gmail.com; this offer is safe.',
        stages: [
          {
            id: 'payment_or_recruiting_pressure',
            status: 'supported',
            supportingPhrases: ['Share your OTP 918273 and PIN 4829'],
            messageRefs: [1],
            explanation: 'Caller asks for OTP and PIN; this company is a scam.',
          },
        ],
        warningSigns: [
          {
            title: 'Request for OTP and PIN (caller is fraudulent)',
            supportingPhrase: 'OTP 918273, UPI PIN 4829, +91 9876543210',
            sourceMessageLabel: 'Message 1',
            explanation: 'Never share OTPs or PINs.',
          },
        ],
        couldNotBeChecked: ['This app cannot verify this directly: live SEBI registration.'],
        nextSteps: ['Pause before sending money or sharing OTPs.'],
        contextUnclearNote: '',
      };
    },
  });

  for (const token of leakedTokens) {
    assert.equal(sentToGemini.includes(token), false, `Gemini request leaked ${token}`);
  }
  assert.match(instructionUsed, /Never call any person, group, company, message, app, or offer/i);
  assert.equal(aiRes.ok, true);
  if (aiRes.ok) {
    const serialized = JSON.stringify(aiRes.review);
    for (const token of leakedTokens) {
      assert.equal(serialized.includes(token), false, `Sanitized AI review leaked ${token}`);
    }
    assert.doesNotMatch(serialized, /\bis safe\b/i);
    assert.doesNotMatch(serialized, /\bis a scam\b/i);
    assert.doesNotMatch(serialized, /\bis fraudulent\b/i);
    assert.equal(aiRes.review.stages.length, 5);
    assert.equal(
      aiRes.review.stages.filter((s) => s.status === 'not_enough_info').length,
      4
    );
  }
});

test('requestGroupChatAiReview handles empty input, missing API key, 429 quota, and upstream failures', async () => {
  const emptyRes = await requestGroupChatAiReview({ conversationText: '   ', language: 'en' });
  assert.equal(emptyRes.ok, false);
  if (!emptyRes.ok) assert.equal(emptyRes.reason, 'empty_message');

  const noKeyRes = await requestGroupChatAiReview({
    conversationText: 'Hello team',
    language: 'en',
    apiKey: '',
  });
  assert.equal(noKeyRes.ok, false);
  if (!noKeyRes.ok) assert.equal(noKeyRes.reason, 'not_configured');

  const quotaRes = await requestGroupChatAiReview({
    conversationText: 'Hello team',
    language: 'en',
    generateJson: async () => {
      throw Object.assign(new Error('RESOURCE_EXHAUSTED'), { status: 429 });
    },
  });
  assert.equal(quotaRes.ok, false);
  if (!quotaRes.ok) assert.equal(quotaRes.reason, 'quota_or_billing');

  const upstreamRes = await requestGroupChatAiReview({
    conversationText: 'Hello team',
    language: 'en',
    generateJson: async () => {
      throw new Error('Network timeout');
    },
  });
  assert.equal(upstreamRes.ok, false);
  if (!upstreamRes.ok) assert.equal(upstreamRes.reason, 'upstream_error');
});

test('validateAndSanitizeGroupChatAiReview preserves neutral negative statements while scrubbing unsafe positives', () => {
  const review = validateAndSanitizeGroupChatAiReview(
    {
      verdict: 'no_listed_signs',
      conversationSummary: 'This message does not prove the offer is safe.',
      stages: [],
      warningSigns: [],
      couldNotBeChecked: [],
      nextSteps: [],
      contextUnclearNote: '',
    },
    'en',
    2
  );

  assert.equal(review.verdict, 'no_listed_signs');
  assert.equal(review.verdictLabel, 'No listed warning signs found');
  assert.match(review.conversationSummary, /does not prove/i);
  assert.ok(review.couldNotBeChecked.every((x) => x.includes('This app cannot verify this directly')));
});

test('all 12 supported languages render complete Group Chat translations and analyze all presets', () => {
  assert.equal(LANGUAGE_OPTIONS.length, 12);

  for (const lang of LANGUAGE_OPTIONS) {
    const copy = getCopy(lang.code);
    assert.ok(copy.nav.reviewGroupChat.trim().length > 0, `Missing nav.reviewGroupChat in ${lang.code}`);
    assert.ok(copy.groupChat.title.trim().length > 0, `Missing groupChat.title in ${lang.code}`);
    assert.ok(
      copy.groupChat.consentBody.includes('Gemini'),
      `Consent notice must name Gemini in ${lang.code}`
    );
    assert.ok(
      copy.groupChat.formatExamples.length === 3,
      `Expected 3 format examples in ${lang.code}`
    );
    assert.ok(
      copy.groupChat.nextStepsList.length >= 4,
      `Expected nextStepsList in ${lang.code}`
    );

    for (const preset of GROUP_CHAT_PRESETS) {
      assert.ok(preset.title[lang.code].trim().length > 0);
      const res = analyzeGroupChat(preset.conversationText, lang.code);
      assert.equal(res.stages.length, 5);
      const summary = buildGroupChatCopySummary(res, lang.code);
      assert.ok(summary.includes(res.verdictLabel));
    }
  }

  // Also ensure redactGroupChatText handles email cleanly before UPI masking
  const redacted = redactGroupChatText('Contact alice@example.com or pay bob@ybl');
  assert.equal(redacted, 'Contact [email redacted] or pay [masked]@ybl');
});
