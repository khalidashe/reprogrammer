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
import { Colors, Type, Space, Radius } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import useStore from '@/store/useStore';
import { CheckIn } from '@/types';
import { generateUUID } from '@/utils/uuid';
import { handleCheckInResponse } from '@/services/notifications';
import { practiceTypeLabel } from '@/services/library-content';
import { useEffect, useState, useMemo, useRef } from 'react';

function draftKey(attemptId: string): string {
  return `checkin-draft:${attemptId}`;
}

export default function CheckInScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { behaviorId, attemptId } = useLocalSearchParams();
  const { behaviors, addCheckIn } = useStore();
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const draftWriteTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

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
      };

      await addCheckIn(checkIn);
      await handleCheckInResponse(behavior.id, attemptId as string, result);

      if (typeof attemptId === 'string') {
        await AsyncStorage.removeItem(draftKey(attemptId));
      }

      router.back();
    } catch (error) {
      console.error('Failed to record check-in:', error);
    } finally {
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

        <View style={styles.buttonContainer}>
          <Pressable
            onPress={() => handleResponse('yes')}
            disabled={isSubmitting}
            style={[
              styles.button,
              { backgroundColor: colors.tint, opacity: isSubmitting ? 0.5 : 1 },
            ]}
            accessibilityLabel={yesLabel}
          >
            <IconSymbol name="checkmark" size={18} color={colors.textOnBrand} />
            <Text style={[styles.buttonText, { color: colors.textOnBrand }]}>{yesLabel}</Text>
          </Pressable>
          <Pressable
            onPress={() => handleResponse('tried')}
            disabled={isSubmitting}
            style={[
              styles.button,
              styles.outlineButton,
              {
                borderColor: colors.warning,
                backgroundColor: colors.warningSoft,
                opacity: isSubmitting ? 0.5 : 1,
              },
            ]}
            accessibilityLabel={triedLabel}
            accessibilityHint="Showing up counts — use when you engaged but didn't fully complete."
          >
            <Text style={[styles.buttonText, { color: colors.warning }]}>{triedLabel}</Text>
          </Pressable>
          <Pressable
            onPress={() => handleResponse('no')}
            disabled={isSubmitting}
            style={[
              styles.button,
              styles.outlineButton,
              {
                borderColor: colors.border,
                backgroundColor: 'transparent',
                opacity: isSubmitting ? 0.5 : 1,
              },
            ]}
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

        <View
          style={[styles.noteWrap, { borderColor: colors.border, backgroundColor: colors.surface }]}
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
});
