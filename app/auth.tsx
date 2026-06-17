import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import * as AppleAuthentication from 'expo-apple-authentication';
import { useAuthActions } from '@convex-dev/auth/react';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, Type, Space, Radius, PRESSED_OPACITY } from '@/constants/theme';
import { useFeedback } from '@/components/ui/feedback';

export default function AuthScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { signIn } = useAuthActions();
  const { showSheet } = useFeedback();
  const [busy, setBusy] = useState<'apple' | 'google' | null>(null);

  const handleApple = async () => {
    setBusy('apple');
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      if (!credential.identityToken) {
        throw new Error('Apple did not return an identity token.');
      }
      await signIn('apple', { idToken: credential.identityToken });
      router.back();
    } catch (e: any) {
      if (e?.code !== 'ERR_REQUEST_CANCELED') {
        showSheet({
          title: 'Sign-in failed',
          message: e?.message ?? 'Something went wrong. Please try again.',
          actions: [{ label: 'OK' }],
        });
      }
    } finally {
      setBusy(null);
    }
  };

  const handleGoogle = async () => {
    setBusy('google');
    try {
      await signIn('google');
      router.back();
    } catch (e: any) {
      showSheet({
        title: 'Sign-in failed',
        message: e?.message ?? 'Something went wrong. Please try again.',
        actions: [{ label: 'OK' }],
      });
    } finally {
      setBusy(null);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>Sign in</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          Sign in to sync your behaviors across devices and unlock Pro.
        </Text>

        {Platform.OS === 'ios' && (
          <AppleAuthentication.AppleAuthenticationButton
            buttonType={AppleAuthenticationButtonType.SIGN_IN}
            buttonStyle={
              colorScheme === 'dark'
                ? AppleAuthenticationButtonStyle.WHITE
                : AppleAuthenticationButtonStyle.BLACK
            }
            cornerRadius={Radius.md}
            style={styles.appleButton}
            onPress={handleApple}
          />
        )}

        <Pressable
          onPress={handleGoogle}
          disabled={busy !== null}
          style={({ pressed }) => [
            styles.googleButton,
            { backgroundColor: colors.surface, borderColor: colors.border },
            busy === 'google' && { opacity: 0.6 },
            pressed && busy === null && { opacity: PRESSED_OPACITY },
          ]}
          accessibilityRole="button"
          accessibilityState={{ disabled: busy !== null, busy: busy === 'google' }}
          accessibilityLabel="Sign in with Google"
        >
          <Text style={[styles.googleButtonText, { color: colors.text }]}>
            {busy === 'google' ? 'Signing in…' : 'Continue with Google'}
          </Text>
        </Pressable>

        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [styles.cancel, pressed && { opacity: PRESSED_OPACITY }]}
          accessibilityRole="button"
          accessibilityLabel="Maybe later"
        >
          <Text style={[Type.caption, { color: colors.textMuted }]}>Maybe later</Text>
        </Pressable>
      </View>
    </View>
  );
}

const AppleAuthenticationButtonType = AppleAuthentication.AppleAuthenticationButtonType;
const AppleAuthenticationButtonStyle = AppleAuthentication.AppleAuthenticationButtonStyle;

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
  appleButton: { height: 48 },
  googleButton: {
    height: 48,
    borderRadius: Radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleButtonText: { ...Type.bodyBold },
  cancel: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    marginTop: Space.md,
  },
});
