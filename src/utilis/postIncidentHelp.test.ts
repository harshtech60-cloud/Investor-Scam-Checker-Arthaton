import test from 'node:test';
import assert from 'node:assert/strict';
import { LANGUAGE_OPTIONS, TRANSLATIONS, getCopy } from '../data/translations';
import { POST_INCIDENT_CHOICES, getPostIncidentGuidance } from './postIncidentHelp';

const EXPECTED_OFFICIAL_URLS = [
  'https://rbi.org.in/commonman/images/FAME202426022024.pdf',
  'https://cybercrime.gov.in/',
  'https://investor.sebi.gov.in/pdf/Fake%20trading%20app%20scam%20Landscape.pdf',
];

const OVERCLAIM_PHRASES = [
  'has blocked',
  'blocked your account',
  'has contacted your bank',
  'we contacted your bank',
  'device is safe',
  'guaranteed recovery',
  'you will get your money back',
  'within 24 hours',
  'we have reported',
  'case has been filed',
];

test('postIncidentHelp covers all 12 languages and all 4 choices with non-empty localized guidance', () => {
  assert.equal(LANGUAGE_OPTIONS.length, 12);
  assert.equal(Object.keys(TRANSLATIONS).length, 12);
  assert.deepEqual(POST_INCIDENT_CHOICES, [
    'paid',
    'shared_secret',
    'clicked_or_installed',
    'not_acted',
  ]);

  for (const langOpt of LANGUAGE_OPTIONS) {
    const copy = getCopy(langOpt.code);
    assert.ok(copy.postIncidentHelp.triggerBtn.trim().length > 0, `${langOpt.code} missing triggerBtn`);
    assert.ok(copy.postIncidentHelp.modalTitle.trim().length > 0, `${langOpt.code} missing modalTitle`);
    assert.ok(
      copy.postIncidentHelp.urgentRuleNote.trim().length > 0,
      `${langOpt.code} missing urgentRuleNote`
    );
    assert.ok(
      copy.postIncidentHelp.disclaimerNote.trim().length > 0,
      `${langOpt.code} missing disclaimerNote`
    );
    assert.ok(
      copy.postIncidentHelp.backToCheckerBtn.trim().length > 0,
      `${langOpt.code} missing backToCheckerBtn`
    );

    for (const choice of POST_INCIDENT_CHOICES) {
      const guidance = getPostIncidentGuidance(choice, langOpt.code);
      assert.equal(guidance.choice, choice);
      assert.ok(guidance.label.trim().length > 0, `${langOpt.code}:${choice} empty label`);
      assert.ok(guidance.heading.trim().length > 0, `${langOpt.code}:${choice} empty heading`);
      assert.ok(guidance.summary.trim().length > 0, `${langOpt.code}:${choice} empty summary`);
      assert.ok(guidance.steps.length >= 2, `${langOpt.code}:${choice} needs >= 2 steps`);
      for (const step of guidance.steps) {
        assert.ok(step.trim().length > 0, `${langOpt.code}:${choice} has empty step`);
      }

      const urls = guidance.officialLinks.map((l) => l.url);
      for (const expectedUrl of EXPECTED_OFFICIAL_URLS) {
        assert.ok(
          urls.includes(expectedUrl),
          `${langOpt.code}:${choice} missing official URL ${expectedUrl}`
        );
      }
      for (const link of guidance.officialLinks) {
        assert.ok(link.label.trim().length > 0, `${langOpt.code}:${choice} empty link label`);
      }
    }
  }
});

test('English guidance matches required wording, helpline 1930, cybercrime portal, and official sources', () => {
  const paid = getPostIncidentGuidance('paid', 'en');
  assert.equal(
    paid.urgentRuleNote,
    'If money has been taken, contact your bank and report it as soon as possible.'
  );
  assert.ok(paid.reporting);
  assert.ok(paid.reporting.helpline.includes('1930'));
  assert.equal(paid.reporting.portalUrl, 'https://cybercrime.gov.in/');
  assert.ok(paid.steps.some((s) => s.includes('1930') && s.includes('https://cybercrime.gov.in/')));
  assert.ok(
    paid.steps.some(
      (s) => s.toLowerCase().includes('official') && s.toLowerCase().includes('bank')
    )
  );
  assert.ok(
    paid.steps.some(
      (s) => s.toLowerCase().includes('transaction') || s.toLowerCase().includes('messages')
    )
  );
  assert.equal(paid.showBackToChecker, false);

  const secret = getPostIncidentGuidance('shared_secret', 'en');
  assert.ok(secret.reporting);
  assert.ok(secret.reporting.helpline.includes('1930'));
  assert.equal(secret.reporting.portalUrl, 'https://cybercrime.gov.in/');
  assert.ok(secret.steps.some((s) => s.toLowerCase().includes('do not share any more')));
  assert.ok(secret.steps.some((s) => s.includes('1930') && s.includes('https://cybercrime.gov.in/')));
  assert.equal(secret.showBackToChecker, false);

  const clicked = getPostIncidentGuidance('clicked_or_installed', 'en');
  assert.ok(clicked.deviceNotCheckedNote, 'clicked_or_installed must include deviceNotCheckedNote');
  assert.ok(
    clicked.deviceNotCheckedNote.toLowerCase().includes('not') &&
      clicked.deviceNotCheckedNote.toLowerCase().includes('checked'),
    'deviceNotCheckedNote must state the app has not checked the device/account'
  );
  assert.ok(clicked.reporting);
  assert.equal(clicked.showBackToChecker, false);

  const notActed = getPostIncidentGuidance('not_acted', 'en');
  assert.equal(notActed.showBackToChecker, true);
  assert.equal(notActed.reporting, undefined);
});

test('English and Easy English guidance avoid overclaiming actions, guarantees, or recovery timelines', () => {
  for (const lang of ['en', 'en-easy'] as const) {
    for (const choice of POST_INCIDENT_CHOICES) {
      const guidance = getPostIncidentGuidance(choice, lang);
      const haystack = [
        guidance.label,
        guidance.heading,
        guidance.summary,
        guidance.urgentRuleNote,
        guidance.deviceNotCheckedNote ?? '',
        guidance.reporting?.title ?? '',
        guidance.reporting?.body ?? '',
        ...guidance.steps,
      ]
        .join(' ')
        .toLowerCase();

      for (const bad of OVERCLAIM_PHRASES) {
        assert.equal(
          haystack.includes(bad),
          false,
          `${lang}:${choice} should not contain overclaim phrase "${bad}"`
        );
      }
    }
  }
});
