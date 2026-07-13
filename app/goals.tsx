import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, Type, Space, Radius, PRESSED_OPACITY } from '@/constants/theme';
import useStore from '@/store/useStore';
import { haptics } from '@/services/haptics';
import { useState } from 'react';

/**
 * Goals editor (REP-41). A place to write what you want to change or become.
 * Stored on `appProfile.goals` (local-only); the Coach / AI program-search will
 * read it later to suggest matching programs.
 */
export default function GoalsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { appProfile, updateAppProfile } = useStore();
  const [text, setText] = useState(appProfile.goals ?? '');

  const dirty = text.trim() !== (appProfile.goals ?? '').trim();

  const onSave = async () => {
    if (!dirty) return;
    await updateAppProfile({ goals: text.trim() || undefined });
    haptics.success();
    router.back();
  };

  return (
    <KeyboardAvoidingView
      style={[styles.fill, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={[Type.h1, { color: colors.text }]}>What are you working toward?</Text>
        <Text style={[Type.body, { color: colors.textMuted, marginTop: Space.sm }]}>
          Jot down what you want to change or become. This stays on your device — and the Coach
          will use it to suggest programs that fit (coming soon).
        </Text>

        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="e.g. Stop doomscrolling at night · rebuild deep focus · stay calm under pressure"
          placeholderTextColor={colors.textMuted}
          multiline
          autoFocus
          textAlignVertical="top"
          style={[
            styles.input,
            { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text },
          ]}
          accessibilityLabel="Your goals"
        />

        <Pressable
          onPress={onSave}
          disabled={!dirty}
          style={({ pressed }) => [
            styles.save,
            { backgroundColor: colors.tint, opacity: !dirty ? 0.5 : pressed ? PRESSED_OPACITY : 1 },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Save goals"
        >
          <Text style={[Type.bodyBold, { color: colors.textOnBrand }]}>Save</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  content: { width: '100%', maxWidth: 640, alignSelf: 'center', padding: Space.xl, gap: Space.sm },
  input: {
    minHeight: 160,
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Space.lg,
    ...Type.body,
    marginTop: Space.md,
  },
  save: {
    borderRadius: Radius.md,
    paddingVertical: Space.lg,
    alignItems: 'center',
    marginTop: Space.md,
  },
});
