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
import { getCaptureTemplate } from '@/services/capture-templates';
import type { CaptureTemplateId } from '@/types';
import {
  enrollableProgramById,
  exercisesForDay,
  completeCurrentDay,
  dayProgressLabel,
} from '@/services/program-engine';

export default function ProgramStructuredScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const params = useLocalSearchParams();
  const enrollmentId = params.enrollmentId as string;
  const templateId = (params.templateId as CaptureTemplateId) ?? 'cbt';
  const minimal = params.minimal === '1';

  const programEnrollments = useStore((s) => s.programEnrollments);
  const updateEnrollment = useStore((s) => s.updateEnrollment);
  const addProgramDayLog = useStore((s) => s.addProgramDayLog);

  const enrollment = useMemo(
    () => programEnrollments.find((e) => e.id === enrollmentId),
    [programEnrollments, enrollmentId],
  );
  const prog = enrollment ? enrollableProgramById(enrollment.programId) : undefined;
  const template = getCaptureTemplate(templateId);

  const [values, setValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  if (!enrollment || !prog) {
    router.back();
    return null;
  }
  const content = prog.program;
  const exercise = exercisesForDay(content, enrollment.currentDay)[0];
  const filledCount = template.fields.filter((f) => (values[f.key] ?? '').trim()).length;

  const onDone = async () => {
    if (saving) return;
    setSaving(true);
    haptics.success();
    const filled = template.fields
      .filter((f) => (values[f.key] ?? '').trim())
      .map((f) => `${f.label}: ${values[f.key].trim()}`);
    if (minimal) filled.push('2-minute version');
    await addProgramDayLog({
      id: generateUUID(),
      enrollmentId: enrollment.id,
      day: enrollment.currentDay,
      completedAt: Date.now(),
      note: filled.join('\n') || undefined,
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
        <Text style={[Type.h2, { color: colors.text, marginTop: Space.xxs }]}>{template.title}</Text>
        {exercise ? (
          <Text style={[Type.body, { color: colors.textMuted, marginTop: Space.sm }]}>
            {exercise.prompt}
          </Text>
        ) : null}

        {template.fields.map((field) => (
          <View key={field.key} style={{ marginTop: Space.lg }}>
            <Text style={[Type.bodyBold, { color: colors.text, marginBottom: Space.xs }]}>
              {field.label}
            </Text>
            <TextInput
              style={[
                field.multiline ? styles.multiline : styles.input,
                { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface },
              ]}
              value={values[field.key] ?? ''}
              onChangeText={(t) => setValues((v) => ({ ...v, [field.key]: t }))}
              placeholder={field.placeholder}
              placeholderTextColor={colors.textMuted}
              multiline={field.multiline}
              textAlignVertical={field.multiline ? 'top' : 'center'}
            />
          </View>
        ))}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + Space.md, borderTopColor: colors.border }]}>
        <Text style={[Type.caption, { color: colors.textMuted }]}>
          {filledCount} of {template.fields.length} filled
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
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Space.md,
    paddingVertical: Space.md,
    fontSize: 16,
  },
  multiline: {
    minHeight: 90,
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Space.md,
    fontSize: 16,
    lineHeight: 22,
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
