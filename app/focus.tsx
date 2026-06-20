import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, Type, Space, Radius, PRESSED_OPACITY } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import useStore from '@/store/useStore';
import { rescheduleAll } from '@/services/notifications';
import { haptics } from '@/services/haptics';
import { completedSessions, driftsPer30Min, sessionDurationMs } from '@/services/focus';
import { useEffect, useMemo, useRef, useState } from 'react';

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

interface Review {
  durationMs: number;
  catches: number;
  rate: number;
  prevRate: number | null;
}

export default function FocusScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { behaviorId } = useLocalSearchParams();
  const { behaviors, startFocusSession, addFocusCatch, endFocusSession, getFocusSessions } =
    useStore();

  const behavior = useMemo(
    () => behaviors.find((b) => b.id === (behaviorId as string)),
    [behaviors, behaviorId]
  );

  const [elapsedMs, setElapsedMs] = useState(0);
  const [catches, setCatches] = useState(0);
  const [affirmation, setAffirmation] = useState('');
  const [review, setReview] = useState<Review | null>(null);

  const sessionIdRef = useRef<string | null>(null);
  const startedAtRef = useRef<number | null>(null);
  const endedRef = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!behavior) {
      router.back();
      return;
    }
    let cancelled = false;
    (async () => {
      const session = await startFocusSession(behavior.id);
      if (cancelled) return;
      sessionIdRef.current = session.id;
      startedAtRef.current = session.startedAt;
      // Mute the app's own reminders while the session runs (REP-7).
      rescheduleAll({ force: true }).catch(() => {});
    })();

    intervalRef.current = setInterval(() => {
      if (startedAtRef.current && !endedRef.current) {
        setElapsedMs(Date.now() - startedAtRef.current);
      }
    }, 1000);

    return () => {
      cancelled = true;
      if (intervalRef.current) clearInterval(intervalRef.current);
      // Dismissed without tapping "End" (e.g. swipe): close the session and
      // restore reminders so muting never leaks past the session.
      if (!endedRef.current && sessionIdRef.current) {
        endFocusSession(sessionIdRef.current).catch(() => {});
        rescheduleAll({ force: true }).catch(() => {});
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!behavior) return null;

  const scale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.12] });

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
    const id = sessionIdRef.current;
    await endFocusSession(id);
    await rescheduleAll({ force: true }).catch(() => {});

    const ended = completedSessions(getFocusSessions(behavior.id));
    const current = ended.find((s) => s.id === id) ?? null;
    const prev = ended.find((s) => s.id !== id) ?? null;
    setReview({
      durationMs: current ? sessionDurationMs(current) : elapsedMs,
      catches,
      rate: current ? driftsPer30Min(current) : 0,
      prevRate: prev ? driftsPer30Min(prev) : null,
    });
  };

  const padding = { paddingTop: insets.top + Space.xl, paddingBottom: insets.bottom + Space.xl };

  if (review) {
    const durMin = Math.max(1, Math.round(review.durationMs / 60000));
    return (
      <View style={[styles.fill, padding, styles.reviewWrap, { backgroundColor: colors.background }]}>
        <View style={[styles.reviewCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <IconSymbol name="sparkles" size={28} color={colors.accentText} />
          <Text style={[Type.h1, { color: colors.text, marginTop: Space.sm }]}>Session complete</Text>
          <Text style={[Type.body, { color: colors.textMuted, marginTop: Space.xs, textAlign: 'center' }]}>
            You ran a focus session — that&apos;s the streak that counts. Noticing the drift is the rep, never a demerit.
          </Text>

          <View style={[styles.statRow, { borderTopColor: colors.border }]}>
            <Text style={[Type.body, { color: colors.textMuted }]}>Length</Text>
            <Text style={[Type.bodyBold, { color: colors.text }]}>{durMin} min</Text>
          </View>
          <View style={[styles.statRow, { borderTopColor: colors.border }]}>
            <Text style={[Type.body, { color: colors.textMuted }]}>Drifts caught</Text>
            <Text style={[Type.bodyBold, { color: colors.text }]}>{review.catches}</Text>
          </View>
          <View style={[styles.statRow, { borderTopColor: colors.border }]}>
            <Text style={[Type.body, { color: colors.textMuted }]}>Per 30 min</Text>
            <Text style={[Type.bodyBold, { color: colors.text }]}>{review.rate.toFixed(1)}</Text>
          </View>
          {review.prevRate != null ? (
            <Text style={[Type.caption, { color: colors.textMuted, marginTop: Space.sm }]}>
              {review.prevRate.toFixed(1)} per 30 min last session
            </Text>
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
          {behavior.title}
        </Text>
        <Text style={[Type.h2, { color: colors.text, marginTop: Space.xxs }]}>Focus session</Text>
      </View>

      <View style={styles.center}>
        <Text style={[styles.timer, { color: colors.textMuted }]}>{formatElapsed(elapsedMs)}</Text>
        <Pressable
          onPress={onCatch}
          style={({ pressed }) => [
            styles.tap,
            { backgroundColor: colors.surface, borderColor: colors.border },
            pressed && { opacity: PRESSED_OPACITY },
          ]}
          accessibilityLabel="Caught it — log a drift"
          accessibilityHint="Tap each time you notice the behavior drifting"
        >
          <Animated.Text style={[styles.count, { color: colors.text, transform: [{ scale }] }]}>
            {catches}
          </Animated.Text>
          <Text style={[Type.bodyBold, { color: colors.accentText }]}>Caught it +1</Text>
        </Pressable>
        <Text style={[Type.caption, { color: colors.textMuted, marginTop: Space.lg, textAlign: 'center' }]}>
          {affirmation || 'Tap each time you notice the drift. Noticing is the win.'}
        </Text>
      </View>

      <View style={styles.footer}>
        <View style={styles.pausedNote}>
          <IconSymbol name="bell.fill" size={13} color={colors.textMuted} />
          <Text style={[Type.caption, { color: colors.textMuted }]}>
            Reminders paused during this session
          </Text>
        </View>
        <Pressable
          onPress={onEnd}
          style={({ pressed }) => [
            styles.primaryButton,
            { backgroundColor: colors.tint },
            pressed && { opacity: PRESSED_OPACITY },
          ]}
          accessibilityLabel="End focus session"
        >
          <Text style={[Type.bodyBold, { color: colors.textOnBrand }]}>End session</Text>
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
  pausedNote: { flexDirection: 'row', alignItems: 'center', gap: Space.xs },
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
