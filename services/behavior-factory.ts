/**
 * Single source of truth for turning a create/edit draft (or a library
 * template) into a `Behavior` (REP-37).
 *
 * Before this, the manual create screen and the template "Add to dashboard"
 * path built behaviors independently — and manual behaviors came out
 * second-class (no practice type, domain, or guide link). Both paths now go
 * through `buildBehavior`, so a hand-made behavior is as rich as a template one.
 */
import { Behavior, BehaviorKind, CaptureSpec, Domain, PracticeType } from '../types';
import { generateUUID } from '../utils/uuid';
import { INITIAL_LEVEL, INITIAL_LAST_LEVELUP_STREAK } from './levels';
import type { AdoptTemplate, EliminateTemplate } from './library-content';

export interface BehaviorDraft {
  kind: BehaviorKind;
  title: string;
  pingMessage?: string;
  practiceType?: PracticeType;
  domain?: Domain;
  libraryGuideId?: string;
  /** Only meaningful for an Eliminate behavior. */
  replacementStateId?: string;
  window: { from: string; to: string };
  activeDays: number[];
  intervalMinutes: number;
  /** Optional typed capture (REP-5 Phase 2). */
  captureSpec?: CaptureSpec;
}

/**
 * Build (or, with `existing`, update) a Behavior from a draft. When `existing`
 * is passed, identity and progress (id, level, streak, createdAt, hidden,
 * bookmarked) are preserved and only the editable fields are overwritten.
 */
export function buildBehavior(draft: BehaviorDraft, existing?: Behavior): Behavior {
  const title = draft.title.trim();
  const base =
    existing ??
    ({
      id: generateUUID(),
      level: INITIAL_LEVEL,
      lastLevelUpStreak: INITIAL_LAST_LEVELUP_STREAK,
      createdAt: Date.now(),
      hidden: false,
      bookmarked: false,
    } as Pick<
      Behavior,
      'id' | 'level' | 'lastLevelUpStreak' | 'createdAt' | 'hidden' | 'bookmarked'
    >);

  return {
    ...base,
    kind: draft.kind,
    title,
    pingMessage: draft.pingMessage?.trim() || title,
    practiceType: draft.practiceType,
    domain: draft.domain,
    libraryGuideId: draft.libraryGuideId,
    replacementStateId: draft.kind === 'eliminate' ? draft.replacementStateId : undefined,
    window: draft.window,
    activeDays: draft.activeDays,
    intervalMinutes: draft.intervalMinutes,
    captureSpec: draft.captureSpec,
  };
}

export function draftFromAdoptTemplate(t: AdoptTemplate): BehaviorDraft {
  return {
    kind: 'adopt',
    title: t.title,
    pingMessage: t.pingMessage,
    practiceType: t.practiceType,
    domain: t.domain,
    libraryGuideId: t.libraryGuideId,
    window: t.window,
    activeDays: [0, 1, 2, 3, 4, 5, 6],
    intervalMinutes: t.intervalMinutes,
  };
}

export function draftFromEliminateTemplate(
  t: EliminateTemplate,
  replacementStateId: string
): BehaviorDraft {
  return {
    kind: 'eliminate',
    title: t.title,
    pingMessage: t.pingMessage,
    domain: t.domain,
    replacementStateId,
    window: { from: '09:00', to: '21:00' },
    activeDays: [0, 1, 2, 3, 4, 5, 6],
    intervalMinutes: 30,
  };
}
