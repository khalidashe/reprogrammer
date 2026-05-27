export type BehaviorKind = 'adopt' | 'eliminate';
export type PracticeType = 'mental' | 'physical' | 'learning' | 'dual';
export type Domain =
  | 'language_cognitive'
  | 'physical'
  | 'social'
  | 'emotional'
  | 'creative'
  | 'professional';
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
  result: 'yes' | 'no';
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
}
