import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Behavior, CheckIn, ReminderAttempt, AppProfile } from '../types';
import { calculateStreak } from '../services/streak';
import { INITIAL_DIFFICULTY, INITIAL_STABILITY } from '../services/fsrs';

const BEHAVIORS_KEY = 'rpg.behaviors.v2';
const BEHAVIORS_LEGACY_KEY = 'rpg.behaviors.v1';

const LEGACY_LEVEL_TO_STABILITY: Record<number, number> = {
  1: 4,
  2: 8,
  3: 16,
  4: 32,
  5: 64,
};

interface LegacyBehavior {
  id: string;
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
}

function migrateBehavior(b: LegacyBehavior): Behavior {
  const intervalMinutes =
    b.intervalMinutes ??
    Math.max(1, Math.min(60, Math.round(60 / (b.frequency?.pingsPerHour ?? 4))));
  const stability =
    b.stability ?? LEGACY_LEVEL_TO_STABILITY[b.level ?? 1] ?? INITIAL_STABILITY;
  const difficulty = b.difficulty ?? INITIAL_DIFFICULTY;
  const lastNoStreak = b.lastNoStreak ?? 0;

  return {
    id: b.id,
    title: b.title,
    pingMessage: b.pingMessage,
    activeDays: b.activeDays,
    window: b.window,
    intervalMinutes,
    stability,
    difficulty,
    lastNoStreak,
    pausedUntil: b.pausedUntil,
    createdAt: b.createdAt,
    hidden: b.hidden,
    bookmarked: b.bookmarked,
    behaviorsToEliminate: b.behaviorsToEliminate,
    tags: b.tags,
    journal: b.journal,
  };
}

interface StoreState {
  behaviors: Behavior[];
  checkIns: CheckIn[];
  reminderAttempts: ReminderAttempt[];
  appProfile: AppProfile;
  isHydrated: boolean;

  hydrate: () => Promise<void>;
  addBehavior: (behavior: Behavior) => Promise<void>;
  updateBehavior: (behavior: Behavior) => Promise<void>;
  deleteBehavior: (id: string) => Promise<void>;
  addCheckIn: (checkIn: CheckIn) => Promise<void>;
  getStreak: (behaviorId: string) => number;
  setOnboarded: (value: boolean) => Promise<void>;
  addReminderAttempt: (attempt: ReminderAttempt) => Promise<void>;
  updateReminderAttempt: (attempt: ReminderAttempt) => Promise<void>;
  getReminderAttempts: (behaviorId: string) => ReminderAttempt[];
}

const useStore = create<StoreState>((set, get) => ({
  behaviors: [],
  checkIns: [],
  reminderAttempts: [],
  appProfile: { hasOnboarded: false },
  isHydrated: false,

  hydrate: async () => {
    try {
      const [v2Data, v1Data, checkInsData, reminderAttemptsData, appProfileData] =
        await Promise.all([
          AsyncStorage.getItem(BEHAVIORS_KEY),
          AsyncStorage.getItem(BEHAVIORS_LEGACY_KEY),
          AsyncStorage.getItem('rpg.checkins.v1'),
          AsyncStorage.getItem('rpg.reminderAttempts.v1'),
          AsyncStorage.getItem('rpg.app.v1'),
        ]);

      let behaviors: Behavior[];
      if (v2Data) {
        behaviors = JSON.parse(v2Data);
      } else if (v1Data) {
        const legacy: LegacyBehavior[] = JSON.parse(v1Data);
        behaviors = legacy.map(migrateBehavior);
        await AsyncStorage.setItem(BEHAVIORS_KEY, JSON.stringify(behaviors));
      } else {
        behaviors = [];
      }

      set({
        behaviors,
        checkIns: checkInsData ? JSON.parse(checkInsData) : [],
        reminderAttempts: reminderAttemptsData ? JSON.parse(reminderAttemptsData) : [],
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
    const updated = [...state.behaviors, behavior];
    set({ behaviors: updated });
    await AsyncStorage.setItem(BEHAVIORS_KEY, JSON.stringify(updated));
  },

  updateBehavior: async (behavior: Behavior) => {
    const state = get();
    const updated = state.behaviors.map(b => (b.id === behavior.id ? behavior : b));
    set({ behaviors: updated });
    await AsyncStorage.setItem(BEHAVIORS_KEY, JSON.stringify(updated));
  },

  deleteBehavior: async (id: string) => {
    const state = get();
    const updated = state.behaviors.filter(b => b.id !== id);
    const checkInsUpdated = state.checkIns.filter(c => c.behaviorId !== id);
    set({ behaviors: updated, checkIns: checkInsUpdated });
    await AsyncStorage.setItem(BEHAVIORS_KEY, JSON.stringify(updated));
    await AsyncStorage.setItem('rpg.checkins.v1', JSON.stringify(checkInsUpdated));
  },

  addCheckIn: async (checkIn: CheckIn) => {
    const state = get();
    const updated = [...state.checkIns, checkIn];
    set({ checkIns: updated });
    await AsyncStorage.setItem('rpg.checkins.v1', JSON.stringify(updated));
  },

  getStreak: (behaviorId: string) => {
    const state = get();
    return calculateStreak(behaviorId, state.checkIns);
  },

  setOnboarded: async (value: boolean) => {
    const state = get();
    const updated = { ...state.appProfile, hasOnboarded: value };
    set({ appProfile: updated });
    await AsyncStorage.setItem('rpg.app.v1', JSON.stringify(updated));
  },

  addReminderAttempt: async (attempt: ReminderAttempt) => {
    const state = get();
    const updated = [...state.reminderAttempts, attempt];
    set({ reminderAttempts: updated });
    await AsyncStorage.setItem('rpg.reminderAttempts.v1', JSON.stringify(updated));
  },

  updateReminderAttempt: async (attempt: ReminderAttempt) => {
    const state = get();
    const updated = state.reminderAttempts.map(ra =>
      ra.id === attempt.id ? attempt : ra
    );
    set({ reminderAttempts: updated });
    await AsyncStorage.setItem('rpg.reminderAttempts.v1', JSON.stringify(updated));
  },

  getReminderAttempts: (behaviorId: string) => {
    const state = get();
    return state.reminderAttempts.filter(ra => ra.behaviorId === behaviorId);
  },
}));

export default useStore;
