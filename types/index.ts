export type BehaviorKind = 'adopt' | 'eliminate';
export type PracticeType =
  | 'mental'
  | 'physical'
  | 'learning'
  | 'mental_physical'
  | 'mental_learning'
  | 'physical_learning';
export type Domain =
  | 'language_cognitive'
  | 'physical'
  | 'social'
  | 'emotional'
  | 'creative'
  | 'professional';
/**
 * Browsable library taxonomy (REP-11). `foundation` is the forefront gateway —
 * the "how change works" prologue surfaced before everything else. The
 * remaining categories are organized by life domain.
 */
export type LibraryCategory =
  | 'foundation'
  | 'mind_thinking'
  | 'focus_attention'
  | 'emotions_resilience'
  | 'social_communication'
  | 'performance_productivity'
  | 'identity_purpose'
  | 'body_health'
  | 'relationships'
  | 'wealth_money'
  | 'philosophy_worldview';
export type Stage = 'starting' | 'in_progress' | 'habitual';

/** Typed capture attached to a behavior (REP-5 Phase 2–4). */
export type CaptureType = 'counter' | 'metric' | 'template' | 'reflection';

/** Built-in structured-entry templates (REP-5 Phase 3). */
export type CaptureTemplateId = 'cbt' | 'ofnr' | 'three_good_things';

export interface CaptureSpec {
  type: CaptureType;
  /** Short noun for what's tracked, e.g. "Pickups" or "Deep minutes". */
  label: string;
  /** Optional unit shown after metric values, e.g. "min", "reps". */
  unit?: string;
  /** Which direction is improvement. Pickups → 'down'; reps → 'up'. */
  direction: 'up' | 'down';
  /** For `type: 'template'` — which structured form to use. */
  templateId?: CaptureTemplateId;
}

export interface Behavior {
  id: string;
  kind: BehaviorKind;
  title: string;
  pingMessage: string;
  practiceType?: PracticeType;
  domain?: Domain;
  libraryGuideId?: string;
  replacementStateId?: string;
  behaviorsToEliminate?: string[];
  tags?: string[];
  journal?: string;
  activeDays: number[];
  window: {
    from: string;
    to: string;
  };
  intervalMinutes: number;
  level: number;
  lastLevelUpStreak: number;
  pausedUntil?: number;
  /** Paused "until I turn it back on" (REP-34). Takes precedence over `pausedUntil`. */
  pausedIndefinitely?: boolean;
  createdAt: number;
  /** Last local write time (REP-30). Drives last-write-wins cross-device sync. */
  updatedAt: number;
  hidden: boolean;
  bookmarked: boolean;
  /** Optional typed capture (Counter / Metric) logged at check-in (REP-5 Phase 2). */
  captureSpec?: CaptureSpec;
  /** @deprecated v1 rollback only */
  frequency?: { pingsPerHour: number };
  /** @deprecated v1 rollback only — replaced by `level` */
  stability?: number;
  /** @deprecated v1 rollback only */
  difficulty?: number;
  /** @deprecated v1 rollback only */
  lastNoStreak?: number;
}

export interface CheckIn {
  id: string;
  behaviorId: string;
  at: number;
  result: 'yes' | 'tried' | 'no';
  note?: string;
  /** Last local write time (REP-30). Drives last-write-wins cross-device sync. */
  updatedAt: number;
}

/**
 * A single logged capture value (REP-5 Phase 2). Syncs for consenting Pro users
 * as a wholly-private entity (REP-30) — `fields` can hold reflection / CBT text.
 */
export interface CaptureEntry {
  id: string;
  behaviorId: string;
  at: number;
  /** Counter: the count logged. Metric: the value. Template/Reflection: 1 (one completion). */
  value: number;
  /**
   * Structured field values. Templates store their form fields here (REP-5
   * Phase 3); reflections store their free text under `text` (REP-5 Phase 4).
   */
  fields?: Record<string, string>;
  /** Last local write time (REP-30). Drives last-write-wins cross-device sync. */
  updatedAt: number;
}

/**
 * Pull Mode (REP-7): a self-logged "focus session". The app stays silent and
 * the user taps +1 each time they catch the eliminated behavior drifting — a
 * meta-awareness rep, never a demerit. Local-only until REP-30.
 */
export interface FocusSession {
  id: string;
  behaviorId: string;
  startedAt: number;
  /** Undefined while the session is live. */
  endedAt?: number;
  /** "Caught it" taps logged during the session. */
  catches: number;
}

/**
 * The trackable "do" a Coach prescription points the user at (REP-6 Phase 2).
 * Every prescription pairs a "read" (the insight + its guide) with one of these.
 */
export type CoachActionKind = 'add_behavior' | 'open_program' | 'open_adopt' | 'open_guide';

export type PrescriptionStatus =
  | 'active'
  | 'resolved_improved'
  | 'resolved_stalled'
  | 'dismissed';

/**
 * A coaching prescription the user accepted (REP-6 Phase 2). Recorded when they
 * tap an insight's "do" CTA; the following weekly review checks whether the
 * paired behavior improved and closes the loop. Local-only for now — coaching
 * metadata is non-sensitive, so cloud sync is a fast-follow, not a blocker.
 */
export interface CoachPrescription {
  id: string;
  /** The insight kind that produced it — for copy + future analytics. */
  insightKind: string;
  /** The behavior this is meant to help; the loop is tracked only when set. */
  behaviorId?: string;
  action: CoachActionKind;
  /** Guide / program / adopt-template id the action opens. */
  targetId?: string;
  /** The behavior's success days the week it was prescribed — the baseline. */
  baselineSuccessDays: number;
  /** Start of the review window it was prescribed against. */
  windowStart: number;
  prescribedAt: number;
  status: PrescriptionStatus;
  /** Last local write time (REP-30). Drives last-write-wins if sync lands. */
  updatedAt: number;
}

export interface ReminderAttempt {
  id: string;
  behaviorId: string;
  scheduledFor: number;
  phase: 'initial' | 'snooze15' | 'snooze30';
  status: 'scheduled' | 'resolved' | 'skipped' | 'disabled';
  noCount: number;
  createdAt: number;
  updatedAt: number;
  notificationId?: string;
}

export interface AppProfile {
  hasOnboarded: boolean;
  userName?: string;
  userBio?: string;
  /**
   * Free-text goals — what the user wants to change or become (REP-41).
   * Local-only; the Coach / AI program-search (REP-40, REP-6) will read these.
   */
  goals?: string;
  /** Timestamp of the most recent lapse (3-no auto-pause). */
  lastLapseAt?: number;
  /** Whether the user has dismissed the compassionate restart banner for the last lapse. */
  lastLapseAcknowledged?: boolean;
  /** Global do-not-ping window (e.g., overnight). Times in "HH:MM" 24-hour form. */
  quietHours?: { from: string; to: string };
  /** Set if the user declined system notification permissions. */
  notificationsDenied?: boolean;
  /**
   * One-tap global mute (REP-35). `'indefinite'` = muted until manually turned
   * back on; a number = muted until that timestamp. Undefined = not muted.
   */
  remindersMutedUntil?: number | 'indefinite';
  /**
   * Privacy-sync consent (REP-30 Phase 2). Set once the user accepts that their
   * private writing (journals, notes, bios, goals, reflections/CBT) may sync to
   * the server. Its presence gates the private tier — see services/sync-policy.ts.
   */
  privacySyncConsent?: { version: string; acceptedAt: number };
  /** Last local write time (REP-30). Drives last-write-wins cross-device sync. */
  updatedAt?: number;
}
