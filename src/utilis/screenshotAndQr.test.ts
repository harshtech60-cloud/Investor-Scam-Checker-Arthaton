import test from 'node:test';
import assert from 'node:assert/strict';
import { parseUpiUri } from './upiQr';
import {
  base64ByteLength,
  sanitizeExtracted,
  ALLOWED_IMAGE_MIME,
  MAX_IMAGE_BYTES,
} from './screenshotHelpers';

test('parseUpiUri correctly extracts payee handle, name, amount and note', () => {
  const result = parseUpiUri('upi://pay?pa=wealth.desk88@okaxis&pn=Rajesh%20Kumar&am=25000&cu=INR');
  assert.ok(result);
  assert.equal(result.pa, 'wealth.desk88@okaxis');
  assert.equal(result.pn, 'Rajesh Kumar');
  assert.equal(result.am, '25000');
  assert.equal(result.tn, undefined);

  const withNote = parseUpiUri('upi://pay?pa=advisory@valid&pn=Advisory%20Ltd&am=10000&tn=Registration%20Fee');
  assert.ok(withNote);
  assert.equal(withNote.pa, 'advisory@valid');
  assert.equal(withNote.pn, 'Advisory Ltd');
  assert.equal(withNote.am, '10000');
  assert.equal(withNote.tn, 'Registration Fee');
});

test('parseUpiUri returns null for non-UPI strings and malformed handles', () => {
  assert.equal(parseUpiUri('https://zerodha.com'), null);
  assert.equal(parseUpiUri('upi://pay?'), null);
  assert.equal(parseUpiUri('upi://pay?pa='), null);
  assert.equal(parseUpiUri('upi://pay?pa=invalid-handle-without-at'), null);
  assert.equal(parseUpiUri('random text'), null);
});

test('sanitizeExtracted drops junk and keeps only well-formed values', () => {
  const raw = {
    messageText: '  Earn 20% guaranteed return  ',
    links: ['https://example.com/login', 'a'.repeat(301)],
    upiIds: ['legit@okaxis', 'not-a-valid-upi', 'another@ybl'],
    sebiNumbers: ['ina000012345', 'invalid-sebi'],
    amountInr: '₹25,000/-',
  };

  const sanitized = sanitizeExtracted(raw);
  assert.equal(sanitized.messageText, 'Earn 20% guaranteed return');
  assert.deepEqual(sanitized.links, ['https://example.com/login']);
  assert.deepEqual(sanitized.upiIds, ['legit@okaxis', 'another@ybl']);
  assert.deepEqual(sanitized.sebiNumbers, ['INA000012345']);
  assert.equal(sanitized.amountInr, '25000');
});

test('screenshot helper constants enforce 4MB limit and supported image mime types', () => {
  assert.equal(MAX_IMAGE_BYTES, 4 * 1024 * 1024);
  assert.ok(ALLOWED_IMAGE_MIME.has('image/jpeg'));
  assert.ok(ALLOWED_IMAGE_MIME.has('image/png'));
  assert.ok(ALLOWED_IMAGE_MIME.has('image/webp'));
  assert.equal(ALLOWED_IMAGE_MIME.has('image/gif'), false);
  assert.equal(ALLOWED_IMAGE_MIME.has('application/pdf'), false);

  assert.equal(base64ByteLength(''), 0);
  // 'AAAA' is 3 bytes
  assert.equal(base64ByteLength('AAAA'), 3);
  // 'AAA=' is 2 bytes
  assert.equal(base64ByteLength('AAA='), 2);
  // 'AA==' is 1 byte
  assert.equal(base64ByteLength('AA=='), 1);
});
