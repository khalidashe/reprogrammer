/**
 * Program engine (the pivot). Pure helpers that resolve what a user should do
 * today in a book program and advance an enrollment when they do it.
 *
 * Progression is **completion-based**: `currentDay` only moves when the day is
 * actually completed, so a missed calendar day never skips content. Adherence
 * (the forgiving streak) is the count of `practicedDates`.
 */
import type {
  Exercise,
  ProgramContent,
  ProgramDay,
  ProgramEnrollment,
  StandingExercise,
} from '../types';
import { LIBRARY_PROGRAMS, type LibraryProgram } from './library-content';

/** A catalog program that carries the structured, runnable layer. */
export type EnrollableProgram = LibraryProgram & { program: ProgramContent };

/** Programs that are enrollable today (have a structured `program`). */
export function enrollablePrograms(): EnrollableProgram[] {
  return LIBRARY_PROGRAMS.filter((p): p is EnrollableProgram => p.program != null);
}

export function enrollableProgramById(id: string): EnrollableProgram | undefined {
  const p = LIBRARY_PROGRAMS.find((x) => x.id === id);
  return p && p.program ? (p as EnrollableProgram) : undefined;
}

/** Does this ProgramDay cover day number `n`? Handles single days and ranges. */
function dayCovers(day: ProgramDay['day'], n: number): boolean {
  return Array.isArray(day) ? n >= day[0] && n <= day[1] : day === n;
}

/** The ProgramDay scheduled for day `n` (or undefined past the end). */
export function resolveDay(content: ProgramContent, n: number): ProgramDay | undefined {
  return content.days.find((d) => dayCovers(d.day, n));
}

/** The day's one-off exercises. */
export function exercisesForDay(content: ProgramContent, n: number): Exercise[] {
  return resolveDay(content, n)?.exercises ?? [];
}

/** Standing exercises active on day `n` (activatesOnDay <= n). */
export function standingExercisesForDay(
  content: ProgramContent,
  n: number,
): StandingExercise[] {
  return (content.standingExercises ?? []).filter((s) => s.activatesOnDay <= n);
}

/** Has the program run past its last day? */
export function isComplete(enrollment: ProgramEnrollment, content: ProgramContent): boolean {
  return enrollment.currentDay > content.durationDays;
}

/** Whether today's day has already been logged (one logical day per calendar day). */
export function isDoneToday(enrollment: ProgramEnrollment, todayKey: string): boolean {
  return enrollment.practicedDates.includes(todayKey);
}

/**
 * Mark the current day complete: record it, stamp today as practiced, and
 * advance to the next day. Completion-based and idempotent for the same calendar
 * day. Returns a new enrollment (the caller persists it).
 */
export function completeCurrentDay(
  enrollment: ProgramEnrollment,
  content: ProgramContent,
  todayKey: string,
  now: number = Date.now(),
): ProgramEnrollment {
  if (isDoneToday(enrollment, todayKey)) return enrollment;
  const day = enrollment.currentDay;
  const completedDays = enrollment.completedDays.includes(day)
    ? enrollment.completedDays
    : [...enrollment.completedDays, day];
  const nextDay = day + 1;
  const finished = nextDay > content.durationDays;
  return {
    ...enrollment,
    completedDays,
    practicedDates: [...enrollment.practicedDates, todayKey],
    currentDay: nextDay,
    status: finished ? 'completed' : enrollment.status,
    updatedAt: now,
  };
}

/** "Day 7 of 21" label, clamped to the program length. */
export function dayProgressLabel(
  enrollment: ProgramEnrollment,
  content: ProgramContent,
): string {
  const d = Math.min(enrollment.currentDay, content.durationDays);
  return `Day ${d} of ${content.durationDays}`;
}
