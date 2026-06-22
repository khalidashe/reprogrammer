/**
 * Lightweight self-test for the feedback mailto builder. Run with:
 *   npx tsx services/__tests__/feedback.test.ts
 *
 * Verifies:
 *  - the URL uses the mailto: scheme and the support address
 *  - subject + body carry the item title, id, kind label, and build info
 *  - special characters are percent-encoded (no raw &, spaces, newlines that
 *    would break the query)
 *  - every FeedbackKind resolves to a human label
 */
import {
  buildFeedbackMailto,
  FEEDBACK_EMAIL,
  type FeedbackContext,
  type FeedbackKind,
} from '../feedback';

let failures = 0;
function expect(cond: boolean, msg: string) {
  if (!cond) {
    failures++;
    console.error('FAIL:', msg);
  }
}

const env = { appVersion: '1.2.3', platform: 'ios' };

// Pull a query param out of the mailto URL and decode it.
function param(url: string, key: 'subject' | 'body'): string {
  const m = url.match(new RegExp(`[?&]${key}=([^&]*)`));
  return m ? decodeURIComponent(m[1]) : '';
}

const guide: FeedbackContext = {
  kind: 'guide',
  id: 'guide-eye-contact',
  title: 'Eye Contact',
};

const url = buildFeedbackMailto(guide, env);

// --- scheme + recipient ---

expect(url.startsWith(`mailto:${FEEDBACK_EMAIL}?`), 'uses mailto + support address');

// --- subject ---

expect(param(url, 'subject').includes('Eye Contact'), 'subject carries the title');

// --- body ---

const body = param(url, 'body');
expect(body.includes('Guide: Eye Contact'), 'body labels the kind + title');
expect(body.includes('Ref: guide-eye-contact'), 'body carries the id');
expect(body.includes('App 1.2.3 · ios'), 'body carries version + platform');
expect(
  body.includes('every note helps') || body.toLowerCase().includes('idea'),
  'body opens with an inviting prompt'
);

// --- encoding safety ---

const tricky: FeedbackContext = {
  kind: 'behavior',
  // title with characters that would otherwise break a URL query string
  id: 'b 1&x=2',
  title: 'Coffee & Calm? yes/no',
};
const trickyUrl = buildFeedbackMailto(tricky, env);

// Raw separators must not leak past the encoded values into the query.
expect(!trickyUrl.includes('Coffee & Calm'), 'raw "&" in title is encoded');
expect(!trickyUrl.includes('b 1&x=2'), 'raw "&"/space in id is encoded');
// …but decoding recovers them exactly.
expect(param(trickyUrl, 'subject').includes('Coffee & Calm? yes/no'), 'title round-trips');
expect(param(trickyUrl, 'body').includes('Ref: b 1&x=2'), 'id round-trips');

// --- every kind has a label ---

const kinds: FeedbackKind[] = ['behavior', 'guide', 'program', 'adopt', 'eliminate'];
for (const kind of kinds) {
  const b = param(buildFeedbackMailto({ kind, id: 'x', title: 'T' }, env), 'body');
  // The footer line is "<Label>: T"; a missing label would render "undefined: T".
  expect(!b.includes('undefined'), `kind ${kind} resolves a label`);
}

// --- summary ---
if (failures > 0) {
  console.error(`\n${failures} test(s) failed.`);
  process.exit(1);
}
console.log('All feedback mailto tests passed.');
