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
  hidden: boolean;
  bookmarked: boolean;
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
}
