import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { useState } from 'react';
import * as AppleAuthentication from 'expo-apple-authentication';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, Type, Space, Radius, PRESSED_OPACITY } from '@/constants/theme';
import { useFeedback } from '@/components/ui/feedback';
import {
  signInWithApple,
  signInWithGoogle,
} from '@/services/firebase-auth-actions';

const AppleAuthenticationButtonType = AppleAuthentication.AppleAuthenticationButtonType;
const AppleAuthenticationButtonStyle = AppleAuthentication.AppleAuthenticationButtonStyle;

interface SignInPanelProps {
  /** Called after a session is established. The caller decides where to go next. */
  onSignedIn: () => void;
}

/**
 * Apple + Google sign-in via Firebase Auth (FB-4).
 * Shared by the standalone `/auth` screen and the onboarding account wall.
 */
export function SignInPanel({ onSignedIn }: SignInPanelProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { showSheet } = useFeedback();
  const [busy, setBusy] = useState<'apple' | 'google' | null>(null);

  const handleApple = async () => {
    setBusy('apple');
    try {
      await signInWithApple();
      onSignedIn();
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
      await signInWithGoogle();
      onSignedIn();
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
    <View style={styles.container}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: Space.lg },
  appleButton: { height: 48 },
  googleButton: {
    height: 48,
    borderRadius: Radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleButtonText: { ...Type.bodyBold },
});
