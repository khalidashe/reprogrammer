import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Behavior,
  CheckIn,
  ReminderAttempt,
  AppProfile,
  BehaviorKind,
  CaptureEntry,
  FocusSession,
  CoachPrescription,
} from '../types';
import { generateUUID } from '../utils/uuid';
import { MAX_FOCUS_SESSION_MS } from '../services/scheduler-core';
import { calculateStreak } from '../services/streak';
import {
  INITIAL_LEVEL,
  INITIAL_LAST_LEVELUP_STREAK,
  LEVEL_MIN,
  LEVEL_MAX,
} from '../services/levels';
import { cloudSync } from '../services/cloud-sync';

const BEHAVIORS_KEY = 'rpg.behaviors.v3';
const BEHAVIORS_V2_KEY = 'rpg.behaviors.v2';
const BEHAVIORS_V1_KEY = 'rpg.behaviors.v1';
const ENTRIES_KEY = 'rpg.entries.v1';
const FOCUS_SESSIONS_KEY = 'rpg.focusSessions.v1';
const PRESCRIPTIONS_KEY = 'rpg.prescriptions.v1';

const LEGACY_STABILITY_TO_LEVEL: Array<[number, number]> = [
  [6, 1],
  [12, 2],
  [24, 3],
  [48, 4],
];

function stabilityToLevel(stability: number): number {
  for (const [threshold, level] of LEGACY_STABILITY_TO_LEVEL) {
    if (stability < threshold) return level;
  }
  return LEVEL_MAX;
}

interface LegacyBehavior {
  id: string;
  kind?: BehaviorKind;
  title: string;
  pingMessage: string;
  activeDays: number[];
  window: { from: string; to: string };
  frequency?: { pingsPerHour: number };
  level?: number;
  pausedUntil?: number;
  lastLevelUpStreak?: number;
  createdAt: number;
  hidden: boolean;
  bookmarked: boolean;
  behaviorsToEliminate?: string[];
  tags?: string[];
  journal?: string;
  intervalMinutes?: number;
  stability?: number;
  difficulty?: number;
  lastNoStreak?: number;
  practiceType?: Behavior['practiceType'];
  domain?: Behavior['domain'];
  libraryGuideId?: string;
  replacementStateId?: string;
}

function migrateBehavior(b: LegacyBehavior): Behavior {
  const intervalMinutes =
    b.intervalMinutes ??
    Math.max(1, Math.min(60, Math.round(60 / (b.frequency?.pingsPerHour ?? 4))));

  let level: number;
  if (typeof b.level === 'number') {
    level = Math.min(LEVEL_MAX, Math.max(LEVEL_MIN, b.level));
  } else if (typeof b.stability === 'number') {
    level = stabilityToLevel(b.stability);
  } else {
    level = INITIAL_LEVEL;
  }

  return {
    id: b.id,
    kind: b.kind ?? 'adopt',
    title: b.title,
    pingMessage: b.pingMessage,
    practiceType: b.practiceType,
    domain: b.domain,
    libraryGuideId: b.libraryGuideId,
    replacementStateId: b.replacementStateId,
    behaviorsToEliminate: b.behaviorsToEliminate,
    tags: b.tags,
    journal: b.journal,
    activeDays: b.activeDays,
    window: b.window,
    intervalMinutes,
    level,
    lastLevelUpStreak: b.lastLevelUpStreak ?? INITIAL_LAST_LEVELUP_STREAK,
    pausedUntil: b.pausedUntil,
    createdAt: b.createdAt,
    updatedAt: b.createdAt,
    hidden: b.hidden,
    bookmarked: b.bookmarked,
  };
}

interface StoreState {
  behaviors: Behavior[];
  checkIns: CheckIn[];
  reminderAttempts: ReminderAttempt[];
  entries: CaptureEntry[];
  focusSessions: FocusSession[];
  prescriptions: CoachPrescription[];
  appProfile: AppProfile;
  isHydrated: boolean;

  hydrate: () => Promise<void>;
  addBehavior: (behavior: Behavior) => Promise<void>;
  updateBehavior: (behavior: Behavior) => Promise<void>;
  deleteBehavior: (id: string) => Promise<void>;
  addCheckIn: (checkIn: CheckIn) => Promise<void>;
  updateCheckIn: (checkIn: CheckIn) => Promise<void>;
  deleteCheckIn: (id: string) => Promise<void>;
  getStreak: (behaviorId: string) => number;
  setOnboarded: (value: boolean) => Promise<void>;
  updateAppProfile: (partial: Partial<AppProfile>) => Promise<void>;
  addReminderAttempt: (attempt: ReminderAttempt) => Promise<void>;
  updateReminderAttempt: (attempt: ReminderAttempt) => Promise<void>;
  getReminderAttempts: (behaviorId: string) => ReminderAttempt[];
  addEntry: (entry: CaptureEntry) => Promise<void>;
  getEntries: (behaviorId: string) => CaptureEntry[];
  startFocusSession: (behaviorId: string) => Promise<FocusSession>;
  addFocusCatch: (sessionId: string) => Promise<void>;
  endFocusSession: (sessionId: string) => Promise<void>;
  getActiveFocusSession: () => FocusSession | undefined;
  getFocusSessions: (behaviorId: string) => FocusSession[];
  addPrescription: (prescription: CoachPrescription) => Promise<void>;
}

const useStore = create<StoreState>((set, get) => ({
  behaviors: [],
  checkIns: [],
  reminderAttempts: [],
  entries: [],
  focusSessions: [],
  prescriptions: [],
  appProfile: { hasOnboarded: false },
  isHydrated: false,

  hydrate: async () => {
    try {
      const [
        v3Data,
        v2Data,
        v1Data,
        checkInsData,
        reminderAttemptsData,
        appProfileData,
        entriesData,
        focusSessionsData,
        prescriptionsData,
      ] = await Promise.all([
        AsyncStorage.getItem(BEHAVIORS_KEY),
        AsyncStorage.getItem(BEHAVIORS_V2_KEY),
        AsyncStorage.getItem(BEHAVIORS_V1_KEY),
        AsyncStorage.getItem('rpg.checkins.v1'),
        AsyncStorage.getItem('rpg.reminderAttempts.v1'),
        AsyncStorage.getItem('rpg.app.v1'),
        AsyncStorage.getItem(ENTRIES_KEY),
        AsyncStorage.getItem(FOCUS_SESSIONS_KEY),
        AsyncStorage.getItem(PRESCRIPTIONS_KEY),
      ]);

      let behaviors: Behavior[];
      if (v3Data) {
        behaviors = JSON.parse(v3Data);
      } else if (v2Data || v1Data) {
        const legacy: LegacyBehavior[] = JSON.parse(v2Data ?? v1Data ?? '[]');
        behaviors = legacy.map(migrateBehavior);
        await AsyncStorage.setItem(BEHAVIORS_KEY, JSON.stringify(behaviors));
      } else {
        behaviors = [];
      }

      // Backfill `updatedAt` (REP-30) for rows persisted before sync existed, so
      // last-write-wins merge treats them as old rather than freshly edited.
      const checkIns: CheckIn[] = (checkInsData ? JSON.parse(checkInsData) : []).map(
        (c: CheckIn) => (typeof c.updatedAt === 'number' ? c : { ...c, updatedAt: c.at })
      );
      const entries: CaptureEntry[] = (entriesData ? JSON.parse(entriesData) : []).map(
        (e: CaptureEntry) => (typeof e.updatedAt === 'number' ? e : { ...e, updatedAt: e.at })
      );

      set({
        behaviors: behaviors.map((b) =>
          typeof b.updatedAt === 'number' ? b : { ...b, updatedAt: b.createdAt }
        ),
        checkIns,
        reminderAttempts: reminderAttemptsData ? JSON.parse(reminderAttemptsData) : [],
        entries,
        focusSessions: focusSessionsData ? JSON.parse(focusSessionsData) : [],
        prescriptions: prescriptionsData ? JSON.parse(prescriptionsData) : [],
        appProfile: appProfileData ? JSON.parse(appProfileData) : { hasOnboarded: false },
        isHydrated: true,
      });
    } catch (error) {
      console.error('Failed to hydrate store:', error);
      set({ isHydrated: true });
    }
  },

  addBehavior: async (behavior: Behavior) => {
    const state = get();
    const stamped = { ...behavior, updatedAt: Date.now() };
    const updated = [...state.behaviors, stamped];
    set({ behaviors: updated });
    await AsyncStorage.setItem(BEHAVIORS_KEY, JSON.stringify(updated));
    cloudSync.pushBehavior(stamped);
  },

  updateBehavior: async (behavior: Behavior) => {
    const state = get();
    const stamped = { ...behavior, updatedAt: Date.now() };
    const updated = state.behaviors.map((b) => (b.id === stamped.id ? stamped : b));
    set({ behaviors: updated });
    await AsyncStorage.setItem(BEHAVIORS_KEY, JSON.stringify(updated));
    cloudSync.pushBehavior(stamped);
  },

  deleteBehavior: async (id: string) => {
    const state = get();
    const removedCheckIns = state.checkIns.filter((c) => c.behaviorId === id);
    const removedEntries = state.entries.filter((e) => e.behaviorId === id);
    const updated = state.behaviors.filter((b) => b.id !== id);
    const checkInsUpdated = state.checkIns.filter((c) => c.behaviorId !== id);
    const attemptsUpdated = state.reminderAttempts.filter((a) => a.behaviorId !== id);
    const entriesUpdated = state.entries.filter((e) => e.behaviorId !== id);
    const focusSessionsUpdated = state.focusSessions.filter((s) => s.behaviorId !== id);
    const prescriptionsUpdated = state.prescriptions.filter((p) => p.behaviorId !== id);
    set({
      behaviors: updated,
      checkIns: checkInsUpdated,
      reminderAttempts: attemptsUpdated,
      entries: entriesUpdated,
      focusSessions: focusSessionsUpdated,
      prescriptions: prescriptionsUpdated,
    });
    await AsyncStorage.setItem(BEHAVIORS_KEY, JSON.stringify(updated));
    await AsyncStorage.setItem('rpg.checkins.v1', JSON.stringify(checkInsUpdated));
    await AsyncStorage.setItem('rpg.reminderAttempts.v1', JSON.stringify(attemptsUpdated));
    await AsyncStorage.setItem(ENTRIES_KEY, JSON.stringify(entriesUpdated));
    await AsyncStorage.setItem(FOCUS_SESSIONS_KEY, JSON.stringify(focusSessionsUpdated));
    await AsyncStorage.setItem(PRESCRIPTIONS_KEY, JSON.stringify(prescriptionsUpdated));
    cloudSync.deleteBehavior(id);
    for (const c of removedCheckIns) cloudSync.deleteCheckIn(c.id);
    for (const e of removedEntries) cloudSync.deleteEntry(e.id);
  },

  addCheckIn: async (checkIn: CheckIn) => {
    const state = get();
    const stamped = { ...checkIn, updatedAt: Date.now() };
    const updated = [...state.checkIns, stamped];
    set({ checkIns: updated });
    await AsyncStorage.setItem('rpg.checkins.v1', JSON.stringify(updated));
    cloudSync.pushCheckIn(stamped);
  },

  updateCheckIn: async (checkIn: CheckIn) => {
    const state = get();
    const stamped = { ...checkIn, updatedAt: Date.now() };
    const updated = state.checkIns.map((c) => (c.id === stamped.id ? stamped : c));
    set({ checkIns: updated });
    await AsyncStorage.setItem('rpg.checkins.v1', JSON.stringify(updated));
    cloudSync.pushCheckIn(stamped);
  },

  deleteCheckIn: async (id: string) => {
    const state = get();
    const updated = state.checkIns.filter((c) => c.id !== id);
    set({ checkIns: updated });
    await AsyncStorage.setItem('rpg.checkins.v1', JSON.stringify(updated));
    cloudSync.deleteCheckIn(id);
  },

  getStreak: (behaviorId: string) => {
    const state = get();
    return calculateStreak(behaviorId, state.checkIns);
  },

  setOnboarded: async (value: boolean) => {
    const state = get();
    const updated = { ...state.appProfile, hasOnboarded: value, updatedAt: Date.now() };
    set({ appProfile: updated });
    await AsyncStorage.setItem('rpg.app.v1', JSON.stringify(updated));
    cloudSync.pushAppProfile(updated);
  },

  updateAppProfile: async (partial: Partial<AppProfile>) => {
    const state = get();
    const updated = { ...state.appProfile, ...partial, updatedAt: Date.now() };
    set({ appProfile: updated });
    await AsyncStorage.setItem('rpg.app.v1', JSON.stringify(updated));
    cloudSync.pushAppProfile(updated);
  },

  addReminderAttempt: async (attempt: ReminderAttempt) => {
    const state = get();
    const updated = [...state.reminderAttempts, attempt];
    set({ reminderAttempts: updated });
    await AsyncStorage.setItem('rpg.reminderAttempts.v1', JSON.stringify(updated));
    cloudSync.pushReminderAttempt(attempt);
  },

  updateReminderAttempt: async (attempt: ReminderAttempt) => {
    const state = get();
    const updated = state.reminderAttempts.map((ra) =>
      ra.id === attempt.id ? attempt : ra
    );
    set({ reminderAttempts: updated });
    await AsyncStorage.setItem('rpg.reminderAttempts.v1', JSON.stringify(updated));
    cloudSync.pushReminderAttempt(attempt);
  },

  getReminderAttempts: (behaviorId: string) => {
    const state = get();
    return state.reminderAttempts.filter((ra) => ra.behaviorId === behaviorId);
  },

  // Capture entries (REP-5). Private tier — pushed only when the user has
  // accepted privacy-sync consent (cloud-sync gates this; see sync-policy.ts).
  addEntry: async (entry: CaptureEntry) => {
    const state = get();
    const stamped = { ...entry, updatedAt: Date.now() };
    const updated = [...state.entries, stamped];
    set({ entries: updated });
    await AsyncStorage.setItem(ENTRIES_KEY, JSON.stringify(updated));
    cloudSync.pushEntry(stamped);
  },

  getEntries: (behaviorId: string) => {
    const state = get();
    return state.entries.filter((e) => e.behaviorId === behaviorId);
  },

  // Pull Mode focus sessions (REP-7). Local-only for now — sync is REP-30.
  startFocusSession: async (behaviorId: string) => {
    const state = get();
    const now = Date.now();
    // Only one session runs at a time; close any that were left open.
    const closed = state.focusSessions.map((s) =>
      s.endedAt == null ? { ...s, endedAt: now } : s
    );
    const session: FocusSession = {
      id: generateUUID(),
      behaviorId,
      startedAt: now,
      catches: 0,
    };
    const updated = [...closed, session];
    set({ focusSessions: updated });
    await AsyncStorage.setItem(FOCUS_SESSIONS_KEY, JSON.stringify(updated));
    return session;
  },

  addFocusCatch: async (sessionId: string) => {
    const state = get();
    const updated = state.focusSessions.map((s) =>
      s.id === sessionId ? { ...s, catches: s.catches + 1 } : s
    );
    set({ focusSessions: updated });
    await AsyncStorage.setItem(FOCUS_SESSIONS_KEY, JSON.stringify(updated));
  },

  endFocusSession: async (sessionId: string) => {
    const state = get();
    const now = Date.now();
    const updated = state.focusSessions.map((s) =>
      s.id === sessionId && s.endedAt == null ? { ...s, endedAt: now } : s
    );
    set({ focusSessions: updated });
    await AsyncStorage.setItem(FOCUS_SESSIONS_KEY, JSON.stringify(updated));
  },

  getActiveFocusSession: () => {
    const now = Date.now();
    return get().focusSessions.find(
      (s) => s.endedAt == null && now - s.startedAt < MAX_FOCUS_SESSION_MS
    );
  },

  getFocusSessions: (behaviorId: string) => {
    return get().focusSessions.filter((s) => s.behaviorId === behaviorId);
  },

  // Coach prescriptions (REP-6 Phase 2). Recorded when the user accepts an
  // insight's "do"; the next weekly review closes the loop (derived from the
  // window, so no status change is needed to display it). Local-only for now —
  // coaching metadata is non-sensitive, so cloud sync is a fast-follow.
  addPrescription: async (prescription: CoachPrescription) => {
    const state = get();
    const updated = [...state.prescriptions, prescription];
    set({ prescriptions: updated });
    await AsyncStorage.setItem(PRESCRIPTIONS_KEY, JSON.stringify(updated));
  },
}));

export default useStore;
