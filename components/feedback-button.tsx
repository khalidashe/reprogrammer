import { Pressable, Text, StyleSheet, Linking, Platform } from 'react-native';
import Constants from 'expo-constants';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Type, Space, PRESSED_OPACITY, type ThemeColors } from '@/constants/theme';
import { useFeedback } from '@/components/ui/feedback';
import {
  buildFeedbackMailto,
  FEEDBACK_EMAIL,
  type FeedbackContext,
} from '@/services/feedback';

/**
 * A quiet "suggest a change or report a problem" affordance (REP-10) for the
 * bottom of any content detail surface — guides, programs, and behaviors.
 * Opens a prefilled email; if no mail client is set up, it falls back to a
 * sheet with the address so the path is never a dead end.
 */
export function FeedbackButton({
  context,
  colors,
}: {
  context: FeedbackContext;
  colors: ThemeColors;
}) {
  const { showSheet } = useFeedback();

  const handlePress = async () => {
    const url = buildFeedbackMailto(context, {
      appVersion: Constants.expoConfig?.version ?? 'dev',
      platform: Platform.OS,
    });
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (!canOpen) throw new Error('no-mail-client');
      await Linking.openURL(url);
    } catch {
      showSheet({
        title: 'Share your thoughts',
        message: `Email us anytime at ${FEEDBACK_EMAIL} — every note is read, and it helps make this better.`,
        actions: [{ label: 'OK' }],
      });
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.row,
        { borderTopColor: colors.border },
        pressed && { opacity: PRESSED_OPACITY },
      ]}
      accessibilityRole="button"
      accessibilityLabel="Suggest a change or send feedback"
      accessibilityHint="Opens an email to share feedback about this"
    >
      <IconSymbol name="exclamationmark.bubble" size={14} color={colors.textMuted} />
      <Text style={[Type.caption, { color: colors.textMuted }]}>
        Suggest a change
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.xs,
    marginTop: Space.xl,
    paddingTop: Space.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    minHeight: 44,
  },
});
