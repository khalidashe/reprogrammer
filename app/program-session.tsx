import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, Type, Space, Radius, PRESSED_OPACITY } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import useStore from '@/store/useStore';
import { haptics } from '@/services/haptics';
import { dateKey } from '@/services/scheduler-core';
import { generateUUID } from '@/utils/uuid';
import {
  enrollableProgramById,
  completeCurrentDay,
  dayProgressLabel,
} from '@/services/program-engine';

const AFFIRMATIONS = ['Caught it.', 'Nice catch.', 'Noticed.', 'Good eye.', "That's the rep."];

function formatElapsed(ms: number): string {
  const total = Math.floor(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const mm = String(m).padStart(2, '0');
  const ss = String(s).padStart(2, '0');
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

export default function ProgramSessionScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const params = useLocalSearchParams();
  const enrollmentId = params.enrollmentId as string;
  const targetMinutes = Number(params.targetMinutes ?? 0);
  const withTally = params.withTally === '1';

  const programEnrollments = useStore((s) => s.programEnrollments);
  const startFocusSession = useStore((s) => s.startFocusSession);
  const addFocusCatch = useStore((s) => s.addFocusCatch);
  const endFocusSession = useStore((s) => s.endFocusSession);
  const updateEnrollment = useStore((s) => s.updateEnrollment);
  const addProgramDayLog = useStore((s) => s.addProgramDayLog);

  const enrollment = useMemo(
    () => programEnrollments.find((e) => e.id === enrollmentId),
    [programEnrollments, enrollmentId],
  );
  const prog = enrollment ? enrollableProgramById(enrollment.programId) : undefined;

  const [elapsedMs, setElapsedMs] = useState(0);
  const [catches, setCatches] = useState(0);
  const [affirmation, setAffirmation] = useState('');
  const [done, setDone] = useState(false);

  const sessionIdRef = useRef<string | null>(null);
  const startedAtRef = useRef<number | null>(null);
  const endedRef = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!enrollment) {
      router.back();
      return;
    }
    let cancelled = false;
    (async () => {
      const session = await startFocusSession(enrollment.id);
      if (cancelled) return;
      sessionIdRef.current = session.id;
      startedAtRef.current = session.startedAt;
    })();

    intervalRef.current = setInterval(() => {
      if (startedAtRef.current && !endedRef.current) {
        setElapsedMs(Date.now() - startedAtRef.current);
      }
    }, 1000);

    return () => {
      cancelled = true;
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (!endedRef.current && sessionIdRef.current) {
        endFocusSession(sessionIdRef.current).catch(() => {});
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!enrollment || !prog) return null;
  const content = prog.program;

  const scale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.12] });
  const targetReached = targetMinutes > 0 && elapsedMs >= targetMinutes * 60_000;

  const onCatch = () => {
    if (endedRef.current || !sessionIdRef.current) return;
    haptics.light();
    const next = catches + 1;
    setCatches(next);
    setAffirmation(AFFIRMATIONS[next % AFFIRMATIONS.length]);
    addFocusCatch(sessionIdRef.current).catch(() => {});
    Animated.sequence([
      Animated.timing(pulse, { toValue: 1, duration: 90, useNativeDriver: true }),
      Animated.timing(pulse, { toValue: 0, duration: 150, useNativeDriver: true }),
    ]).start();
  };

  const onEnd = async () => {
    if (endedRef.current || !sessionIdRef.current) return;
    endedRef.current = true;
    haptics.success();
    if (intervalRef.current) clearInterval(intervalRef.current);
    await endFocusSession(sessionIdRef.current);
    await addProgramDayLog({
      id: generateUUID(),
      enrollmentId: enrollment.id,
      day: enrollment.currentDay,
      completedAt: Date.now(),
      note: withTally ? `${catches} drifts caught` : undefined,
      updatedAt: Date.now(),
    });
    await updateEnrollment(completeCurrentDay(enrollment, content, dateKey(new Date())));
    setDone(true);
  };

  const padding = { paddingTop: insets.top + Space.xl, paddingBottom: insets.bottom + Space.xl };
  const durMin = Math.max(1, Math.round(elapsedMs / 60000));

  if (done) {
    return (
      <View style={[styles.fill, padding, styles.reviewWrap, { backgroundColor: colors.background }]}>
        <View style={[styles.reviewCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <IconSymbol name="checkmark.seal.fill" size={28} color={colors.accentText} />
          <Text style={[Type.h1, { color: colors.text, marginTop: Space.sm }]}>Day complete</Text>
          <Text style={[Type.body, { color: colors.textMuted, marginTop: Space.xs, textAlign: 'center' }]}>
            {dayProgressLabel(enrollment, content)} done. Showing up is the streak that counts.
          </Text>

          <View style={[styles.statRow, { borderTopColor: colors.border }]}>
            <Text style={[Type.body, { color: colors.textMuted }]}>Length</Text>
            <Text style={[Type.bodyBold, { color: colors.text }]}>{durMin} min</Text>
          </View>
          {withTally ? (
            <View style={[styles.statRow, { borderTopColor: colors.border }]}>
              <Text style={[Type.body, { color: colors.textMuted }]}>Drifts caught</Text>
              <Text style={[Type.bodyBold, { color: colors.text }]}>{catches}</Text>
            </View>
          ) : null}

          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [
              styles.primaryButton,
              { backgroundColor: colors.tint },
              pressed && { opacity: PRESSED_OPACITY },
            ]}
            accessibilityLabel="Done"
          >
            <Text style={[Type.bodyBold, { color: colors.textOnBrand }]}>Done</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.fill, padding, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[Type.caption, { color: colors.textMuted }]} numberOfLines={1}>
          {prog.title} · {dayProgressLabel(enrollment, content)}
        </Text>
        <Text style={[Type.h2, { color: colors.text, marginTop: Space.xxs }]}>
          {targetMinutes > 0 ? `${targetMinutes}-minute session` : 'Focus session'}
        </Text>
      </View>

      <View style={styles.center}>
        <Text style={[styles.timer, { color: targetReached ? colors.accentText : colors.textMuted }]}>
          {formatElapsed(elapsedMs)}
        </Text>
        {withTally ? (
          <Pressable
            onPress={onCatch}
            style={({ pressed }) => [
              styles.tap,
              { backgroundColor: colors.surface, borderColor: colors.border },
              pressed && { opacity: PRESSED_OPACITY },
            ]}
            accessibilityLabel="Caught it — log a drift"
          >
            <Animated.Text style={[styles.count, { color: colors.text, transform: [{ scale }] }]}>
              {catches}
            </Animated.Text>
            <Text style={[Type.bodyBold, { color: colors.accentText }]}>Caught it +1</Text>
          </Pressable>
        ) : null}
        <Text style={[Type.caption, { color: colors.textMuted, marginTop: Space.lg, textAlign: 'center' }]}>
          {withTally
            ? affirmation || 'Tap each time you notice the drift. Noticing is the win.'
            : targetReached
              ? 'Target reached — end whenever you like.'
              : 'Stay with the work. End the session when you’re done.'}
        </Text>
      </View>

      <View style={styles.footer}>
        <Pressable
          onPress={onEnd}
          style={({ pressed }) => [
            styles.primaryButton,
            { backgroundColor: colors.tint },
            pressed && { opacity: PRESSED_OPACITY },
          ]}
          accessibilityLabel="End session and complete the day"
        >
          <Text style={[Type.bodyBold, { color: colors.textOnBrand }]}>End &amp; complete day</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, paddingHorizontal: Space.xl },
  header: { alignItems: 'center' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  timer: { ...Type.h1, fontVariant: ['tabular-nums'], marginBottom: Space.xxl },
  tap: {
    width: 220,
    height: 220,
    borderRadius: Radius.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Space.xs,
  },
  count: { fontSize: 72, lineHeight: 80, fontWeight: '800' },
  footer: { alignItems: 'center', gap: Space.lg },
  primaryButton: {
    alignSelf: 'stretch',
    borderRadius: Radius.md,
    paddingVertical: Space.lg,
    alignItems: 'center',
  },
  reviewWrap: { justifyContent: 'center' },
  reviewCard: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Space.xl,
    alignItems: 'center',
  },
  statRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Space.md,
    borderTopWidth: 1,
    marginTop: Space.md,
  },
});
