import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import useStore from '@/store/useStore';
import { cloudSync } from '@/services/cloud-sync';
import { useIsPro } from './useIsPro';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Drives cross-device sync for Pro / signed-in users.
 *
 * Flow:
 *   1. Auth or entitlement changes → flip cloudSync on/off.
 *   2. First time cloudSync turns on this session → push local data to
 *      Convex (no-op if remote already has it; upsert is by clientId),
 *      then pull remote data and replace the local store with the merge.
 *   3. On app foreground while sync is on → pull again and replace.
 *
 * Soft-deletes propagate because `listMine` returns only rows with
 * `deletedAt === undefined`, so devices that pull see deletions as
 * absences. Mutations from the store push through automatically (see
 * the `cloudSync.pushX` calls in store/useStore.ts).
 */
export function useCloudSyncBootstrap() {
  const { isPro, isSignedIn, isLoading } = useIsPro();
  const isHydrated = useStore((s) => s.isHydrated);
  const bootstrapped = useRef(false);

  useEffect(() => {
    if (isLoading || !isHydrated) return;

    const eligible = isSignedIn && isPro;
    cloudSync.setEnabled(eligible);

    if (!eligible) {
      bootstrapped.current = false;
      return;
    }
    if (bootstrapped.current) return;
    bootstrapped.current = true;

    void runSync({ pushLocalFirst: true });
  }, [isPro, isSignedIn, isLoading, isHydrated]);

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

async function runSync({ pushLocalFirst }: { pushLocalFirst: boolean }) {
  if (!cloudSync.isEnabled()) return;

  if (pushLocalFirst) {
    const local = useStore.getState();
    await cloudSync.pushAll({
      behaviors: local.behaviors,
      checkIns: local.checkIns,
      reminderAttempts: local.reminderAttempts,
      appProfile: local.appProfile,
    });
  }

  const remote = await cloudSync.pullAll();
  if (!remote) return;

  useStore.setState({
    behaviors: remote.behaviors,
    checkIns: remote.checkIns,
    reminderAttempts: remote.reminderAttempts,
    appProfile: remote.appProfile ?? useStore.getState().appProfile,
  });

  await Promise.all([
    AsyncStorage.setItem('rpg.behaviors.v3', JSON.stringify(remote.behaviors)),
    AsyncStorage.setItem('rpg.checkins.v1', JSON.stringify(remote.checkIns)),
    AsyncStorage.setItem(
      'rpg.reminderAttempts.v1',
      JSON.stringify(remote.reminderAttempts),
    ),
    remote.appProfile
      ? AsyncStorage.setItem('rpg.app.v1', JSON.stringify(remote.appProfile))
      : Promise.resolve(),
  ]);
}
