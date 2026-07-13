/**
 * Self-test for the reflections search core (REP-5 Phase 4). Run with:
 *   tsx services/__tests__/reflections.test.ts
 *
 * Verifies collection (reflection behaviors only, non-empty text, newest-first),
 * multi-term AND search across text + title, behavior scoping, and counting.
 */
import {
  collectReflections,
  searchReflections,
  countReflections,
} from '../reflections';
import { Behavior, CaptureEntry } from '../../types';

let failures = 0;
function expect(cond: boolean, msg: string) {
  if (!cond) {
    failures++;
    console.error('FAIL:', msg);
  }
}

const mk = (id: string, over: Partial<Behavior> = {}): Behavior => ({
  id,
  kind: 'adopt',
  title: id,
  pingMessage: '',
  activeDays: [0, 1, 2, 3, 4, 5, 6],
  window: { from: '09:00', to: '21:00' },
  intervalMinutes: 30,
  level: 1,
  lastLevelUpStreak: 0,
  createdAt: 0,
  hidden: false,
  bookmarked: false,
  ...over,
});

const entry = (id: string, behaviorId: string, at: number, text?: string): CaptureEntry => ({
  id,
  behaviorId,
  at,
  value: 1,
  ...(text !== undefined ? { fields: { text } } : {}),
});

// One reflection behavior, one counter behavior (whose entries must be ignored).
const journal = mk('journal', {
  title: 'Evening journal',
  captureSpec: { type: 'reflection', label: 'Reflection', direction: 'up' },
});
const pickups = mk('pickups', {
  captureSpec: { type: 'counter', label: 'Pickups', direction: 'down' },
});

const entries: CaptureEntry[] = [
  entry('r1', 'journal', 100, 'Felt calm after the walk'),
  entry('r2', 'journal', 300, 'Anxious about the deadline today'),
  entry('r3', 'journal', 200, '   '), // whitespace only → dropped
  entry('r4', 'journal', 50), // no fields → dropped
  entry('c1', 'pickups', 400, 'this is a counter, not a reflection'), // wrong type → dropped
];

const all = collectReflections([journal, pickups], entries);
expect(all.length === 2, 'collects only non-empty reflections from reflection behaviors');
expect(all[0].id === 'r2' && all[1].id === 'r1', 'sorted newest first');
expect(all[0].behaviorTitle === 'Evening journal', 'title comes from the live behavior');
expect(all[0].text === 'Anxious about the deadline today', 'text is trimmed from fields.text');

// Search: single term, case-insensitive.
const calm = searchReflections([journal, pickups], entries, 'CALM');
expect(calm.length === 1 && calm[0].id === 'r1', 'single-term search is case-insensitive');

// Search: multi-term AND.
expect(
  searchReflections([journal, pickups], entries, 'anxious deadline').length === 1,
  'multi-term search requires all terms'
);
expect(
  searchReflections([journal, pickups], entries, 'anxious walk').length === 0,
  'AND search excludes when one term is missing'
);

// Search matches the behavior title too.
expect(
  searchReflections([journal, pickups], entries, 'evening').length === 2,
  'search also matches the behavior title'
);

// Empty query returns everything.
expect(searchReflections([journal, pickups], entries, '   ').length === 2, 'blank query returns all');

// Behavior scoping.
const j2 = mk('journal2', {
  title: 'Morning pages',
  captureSpec: { type: 'reflection', label: 'Reflection', direction: 'up' },
});
const scopedEntries = [...entries, entry('r5', 'journal2', 500, 'A fresh start')];
expect(
  searchReflections([journal, j2], scopedEntries, '', 'journal2').length === 1,
  'scoping to a behavior returns only its reflections'
);
expect(countReflections([journal, j2], scopedEntries) === 3, 'count totals all reflections');
expect(
  countReflections([journal, j2], scopedEntries, 'journal') === 2,
  'count scopes to a behavior'
);

if (failures > 0) {
  console.error(`\n${failures} test(s) failed.`);
  process.exit(1);
}
console.log('OK — reflections tests passed.');
