import { Behavior, CheckIn, ReminderAttempt, AppProfile, CaptureEntry } from '@/types';
import { api } from '@/convex/_generated/api';
import type { Doc } from '@/convex/_generated/dataModel';
import { convex } from '@/services/convex-client';
import { requiresPrivacyConsent, type SyncEntity } from '@/services/sync-policy';

/**
 * Best-effort cross-device sync to Convex.
 *
 * Free / signed-out users: every method is a no-op. The local Zustand store
 * stays the single source of truth.
 *
 * Pro / signed-in users: every store mutation also writes through to Convex
 * via these helpers, and `pullAll` is called on app foreground to merge
 * remote changes back into the local store. Sync is non-blocking — if the
 * network is down, the UI continues working offline and we'll catch up on
 * the next mutation or foreground.
 *
 * The **private tier** (REP-30) — personal free-text fields and the wholly-
 * private `entries` — only leaves the device once the user has accepted
 * privacy-sync consent. The boundary is enforced here against the canonical
 * `services/sync-policy.ts` registry, so a private field can never be pushed
 * by accident.
 */
class CloudSync {
  private enabled = false;
  private consented = false;

  setEnabled(value: boolean) {
    this.enabled = value;
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  /** Whether the user has accepted privacy-sync consent (gates the private tier). */
  setConsented(value: boolean) {
    this.consented = value;
  }

  isConsented(): boolean {
    return this.consented;
  }

  /** A private field is only allowed up once consent is granted. */
  private allowField(entity: SyncEntity, field: string): boolean {
    return this.consented || !requiresPrivacyConsent(entity, field);
  }

  pushBehavior(b: Behavior): void {
    if (!this.enabled) return;
    convex
      .mutation(api.behaviors.upsert, {
        clientId: b.id,
        kind: b.kind,
        title: b.title,
        pingMessage: b.pingMessage,
        practiceType: b.practiceType,
        domain: b.domain,
        libraryGuideId: b.libraryGuideId,
        replacementStateId: b.replacementStateId,
        behaviorsToEliminate: b.behaviorsToEliminate,
        tags: b.tags,
        journal: this.allowField('behaviors', 'journal') ? b.journal : undefined,
        activeDays: b.activeDays,
        window: b.window,
        intervalMinutes: b.intervalMinutes,
        level: b.level,
        lastLevelUpStreak: b.lastLevelUpStreak,
        pausedUntil: b.pausedUntil,
        pausedIndefinitely: b.pausedIndefinitely,
        createdAt: b.createdAt,
        hidden: b.hidden,
        bookmarked: b.bookmarked,
      })
      .catch((e) => console.warn('[cloud-sync] pushBehavior', e));
  }

  deleteBehavior(id: string): void {
    if (!this.enabled) return;
    convex
      .mutation(api.behaviors.softDelete, { clientId: id })
      .catch((e) => console.warn('[cloud-sync] deleteBehavior', e));
  }

  pushCheckIn(c: CheckIn): void {
    if (!this.enabled) return;
    convex
      .mutation(api.checkIns.upsert, {
        clientId: c.id,
        behaviorClientId: c.behaviorId,
        at: c.at,
        result: c.result,
        note: this.allowField('checkIns', 'note') ? c.note : undefined,
      })
      .catch((e) => console.warn('[cloud-sync] pushCheckIn', e));
  }

  deleteCheckIn(id: string): void {
    if (!this.enabled) return;
    convex
      .mutation(api.checkIns.softDelete, { clientId: id })
      .catch((e) => console.warn('[cloud-sync] deleteCheckIn', e));
  }

  pushReminderAttempt(a: ReminderAttempt): void {
    if (!this.enabled) return;
    convex
      .mutation(api.reminderAttempts.upsert, {
        clientId: a.id,
        behaviorClientId: a.behaviorId,
        scheduledFor: a.scheduledFor,
        phase: a.phase,
        status: a.status,
        noCount: a.noCount,
        createdAt: a.createdAt,
        notificationId: a.notificationId,
      })
      .catch((e) => console.warn('[cloud-sync] pushReminderAttempt', e));
  }

  pushAppProfile(p: AppProfile): void {
    if (!this.enabled) return;
    convex
      .mutation(api.appProfiles.upsert, {
        hasOnboarded: p.hasOnboarded,
        userName: p.userName,
        userBio: this.allowField('appProfiles', 'userBio') ? p.userBio : undefined,
        goals: this.allowField('appProfiles', 'goals') ? p.goals : undefined,
        lastLapseAt: p.lastLapseAt,
        lastLapseAcknowledged: p.lastLapseAcknowledged,
        quietHours: p.quietHours,
        notificationsDenied: p.notificationsDenied,
        remindersMutedUntil: p.remindersMutedUntil,
      })
      .catch((e) => console.warn('[cloud-sync] pushAppProfile', e));
  }

  pushEntry(e: CaptureEntry): void {
    if (!this.enabled) return;
    // Entries are a wholly-private entity — never push without consent.
    if (requiresPrivacyConsent('entries') && !this.consented) return;
    convex
      .mutation(api.entries.upsert, {
        clientId: e.id,
        behaviorClientId: e.behaviorId,
        at: e.at,
        value: e.value,
        fields: e.fields,
      })
      .catch((err) => console.warn('[cloud-sync] pushEntry', err));
  }

  deleteEntry(id: string): void {
    if (!this.enabled) return;
    convex
      .mutation(api.entries.softDelete, { clientId: id })
      .catch((e) => console.warn('[cloud-sync] deleteEntry', e));
  }

  async pullAll(): Promise<{
    behaviors: Behavior[];
    checkIns: CheckIn[];
    reminderAttempts: ReminderAttempt[];
    entries: CaptureEntry[];
    appProfile: AppProfile | null;
  } | null> {
    if (!this.enabled) return null;
    try {
      const [behaviors, checkIns, reminderAttempts, entries, appProfile] =
        await Promise.all([
          convex.query(api.behaviors.listMine, {}),
          convex.query(api.checkIns.listMine, {}),
          convex.query(api.reminderAttempts.listMine, {}),
          convex.query(api.entries.listMine, {}),
          convex.query(api.appProfiles.getMine, {}),
        ]);
      return {
        behaviors: behaviors.map(toBehavior),
        checkIns: checkIns.map(toCheckIn),
        reminderAttempts: reminderAttempts.map(toReminderAttempt),
        entries: entries.map(toEntry),
        appProfile: appProfile ? toAppProfile(appProfile) : null,
      };
    } catch (e) {
      console.warn('[cloud-sync] pullAll', e);
      return null;
    }
  }

  async pushAll(state: {
    behaviors: Behavior[];
    checkIns: CheckIn[];
    reminderAttempts: ReminderAttempt[];
    entries: CaptureEntry[];
    appProfile: AppProfile;
  }): Promise<void> {
    if (!this.enabled) return;
    for (const b of state.behaviors) this.pushBehavior(b);
    for (const c of state.checkIns) this.pushCheckIn(c);
    for (const a of state.reminderAttempts) this.pushReminderAttempt(a);
    for (const e of state.entries) this.pushEntry(e);
    this.pushAppProfile(state.appProfile);
  }
}

function toBehavior(d: Doc<'behaviors'>): Behavior {
  return {
    id: d.clientId,
    kind: d.kind,
    title: d.title,
    pingMessage: d.pingMessage,
    practiceType: d.practiceType,
    domain: d.domain,
    libraryGuideId: d.libraryGuideId,
    replacementStateId: d.replacementStateId,
    behaviorsToEliminate: d.behaviorsToEliminate,
    tags: d.tags,
    journal: d.journal,
    activeDays: d.activeDays,
    window: d.window,
    intervalMinutes: d.intervalMinutes,
    level: d.level,
    lastLevelUpStreak: d.lastLevelUpStreak,
    pausedUntil: d.pausedUntil,
    pausedIndefinitely: d.pausedIndefinitely,
    createdAt: d.createdAt,
    updatedAt: d.updatedAt,
    hidden: d.hidden,
    bookmarked: d.bookmarked,
  };
}

function toCheckIn(d: Doc<'checkIns'>): CheckIn {
  return {
    id: d.clientId,
    behaviorId: d.behaviorClientId,
    at: d.at,
    result: d.result,
    note: d.note,
    updatedAt: d.updatedAt,
  };
}

function toReminderAttempt(d: Doc<'reminderAttempts'>): ReminderAttempt {
  return {
    id: d.clientId,
    behaviorId: d.behaviorClientId,
    scheduledFor: d.scheduledFor,
    phase: d.phase,
    status: d.status,
    noCount: d.noCount,
    createdAt: d.createdAt,
    updatedAt: d.updatedAt,
    notificationId: d.notificationId,
  };
}

function toEntry(d: Doc<'entries'>): CaptureEntry {
  return {
    id: d.clientId,
    behaviorId: d.behaviorClientId,
    at: d.at,
    value: d.value,
    fields: d.fields,
    updatedAt: d.updatedAt,
  };
}

function toAppProfile(d: Doc<'appProfiles'>): AppProfile {
  return {
    hasOnboarded: d.hasOnboarded,
    userName: d.userName,
    userBio: d.userBio,
    goals: d.goals,
    lastLapseAt: d.lastLapseAt,
    lastLapseAcknowledged: d.lastLapseAcknowledged,
    quietHours: d.quietHours,
    notificationsDenied: d.notificationsDenied,
    remindersMutedUntil: d.remindersMutedUntil,
    privacySyncConsent: d.privacySyncConsent,
    updatedAt: d.updatedAt,
  };
}

export const cloudSync = new CloudSync();
