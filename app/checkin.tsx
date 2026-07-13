import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, Type, Space, Radius, PRESSED_OPACITY } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import useStore from '@/store/useStore';
import { CheckIn } from '@/types';
import { generateUUID } from '@/utils/uuid';
import { handleCheckInResponse } from '@/services/notifications';
import { practiceTypeLabel } from '@/services/library-content';
import { getCaptureTemplate } from '@/services/capture-templates';
import { haptics } from '@/services/haptics';
import { useEffect, useState, useMemo, useRef } from 'react';

function draftKey(attemptId: string): string {
  return `checkin-draft:${attemptId}`;
}

export default function CheckInScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { behaviorId, attemptId } = useLocalSearchParams();
  const { behaviors, addCheckIn, addEntry, getStreak } = useStore();
  const [note, setNote] = useState('');
  const [counterValue, setCounterValue] = useState(0);
  const [metricValue, setMetricValue] = useState('');
  const [templateFields, setTemplateFields] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [done, setDone] = useState<{ result: 'yes' | 'tried'; streak: number } | null>(null);
  const draftWriteTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dismissTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const behavior = useMemo(
    () => behaviors.find((b) => b.id === (behaviorId as string)),
    [behaviors, behaviorId]
  );

  // Load any saved draft for this attempt on mount.
  useEffect(() => {
    if (typeof attemptId !== 'string') return;
    let cancelled = false;
    AsyncStorage.getItem(draftKey(attemptId))
      .then((stored) => {
        if (!cancelled && stored) setNote(stored);
      })
      .catch(() => {
        // Draft load is best-effort.
      });
    return () => {
      cancelled = true;
    };
  }, [attemptId]);

  // Debounce-write the draft as the user types.
  useEffect(() => {
    if (typeof attemptId !== 'string') return;
    if (draftWriteTimeout.current) clearTimeout(draftWriteTimeout.current);
    draftWriteTimeout.current = setTimeout(() => {
      if (note) {
        void AsyncStorage.setItem(draftKey(attemptId), note);
      } else {
        void AsyncStorage.removeItem(draftKey(attemptId));
      }
    }, 200);
    return () => {
      if (draftWriteTimeout.current) clearTimeout(draftWriteTimeout.current);
    };
  }, [note, attemptId]);

  // Clear the pending auto-dismiss if the screen unmounts (e.g. tap-to-skip).
  useEffect(
    () => () => {
      if (dismissTimer.current) clearTimeout(dismissTimer.current);
    },
    []
  );

  const handleResponse = async (result: 'yes' | 'tried' | 'no') => {
    if (!behavior || !behaviorId || !attemptId) return;

    setIsSubmitting(true);

    try {
      const checkIn: CheckIn = {
        id: generateUUID(),
        behaviorId: behavior.id,
        at: Date.now(),
        result,
        note: note || undefined,
        updatedAt: Date.now(),
      };

      await addCheckIn(checkIn);

      // Log the typed capture value alongside the rep (REP-5 Phase 2). Only on a
      // real rep (yes/tried), and only when a positive value was entered.
      if (behavior.captureSpec && result !== 'no') {
        const spec = behavior.captureSpec;
        if (spec.type === 'template') {
          const fields = Object.fromEntries(
            Object.entries(templateFields).filter(([, v]) => v.trim().length > 0)
          );
          if (Object.keys(fields).length > 0) {
            await addEntry({
              id: generateUUID(),
              behaviorId: behavior.id,
              at: Date.now(),
              value: 1,
              fields,
              updatedAt: Date.now(),
            });
          }
        } else if (spec.type === 'reflection') {
          // The reflection reuses the note field — store it as a searchable entry.
          const text = note.trim();
          if (text.length > 0) {
            await addEntry({
              id: generateUUID(),
              behaviorId: behavior.id,
              at: Date.now(),
              value: 1,
              fields: { text },
              updatedAt: Date.now(),
            });
          }
        } else {
          const raw = spec.type === 'counter' ? counterValue : parseFloat(metricValue);
          if (Number.isFinite(raw) && raw > 0) {
            await addEntry({
              id: generateUUID(),
              behaviorId: behavior.id,
              at: Date.now(),
              value: raw,
              updatedAt: Date.now(),
            });
          }
        }
      }

      await handleCheckInResponse(behavior.id, attemptId as string, result);

      if (typeof attemptId === 'string') {
        await AsyncStorage.removeItem(draftKey(attemptId));
      }

      // Snooze/skip just closes; a real check-in earns a brief affirmation.
      if (result === 'no') {
        router.back();
        return;
      }
      haptics.success();
      setDone({ result, streak: getStreak(behavior.id) });
      dismissTimer.current = setTimeout(() => router.back(), 1300);
    } catch (error) {
      console.error('Failed to record check-in:', error);
      setIsSubmitting(false);
    }
  };

  if (!behavior) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.text }]}>Behavior not found</Text>
      </View>
    );
  }

  const isEliminate = behavior.kind === 'eliminate';
  const yesLabel = isEliminate ? 'Caught it' : 'Check-in';
  const triedLabel = isEliminate ? 'Struggled' : 'Tried';
  const noLabel = isEliminate ? "Didn't notice" : 'Snooze';
  const messageBody = behavior.pingMessage;
  const kindText =
    (isEliminate ? 'Eliminate' : 'Adopt') +
    (behavior.practiceType ? ` · ${practiceTypeLabel(behavior.practiceType)}` : '');

  if (done) {
    const isYes = done.result === 'yes';
    const accent = isYes ? colors.tintCelebrate : colors.warning;
    const accentSoft = isYes ? colors.tintSoft : colors.warningSoft;
    const headline = isYes
      ? isEliminate
        ? 'You caught it.'
        : 'Done.'
      : isEliminate
        ? 'Noticing is the work.'
        : 'Showing up counts.';
    return (
      <Pressable
        style={[styles.container, styles.successContainer, { backgroundColor: colors.background }]}
        onPress={() => router.back()}
        accessibilityRole="button"
        accessibilityLabel={`${headline}${
          done.streak > 0 ? `, ${done.streak} day streak` : ''
        }. Tap to continue.`}
      >
        <View style={[styles.successIcon, { backgroundColor: accentSoft }]}>
          <IconSymbol name="checkmark" size={44} color={accent} />
        </View>
        <Text style={[styles.successHeadline, { color: colors.text }]}>{headline}</Text>
        {done.streak > 0 ? (
          <View style={styles.successStreakRow}>
            <IconSymbol name="flame.fill" size={18} color={colors.warning} />
            <Text style={[styles.successStreak, { color: colors.textMuted }]}>
              {done.streak} day streak
            </Text>
          </View>
        ) : (
          <Text style={[styles.successStreak, { color: colors.textMuted }]}>Logged</Text>
        )}
      </Pressable>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.content}>
        <View
          style={[
            styles.kindPill,
            { backgroundColor: isEliminate ? colors.dangerSoft : colors.tintSoft },
          ]}
        >
          <Text
            style={[
              styles.kindPillText,
              { color: isEliminate ? colors.danger : colors.accentText },
            ]}
          >
            {kindText}
          </Text>
        </View>
        <Text style={[styles.behaviorTitle, { color: colors.text }]}>{behavior.title}</Text>
        <Text style={[styles.message, { color: colors.textMuted }]}>{messageBody}</Text>

        {behavior.captureSpec && behavior.captureSpec.type === 'template' ? (
          <View style={styles.templateWrap}>
            {getCaptureTemplate(behavior.captureSpec.templateId ?? 'cbt').fields.map((f) => (
              <View key={f.key} style={styles.templateField}>
                <Text style={[styles.templateLabel, { color: colors.textMuted }]}>{f.label}</Text>
                <TextInput
                  style={[
                    styles.templateInput,
                    f.multiline && styles.templateInputMultiline,
                    {
                      color: colors.text,
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                    },
                  ]}
                  value={templateFields[f.key] ?? ''}
                  onChangeText={(t) => setTemplateFields((prev) => ({ ...prev, [f.key]: t }))}
                  placeholder={f.placeholder}
                  placeholderTextColor={colors.textMuted}
                  multiline={f.multiline}
                  editable={!isSubmitting}
                  accessibilityLabel={f.label}
                />
              </View>
            ))}
          </View>
        ) : behavior.captureSpec && behavior.captureSpec.type === 'reflection' ? (
          <View style={styles.reflectionWrap}>
            <Text style={[styles.captureLabel, { color: colors.textMuted }]}>
              {behavior.captureSpec.label}
            </Text>
            <TextInput
              style={[
                styles.reflectionInput,
                {
                  color: colors.text,
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
              value={note}
              onChangeText={setNote}
              placeholder="Write a few lines…"
              placeholderTextColor={colors.textMuted}
              multiline
              editable={!isSubmitting}
              accessibilityLabel={behavior.captureSpec.label}
            />
          </View>
        ) : behavior.captureSpec ? (
          <View style={styles.captureWrap}>
            <Text style={[styles.captureLabel, { color: colors.textMuted }]}>
              {behavior.captureSpec.label}
              {behavior.captureSpec.type === 'metric' && behavior.captureSpec.unit
                ? ` (${behavior.captureSpec.unit})`
                : ''}
            </Text>
            {behavior.captureSpec.type === 'counter' ? (
              <View style={styles.stepperRow}>
                <Pressable
                  onPress={() => {
                    haptics.selection();
                    setCounterValue((v) => Math.max(0, v - 1));
                  }}
                  disabled={isSubmitting}
                  style={({ pressed }) => [
                    styles.stepperBtn,
                    pressed && { opacity: PRESSED_OPACITY },
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel="Decrease"
                >
                  <IconSymbol name="minus.circle" size={30} color={colors.textMuted} />
                </Pressable>
                <Text style={[styles.stepperValue, { color: colors.text }]}>{counterValue}</Text>
                <Pressable
                  onPress={() => {
                    haptics.selection();
                    setCounterValue((v) => v + 1);
                  }}
                  disabled={isSubmitting}
                  style={({ pressed }) => [
                    styles.stepperBtn,
                    pressed && { opacity: PRESSED_OPACITY },
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel="Increase"
                >
                  <IconSymbol name="plus.circle.fill" size={30} color={colors.accentText} />
                </Pressable>
              </View>
            ) : (
              <TextInput
                style={[
                  styles.metricInput,
                  { color: colors.text, backgroundColor: colors.surface, borderColor: colors.border },
                ]}
                value={metricValue}
                onChangeText={setMetricValue}
                placeholder="0"
                placeholderTextColor={colors.textMuted}
                keyboardType="numeric"
                editable={!isSubmitting}
                accessibilityLabel={behavior.captureSpec.label}
              />
            )}
          </View>
        ) : null}

        <View style={styles.buttonContainer}>
          <Pressable
            onPress={() => handleResponse('yes')}
            disabled={isSubmitting}
            style={({ pressed }) => [
              styles.button,
              { backgroundColor: colors.tint, opacity: isSubmitting ? 0.5 : 1 },
              pressed && !isSubmitting && { opacity: PRESSED_OPACITY },
            ]}
            accessibilityRole="button"
            accessibilityLabel={yesLabel}
          >
            <IconSymbol name="checkmark" size={18} color={colors.textOnBrand} />
            <Text style={[styles.buttonText, { color: colors.textOnBrand }]}>{yesLabel}</Text>
          </Pressable>
          <Pressable
            onPress={() => handleResponse('tried')}
            disabled={isSubmitting}
            style={({ pressed }) => [
              styles.button,
              styles.outlineButton,
              {
                borderColor: colors.warning,
                backgroundColor: colors.warningSoft,
                opacity: isSubmitting ? 0.5 : 1,
              },
              pressed && !isSubmitting && { opacity: PRESSED_OPACITY },
            ]}
            accessibilityRole="button"
            accessibilityLabel={triedLabel}
            accessibilityHint="Showing up counts — use when you engaged but didn't fully complete."
          >
            <Text style={[styles.buttonText, { color: colors.warning }]}>{triedLabel}</Text>
          </Pressable>
          <Pressable
            onPress={() => handleResponse('no')}
            disabled={isSubmitting}
            style={({ pressed }) => [
              styles.button,
              styles.outlineButton,
              {
                borderColor: colors.border,
                backgroundColor: 'transparent',
                opacity: isSubmitting ? 0.5 : 1,
              },
              pressed && !isSubmitting && { opacity: PRESSED_OPACITY },
            ]}
            accessibilityRole="button"
            accessibilityLabel={noLabel}
            accessibilityHint={
              isEliminate
                ? "Marks this prompt as missed. Doesn't reset your streak."
                : "Reschedules this reminder for later. Use when you can't practice right now."
            }
          >
            <Text style={[styles.buttonText, { color: colors.textMuted }]}>{noLabel}</Text>
          </Pressable>
        </View>

        {behavior.captureSpec?.type !== 'reflection' ? (
          <View
            style={[
              styles.noteWrap,
              { borderColor: colors.border, backgroundColor: colors.surface },
            ]}
          >
            <TextInput
              style={[styles.noteInput, { color: colors.text }]}
              placeholder="How did it go? (optional)"
              placeholderTextColor={colors.textMuted}
              value={note}
              onChangeText={setNote}
              multiline
              editable={!isSubmitting}
              accessibilityLabel="Optional note about this check-in"
            />
          </View>
        ) : null}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  content: {
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
    paddingHorizontal: Space.xl,
    paddingVertical: Space.xxxl + Space.sm,
  },
  kindPill: {
    alignSelf: 'center',
    paddingHorizontal: Space.md,
    paddingVertical: Space.xs,
    borderRadius: Radius.sm,
    marginBottom: Space.lg,
  },
  kindPillText: { ...Type.micro, letterSpacing: 0 },
  behaviorTitle: {
    ...Type.display2,
    textAlign: 'center',
    marginBottom: Space.md,
  },
  message: {
    ...Type.body,
    textAlign: 'center',
    marginBottom: Space.xxxl + Space.sm,
  },
  captureWrap: { alignItems: 'center', gap: Space.sm, marginBottom: Space.xxl },
  captureLabel: { ...Type.caption, textTransform: 'uppercase', letterSpacing: 1 },
  stepperRow: { flexDirection: 'row', alignItems: 'center', gap: Space.xl },
  stepperBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  stepperValue: { ...Type.display2, minWidth: 56, textAlign: 'center' },
  metricInput: {
    ...Type.display2,
    textAlign: 'center',
    minWidth: 140,
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingVertical: Space.sm,
    paddingHorizontal: Space.lg,
  },
  templateWrap: { alignSelf: 'stretch', gap: Space.md, marginBottom: Space.xxl },
  templateField: { gap: Space.xs },
  templateLabel: { ...Type.micro, textTransform: 'uppercase', letterSpacing: 1 },
  templateInput: {
    ...Type.body,
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Space.md,
    paddingVertical: Space.sm,
  },
  templateInputMultiline: { minHeight: 64, textAlignVertical: 'top' },
  reflectionWrap: { alignSelf: 'stretch', gap: Space.sm, marginBottom: Space.xxl },
  reflectionInput: {
    ...Type.body,
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Space.md,
    paddingVertical: Space.sm,
    minHeight: 96,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    flexDirection: 'column',
    gap: Space.sm,
    marginBottom: Space.xxl,
  },
  button: {
    flexDirection: 'row',
    gap: Space.sm,
    paddingVertical: Space.lg,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 54,
  },
  outlineButton: {
    borderWidth: 1,
  },
  buttonText: {
    ...Type.h2,
  },
  noteWrap: {
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Space.md,
    paddingVertical: Space.xs,
  },
  noteInput: {
    minHeight: 64,
    ...Type.body,
    textAlignVertical: 'top',
    paddingTop: Space.sm,
  },
  errorText: {
    textAlign: 'center',
    ...Type.body,
  },
  successContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: Space.sm,
    paddingHorizontal: Space.xl,
  },
  successIcon: {
    width: 96,
    height: 96,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Space.sm,
  },
  successHeadline: { ...Type.display2, textAlign: 'center' },
  successStreakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.xs,
  },
  successStreak: { ...Type.body },
});
