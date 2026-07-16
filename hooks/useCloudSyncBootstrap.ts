import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import useStore from '@/store/useStore';
import { cloudSync } from '@/services/cloud-sync';
import { mergeById } from '@/services/sync-merge';
import { preserveLocalPrivateFields } from '@/services/sync-policy';
import type { AppProfile, Behavior, CheckIn } from '@/types';
import { useIsPro } from './useIsPro';
import { useFirebaseAuth } from '@/services/firebase-auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Drives cross-device sync for Pro / signed-in users.
 *
 * Flow:
 *   1. Auth or entitlement changes → flip cloudSync on/off. Privacy-sync consent
 *      (gates the private tier) is mirrored to cloudSync whenever it changes.
 *   2. First time cloudSync turns on this session → push local data to Convex
 *      (no-op if remote already has it; upsert is by clientId), then pull and
 *      **merge** remote into the local store.
 *   3. On app foreground while sync is on → pull again and merge.
 *
 * The merge is last-write-wins by `updatedAt` (services/sync-merge.ts): a pull
 * no longer blindly replaces the store, so an older remote row can't clobber a
 * newer local edit made offline. Soft-deletes propagate because `listMine`
 * returns only live rows, so a deletion shows up as an absence. Mutations from
 * the store push through automatically (the `cloudSync.pushX` calls in
 * store/useStore.ts).
 */
export function useCloudSyncBootstrap() {
  const { isPro, isSignedIn, isLoading } = useIsPro();
  const { userId } = useFirebaseAuth();
  const isHydrated = useStore((s) => s.isHydrated);
  const privacyConsent = useStore((s) => s.appProfile.privacySyncConsent);
  const bootstrapped = useRef(false);

  useEffect(() => {
    if (isLoading || !isHydrated) return;

    cloudSync.setUid(userId);
    cloudSync.setConsented(privacyConsent !== undefined);

    const eligible = isSignedIn && isPro;
    cloudSync.setEnabled(eligible);

    if (!eligible) {
      bootstrapped.current = false;
      return;
    }
    if (bootstrapped.current) return;
    bootstrapped.current = true;

    void runSync({ pushLocalFirst: true });
  }, [isPro, isSignedIn, isLoading, isHydrated, privacyConsent, userId]);

  useEffect(() => {
    const onChange = (state: AppStateStatus) => {
      if (state === 'active' && cloudSync.isEnabled()) {
        void runSync({ pushLocalFirst: false });
      }
    };
    const sub = AppState.addEventListener('change', onChange);
    return () => sub.remove();
  }, []);
}

/** Singleton appProfile — newest `updatedAt` wins. */
function pickProfile(local: AppProfile, remote: AppProfile | null): AppProfile {
  if (!remote) return local;
  return (remote.updatedAt ?? 0) >= (local.updatedAt ?? 0) ? remote : local;
}

async function runSync({ pushLocalFirst }: { pushLocalFirst: boolean }) {
  if (!cloudSync.isEnabled()) return;

  const local = useStore.getState();

  if (pushLocalFirst) {
    await cloudSync.pushAll({
      behaviors: local.behaviors,
      checkIns: local.checkIns,
      reminderAttempts: local.reminderAttempts,
      entries: local.entries,
      appProfile: local.appProfile,
    });
  }

  const remote = await cloudSync.pullAll();
  if (!remote) return;

  let behaviors = mergeById(local.behaviors, remote.behaviors).merged;
  let checkIns = mergeById(local.checkIns, remote.checkIns).merged;
  const reminderAttempts = mergeById(
    local.reminderAttempts,
    remote.reminderAttempts,
  ).merged;
  const entries = mergeById(local.entries, remote.entries).merged;
  let appProfile = pickProfile(local.appProfile, remote.appProfile);

  // Without consent the private tier is local-only: keep the device's private
  // writing rather than letting a server-side purge (e.g. after a revoke) wipe
  // it. Mirrors the push-side gate in cloud-sync.ts.
  if (!cloudSync.isConsented()) {
    const localBehaviorsById = new Map(local.behaviors.map((b) => [b.id, b]));
    behaviors = behaviors.map((b) =>
      preserveLocalPrivateFields<Behavior>('behaviors', b, localBehaviorsById.get(b.id)),
    );
    const localCheckInsById = new Map(local.checkIns.map((c) => [c.id, c]));
    checkIns = checkIns.map((c) =>
      preserveLocalPrivateFields<CheckIn>('checkIns', c, localCheckInsById.get(c.id)),
    );
    appProfile = preserveLocalPrivateFields<AppProfile>(
      'appProfiles',
      appProfile,
      local.appProfile,
    );
  }

  useStore.setState({ behaviors, checkIns, reminderAttempts, entries, appProfile });

  await Promise.all([
    AsyncStorage.setItem('rpg.behaviors.v3', JSON.stringify(behaviors)),
    AsyncStorage.setItem('rpg.checkins.v1', JSON.stringify(checkIns)),
    AsyncStorage.setItem(
      'rpg.reminderAttempts.v1',
      JSON.stringify(reminderAttempts),
    ),
    AsyncStorage.setItem('rpg.entries.v1', JSON.stringify(entries)),
    AsyncStorage.setItem('rpg.app.v1', JSON.stringify(appProfile)),
  ]);
}
