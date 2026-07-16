import { Behavior, CheckIn, ReminderAttempt, AppProfile, CaptureEntry } from '@/types';
import { requiresPrivacyConsent, type SyncEntity } from '@/services/sync-policy';
import * as fs from '@/services/firestore-sync';

const MAX_PUSH_ATTEMPTS = 4;

/**
 * Fire-and-forget a write-through push, retrying a transient failure a few
 * times with exponential backoff (REP-48) before giving up. Re-running is safe:
 * every push is an idempotent upsert keyed by clientId.
 */
function pushWithRetry(label: string, run: () => Promise<unknown>): void {
  const attempt = (n: number, delayMs: number) => {
    run().catch((e) => {
      if (n >= MAX_PUSH_ATTEMPTS) {
        console.warn(`[cloud-sync] ${label} (gave up after ${n} attempts)`, e);
        return;
      }
      setTimeout(() => attempt(n + 1, delayMs * 2), delayMs);
    });
  };
  attempt(1, 800);
}

/**
 * Best-effort cross-device sync to Firestore (FB-2).
 *
 * Free / signed-out users: every method is a no-op. The local Zustand store
 * stays the single source of truth.
 *
 * Pro / signed-in users: every store mutation also writes through to Firestore
 * via these helpers, and `pullAll` is called on app foreground to merge
 * remote changes back into the local store. Sync is non-blocking — if the
 * network is down, the UI continues working offline and we'll catch up on the
 * next mutation or foreground.
 *
 * PERF DISCIPLINE (Critical-Mistakes §1, §8): pull-on-foreground only. One-shot
 * getDocs on resume — NO always-on onSnapshot listeners (that would be a read
 * billing regression). Each write is an idempotent setDoc(..., { merge: true }).
 *
 * The **private tier** (REP-30) — personal free-text fields and the wholly-
 * private `entries` — only leaves the device once the user has accepted
 * privacy-sync consent. The boundary is enforced here against the canonical
 * `services/sync-policy.ts` registry, so a private field can never be pushed
 * by accident. Firestore security rules (FB-5) enforce it server-side as well.
 */
class CloudSync {
  private enabled = false;
  private consented = false;
  private uid: string | null = null;

  /** Set the Firebase UID; cloud sync is only meaningful once signed in. */
  setUid(value: string | null) {
    this.uid = value;
  }

  setEnabled(value: boolean) {
    this.enabled = value;
  }

  isEnabled(): boolean {
    return this.enabled && this.uid !== null;
  }

  /** Whether the user has accepted privacy-sync consent (gates the private tier). */
  setConsented(value: boolean) {
    this.consented = value;
  }

  isConsented(): boolean {
    return this.consented;
  }

  private allowField(entity: SyncEntity, field: string): boolean {
    return this.consented || !requiresPrivacyConsent(entity, field);
  }

  pushBehavior(b: Behavior): void {
    if (!this.canPush()) return;
    const uid = this.uid!;
    pushWithRetry('pushBehavior', () =>
      fs.upsertDoc(uid, 'behaviors', b.id, {
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
        updatedAt: b.updatedAt,
      }),
    );
  }

  deleteBehavior(id: string): void {
    if (!this.canPush()) return;
    pushWithRetry('deleteBehavior', () => fs.deleteDocByClientId(this.uid!, 'behaviors', id));
  }

  pushCheckIn(c: CheckIn): void {
    if (!this.canPush()) return;
    pushWithRetry('pushCheckIn', () =>
      fs.upsertDoc(this.uid!, 'checkIns', c.id, {
        clientId: c.id,
        behaviorClientId: c.behaviorId,
        at: c.at,
        result: c.result,
        note: this.allowField('checkIns', 'note') ? c.note : undefined,
        updatedAt: c.updatedAt,
      }),
    );
  }

  deleteCheckIn(id: string): void {
    if (!this.canPush()) return;
    pushWithRetry('deleteCheckIn', () => fs.deleteDocByClientId(this.uid!, 'checkIns', id));
  }

  pushReminderAttempt(a: ReminderAttempt): void {
    if (!this.canPush()) return;
    pushWithRetry('pushReminderAttempt', () =>
      fs.upsertDoc(this.uid!, 'reminderAttempts', a.id, {
        clientId: a.id,
        behaviorClientId: a.behaviorId,
        scheduledFor: a.scheduledFor,
        phase: a.phase,
        status: a.status,
        noCount: a.noCount,
        createdAt: a.createdAt,
        updatedAt: a.updatedAt,
        notificationId: a.notificationId,
      }),
    );
  }

  pushAppProfile(p: AppProfile): void {
    if (!this.canPush()) return;
    // NOTE: privacySyncConsent is owned by recordPrivacyConsent/revoke (FB-5);
    // we do not clobber it here. We also don't push private fields unless consented.
    pushWithRetry('pushAppProfile', () =>
      fs.upsertProfile(this.uid!, 'appProfiles', {
        hasOnboarded: p.hasOnboarded,
        userName: p.userName,
        userBio: this.allowField('appProfiles', 'userBio') ? p.userBio : undefined,
        goals: this.allowField('appProfiles', 'goals') ? p.goals : undefined,
        lastLapseAt: p.lastLapseAt,
        lastLapseAcknowledged: p.lastLapseAcknowledged,
        quietHours: p.quietHours,
        notificationsDenied: p.notificationsDenied,
        remindersMutedUntil: p.remindersMutedUntil,
        updatedAt: p.updatedAt ?? Date.now(),
      }),
    );
  }

  pushEntry(e: CaptureEntry): void {
    if (!this.canPush()) return;
    // Entries are a wholly-private entity — never push without consent.
    if (requiresPrivacyConsent('entries') && !this.consented) return;
    pushWithRetry('pushEntry', () =>
      fs.upsertDoc(this.uid!, 'entries', e.id, {
        clientId: e.id,
        behaviorClientId: e.behaviorId,
        at: e.at,
        value: e.value,
        fields: e.fields,
        updatedAt: e.updatedAt,
      }),
    );
  }

  deleteEntry(id: string): void {
    if (!this.canPush()) return;
    pushWithRetry('deleteEntry', () => fs.deleteDocByClientId(this.uid!, 'entries', id));
  }

  async pullAll(): Promise<{
    behaviors: Behavior[];
    checkIns: CheckIn[];
    reminderAttempts: ReminderAttempt[];
    entries: CaptureEntry[];
    appProfile: AppProfile | null;
  } | null> {
    if (!this.enabled || this.uid === null) return null;
    try {
      const [behaviors, checkIns, reminderAttempts, entries, appProfile] = await Promise.all([
        fs.pullBehaviors(this.uid),
        fs.pullCheckIns(this.uid),
        fs.pullReminderAttempts(this.uid),
        fs.pullEntries(this.uid),
        fs.pullAppProfile(this.uid),
      ]);
      return { behaviors, checkIns, reminderAttempts, entries, appProfile };
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
    if (!this.canPush()) return;
    for (const b of state.behaviors) this.pushBehavior(b);
    for (const c of state.checkIns) this.pushCheckIn(c);
    for (const a of state.reminderAttempts) this.pushReminderAttempt(a);
    for (const e of state.entries) this.pushEntry(e);
    this.pushAppProfile(state.appProfile);
  }

  private canPush(): boolean {
    return this.enabled && this.uid !== null;
  }
}

// Imported lazily to keep the module self-contained; re-exported below.

export const cloudSync = new CloudSync();
