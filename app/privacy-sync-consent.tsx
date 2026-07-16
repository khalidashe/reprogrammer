import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, Type, Space, Radius, PRESSED_OPACITY } from '@/constants/theme';
import { useIsPro } from '@/hooks/useIsPro';
import useStore from '@/store/useStore';
import { cloudSync } from '@/services/cloud-sync';
import { PRIVACY_SYNC_CONSENT_VERSION } from '@/services/sync-policy';
import { haptics } from '@/services/haptics';
import { getFirebaseAuth } from '@/services/firebase';
import { recordPrivacyConsent, revokePrivacyConsent } from '@/services/firestore-sync';

/**
 * Privacy-sync consent (REP-30 Phase 2). The explicit gate for the private tier
 * — journals, check-in notes, your bio, goals, and reflection / CBT entries.
 *
 * On accept we record consent (version + timestamp) on the server and locally,
 * then push the private data that was waiting on the device. On revoke the
 * server purges remote private data; the local copy stays (the read-side guard
 * in useCloudSyncBootstrap keeps it from being clobbered).
 */
export default function PrivacySyncConsentScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { isPro, isSignedIn } = useIsPro();
  const consent = useStore((s) => s.appProfile.privacySyncConsent);
  const updateAppProfile = useStore((s) => s.updateAppProfile);

  const isOn = consent !== undefined;
  const gated = !isSignedIn || !isPro;

  const accept = async () => {
    const uid = getFirebaseAuth()?.currentUser?.uid;
    if (uid) await recordPrivacyConsent(uid, PRIVACY_SYNC_CONSENT_VERSION);
    cloudSync.setConsented(true);
    await updateAppProfile({
      privacySyncConsent: {
        version: PRIVACY_SYNC_CONSENT_VERSION,
        acceptedAt: Date.now(),
      },
    });
    // The private tier is now open — push what was waiting on the device.
    const s = useStore.getState();
    await cloudSync.pushAll({
      behaviors: s.behaviors,
      checkIns: s.checkIns,
      reminderAttempts: s.reminderAttempts,
      entries: s.entries,
      appProfile: s.appProfile,
    });
    haptics.success();
    router.back();
  };

  const revoke = async () => {
    const uid = getFirebaseAuth()?.currentUser?.uid;
    if (uid) await revokePrivacyConsent(uid);
    cloudSync.setConsented(false);
    await updateAppProfile({ privacySyncConsent: undefined });
    haptics.selection();
    router.back();
  };

  return (
    <ScrollView
      style={[styles.fill, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      <Text style={[Type.h1, { color: colors.text }]}>Private sync</Text>

      <Text style={[Type.body, { color: colors.textMuted, marginTop: Space.sm }]}>
        Your stats already sync across your devices. Turning on private sync also backs
        up your <Text style={{ color: colors.text }}>private writing</Text> — journals,
        check-in notes, your bio and goals, and reflection / CBT entries — so it follows
        you to a new phone and is never lost.
      </Text>

      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[Type.bodyBold, { color: colors.text }]}>What you should know</Text>
        <Text style={[Type.caption, { color: colors.textMuted, marginTop: Space.xs }]}>
          • This writing is stored on our servers, encrypted at rest.{'\n'}
          • It is readable by the app to power your experience — so encryption at rest
          does not protect it against a breach, an insider, or a legal request.{'\n'}
          • Turn this off any time and we delete the private copies from our servers.
          What's on this phone stays with you.
        </Text>
      </View>

      {gated ? (
        <>
          <Text style={[Type.caption, { color: colors.textMuted, marginTop: Space.lg }]}>
            {isSignedIn
              ? 'Private sync is part of Reprogrammer Pro.'
              : 'Sign in to enable private sync.'}
          </Text>
          <Pressable
            onPress={() => router.replace(isSignedIn ? '/paywall' : '/auth')}
            style={({ pressed }) => [
              styles.primary,
              { backgroundColor: colors.tint, opacity: pressed ? PRESSED_OPACITY : 1 },
            ]}
            accessibilityRole="button"
            accessibilityLabel={isSignedIn ? 'Upgrade to Pro' : 'Sign in'}
          >
            <Text style={[Type.bodyBold, { color: colors.textOnBrand }]}>
              {isSignedIn ? 'Upgrade to Pro' : 'Sign in'}
            </Text>
          </Pressable>
        </>
      ) : isOn ? (
        <Pressable
          onPress={revoke}
          style={({ pressed }) => [
            styles.secondary,
            { backgroundColor: colors.surfaceMuted, opacity: pressed ? PRESSED_OPACITY : 1 },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Turn off private sync"
        >
          <Text style={[Type.bodyBold, { color: colors.danger }]}>Turn off private sync</Text>
        </Pressable>
      ) : (
        <Pressable
          onPress={accept}
          style={({ pressed }) => [
            styles.primary,
            { backgroundColor: colors.tint, opacity: pressed ? PRESSED_OPACITY : 1 },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Turn on private sync"
        >
          <Text style={[Type.bodyBold, { color: colors.textOnBrand }]}>Turn on private sync</Text>
        </Pressable>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  content: { width: '100%', maxWidth: 640, alignSelf: 'center', padding: Space.xl },
  card: {
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Space.lg,
    marginTop: Space.lg,
  },
  primary: {
    borderRadius: Radius.md,
    paddingVertical: Space.lg,
    alignItems: 'center',
    marginTop: Space.lg,
    minHeight: 44,
    justifyContent: 'center',
  },
  secondary: {
    borderRadius: Radius.md,
    paddingVertical: Space.lg,
    alignItems: 'center',
    marginTop: Space.lg,
    minHeight: 44,
    justifyContent: 'center',
  },
});
