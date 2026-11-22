import test from 'node:test';
import assert from 'node:assert/strict';
import { GROUP_CHAT_PRESETS, MESSAGE_DEMO_PRESETS, PAYMENT_DEMO_PRESETS } from '../data/presets';
import { validateAndSanitizeGroupChatAiReview } from '../utils/aiReviewHelpers';
import { requestAiMessageReview } from '../utils/aiReviewServer';
import { analyzeUnifiedCheck, buildFamilySummaryText } from '../utils/analyzer';
import { requestGroupChatAiReview } from '../utils/groupChatAiServer';
import { analyzeGroupChat, buildGroupChatCopySummary } from '../utils/groupChatAnalyzer';
import { buildPrintableMessageSummary } from '../utils/printSummary';
import { EVALUATION_DATASET } from './evaluationSet';
import { runEvaluationSuite } from './runEvaluation';

test('evaluation dataset has 40-60 synthetic examples, expected labels/reasons, and stays separate from UI presets', () => {
  assert.ok(EVALUATION_DATASET.length >= 40 && EVALUATION_DATASET.length <= 60);

  const presetTexts = new Set<string>([
    ...MESSAGE_DEMO_PRESETS.map((p) => p.input.messageText.trim()),
    ...PAYMENT_DEMO_PRESETS.map((p) => p.input.handleOrAccount.trim()),
    ...GROUP_CHAT_PRESETS.map((p) => p.conversationText.trim()),
  ]);

  const seenIds = new Set<string>();
  for (const item of EVALUATION_DATASET) {
    assert.ok(!seenIds.has(item.id), `Duplicate ID ${item.id}`);
    seenIds.add(item.id);
    assert.ok(
      item.expectedLabel === 'Warning signs found' ||
        item.expectedLabel === 'No listed warning signs found'
    );
    assert.ok(item.reason.trim().length > 10, `Missing reason for ${item.id}`);
    assert.ok(!presetTexts.has(item.text.trim()), `Dataset item ${item.id} duplicates UI preset`);
    // Ensure no synthetic PII/phone/PAN/email leaks into evaluation set
    assert.equal(/\+\d{1,3}[\s-]?\d{4,}/.test(item.text), false, `Phone pattern in ${item.id}`);
    assert.equal(/@gmail\.com|@yahoo\.com|@outlook\.com/i.test(item.text), false, `Email in ${item.id}`);
    assert.equal(/\b[A-Z]{5}\d{4}[A-Z]\b/.test(item.text), false, `PAN pattern in ${item.id}`);
  }
});

test('evaluation suite executes deterministically and group-chat results preserve short quotes and stage discipline', () => {
  const report = runEvaluationSuite();
  assert.equal(report.overall.total, EVALUATION_DATASET.length);
  assert.equal(
    report.overall.correctWarningsTP +
      report.overall.missedWarningsFN +
      report.overall.falseWarningsFP +
      report.overall.correctNoWarningsTN,
    report.overall.total
  );

  // Single-stage chats must not invent unsupported stages
  const offerChatRes = analyzeGroupChat(
    EVALUATION_DATASET.find((e) => e.id === 'eval-gc-03')!.text,
    'en'
  );
  assert.ok(offerChatRes.stages.filter((s) => s.status === 'supported').length <= 2);
  assert.ok(offerChatRes.stages.filter((s) => s.status === 'not_enough_info').length >= 3);

  const singleStageRes = analyzeGroupChat(
    EVALUATION_DATASET.find((e) => e.id === 'eval-gc-04')!.text,
    'en'
  );
  assert.equal(singleStageRes.stages.filter((s) => s.status === 'supported').length, 1);
  assert.equal(singleStageRes.stages.filter((s) => s.status === 'not_enough_info').length, 4);

  // Short unclear excerpt triggers contextUnclearNote and short quotes
  const unclearRes = analyzeGroupChat(
    EVALUATION_DATASET.find((e) => e.id === 'eval-gc-05')!.text,
    'en'
  );
  assert.ok(unclearRes.contextUnclearNote);
  for (const warn of unclearRes.warningSigns) {
    assert.ok(warn.supportingPhrase.length > 0 && warn.supportingPhrase.length <= 180);
  }
});

test('audit privacy invariants: secrets and personal details are redacted across single-message, group-chat, copy, and print flows', async () => {
  const sensitiveSingle =
    'Please share OTP 918273, PIN 4829, CVV 714, password: mySecret99, email user.demo@example.com, PAN ABCDE1234F, phone +91 98765 43210, account 987654321012, IFSC HDFC0001234, and pay demo.user@okaxis for 25% guaranteed return.';

  const unified = analyzeUnifiedCheck({
    messageText: sensitiveSingle,
    sebiClaim: 'INA000099999',
    websiteLink: 'https://demo-advisory.example.invalid',
    paymentDetail: 'demo.user@okaxis',
    requestedAmountInr: '25000',
  });

  const copiedSingle = buildFamilySummaryText(unified, 'en');
  const printableSingle = JSON.stringify(buildPrintableMessageSummary(unified, 'en'));

  let aiSentSingle = '';
  const aiSingleRes = await requestAiMessageReview({
    messageText: sensitiveSingle,
    language: 'en',
    generateJson: async ({ sanitizedMessage }) => {
      aiSentSingle = sanitizedMessage;
      return {
        verdict: 'warning_signs_found',
        plainLanguageSummary:
          'Asks for OTP 918273, phone +91 98765 43210, email user.demo@example.com, and demo.user@okaxis.',
        warningSigns: [
          {
            title: 'Secret request',
            supportingPhrase: 'share OTP 918273, PIN 4829',
            explanation: 'Never share secrets.',
          },
        ],
        practicalNextSteps: ['Verify on official SEBI portals.'],
        insufficientEvidenceNote: '',
      };
    },
  });

  const sensitiveTokens = [
    '918273',
    '4829',
    '714',
    'mySecret99',
    'user.demo@example.com',
    'ABCDE1234F',
    '98765 43210',
    '987654321012',
    'HDFC0001234',
    'demo.user',
  ];

  for (const token of sensitiveTokens) {
    assert.equal(aiSentSingle.includes(token), false, `Single AI request leaked ${token}`);
    assert.equal(copiedSingle.includes(token), false, `Copied family summary leaked ${token}`);
    assert.equal(printableSingle.includes(token), false, `Printable summary leaked ${token}`);
    if (aiSingleRes.ok) {
      assert.equal(
        JSON.stringify(aiSingleRes.review).includes(token),
        false,
        `Sanitized single AI review leaked ${token}`
      );
    }
  }

  // Group chat AI sanitizer must NOT mark stages supported without supportingPhrases
  const guardedGc = validateAndSanitizeGroupChatAiReview(
    {
      verdict: 'warning_signs_found',
      conversationSummary: 'Summary text.',
      stages: [
        {
          id: 'withdrawal_friction',
          status: 'supported',
          supportingPhrases: [],
          messageRefs: [1],
          explanation: 'Invented stage without quote',
        },
      ],
      warningSigns: [],
      couldNotBeChecked: [],
      nextSteps: [],
      contextUnclearNote: '',
    },
    'en',
    2
  );
  assert.equal(guardedGc.stages.find((s) => s.id === 'withdrawal_friction')?.status, 'not_enough_info');

  // Group chat copy summary & AI request also stay free of secrets
  const gcRes = analyzeGroupChat(`Admin: ${sensitiveSingle}`, 'en');
  const gcCopy = buildGroupChatCopySummary(gcRes, 'en');
  let gcSent = '';
  await requestGroupChatAiReview({
    conversationText: `Admin: ${sensitiveSingle}`,
    language: 'en',
    generateJson: async ({ sanitizedConversation }) => {
      gcSent = sanitizedConversation;
      return {
        verdict: 'warning_signs_found',
        conversationSummary: 'Summary.',
        stages: [],
        warningSigns: [],
        couldNotBeChecked: [],
        nextSteps: [],
        contextUnclearNote: '',
      };
    },
  });
  for (const token of sensitiveTokens) {
    assert.equal(gcCopy.includes(token), false, `Group chat copy leaked ${token}`);
    assert.equal(gcSent.includes(token), false, `Group chat AI request leaked ${token}`);
  }
});
