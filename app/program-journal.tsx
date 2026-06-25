import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMemo, useState } from 'react';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, Type, Space, Radius, PRESSED_OPACITY } from '@/constants/theme';
import useStore from '@/store/useStore';
import { haptics } from '@/services/haptics';
import { dateKey } from '@/services/scheduler-core';
import { generateUUID } from '@/utils/uuid';
import {
  enrollableProgramById,
  exercisesForDay,
  completeCurrentDay,
  dayProgressLabel,
} from '@/services/program-engine';

export default function ProgramJournalScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const params = useLocalSearchParams();
  const enrollmentId = params.enrollmentId as string;
  const minimal = params.minimal === '1';

  const programEnrollments = useStore((s) => s.programEnrollments);
  const updateEnrollment = useStore((s) => s.updateEnrollment);
  const addProgramDayLog = useStore((s) => s.addProgramDayLog);

  const enrollment = useMemo(
    () => programEnrollments.find((e) => e.id === enrollmentId),
    [programEnrollments, enrollmentId],
  );
  const prog = enrollment ? enrollableProgramById(enrollment.programId) : undefined;

  const [text, setText] = useState('');
  const [saving, setSaving] = useState(false);

  if (!enrollment || !prog) {
    router.back();
    return null;
  }
  const content = prog.program;
  const exercises = exercisesForDay(content, enrollment.currentDay);
  const exercise = exercises.find((e) => e.instrument === 'journal') ?? exercises[0];
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;

  const onDone = async () => {
    if (saving) return;
    setSaving(true);
    haptics.success();
    const note =
      [text.trim() || null, minimal ? '2-minute version' : null].filter(Boolean).join(' · ') ||
      undefined;
    await addProgramDayLog({
      id: generateUUID(),
      enrollmentId: enrollment.id,
      day: enrollment.currentDay,
      completedAt: Date.now(),
      note,
      updatedAt: Date.now(),
    });
    await updateEnrollment(completeCurrentDay(enrollment, content, dateKey(new Date())));
    router.back();
  };

  return (
    <KeyboardAvoidingView
      style={[styles.fill, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + Space.lg, paddingBottom: Space.lg },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={[Type.caption, { color: colors.textMuted }]} numberOfLines={1}>
          {prog.title} · {dayProgressLabel(enrollment, content)}
        </Text>
        <Text style={[Type.h2, { color: colors.text, marginTop: Space.xxs }]}>Write</Text>
        {exercise ? (
          <Text style={[Type.body, { color: colors.textMuted, marginTop: Space.sm }]}>
            {exercise.prompt}
          </Text>
        ) : null}

        <TextInput
          style={[
            styles.input,
            { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface },
          ]}
          value={text}
          onChangeText={setText}
          placeholder="Start writing — no audience, no quality bar."
          placeholderTextColor={colors.textMuted}
          multiline
          autoFocus
          textAlignVertical="top"
        />
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + Space.md, borderTopColor: colors.border }]}>
        <Text style={[Type.caption, { color: colors.textMuted }]}>
          {words} {words === 1 ? 'word' : 'words'}
        </Text>
        <View style={styles.footerButtons}>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [styles.secondary, pressed && { opacity: PRESSED_OPACITY }]}
            accessibilityLabel="Cancel"
          >
            <Text style={[Type.bodyBold, { color: colors.textMuted }]}>Cancel</Text>
          </Pressable>
          <Pressable
            onPress={onDone}
            style={({ pressed }) => [
              styles.primary,
              { backgroundColor: colors.tint },
              pressed && { opacity: PRESSED_OPACITY },
            ]}
            accessibilityLabel="Save and complete the day"
          >
            <Text style={[Type.bodyBold, { color: colors.textOnBrand }]}>Done</Text>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  content: { paddingHorizontal: Space.xl, flexGrow: 1 },
  input: {
    flex: 1,
    minHeight: 240,
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Space.lg,
    marginTop: Space.lg,
    fontSize: 17,
    lineHeight: 25,
  },
  footer: {
    paddingHorizontal: Space.xl,
    paddingTop: Space.md,
    borderTopWidth: 1,
    gap: Space.sm,
  },
  footerButtons: { flexDirection: 'row', gap: Space.md },
  secondary: {
    flex: 1,
    borderRadius: Radius.md,
    paddingVertical: Space.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    flex: 2,
    borderRadius: Radius.md,
    paddingVertical: Space.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
