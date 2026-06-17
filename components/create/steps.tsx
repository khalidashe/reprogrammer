/**
 * Presentational steps + primitives for the guided create/edit flow (REP-37).
 * State lives in the orchestrator (`app/create.tsx`); each step renders a slice
 * of it and calls `update`. Kept calm and single-purpose per the Atoms north star.
 */
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Platform,
} from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import {
  Type,
  Space,
  Radius,
  PRESSED_OPACITY,
  controlSelected,
  type ThemeColors,
} from '@/constants/theme';
import { haptics } from '@/services/haptics';
import { IconSymbol } from '@/components/ui/icon-symbol';
import type { Behavior, BehaviorKind, CaptureTemplateId, CaptureType, Domain } from '@/types';
import { CAPTURE_TEMPLATES } from '@/services/capture-templates';
import {
  PRACTICE_BASES,
  practiceBaseLabel,
  type AdoptTemplate,
  type PracticeBase,
} from '@/services/library-content';
import { CADENCES, type CadenceId } from '@/services/cadence';
import { hhmmToDate, formatTimeForDisplay } from '@/utils/time';

const DAY_LETTERS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const BASE_ICON: Record<PracticeBase, ComponentIconName> = {
  mental: 'brain.head.profile',
  physical: 'figure.walk',
  learning: 'book.fill',
};
type ComponentIconName = 'brain.head.profile' | 'figure.walk' | 'book.fill';

export type StepId =
  | 'start'
  | 'kind'
  | 'what'
  | 'instead'
  | 'when'
  | 'cadence'
  | 'track'
  | 'review';

export interface WizardState {
  kind: BehaviorKind;
  title: string;
  pingMessage: string;
  practiceBases: PracticeBase[];
  domain?: Domain;
  libraryGuideId?: string;
  startTime: string;
  endTime: string;
  activeDays: number[];
  cadenceId: CadenceId;
  /** Eliminate only: an existing Adopt behavior to do instead… */
  replacementStateId?: string;
  /** …or a brand-new Adopt to create inline on save. */
  newReplacementTitle: string;
  /** Capture authoring (REP-5 Phase 2–3). */
  captureType: 'none' | CaptureType;
  captureLabel: string;
  captureUnit: string;
  captureDirection: 'up' | 'down';
  captureTemplateId: CaptureTemplateId;
}

type Update = (patch: Partial<WizardState>) => void;

/* ── shared primitives ──────────────────────────────────────────────────── */

export function ProgressDots({
  total,
  current,
  colors,
}: {
  total: number;
  current: number;
  colors: ThemeColors;
}) {
  return (
    <View style={styles.dots} accessibilityLabel={`Step ${current + 1} of ${total}`}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.dot,
            {
              backgroundColor: i === current ? colors.tint : colors.surfaceMuted,
              width: i === current ? 20 : 8,
            },
          ]}
        />
      ))}
    </View>
  );
}

function StepScaffold({
  title,
  subtitle,
  colors,
  children,
}: {
  title: string;
  subtitle?: string;
  colors: ThemeColors;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.step}>
      <Text style={[styles.stepTitle, { color: colors.text }]}>{title}</Text>
      {subtitle ? (
        <Text style={[styles.stepSubtitle, { color: colors.textMuted }]}>{subtitle}</Text>
      ) : null}
      <View style={styles.stepBody}>{children}</View>
    </View>
  );
}

function SelectCard({
  title,
  description,
  selected,
  mode,
  onPress,
  colors,
}: {
  title: string;
  description?: string;
  selected?: boolean;
  mode: 'select' | 'nav';
  onPress: () => void;
  colors: ThemeColors;
}) {
  return (
    <Pressable
      onPress={() => {
        haptics.selection();
        onPress();
      }}
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected }}
      style={({ pressed }) => [
        styles.selectCard,
        selected
          ? { ...controlSelected(colors), borderWidth: 2 }
          : { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 },
        pressed && { opacity: PRESSED_OPACITY },
      ]}
    >
      <View style={{ flex: 1 }}>
        <Text style={[styles.selectCardTitle, { color: colors.text }]}>{title}</Text>
        {description ? (
          <Text style={[styles.selectCardDesc, { color: colors.textMuted }]}>{description}</Text>
        ) : null}
      </View>
      {mode === 'nav' ? (
        <IconSymbol name="chevron.right" size={18} color={colors.textMuted} />
      ) : selected ? (
        <IconSymbol name="checkmark" size={20} color={colors.accentText} />
      ) : null}
    </Pressable>
  );
}

function Chip({
  label,
  selected,
  onPress,
  colors,
  icon,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  colors: ThemeColors;
  icon?: ComponentIconName;
}) {
  return (
    <Pressable
      onPress={() => {
        haptics.selection();
        onPress();
      }}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={({ pressed }) => [
        styles.chip,
        selected
          ? controlSelected(colors)
          : { backgroundColor: colors.surfaceMuted, borderColor: colors.border },
        pressed && { opacity: PRESSED_OPACITY },
      ]}
    >
      {icon ? (
        <IconSymbol
          name={icon}
          size={14}
          color={selected ? colors.accentText : colors.textMuted}
        />
      ) : null}
      <Text style={[styles.chipText, { color: selected ? colors.accentText : colors.text }]}>
        {label}
      </Text>
    </Pressable>
  );
}

function FieldInput(props: {
  value: string;
  onChangeText: (t: string) => void;
  placeholder: string;
  colors: ThemeColors;
  multiline?: boolean;
  accessibilityLabel?: string;
  autoFocus?: boolean;
}) {
  const { colors, multiline, ...rest } = props;
  return (
    <TextInput
      {...rest}
      style={[
        styles.input,
        multiline && styles.inputMultiline,
        { color: colors.text, backgroundColor: colors.surfaceMuted, borderColor: colors.border },
      ]}
      placeholderTextColor={colors.textMuted}
      multiline={multiline}
    />
  );
}

/* ── steps ──────────────────────────────────────────────────────────────── */

export function StartStep({
  featuredAdopt,
  onPickTemplate,
  onBuildOwn,
  colors,
}: {
  featuredAdopt: AdoptTemplate[];
  onPickTemplate: (t: AdoptTemplate) => void;
  onBuildOwn: () => void;
  colors: ThemeColors;
}) {
  return (
    <StepScaffold
      title="What are you reprogramming?"
      subtitle="Start from a popular practice, or build your own from scratch."
      colors={colors}
    >
      <SelectCard
        title="Build my own"
        description="A blank behavior, your way"
        mode="nav"
        onPress={onBuildOwn}
        colors={colors}
      />
      <Text style={[styles.groupLabel, { color: colors.textMuted }]}>Popular to adopt</Text>
      {featuredAdopt.map((t) => (
        <SelectCard
          key={t.id}
          title={t.title}
          description={t.pingMessage}
          mode="nav"
          onPress={() => onPickTemplate(t)}
          colors={colors}
        />
      ))}
    </StepScaffold>
  );
}

export function KindStep({
  state,
  update,
  colors,
}: {
  state: WizardState;
  update: Update;
  colors: ThemeColors;
}) {
  return (
    <StepScaffold
      title="Adopt or eliminate?"
      subtitle="Build a good behavior, or replace an automatic bad one with a good one."
      colors={colors}
    >
      <SelectCard
        title="Adopt a behavior"
        description="A good behavior you want to make automatic"
        mode="select"
        selected={state.kind === 'adopt'}
        onPress={() => update({ kind: 'adopt' })}
        colors={colors}
      />
      <SelectCard
        title="Eliminate a behavior"
        description="An automatic bad behavior to catch and replace"
        mode="select"
        selected={state.kind === 'eliminate'}
        onPress={() => update({ kind: 'eliminate' })}
        colors={colors}
      />
    </StepScaffold>
  );
}

export function WhatStep({
  state,
  update,
  colors,
}: {
  state: WizardState;
  update: Update;
  colors: ThemeColors;
}) {
  const isAdopt = state.kind === 'adopt';
  const toggleBase = (b: PracticeBase) => {
    const has = state.practiceBases.includes(b);
    if (has) {
      update({ practiceBases: state.practiceBases.filter((x) => x !== b) });
    } else {
      // cap at two bases; drop the oldest when a third is added
      const next = [...state.practiceBases, b].slice(-2);
      update({ practiceBases: next });
    }
  };

  return (
    <StepScaffold
      title={isAdopt ? 'Name the behavior' : 'Name the behavior to catch'}
      subtitle={
        isAdopt
          ? 'What do you want to practice? You can fine-tune the reminder wording too.'
          : 'What automatic behavior do you want to notice and interrupt?'
      }
      colors={colors}
    >
      <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>Label</Text>
      <FieldInput
        value={state.title}
        onChangeText={(t) => update({ title: t })}
        placeholder={isAdopt ? 'e.g. Stand tall' : 'e.g. Slouching'}
        colors={colors}
        accessibilityLabel="Behavior label"
        autoFocus
      />

      <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>Reminder (optional)</Text>
      <FieldInput
        value={state.pingMessage}
        onChangeText={(t) => update({ pingMessage: t })}
        placeholder={state.title ? `Default: "${state.title}"` : 'What should the nudge say?'}
        colors={colors}
        multiline
        accessibilityLabel="Reminder message"
      />

      {isAdopt ? (
        <>
          <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>Type (optional)</Text>
          <View style={styles.chipRow}>
            {PRACTICE_BASES.map((b) => (
              <Chip
                key={b}
                label={practiceBaseLabel(b)}
                icon={BASE_ICON[b]}
                selected={state.practiceBases.includes(b)}
                onPress={() => toggleBase(b)}
                colors={colors}
              />
            ))}
          </View>
        </>
      ) : null}
    </StepScaffold>
  );
}

export function TrackStep({
  state,
  update,
  colors,
}: {
  state: WizardState;
  update: Update;
  colors: ThemeColors;
}) {
  const setType = (t: 'none' | CaptureType) =>
    update({ captureType: t, ...(t === 'counter' ? { captureUnit: '' } : {}) });
  return (
    <StepScaffold
      title="Track a number"
      subtitle="Optional. Capture a count or metric at each check-in and watch it trend in your weekly review."
      colors={colors}
    >
      <SelectCard
        title="No tracking"
        description="Just check in — yes, tried, or snooze."
        mode="select"
        selected={state.captureType === 'none'}
        onPress={() => setType('none')}
        colors={colors}
      />
      <SelectCard
        title="Counter"
        description="Tally something — pickups, urges resisted, drifts."
        mode="select"
        selected={state.captureType === 'counter'}
        onPress={() => setType('counter')}
        colors={colors}
      />
      <SelectCard
        title="Metric"
        description="Log a number — minutes, reps, words."
        mode="select"
        selected={state.captureType === 'metric'}
        onPress={() => setType('metric')}
        colors={colors}
      />
      <SelectCard
        title="Guided entry"
        description="Fill a short structured form — CBT, OFNR, Three good things."
        mode="select"
        selected={state.captureType === 'template'}
        onPress={() => setType('template')}
        colors={colors}
      />
      {state.captureType === 'template' ? (
        <>
          <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>Which form?</Text>
          {CAPTURE_TEMPLATES.map((t) => (
            <SelectCard
              key={t.id}
              title={t.title}
              description={t.blurb}
              mode="select"
              selected={state.captureTemplateId === t.id}
              onPress={() => update({ captureTemplateId: t.id })}
              colors={colors}
            />
          ))}
        </>
      ) : state.captureType !== 'none' ? (
        <>
          <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>
            What are you tracking?
          </Text>
          <FieldInput
            value={state.captureLabel}
            onChangeText={(t) => update({ captureLabel: t })}
            placeholder={state.captureType === 'counter' ? 'e.g. Pickups' : 'e.g. Deep minutes'}
            colors={colors}
            accessibilityLabel="What you are tracking"
          />
          {state.captureType === 'metric' ? (
            <>
              <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>Unit (optional)</Text>
              <FieldInput
                value={state.captureUnit}
                onChangeText={(t) => update({ captureUnit: t })}
                placeholder="e.g. min, reps, words"
                colors={colors}
                accessibilityLabel="Unit"
              />
            </>
          ) : null}
          <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>Better when it goes</Text>
          <View style={styles.chipRow}>
            <Chip
              label="Up"
              selected={state.captureDirection === 'up'}
              onPress={() => update({ captureDirection: 'up' })}
              colors={colors}
            />
            <Chip
              label="Down"
              selected={state.captureDirection === 'down'}
              onPress={() => update({ captureDirection: 'down' })}
              colors={colors}
            />
          </View>
        </>
      ) : null}
    </StepScaffold>
  );
}

export function InsteadStep({
  state,
  update,
  adoptOptions,
  colors,
}: {
  state: WizardState;
  update: Update;
  adoptOptions: Behavior[];
  colors: ThemeColors;
}) {
  return (
    <StepScaffold
      title="What will you do instead?"
      subtitle="Eliminating works by replacing — pick a good behavior to reach for, or name a new one."
      colors={colors}
    >
      {adoptOptions.length > 0 ? (
        <>
          <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>
            Pick an existing behavior
          </Text>
          <View style={styles.chipRow}>
            {adoptOptions.map((b) => (
              <Chip
                key={b.id}
                label={b.title}
                selected={state.replacementStateId === b.id}
                onPress={() =>
                  update({ replacementStateId: b.id, newReplacementTitle: '' })
                }
                colors={colors}
              />
            ))}
          </View>
          <Text style={[styles.orLabel, { color: colors.textMuted }]}>or create a new one</Text>
        </>
      ) : (
        <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>Create the replacement</Text>
      )}
      <FieldInput
        value={state.newReplacementTitle}
        onChangeText={(t) => update({ newReplacementTitle: t, replacementStateId: undefined })}
        placeholder="e.g. Stand tall"
        colors={colors}
        accessibilityLabel="New replacement behavior"
      />
      <Text style={[styles.hint, { color: colors.textMuted }]}>
        It’ll share this behavior’s schedule and you can fine-tune it later.
      </Text>
    </StepScaffold>
  );
}

export function WhenStep({
  state,
  update,
  pickerOpen,
  onOpenPicker,
  onTimeChange,
  colors,
}: {
  state: WizardState;
  update: Update;
  pickerOpen: 'start' | 'end' | null;
  onOpenPicker: (which: 'start' | 'end' | null) => void;
  onTimeChange: (which: 'start' | 'end') => (e: DateTimePickerEvent, d?: Date) => void;
  colors: ThemeColors;
}) {
  const toggleDay = (day: number) =>
    update({
      activeDays: state.activeDays.includes(day)
        ? state.activeDays.filter((d) => d !== day)
        : [...state.activeDays, day],
    });

  const renderChip = (which: 'start' | 'end', value: string) => {
    const isOpen = pickerOpen === which;
    const display = formatTimeForDisplay(value);
    return (
      <Pressable
        onPress={() => {
          haptics.selection();
          onOpenPicker(isOpen ? null : which);
        }}
        style={({ pressed }) => [
          styles.timeChip,
          isOpen
            ? controlSelected(colors)
            : { backgroundColor: colors.surfaceMuted, borderColor: colors.border },
          pressed && { opacity: PRESSED_OPACITY },
        ]}
        accessibilityRole="button"
        accessibilityLabel={`${which === 'start' ? 'From' : 'To'} ${display.time} ${display.period}`}
      >
        <Text style={[styles.timeChipText, { color: isOpen ? colors.accentText : colors.text }]}>
          {display.time}
        </Text>
        <Text
          style={[styles.timeChipPeriod, { color: isOpen ? colors.accentText : colors.textMuted }]}
        >
          {display.period}
        </Text>
      </Pressable>
    );
  };

  return (
    <StepScaffold
      title="When should it nudge you?"
      subtitle="Reminders only fire inside this window, on the days you choose."
      colors={colors}
    >
      <View style={styles.timeBlock}>
        <View style={styles.timeColumn}>
          <Text style={[styles.timeColumnLabel, { color: colors.textMuted }]}>From</Text>
          {renderChip('start', state.startTime)}
        </View>
        <Text style={[styles.timeArrow, { color: colors.textMuted }]}>→</Text>
        <View style={styles.timeColumn}>
          <Text style={[styles.timeColumnLabel, { color: colors.textMuted }]}>To</Text>
          {renderChip('end', state.endTime)}
        </View>
      </View>

      {pickerOpen ? (
        <View style={styles.pickerWrapper}>
          <DateTimePicker
            value={hhmmToDate(pickerOpen === 'start' ? state.startTime : state.endTime)}
            mode="time"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onTimeChange(pickerOpen)}
          />
        </View>
      ) : null}

      <Text style={[styles.fieldLabel, { color: colors.textMuted, marginTop: Space.lg }]}>
        Repeat
      </Text>
      <View style={styles.dayRow}>
        {DAY_LETTERS.map((letter, index) => {
          const active = state.activeDays.includes(index);
          return (
            <Pressable
              key={index}
              onPress={() => {
                haptics.selection();
                toggleDay(index);
              }}
              style={({ pressed }) => [
                styles.dayPill,
                active
                  ? controlSelected(colors)
                  : { backgroundColor: colors.surfaceMuted, borderColor: colors.border },
                pressed && { opacity: PRESSED_OPACITY },
              ]}
              accessibilityRole="button"
              accessibilityLabel={`${DAY_NAMES[index]} ${active ? 'active' : 'inactive'}`}
              accessibilityState={{ selected: active }}
            >
              <Text style={[styles.dayPillText, { color: active ? colors.accentText : colors.text }]}>
                {letter}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </StepScaffold>
  );
}

export function CadenceStep({
  state,
  update,
  previewText,
  colors,
}: {
  state: WizardState;
  update: Update;
  previewText: string;
  colors: ThemeColors;
}) {
  return (
    <StepScaffold
      title="How often should it nudge you?"
      subtitle="Nudges spread out on their own as your streak grows — this just sets the starting rhythm."
      colors={colors}
    >
      {CADENCES.map((c) => (
        <SelectCard
          key={c.id}
          title={c.label}
          description={c.description}
          mode="select"
          selected={state.cadenceId === c.id}
          onPress={() => update({ cadenceId: c.id })}
          colors={colors}
        />
      ))}
      <Text style={[styles.preview, { color: colors.textMuted }]}>{previewText}</Text>
    </StepScaffold>
  );
}

export function ReviewStep({
  state,
  adoptOptions,
  previewText,
  onJump,
  colors,
}: {
  state: WizardState;
  adoptOptions: Behavior[];
  previewText: string;
  onJump: (step: StepId) => void;
  colors: ThemeColors;
}) {
  const cadence = CADENCES.find((c) => c.id === state.cadenceId);
  const replacement =
    state.replacementStateId
      ? adoptOptions.find((b) => b.id === state.replacementStateId)?.title
      : state.newReplacementTitle.trim()
        ? `${state.newReplacementTitle.trim()} (new)`
        : '—';

  const daySummary = summarizeDays(state.activeDays);

  const Row = ({ label, value, step }: { label: string; value: string; step: StepId }) => (
    <Pressable
      onPress={() => onJump(step)}
      style={({ pressed }) => [
        styles.reviewRow,
        { borderBottomColor: colors.border },
        pressed && { opacity: PRESSED_OPACITY },
      ]}
      accessibilityRole="button"
      accessibilityLabel={`Edit ${label}`}
    >
      <Text style={[styles.reviewLabel, { color: colors.textMuted }]}>{label}</Text>
      <Text style={[styles.reviewValue, { color: colors.text }]} numberOfLines={2}>
        {value}
      </Text>
      <IconSymbol name="pencil" size={15} color={colors.textMuted} />
    </Pressable>
  );

  return (
    <StepScaffold title="Ready to go" subtitle="Tap any line to change it." colors={colors}>
      <View style={[styles.reviewCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Row label="Type" value={state.kind === 'adopt' ? 'Adopt' : 'Eliminate'} step="kind" />
        <Row label="Behavior" value={state.title.trim() || '—'} step="what" />
        {state.kind === 'eliminate' ? (
          <Row label="Instead" value={replacement ?? '—'} step="instead" />
        ) : null}
        <Row label="When" value={`${formatTimeForDisplay(state.startTime).time}${formatTimeForDisplay(state.startTime).period.toLowerCase()}–${formatTimeForDisplay(state.endTime).time}${formatTimeForDisplay(state.endTime).period.toLowerCase()} · ${daySummary}`} step="when" />
        <Row label="Cadence" value={cadence?.label ?? '—'} step="cadence" />
      </View>
      <Text style={[styles.preview, { color: colors.textMuted }]}>{previewText}</Text>
    </StepScaffold>
  );
}

function summarizeDays(days: number[]): string {
  const set = new Set(days);
  if (set.size === 7) return 'Every day';
  if (set.size === 5 && [1, 2, 3, 4, 5].every((d) => set.has(d))) return 'Weekdays';
  if (set.size === 2 && set.has(0) && set.has(6)) return 'Weekends';
  return [0, 1, 2, 3, 4, 5, 6]
    .filter((d) => set.has(d))
    .map((d) => DAY_LETTERS[d])
    .join(' ');
}

const styles = StyleSheet.create({
  dots: { flexDirection: 'row', gap: Space.xs, alignItems: 'center', justifyContent: 'center' },
  dot: { height: 8, borderRadius: Radius.pill },

  step: { gap: Space.sm },
  stepTitle: { ...Type.display2 },
  stepSubtitle: { ...Type.body, marginTop: Space.xs },
  stepBody: { gap: Space.md, marginTop: Space.lg },

  groupLabel: { ...Type.micro, marginTop: Space.sm, marginBottom: -Space.xs },
  fieldLabel: { ...Type.micro },
  orLabel: { ...Type.caption, textAlign: 'center', marginVertical: Space.xs },
  hint: { ...Type.caption, marginTop: Space.xs },

  selectCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.md,
    padding: Space.lg,
    borderRadius: Radius.lg,
  },
  selectCardTitle: { ...Type.bodyBold },
  selectCardDesc: { ...Type.caption, marginTop: 2 },

  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Space.xs },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Space.xs,
    paddingHorizontal: Space.md,
    paddingVertical: Space.sm,
    borderRadius: Radius.md,
    borderWidth: 1,
    minHeight: 44,
  },
  chipText: { ...Type.caption, fontWeight: '600' },

  input: {
    paddingHorizontal: Space.md,
    paddingVertical: Space.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    ...Type.body,
  },
  inputMultiline: { minHeight: 64, textAlignVertical: 'top' },

  timeBlock: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    gap: Space.lg,
  },
  timeColumn: { alignItems: 'center', gap: Space.xs },
  timeColumnLabel: { ...Type.micro },
  timeChip: {
    minWidth: 124,
    paddingHorizontal: Space.lg,
    paddingVertical: Space.md,
    borderRadius: Radius.md,
    borderWidth: 2,
    alignItems: 'center',
  },
  timeChipText: { fontSize: 30, fontWeight: '700', lineHeight: 34 },
  timeChipPeriod: { ...Type.micro, marginTop: 2 },
  timeArrow: { ...Type.h1, paddingBottom: Space.lg },
  pickerWrapper: { alignItems: 'center', marginTop: Space.sm },

  dayRow: { flexDirection: 'row', gap: Space.xs, justifyContent: 'space-between' },
  dayPill: {
    flex: 1,
    height: 44,
    borderRadius: Radius.sm,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayPillText: { ...Type.bodyBold },

  preview: { ...Type.caption, fontStyle: 'italic', textAlign: 'center', marginTop: Space.sm },

  reviewCard: { borderRadius: Radius.lg, borderWidth: 1, paddingHorizontal: Space.lg },
  reviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.md,
    paddingVertical: Space.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  reviewLabel: { ...Type.micro, width: 72 },
  reviewValue: { ...Type.body, flex: 1 },
});
