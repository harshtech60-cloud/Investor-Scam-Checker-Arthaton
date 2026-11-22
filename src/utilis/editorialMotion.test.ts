import assert from 'node:assert/strict';
import test from 'node:test';
import { TRANSLATIONS } from '../data/translations';
import type { Language } from '../types/check';
import {
  clamp01,
  computeCardPointerTilt,
  computeLensScrollProgress,
  splitHeadlineLines,
} from './editorialMotion';

test('splitHeadlineLines splits multi-sentence headlines cleanly across all 12 languages', () => {
  const langs = Object.keys(TRANSLATIONS) as Language[];
  for (const lang of langs) {
    const title = TRANSLATIONS[lang].hero.title;
    const lines = splitHeadlineLines(title);
    assert.ok(lines.length >= 1 && lines.length <= 3, `Expected 1-3 lines for ${lang}`);
    assert.equal(lines.join(' '), title.trim().replace(/\s+/g, ' '));
  }

  assert.deepEqual(
    splitHeadlineLines('Pause before you pay. Connect every clue in one check.'),
    ['Pause before you pay.', 'Connect every clue in one check.']
  );
  assert.deepEqual(splitHeadlineLines(''), []);
});

test('computeLensScrollProgress stays strictly clamped between 0 and 1', () => {
  assert.equal(clamp01(-0.5), 0);
  assert.equal(clamp01(1.8), 1);
  assert.equal(clamp01(Number.NaN), 0);

  assert.equal(computeLensScrollProgress(0, 80, 420), 0);
  const mid = computeLensScrollProgress(220, 80, 420);
  assert.ok(mid > 0 && mid < 1);
  assert.equal(computeLensScrollProgress(1200, 80, 420), 1);
});

test('computeCardPointerTilt returns bounded gentle angles centered at zero', () => {
  const rect = { left: 100, top: 100, width: 200, height: 100 };
  const center = computeCardPointerTilt(200, 150, rect, 3);
  assert.equal(center.rotateX, 0);
  assert.equal(center.rotateY, 0);

  const corner = computeCardPointerTilt(300, 100, rect, 3);
  assert.equal(corner.rotateX, 3);
  assert.equal(corner.rotateY, 3);

  const clamped = computeCardPointerTilt(999, 999, rect, 3);
  assert.equal(clamped.rotateX, -3);
  assert.equal(clamped.rotateY, 3);
});
