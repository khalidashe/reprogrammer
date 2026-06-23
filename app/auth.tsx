import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, Type, Space } from '@/constants/theme';
import { SignInPanel } from '@/components/auth/sign-in-panel';

export default function AuthScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  // The account is a hard wall now (REP-46) — there is no "Maybe later".
  // When reached as a modal (e.g. from the paywall) we pop back; when reached
  // as the launch wall (a signed-out, onboarded user) there is nothing to pop
  // to, so fall through to the app and let the root gate settle the route.
  const onSignedIn = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>Sign in</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          Sign in to sync your behaviors across devices and unlock Pro.
        </Text>

        <SignInPanel onSignedIn={onSignedIn} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    flex: 1,
    padding: Space.xxl,
    gap: Space.lg,
    justifyContent: 'center',
  },
  title: { ...Type.h1, textAlign: 'center' },
  subtitle: {
    ...Type.body,
    textAlign: 'center',
    marginBottom: Space.lg,
  },
});
