/**
 * Lightweight self-test for the program engine (the pivot). Run with:
 *   npx tsx services/__tests__/program-engine.test.ts
 *
 * Verifies day resolution (single days + ranges), standing-exercise activation,
 * completion-based advance (idempotent per calendar day), and end-of-program.
 */
import {
  resolveDay,
  exercisesForDay,
  standingExercisesForDay,
  isComplete,
  isDoneToday,
  completeCurrentDay,
  dayProgressLabel,
} from '../program-engine';
import type { ProgramContent, ProgramEnrollment } from '../../types';

let failures = 0;
function expect(cond: boolean, msg: string) {
  if (!cond) {
    failures++;
    console.error('FAIL:', msg);
  }
}

const content: ProgramContent = {
  primaryInstrument: 'timer',
  durationDays: 5,
  dailyMinutes: 30,
  setting: 'solo',
  days: [
    { day: 1, week: 1, theme: 'A', exercises: [{ prompt: 'p1', minutes: 30, instrument: 'timer' }] },
    { day: 2, week: 1, theme: 'A', exercises: [{ prompt: 'p2', minutes: 30, instrument: 'tally' }] },
    {
      day: [3, 4],
      week: 1,
      theme: 'B',
      exercises: [{ prompt: 'p34', minutes: 45, instrument: 'timer' }],
    },
    { day: 5, week: 1, theme: 'C', exercises: [{ prompt: 'p5', minutes: 20, instrument: 'journal' }] },
  ],
  standingExercises: [
    { activatesOnDay: 3, prompt: 'daily review', instrument: 'srs' },
  ],
};

const baseEnrollment: ProgramEnrollment = {
  id: 'e1',
  programId: 'pkg-x',
  startedAt: 0,
  currentDay: 1,
  reminderTime: '09:00',
  status: 'active',
  completedDays: [],
  practicedDates: [],
  isPrimary: true,
  createdAt: 0,
  updatedAt: 0,
};

// --- resolveDay / exercisesForDay ---
expect(resolveDay(content, 1)?.theme === 'A', 'day 1 resolves to theme A');
expect(resolveDay(content, 3)?.theme === 'B', 'day 3 resolves into the [3,4] range');
expect(resolveDay(content, 4)?.theme === 'B', 'day 4 resolves into the [3,4] range');
expect(resolveDay(content, 6) === undefined, 'day past the end resolves to undefined');
expect(exercisesForDay(content, 2)[0].instrument === 'tally', 'day 2 exercise is a tally');
expect(exercisesForDay(content, 4)[0].prompt === 'p34', 'day 4 shares the range exercise');

// --- standing exercises ---
expect(standingExercisesForDay(content, 2).length === 0, 'no standing exercise before day 3');
expect(standingExercisesForDay(content, 3).length === 1, 'standing exercise active on day 3');
expect(standingExercisesForDay(content, 5)[0].instrument === 'srs', 'standing exercise persists');

// --- isComplete / progress label ---
expect(!isComplete(baseEnrollment, content), 'fresh enrollment is not complete');
expect(dayProgressLabel(baseEnrollment, content) === 'Day 1 of 5', 'progress label day 1');

// --- completeCurrentDay: advance ---
const afterD1 = completeCurrentDay(baseEnrollment, content, '2026-06-25', 1000);
expect(afterD1.currentDay === 2, 'completing day 1 advances to day 2');
expect(afterD1.completedDays.length === 1 && afterD1.completedDays[0] === 1, 'day 1 recorded');
expect(afterD1.practicedDates[0] === '2026-06-25', 'today recorded as practiced');
expect(afterD1.status === 'active', 'still active mid-program');
expect(isDoneToday(afterD1, '2026-06-25'), 'isDoneToday true after completing today');

// --- idempotent for the same calendar day ---
const afterD1Again = completeCurrentDay(afterD1, content, '2026-06-25', 2000);
expect(afterD1Again.currentDay === 2, 'completing again same day does not advance');
expect(afterD1Again.practicedDates.length === 1, 'no duplicate practiced date');

// --- completion at the end ---
let e = baseEnrollment;
const dates = ['d1', 'd2', 'd3', 'd4', 'd5'];
for (let i = 0; i < 5; i++) e = completeCurrentDay(e, content, dates[i], i);
expect(e.currentDay === 6, 'after 5 days currentDay is 6');
expect(e.status === 'completed', 'status flips to completed past the last day');
expect(isComplete(e, content), 'isComplete true past the end');

// --- summary ---
if (failures > 0) {
  console.error(`\n${failures} test(s) failed.`);
  process.exit(1);
}
console.log('OK — program engine tests passed.');
