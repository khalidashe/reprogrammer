import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { useState, useMemo, useCallback, type ComponentProps } from 'react';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, Type, Space, Radius, PRESSED_OPACITY } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import useStore from '@/store/useStore';
import { useIsPro } from '@/hooks/useIsPro';
import { useContentModals } from '@/components/library/content-modals-provider';
import { useFeedback } from '@/components/ui/feedback';
import { haptics } from '@/services/haptics';
import { generateUUID } from '@/utils/uuid';
import type { DayStatus } from '@/services/consistency';
import type { CoachActionKind } from '@/types';
import {
  buildWeeklyReview,
  formatWindowLabel,
  WEEK_DAYS,
  type BehaviorWeek,
} from '@/services/weekly-review';
import { countReflections } from '@/services/reflections';
import { buildCoachInsights, type CoachInsight, type CoachTone } from '@/services/coach';

/**
 * Weekly Review — REP-5 Phase 1. The pillar's centerpiece, built from existing
 * check-in data: per-behavior weekly picture, week-over-week delta, and the
 * note written on a hard day. Free for the live + prior week; earlier weeks are
 * a Pro feature (history depth gating).
 */
const FREE_WEEKS_BACK = 1;

const fmt = (n: number) => (Number.isInteger(n) ? String(n) : String(Math.round(n * 10) / 10));

const firstField = (fields?: Record<string, string>) => {
  if (!fields) return '';
  const v = Object.values(fields).find((x) => x && x.trim().length > 0);
  return v ? v.trim() : '';
};

export default function ReviewScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const { behaviors, checkIns, entries, prescriptions, addPrescription } = useStore();
  const { isPro } = useIsPro();
  const { openGuide, openProgram, openAdopt } = useContentModals();
  const { showToast } = useFeedback();
  const [weeksAgo, setWeeksAgo] = useState(0);

  const review = useMemo(
    () => buildWeeklyReview(behaviors, checkIns, entries, Date.now(), weeksAgo),
    [behaviors, checkIns, entries, weeksAgo]
  );
  const isLiveWeek = weeksAgo === 0;

  const atFreeEdge = !isPro && weeksAgo >= FREE_WEEKS_BACK;

  const goOlder = () => {
    if (!isPro && weeksAgo + 1 > FREE_WEEKS_BACK) {
      haptics.light();
      router.push('/paywall');
      return;
    }
    haptics.selection();
    setWeeksAgo((w) => w + 1);
  };
  const goNewer = () => {
    if (weeksAgo === 0) return;
    haptics.selection();
    setWeeksAgo((w) => Math.max(0, w - 1));
  };

  const dotColor = (s: DayStatus) =>
    s === 'yes'
      ? colors.tint
      : s === 'tried'
        ? colors.warning
        : s === 'no'
          ? colors.danger
          : colors.surfaceMuted;

  const overallDelta =
    review.totalPrevSuccessDays > 0
      ? Math.round(
          ((review.totalSuccessDays - review.totalPrevSuccessDays) /
            review.totalPrevSuccessDays) *
            100
        )
      : null;

  const hasBehaviors = review.behaviors.length > 0;
  const reflectionCount = useMemo(
    () => countReflections(behaviors, entries),
    [behaviors, entries]
  );
  const insights = useMemo(
    () => buildCoachInsights(review, isLiveWeek ? prescriptions : []),
    [review, prescriptions, isLiveWeek]
  );

  // Accept a prescription's "do": perform the action, and (when it's tied to a
  // behavior) record it so next week's review can check whether it helped.
  const handlePrescribe = useCallback(
    (ins: CoachInsight) => {
      const p = ins.prescription;
      if (!p) return;
      haptics.selection();
      switch (p.action) {
        case 'add_behavior':
          router.push('/create');
          break;
        case 'open_program':
          if (p.targetId) openProgram(p.targetId);
          break;
        case 'open_adopt':
          if (p.targetId) openAdopt(p.targetId);
          break;
        case 'open_guide':
          if (p.targetId) openGuide(p.targetId);
          break;
      }
      const alreadyTracking =
        !!p.behaviorId &&
        prescriptions.some((x) => x.status === 'active' && x.behaviorId === p.behaviorId);
      if (p.behaviorId && !alreadyTracking) {
        void addPrescription({
          id: generateUUID(),
          insightKind: ins.kind,
          behaviorId: p.behaviorId,
          action: p.action,
          targetId: p.targetId,
          baselineSuccessDays: p.baselineSuccessDays ?? 0,
          windowStart: review.window.start,
          prescribedAt: Date.now(),
          status: 'active',
          updatedAt: Date.now(),
        });
        showToast('Added to your plan — I’ll check back next week.');
      }
    },
    [router, openProgram, openAdopt, openGuide, prescriptions, addPrescription, showToast, review.window.start]
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      {/* Week navigator */}
      <View style={styles.nav}>
        <Pressable
          onPress={goOlder}
          hitSlop={8}
          style={({ pressed }) => [styles.navButton, pressed && { opacity: PRESSED_OPACITY }]}
          accessibilityRole="button"
          accessibilityLabel="Previous week"
        >
          <IconSymbol name="chevron.left" size={20} color={colors.textMuted} />
        </Pressable>
        <View style={styles.navLabelWrap}>
          <Text style={[styles.navLabel, { color: colors.text }]}>
            {weeksAgo === 0
              ? 'This week'
              : weeksAgo === 1
                ? 'Last week'
                : `${weeksAgo} weeks ago`}
          </Text>
          <Text style={[styles.navSub, { color: colors.textMuted }]}>
            {formatWindowLabel(review.window)}
          </Text>
        </View>
        <Pressable
          onPress={goNewer}
          hitSlop={8}
          disabled={weeksAgo === 0}
          style={({ pressed }) => [
            styles.navButton,
            pressed && { opacity: PRESSED_OPACITY },
            weeksAgo === 0 && { opacity: 0.3 },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Next week"
        >
          <IconSymbol name="chevron.right" size={20} color={colors.textMuted} />
        </Pressable>
      </View>

      {!hasBehaviors ? (
        <View style={[styles.emptyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>Nothing to review yet</Text>
          <Text style={[styles.emptyBody, { color: colors.textMuted }]}>
            Add a behavior and check in through the week — your review fills in here.
          </Text>
          <Pressable
            onPress={() => router.push('/create')}
            style={({ pressed }) => [
              styles.emptyCta,
              { backgroundColor: colors.tint },
              pressed && { opacity: PRESSED_OPACITY },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Add a behavior"
          >
            <Text style={[styles.emptyCtaText, { color: colors.textOnBrand }]}>Add a behavior</Text>
          </Pressable>
        </View>
      ) : (
        <>
          {/* Headline */}
          <View style={[styles.headline, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.headlineNumber, { color: colors.text }]}>
              {review.totalSuccessDays}
            </Text>
            <Text style={[styles.headlineLabel, { color: colors.textMuted }]}>
              good {review.totalSuccessDays === 1 ? 'day' : 'days'} · {review.totalReps}{' '}
              {review.totalReps === 1 ? 'rep' : 'reps'}
            </Text>
            {overallDelta !== null ? (
              <Text
                style={[
                  styles.headlineDelta,
                  { color: overallDelta >= 0 ? colors.accentText : colors.textMuted },
                ]}
              >
                {overallDelta >= 0 ? '+' : ''}
                {overallDelta}% vs last week
              </Text>
            ) : (
              <Text style={[styles.headlineDelta, { color: colors.textMuted }]}>
                {weeksAgo === 0 ? 'Your baseline week' : ' '}
              </Text>
            )}
          </View>

          {insights.length > 0 ? (
            <CoachCard
              insights={insights}
              colors={colors}
              live={isLiveWeek}
              onOpenGuide={openGuide}
              onPrescribe={handlePrescribe}
            />
          ) : null}

          {review.behaviors.map((row) => (
            <BehaviorReviewCard key={row.behaviorId} row={row} colors={colors} dotColor={dotColor} />
          ))}

          {reflectionCount > 0 ? (
            <Pressable
              onPress={() => {
                haptics.selection();
                router.push('/reflections');
              }}
              style={({ pressed }) => [
                styles.reflectionsLink,
                { backgroundColor: colors.surface, borderColor: colors.border },
                pressed && { opacity: PRESSED_OPACITY },
              ]}
              accessibilityRole="button"
              accessibilityLabel={`Search your reflections, ${reflectionCount} total`}
            >
              <IconSymbol name="note.text" size={16} color={colors.accentText} />
              <Text style={[styles.reflectionsLinkText, { color: colors.text }]}>
                Your reflections
              </Text>
              <Text style={[styles.reflectionsLinkCount, { color: colors.textMuted }]}>
                {reflectionCount}
              </Text>
              <IconSymbol name="chevron.right" size={16} color={colors.textMuted} />
            </Pressable>
          ) : null}

          {atFreeEdge ? (
            <View style={styles.proHintRow}>
              <IconSymbol name="lock.fill" size={12} color={colors.textMuted} />
              <Text style={[styles.proHint, { color: colors.textMuted }]}>
                Earlier weeks are a Pro feature.
              </Text>
            </View>
          ) : null}
        </>
      )}
    </ScrollView>
  );
}

function coachIconFor(kind: CoachInsight['kind']): ComponentProps<typeof IconSymbol>['name'] {
  switch (kind) {
    case 'momentum':
      return 'flame.fill';
    case 'showed_up':
    case 'loop_win':
      return 'checkmark';
    case 'regression':
    case 'loop_followup':
      return 'book.fill';
    default:
      return 'sparkles';
  }
}

function ctaIconFor(action: CoachActionKind): ComponentProps<typeof IconSymbol>['name'] {
  switch (action) {
    case 'add_behavior':
      return 'plus';
    case 'open_program':
      return 'square.stack.fill';
    case 'open_adopt':
      return 'plus.circle.fill';
    case 'open_guide':
      return 'book.fill';
  }
}

function coachTone(tone: CoachTone, colors: typeof Colors.dark) {
  return tone === 'support'
    ? { fg: colors.warning, bg: colors.warningSoft }
    : { fg: colors.accentText, bg: colors.tintSoft };
}

function CoachCard({
  insights,
  colors,
  live,
  onOpenGuide,
  onPrescribe,
}: {
  insights: CoachInsight[];
  colors: typeof Colors.dark;
  live: boolean;
  onOpenGuide: (guideId: string) => void;
  onPrescribe: (insight: CoachInsight) => void;
}) {
  return (
    <View style={[styles.coachCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.coachHeader}>
        <IconSymbol name="sparkles" size={14} color={colors.accentText} />
        <Text style={[styles.coachHeaderText, { color: colors.textMuted }]}>Coach</Text>
      </View>
      {insights.map((ins, i) => {
        const tone = coachTone(ins.tone, colors);
        const tappable = !!ins.guideId;
        const cta = live ? ins.prescription : undefined;
        return (
          <Pressable
            key={ins.id}
            onPress={tappable ? () => onOpenGuide(ins.guideId!) : undefined}
            accessibilityRole={tappable ? 'button' : undefined}
            accessibilityLabel={
              tappable ? `${ins.title}. ${ins.body} Tap to read more.` : `${ins.title}. ${ins.body}`
            }
            style={({ pressed }) => [
              styles.coachRow,
              i > 0 && { borderTopColor: colors.border, borderTopWidth: StyleSheet.hairlineWidth },
              tappable && pressed && { opacity: PRESSED_OPACITY },
            ]}
          >
            <View style={[styles.coachIcon, { backgroundColor: tone.bg }]}>
              <IconSymbol name={coachIconFor(ins.kind)} size={15} color={tone.fg} />
            </View>
            <View style={styles.coachBody}>
              <Text style={[styles.coachTitle, { color: colors.text }]}>{ins.title}</Text>
              <Text style={[styles.coachText, { color: colors.textMuted }]}>{ins.body}</Text>
              {cta ? (
                <Pressable
                  onPress={() => onPrescribe(ins)}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel={cta.label}
                  style={({ pressed }) => [
                    styles.coachCta,
                    { backgroundColor: colors.tintSoft },
                    pressed && { opacity: PRESSED_OPACITY },
                  ]}
                >
                  <IconSymbol name={ctaIconFor(cta.action)} size={13} color={colors.accentText} />
                  <Text style={[styles.coachCtaText, { color: colors.accentText }]}>{cta.label}</Text>
                  <IconSymbol name="chevron.right" size={12} color={colors.accentText} />
                </Pressable>
              ) : null}
            </View>
            {tappable ? (
              <IconSymbol name="chevron.right" size={15} color={colors.textMuted} />
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}

function BehaviorReviewCard({
  row,
  colors,
  dotColor,
}: {
  row: BehaviorWeek;
  colors: typeof Colors.dark;
  dotColor: (s: DayStatus) => string;
}) {
  const isEliminate = row.kind === 'eliminate';
  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.cardHeader}>
        <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={1}>
          {row.title}
        </Text>
        <View
          style={[
            styles.kindPill,
            { backgroundColor: isEliminate ? colors.dangerSoft : colors.tintSoft },
          ]}
        >
          <Text style={[styles.kindPillText, { color: isEliminate ? colors.danger : colors.accentText }]}>
            {isEliminate ? 'Eliminate' : 'Adopt'}
          </Text>
        </View>
      </View>

      {/* Week strip */}
      <View style={styles.strip}>
        {row.dayStatuses.map((s, i) => (
          <View key={i} style={[styles.dot, { backgroundColor: dotColor(s) }]} />
        ))}
      </View>

      {/* Stats row */}
      <View style={styles.statRow}>
        <Text style={[styles.statMain, { color: colors.text }]}>
          {row.successDays}/{WEEK_DAYS} days
        </Text>
        {row.deltaPct !== null ? (
          <Text
            style={[
              styles.statDelta,
              { color: row.deltaPct >= 0 ? colors.accentText : colors.textMuted },
            ]}
          >
            {row.deltaPct >= 0 ? '+' : ''}
            {row.deltaPct}%
          </Text>
        ) : null}
        <View style={styles.statSpacer} />
        {row.streak && row.streak > 0 ? (
          <View style={styles.statChip}>
            <IconSymbol name="flame.fill" size={13} color={colors.warning} />
            <Text style={[styles.statChipText, { color: colors.textMuted }]}>{row.streak}</Text>
          </View>
        ) : null}
        <View style={styles.statChip}>
          <IconSymbol name="sparkles" size={12} color={colors.accentText} />
          <Text style={[styles.statChipText, { color: colors.textMuted }]}>Lvl {row.level}</Text>
        </View>
      </View>

      {row.capture ? (
        <View style={[styles.captureBlock, { borderTopColor: colors.border }]}>
          <View style={styles.captureHeader}>
            <Text style={[styles.captureTitle, { color: colors.text }]}>{row.capture.label}</Text>
            {row.capture.deltaPct !== null ? (
              <Text
                style={[
                  styles.captureDelta,
                  { color: row.capture.improved ? colors.accentText : colors.textMuted },
                ]}
              >
                {row.capture.deltaPct >= 0 ? '+' : ''}
                {row.capture.deltaPct}%
              </Text>
            ) : null}
          </View>
          <CaptureBars daily={row.capture.daily} colors={colors} />
          <Text style={[styles.captureMeta, { color: colors.textMuted }]}>
            {row.capture.type === 'metric'
              ? `${fmt(row.capture.total)}${row.capture.unit ? ' ' + row.capture.unit : ''} · avg ${fmt(row.capture.avg)}/logged day`
              : row.capture.type === 'template'
                ? `${row.capture.count} ${row.capture.count === 1 ? 'entry' : 'entries'} this week`
                : row.capture.type === 'reflection'
                  ? `${row.capture.count} ${row.capture.count === 1 ? 'reflection' : 'reflections'} this week`
                  : `${fmt(row.capture.total)} total this week`}
          </Text>
          {(row.capture.type === 'template' || row.capture.type === 'reflection') &&
          firstField(row.capture.last?.fields) ? (
            <Text style={[styles.captureEntry, { color: colors.text }]} numberOfLines={2}>
              “{firstField(row.capture.last?.fields)}”
            </Text>
          ) : null}
        </View>
      ) : null}

      {row.hardestNote ? (
        <View style={[styles.noteCard, { borderColor: colors.border }]}>
          <Text style={[styles.noteLabel, { color: colors.textMuted }]}>When it was hard, you wrote</Text>
          <Text style={[styles.noteText, { color: colors.text }]}>“{row.hardestNote.text}”</Text>
        </View>
      ) : null}
    </View>
  );
}

function CaptureBars({ daily, colors }: { daily: number[]; colors: typeof Colors.dark }) {
  const max = Math.max(1, ...daily);
  return (
    <View style={styles.bars}>
      {daily.map((v, i) => (
        <View key={i} style={styles.barTrack}>
          <View
            style={[
              styles.bar,
              {
                height: `${Math.max(4, (v / max) * 100)}%`,
                backgroundColor: v > 0 ? colors.tint : colors.surfaceMuted,
              },
            ]}
          />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    padding: Space.xl,
    paddingBottom: Space.xxxl,
    gap: Space.md,
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
  },
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Space.xs,
  },
  navButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  navLabelWrap: { flex: 1, alignItems: 'center' },
  navLabel: { ...Type.bodyBold, fontWeight: '700' },
  navSub: { ...Type.micro, marginTop: 2 },

  emptyCard: {
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Space.xl,
    alignItems: 'center',
    gap: Space.sm,
  },
  emptyTitle: { ...Type.bodyBold, fontWeight: '700' },
  emptyBody: { ...Type.caption, textAlign: 'center' },
  emptyCta: {
    marginTop: Space.sm,
    paddingVertical: Space.md,
    paddingHorizontal: Space.xl,
    borderRadius: Radius.md,
    minHeight: 44,
    justifyContent: 'center',
  },
  emptyCtaText: { ...Type.bodyBold, fontWeight: '700' },

  headline: {
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Space.xl,
    alignItems: 'center',
    gap: Space.xxs,
  },
  headlineNumber: { ...Type.display2, fontSize: 44, fontWeight: '800' },
  headlineLabel: { ...Type.body },
  headlineDelta: { ...Type.caption, fontWeight: '600', marginTop: Space.xxs },

  card: {
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Space.lg,
    gap: Space.sm,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: Space.sm },
  cardTitle: { ...Type.bodyBold, fontWeight: '700', flex: 1 },
  kindPill: { paddingHorizontal: Space.sm, paddingVertical: 3, borderRadius: Radius.sm },
  kindPillText: { ...Type.micro, letterSpacing: 0 },

  strip: { flexDirection: 'row', gap: Space.xs },
  dot: { flex: 1, height: 10, borderRadius: Radius.sm },

  statRow: { flexDirection: 'row', alignItems: 'center', gap: Space.sm },
  statMain: { ...Type.bodyBold, fontWeight: '700' },
  statDelta: { ...Type.caption, fontWeight: '700' },
  statSpacer: { flex: 1 },
  statChip: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  statChipText: { ...Type.micro, letterSpacing: 0 },

  noteCard: {
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Space.md,
    gap: Space.xxs,
    marginTop: Space.xxs,
  },
  noteLabel: { ...Type.micro, textTransform: 'uppercase', letterSpacing: 1 },
  noteText: { ...Type.body, fontStyle: 'italic' },

  captureBlock: { borderTopWidth: 1, paddingTop: Space.sm, gap: Space.xs, marginTop: Space.xxs },
  captureHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  captureTitle: { ...Type.caption, fontWeight: '700' },
  captureDelta: { ...Type.caption, fontWeight: '700' },
  captureMeta: { ...Type.micro },
  captureEntry: { ...Type.caption, fontStyle: 'italic' },
  bars: { flexDirection: 'row', alignItems: 'flex-end', gap: Space.xs, height: 36 },
  barTrack: { flex: 1, height: '100%', justifyContent: 'flex-end' },
  bar: { width: '100%', borderRadius: Radius.sm, minHeight: 3 },

  coachCard: {
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Space.lg,
    gap: Space.xs,
  },
  coachHeader: { flexDirection: 'row', alignItems: 'center', gap: Space.xs, marginBottom: Space.xxs },
  coachHeaderText: { ...Type.micro, textTransform: 'uppercase', letterSpacing: 1, fontWeight: '700' },
  coachRow: { flexDirection: 'row', alignItems: 'center', gap: Space.md, paddingVertical: Space.sm },
  coachIcon: {
    width: 30,
    height: 30,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coachBody: { flex: 1, gap: 2 },
  coachTitle: { ...Type.bodyBold, fontWeight: '700' },
  coachText: { ...Type.caption },
  coachCta: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: Space.xs,
    paddingHorizontal: Space.sm,
    paddingVertical: Space.xs,
    borderRadius: Radius.pill,
    marginTop: Space.xs,
  },
  coachCtaText: { ...Type.micro, fontWeight: '700', letterSpacing: 0 },

  reflectionsLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.sm,
    borderWidth: 1,
    borderRadius: Radius.lg,
    paddingHorizontal: Space.lg,
    paddingVertical: Space.md,
    minHeight: 52,
  },
  reflectionsLinkText: { ...Type.bodyBold, flex: 1 },
  reflectionsLinkCount: { ...Type.body },

  proHintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Space.xs,
    paddingTop: Space.sm,
  },
  proHint: { ...Type.micro },
});
