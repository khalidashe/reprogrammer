/**
 * Tests the shared behavior factory (REP-37).
 * Run: npx tsx services/__tests__/behavior-factory.test.ts
 */
import { buildBehavior, draftFromAdoptTemplate } from '../behavior-factory';
import { INITIAL_LEVEL } from '../levels';
import type { Behavior } from '../../types';
import type { AdoptTemplate } from '../library-content';

let failures = 0;
function expect(cond: boolean, msg: string) {
  if (!cond) {
    failures++;
    console.error('FAIL:', msg);
  }
}

const window = { from: '09:00', to: '21:00' };

// New adopt behavior
const adopt = buildBehavior({
  kind: 'adopt',
  title: '  Stand tall  ',
  window,
  activeDays: [1, 2, 3],
  intervalMinutes: 15,
  practiceType: 'physical',
});
expect(adopt.title === 'Stand tall', 'title is trimmed');
expect(adopt.pingMessage === 'Stand tall', 'empty ping falls back to title');
expect(adopt.level === INITIAL_LEVEL, 'new behavior starts at initial level');
expect(typeof adopt.id === 'string' && adopt.id.length > 0, 'new behavior gets an id');
expect(adopt.practiceType === 'physical', 'practice type carried through');
expect(adopt.replacementStateId === undefined, 'adopt has no replacement');

// Eliminate only keeps replacement
const elim = buildBehavior({
  kind: 'eliminate',
  title: 'Slouching',
  pingMessage: 'CATCH IT',
  window,
  activeDays: [0, 1, 2, 3, 4, 5, 6],
  intervalMinutes: 30,
  replacementStateId: 'abc',
});
expect(elim.replacementStateId === 'abc', 'eliminate keeps replacement id');
expect(elim.pingMessage === 'CATCH IT', 'explicit ping is kept');

// Adopt drops a stray replacement id
const adoptNoRepl = buildBehavior({
  kind: 'adopt',
  title: 'x',
  window,
  activeDays: [1],
  intervalMinutes: 15,
  replacementStateId: 'should-be-dropped',
});
expect(adoptNoRepl.replacementStateId === undefined, 'adopt drops replacement id');

// Editing preserves identity + progress, overwrites editable fields
const existing: Behavior = {
  id: 'keep-me',
  kind: 'adopt',
  title: 'Old',
  pingMessage: 'Old',
  activeDays: [1],
  window,
  intervalMinutes: 15,
  level: 4,
  lastLevelUpStreak: 21,
  createdAt: 123,
  hidden: false,
  bookmarked: true,
};
const edited = buildBehavior(
  { kind: 'adopt', title: 'New', window, activeDays: [2, 3], intervalMinutes: 30 },
  existing
);
expect(edited.id === 'keep-me', 'edit preserves id');
expect(edited.level === 4 && edited.lastLevelUpStreak === 21, 'edit preserves level + streak');
expect(edited.createdAt === 123, 'edit preserves createdAt');
expect(edited.bookmarked === true, 'edit preserves bookmarked');
expect(edited.title === 'New' && edited.intervalMinutes === 30, 'edit overwrites editable fields');

// Template → draft → behavior keeps the rich metadata
const template: AdoptTemplate = {
  id: 'adopt-x',
  title: 'Eye Contact',
  pingMessage: 'Hold their gaze',
  domain: 'social',
  practiceType: 'physical',
  intervalMinutes: 20,
  window,
  libraryGuideId: 'guide-eye-contact',
  body: '',
};
const fromTemplate = buildBehavior(draftFromAdoptTemplate(template));
expect(fromTemplate.domain === 'social', 'template domain carried');
expect(fromTemplate.libraryGuideId === 'guide-eye-contact', 'template guide link carried');
expect(fromTemplate.practiceType === 'physical', 'template practice type carried');

if (failures === 0) {
  console.log('OK — behavior-factory tests passed.');
  process.exit(0);
} else {
  console.error(`FAILED — ${failures} test(s).`);
  process.exit(1);
}
