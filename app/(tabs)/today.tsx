import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useState, type ComponentProps } from 'react';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, Type, Space, Radius, PRESSED_OPACITY } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import useStore from '@/store/useStore';
import { generateUUID } from '@/utils/uuid';
import { dateKey } from '@/services/scheduler-core';
import { haptics } from '@/services/haptics';
import {
  enrollablePrograms,
  enrollableProgramById,
  resolveDay,
  exercisesForDay,
  standingExercisesForDay,
  isComplete,
  isDoneToday,
  completeCurrentDay,
  dayProgressLabel,
} from '@/services/program-engine';
import type { Exercise, InstrumentKind, ProgramContent, ProgramEnrollment } from '@/types';

type IconName = ComponentProps<typeof IconSymbol>['name'];
const INSTRUMENT_ICON: Record<InstrumentKind, IconName> = {
  timer: 'timer',
  tally: 'plus.circle.fill',
  checkbox: 'checkmark.circle.fill',
  journal: 'square.and.pencil',
  structured: 'list.bullet.rectangle.fill',
  rating: 'slider.horizontal.3',
  srs: 'square.stack.fill',
};

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

export default function TodayScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const programEnrollments = useStore((s) => s.programEnrollments);
  const addEnrollment = useStore((s) => s.addEnrollment);
  const updateEnrollment = useStore((s) => s.updateEnrollment);
  const addProgramDayLog = useStore((s) => s.addProgramDayLog);
  const [whyOpen, setWhyOpen] = useState<Record<string, boolean>>({});
  const toggleWhy = (id: string) => setWhyOpen((m) => ({ ...m, [id]: !m[id] }));

  const todayKey = dateKey(new Date());
  const active = programEnrollments.filter(
    (e) => e.status === 'active' && e.deletedAt == null,
  );

  const startProgram = async (programId: string) => {
    haptics.success();
    const now = Date.now();
    const enrollment: ProgramEnrollment = {
      id: generateUUID(),
      programId,
      startedAt: now,
      currentDay: 1,
      reminderTime: '09:00',
      status: 'active',
      completedDays: [],
      practicedDates: [],
      isPrimary: active.length === 0,
      createdAt: now,
      updatedAt: now,
    };
    await addEnrollment(enrollment);
  };

  const markDone = async (
    enrollment: ProgramEnrollment,
    content: ProgramContent,
    minimal = false,
  ) => {
    haptics.success();
    await addProgramDayLog({
      id: generateUUID(),
      enrollmentId: enrollment.id,
      day: enrollment.currentDay,
      completedAt: Date.now(),
      note: minimal ? '2-minute version' : undefined,
      updatedAt: Date.now(),
    });
    await updateEnrollment(completeCurrentDay(enrollment, content, todayKey));
  };

  const openTimer = (enrollment: ProgramEnrollment, exercise: Exercise, minimal = false) => {
    router.push({
      pathname: '/program-session',
      params: {
        enrollmentId: enrollment.id,
        targetMinutes: String(
          minimal ? 2 : (exercise.instrumentConfig?.targetMinutes ?? exercise.minutes),
        ),
        withTally: exercise.instrumentConfig?.withTally ? '1' : '0',
        minimal: minimal ? '1' : '0',
      },
    });
  };

  const padding = {
    paddingTop: insets.top + Space.lg,
    paddingBottom: insets.bottom + Space.xxl,
  };

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={[styles.content, padding]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[Type.caption, { color: colors.textMuted }]}>{greeting()}</Text>
      <Text style={[Type.h1, { color: colors.text, marginTop: Space.xxs }]}>Today</Text>

      {active.length === 0 ? (
        <View style={{ marginTop: Space.xl }}>
          <Text style={[Type.body, { color: colors.textMuted, marginBottom: Space.md }]}>
            You&apos;re not running a program yet. Pick a book to live.
          </Text>
          {enrollablePrograms().map((p) => (
            <Pressable
              key={p.id}
              onPress={() => startProgram(p.id)}
              style={({ pressed }) => [
                styles.card,
                { backgroundColor: colors.surface, borderColor: colors.border },
                pressed && { opacity: PRESSED_OPACITY },
              ]}
              accessibilityLabel={`Start ${p.title}`}
            >
              <Text style={[Type.bodyBold, { color: colors.text }]}>{p.title}</Text>
              <Text style={[Type.caption, { color: colors.textMuted, marginTop: Space.xxs }]}>
                {p.program.durationDays} days · {p.program.dailyMinutes} min/day ·{' '}
                {p.program.primaryInstrument}
              </Text>
              <Text style={[Type.caption, { color: colors.accentText, marginTop: Space.sm }]}>
                Start program →
              </Text>
            </Pressable>
          ))}
        </View>
      ) : (
        active.map((enrollment) => {
          const prog = enrollableProgramById(enrollment.programId);
          if (!prog) return null;
          const content = prog.program;
          const done = isDoneToday(enrollment, todayKey);

          if (isComplete(enrollment, content)) {
            return (
              <View
                key={enrollment.id}
                style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, marginTop: Space.xl }]}
              >
                <Text style={[Type.caption, { color: colors.accentText }]}>{prog.title}</Text>
                <Text style={[Type.h2, { color: colors.text, marginTop: Space.xs }]}>
                  Program complete
                </Text>
                <Text style={[Type.body, { color: colors.textMuted, marginTop: Space.xs }]}>
                  You ran all {content.durationDays} days. The method is yours now.
                </Text>
              </View>
            );
          }

          const dayExercises = exercisesForDay(content, enrollment.currentDay);
          const standing = standingExercisesForDay(content, enrollment.currentDay);
          const theme = resolveDay(content, enrollment.currentDay)?.theme;

          return (
            <View key={enrollment.id} style={{ marginTop: Space.xl }}>
              <View style={styles.progressRow}>
                <Text style={[Type.caption, { color: colors.accentText }]}>{prog.title}</Text>
                <Text style={[Type.caption, { color: colors.textMuted }]}>
                  {dayProgressLabel(enrollment, content)} · {enrollment.practicedDates.length} days practiced
                </Text>
              </View>

              {dayExercises.map((exercise, i) => (
                <View
                  key={`${enrollment.id}-${i}`}
                  style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
                >
                  {done ? (
                    <Text style={[Type.caption, { color: colors.textMuted }]}>
                      Tomorrow{theme ? ` · ${theme}` : ''}
                    </Text>
                  ) : theme ? (
                    <Text style={[Type.caption, { color: colors.accentText }]}>{theme}</Text>
                  ) : null}
                  <View style={[styles.exerciseHead, { marginTop: Space.xxs }]}>
                    <IconSymbol
                      name={INSTRUMENT_ICON[exercise.instrument]}
                      size={20}
                      color={colors.accentText}
                    />
                    <Text style={[Type.caption, { color: colors.textMuted }]}>
                      {exercise.minutes} min · {exercise.instrument}
                    </Text>
                  </View>
                  <Text style={[Type.body, { color: colors.text, marginTop: Space.sm }]}>
                    {exercise.prompt}
                  </Text>
                  <Pressable onPress={() => toggleWhy(enrollment.id)} hitSlop={8}>
                    <Text style={[Type.caption, { color: colors.accentText, marginTop: Space.sm }]}>
                      {whyOpen[enrollment.id] ? 'Hide context' : 'Why this?'}
                    </Text>
                  </Pressable>
                  {whyOpen[enrollment.id] ? (
                    <Text style={[Type.caption, { color: colors.textMuted, marginTop: Space.xxs }]}>
                      {prog.description}
                    </Text>
                  ) : null}

                  {done ? (
                    <View style={[styles.doneRow, { borderTopColor: colors.border }]}>
                      <IconSymbol name="checkmark.circle.fill" size={18} color={colors.accentText} />
                      <Text style={[Type.bodyBold, { color: colors.accentText }]}>Done for today</Text>
                    </View>
                  ) : (
                    <>
                      <Pressable
                        onPress={() =>
                          exercise.instrument === 'timer'
                            ? openTimer(enrollment, exercise)
                            : markDone(enrollment, content)
                        }
                        style={({ pressed }) => [
                          styles.button,
                          { backgroundColor: colors.tint },
                          pressed && { opacity: PRESSED_OPACITY },
                        ]}
                        accessibilityLabel={
                          exercise.instrument === 'timer' ? 'Start session' : 'Mark done'
                        }
                      >
                        <Text style={[Type.bodyBold, { color: colors.textOnBrand }]}>
                          {exercise.instrument === 'timer' ? 'Start session' : 'Mark done'}
                        </Text>
                      </Pressable>
                      <Pressable
                        onPress={() =>
                          exercise.instrument === 'timer'
                            ? openTimer(enrollment, exercise, true)
                            : markDone(enrollment, content, true)
                        }
                        hitSlop={8}
                        accessibilityLabel="Do the two-minute version"
                      >
                        <Text
                          style={[
                            Type.caption,
                            { color: colors.textMuted, textAlign: 'center', marginTop: Space.sm },
                          ]}
                        >
                          Short on time? Do the 2-minute version
                        </Text>
                      </Pressable>
                    </>
                  )}
                </View>
              ))}

              {standing.map((s, i) => (
                <View
                  key={`${enrollment.id}-standing-${i}`}
                  style={[styles.standingCard, { borderColor: colors.border }]}
                >
                  <IconSymbol name={INSTRUMENT_ICON[s.instrument]} size={16} color={colors.textMuted} />
                  <Text style={[Type.caption, { color: colors.textMuted, flex: 1 }]}>
                    Ongoing · {s.prompt}
                  </Text>
                </View>
              ))}

              {done ? (
                <Text style={[Type.caption, { color: colors.textMuted, marginTop: Space.md, textAlign: 'center' }]}>
                  Done for today. Come back tomorrow for Day {Math.min(enrollment.currentDay, content.durationDays)}.
                </Text>
              ) : null}
            </View>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: Space.xl, flexGrow: 1 },
  card: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Space.lg,
    marginBottom: Space.md,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Space.sm,
  },
  exerciseHead: { flexDirection: 'row', alignItems: 'center', gap: Space.xs },
  button: {
    marginTop: Space.lg,
    borderRadius: Radius.md,
    paddingVertical: Space.md,
    alignItems: 'center',
  },
  doneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.xs,
    marginTop: Space.lg,
    paddingTop: Space.md,
    borderTopWidth: 1,
  },
  standingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.xs,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderStyle: 'dashed',
    paddingVertical: Space.sm,
    paddingHorizontal: Space.md,
    marginBottom: Space.md,
  },
});
