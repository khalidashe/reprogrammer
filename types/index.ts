export interface Behavior {
  id: string;
  title: string;
  behaviorsToEliminate?: string[];
  tags?: string[];
  pingMessage: string;
  journal?: string;
  activeDays: number[];
  window: {
    from: string;
    to: string;
  };
  intervalMinutes: number;
  stability: number;
  difficulty: number;
  lastNoStreak: number;
  pausedUntil?: number;
  createdAt: number;
  hidden: boolean;
  bookmarked: boolean;
  /** @deprecated use intervalMinutes; kept for v1 rollback */
  frequency?: { pingsPerHour: number };
  /** @deprecated derived from stability via bucketLevel(); kept for v1 rollback */
  level?: number;
  /** @deprecated no longer used; kept for v1 rollback */
  lastLevelUpStreak?: number;
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
