import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCallback, useMemo, useState } from 'react';
import type { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, Type, Space, Radius, PRESSED_OPACITY } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import useStore from '@/store/useStore';
import type { Behavior } from '@/types';
import { useIsPro } from '@/hooks/useIsPro';
import { FREE_TIER_STATE_CAP } from '@/constants/limits';
import { cancelForBehavior, scheduleForBehavior } from '@/services/notifications';
import { INITIAL_LEVEL, effectiveIntervalMinutes } from '@/services/levels';
import {
  buildBehavior,
  type BehaviorDraft,
} from '@/services/behavior-factory';
import {
  composePracticeType,
  decomposePracticeType,
  featuredTemplates,
  type AdoptTemplate,
} from '@/services/library-content';
import {
  DEFAULT_CADENCE,
  cadenceForInterval,
  intervalForCadence,
} from '@/services/cadence';
import { hhmmToMinutes, dateToHHmm } from '@/utils/time';
import { haptics } from '@/services/haptics';
import {
  ProgressDots,
  StartStep,
  KindStep,
  WhatStep,
  InsteadStep,
  WhenStep,
  CadenceStep,
  TrackStep,
  ReviewStep,
  type StepId,
  type WizardState,
} from '@/components/create/steps';

function initialState(b: Behavior | null | undefined): WizardState {
  if (b) {
    return {
      kind: b.kind,
      title: b.title,
      pingMessage: b.pingMessage === b.title ? '' : b.pingMessage,
      practiceBases: decomposePracticeType(b.practiceType),
      domain: b.domain,
      libraryGuideId: b.libraryGuideId,
      startTime: b.window.from,
      endTime: b.window.to,
      activeDays: b.activeDays,
      cadenceId: cadenceForInterval(b.intervalMinutes),
      replacementStateId: b.replacementStateId,
      newReplacementTitle: '',
      captureType: b.captureSpec?.type ?? 'none',
      captureLabel: b.captureSpec?.label ?? '',
      captureUnit: b.captureSpec?.unit ?? '',
      captureDirection: b.captureSpec?.direction ?? 'up',
    };
  }
  return {
    kind: 'adopt',
    title: '',
    pingMessage: '',
    practiceBases: [],
    domain: undefined,
    libraryGuideId: undefined,
    startTime: '09:00',
    endTime: '21:00',
    activeDays: [0, 1, 2, 3, 4, 5, 6],
    cadenceId: DEFAULT_CADENCE,
    replacementStateId: undefined,
    newReplacementTitle: '',
    captureType: 'none',
    captureLabel: '',
    captureUnit: '',
    captureDirection: 'up',
  };
}

function buildSteps(kind: WizardState['kind'], editing: boolean): StepId[] {
  const arr: StepId[] = editing ? ['kind', 'what'] : ['start', 'kind', 'what'];
  if (kind === 'eliminate') arr.push('instead');
  arr.push('when', 'cadence', 'track', 'review');
  return arr;
}

function isStepValid(stepId: StepId, s: WizardState): boolean {
  if (stepId === 'what') return s.title.trim().length > 0;
  if (stepId === 'instead') {
    return !!s.replacementStateId || s.newReplacementTitle.trim().length > 0;
  }
  if (stepId === 'when') {
    return hhmmToMinutes(s.endTime) > hhmmToMinutes(s.startTime) && s.activeDays.length > 0;
  }
  if (stepId === 'track') {
    return s.captureType === 'none' || s.captureLabel.trim().length > 0;
  }
  return true;
}

export default function CreateScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams();
  const { behaviors, addBehavior, updateBehavior } = useStore();
  const { isPro } = useIsPro();

  const editingBehavior = useMemo(
    () => (id ? behaviors.find((b) => b.id === (id as string)) ?? null : null),
    [id, behaviors]
  );
  const isEditing = !!editingBehavior;

  const [state, setState] = useState<WizardState>(() => initialState(editingBehavior));
  const [stepId, setStepId] = useState<StepId>(editingBehavior ? 'review' : 'start');
  const [pickerOpen, setPickerOpen] = useState<'start' | 'end' | null>(null);

  const update = useCallback((patch: Partial<WizardState>) => {
    setState((s) => ({ ...s, ...patch }));
  }, []);

  const steps = useMemo(() => buildSteps(state.kind, isEditing), [state.kind, isEditing]);
  const index = Math.max(0, steps.indexOf(stepId));

  const adoptOptions = useMemo(
    () =>
      behaviors.filter(
        (b) => b.kind === 'adopt' && !b.hidden && b.id !== editingBehavior?.id
      ),
    [behaviors, editingBehavior?.id]
  );

  const activeStateCount = useMemo(() => behaviors.filter((b) => !b.hidden).length, [behaviors]);
  const wouldExceedFreeCap = !isPro && !isEditing && activeStateCount >= FREE_TIER_STATE_CAP;

  const previewText = useMemo(() => {
    const startMin = hhmmToMinutes(state.startTime);
    const endMin = hhmmToMinutes(state.endTime);
    const durationMin = endMin - startMin;
    const interval = intervalForCadence(state.cadenceId);
    if (durationMin <= 0) return 'Pick a valid time window';
    const level = editingBehavior?.level ?? INITIAL_LEVEL;
    const effMin = effectiveIntervalMinutes(interval, level);
    const totalPings = Math.max(1, Math.floor(durationMin / effMin));
    const spacing =
      effMin >= 60
        ? `${Math.floor(effMin / 60)}h${effMin % 60 ? ` ${Math.round(effMin % 60)}m` : ''}`
        : `${Math.round(effMin)} min`;
    return `≈ ${totalPings} nudges a day, about every ${spacing}`;
  }, [state.startTime, state.endTime, state.cadenceId, editingBehavior?.level]);

  const onTimeChange = (which: 'start' | 'end') => (
    event: DateTimePickerEvent,
    selected?: Date
  ) => {
    if (Platform.OS === 'android') setPickerOpen(null);
    if (event.type === 'dismissed' || !selected) return;
    const value = dateToHHmm(selected);
    update(which === 'start' ? { startTime: value } : { endTime: value });
  };

  const pickTemplate = (t: AdoptTemplate) => {
    setState((s) => ({
      ...s,
      kind: 'adopt',
      title: t.title,
      pingMessage: t.pingMessage,
      practiceBases: decomposePracticeType(t.practiceType),
      domain: t.domain,
      libraryGuideId: t.libraryGuideId,
      startTime: t.window.from,
      endTime: t.window.to,
      activeDays: [0, 1, 2, 3, 4, 5, 6],
      cadenceId: cadenceForInterval(t.intervalMinutes),
      replacementStateId: undefined,
      newReplacementTitle: '',
      captureType: 'none',
      captureLabel: '',
      captureUnit: '',
      captureDirection: 'up',
    }));
    setStepId('review');
  };

  const handleSave = async () => {
    if (!isEditing && wouldExceedFreeCap) {
      router.push('/paywall');
      return;
    }
    const intervalMinutes = intervalForCadence(state.cadenceId);
    const window = { from: state.startTime, to: state.endTime };

    let replacementStateId = state.replacementStateId;
    if (state.kind === 'eliminate' && !replacementStateId && state.newReplacementTitle.trim()) {
      const adopt = buildBehavior({
        kind: 'adopt',
        title: state.newReplacementTitle,
        window,
        activeDays: state.activeDays,
        intervalMinutes,
      });
      await addBehavior(adopt);
      await scheduleForBehavior(adopt);
      replacementStateId = adopt.id;
    }

    const captureSpec =
      state.captureType === 'none'
        ? undefined
        : {
            type: state.captureType,
            label: state.captureLabel.trim(),
            unit:
              state.captureType === 'metric' && state.captureUnit.trim()
                ? state.captureUnit.trim()
                : undefined,
            direction: state.captureDirection,
          };

    const draft: BehaviorDraft = {
      kind: state.kind,
      title: state.title,
      pingMessage: state.pingMessage,
      practiceType: state.kind === 'adopt' ? composePracticeType(state.practiceBases) : undefined,
      domain: state.domain,
      libraryGuideId: state.libraryGuideId,
      replacementStateId,
      window,
      activeDays: state.activeDays,
      intervalMinutes,
      captureSpec,
    };

    if (editingBehavior) {
      const updated = buildBehavior(draft, editingBehavior);
      await cancelForBehavior(editingBehavior.id);
      await updateBehavior(updated);
      await scheduleForBehavior(updated);
    } else {
      const behavior = buildBehavior(draft);
      await addBehavior(behavior);
      await scheduleForBehavior(behavior);
    }
    router.replace('/');
  };

  const goNext = () => {
    haptics.light();
    if (stepId === 'review') {
      void handleSave();
      return;
    }
    if (index < steps.length - 1) setStepId(steps[index + 1]);
  };

  const goBack = () => {
    setPickerOpen(null);
    if (index > 0) setStepId(steps[index - 1]);
  };

  const currentValid = isStepValid(stepId, state);

  const renderStep = () => {
    switch (stepId) {
      case 'start':
        return (
          <StartStep
            featuredAdopt={featuredTemplates()}
            onPickTemplate={pickTemplate}
            onBuildOwn={() => setStepId('kind')}
            colors={colors}
          />
        );
      case 'kind':
        return <KindStep state={state} update={update} colors={colors} />;
      case 'what':
        return <WhatStep state={state} update={update} colors={colors} />;
      case 'instead':
        return (
          <InsteadStep state={state} update={update} adoptOptions={adoptOptions} colors={colors} />
        );
      case 'when':
        return (
          <WhenStep
            state={state}
            update={update}
            pickerOpen={pickerOpen}
            onOpenPicker={setPickerOpen}
            onTimeChange={onTimeChange}
            colors={colors}
          />
        );
      case 'cadence':
        return (
          <CadenceStep state={state} update={update} previewText={previewText} colors={colors} />
        );
      case 'track':
        return <TrackStep state={state} update={update} colors={colors} />;
      case 'review':
        return (
          <ReviewStep
            state={state}
            adoptOptions={adoptOptions}
            previewText={previewText}
            onJump={setStepId}
            colors={colors}
          />
        );
    }
  };

  const primaryLabel = stepId === 'review' ? (isEditing ? 'Save changes' : 'Create behavior') : 'Next';

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.header, { paddingTop: insets.top + Space.sm }]}>
        {index > 0 ? (
          <Pressable
            onPress={goBack}
            hitSlop={8}
            style={({ pressed }) => [styles.headerButton, pressed && { opacity: PRESSED_OPACITY }]}
            accessibilityRole="button"
            accessibilityLabel="Back"
          >
            <IconSymbol name="chevron.left" size={22} color={colors.textMuted} />
          </Pressable>
        ) : (
          <View style={styles.headerButton} />
        )}
        <ProgressDots total={steps.length} current={index} colors={colors} />
        <Pressable
          onPress={() => router.back()}
          hitSlop={8}
          style={({ pressed }) => [styles.headerButton, pressed && { opacity: PRESSED_OPACITY }]}
          accessibilityRole="button"
          accessibilityLabel="Close"
        >
          <IconSymbol name="xmark" size={20} color={colors.textMuted} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        {wouldExceedFreeCap ? (
          <Pressable
            onPress={() => router.push('/paywall')}
            style={({ pressed }) => [
              styles.capBanner,
              { backgroundColor: colors.surface, borderColor: colors.border },
              pressed && { opacity: PRESSED_OPACITY },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Free tier limit reached. Upgrade to Pro."
          >
            <Text style={[styles.capTitle, { color: colors.text }]}>
              Free plan: {FREE_TIER_STATE_CAP} of {FREE_TIER_STATE_CAP} behaviors used
            </Text>
            <Text style={[styles.capSub, { color: colors.accentText }]}>
              Upgrade to Pro for unlimited behaviors →
            </Text>
          </Pressable>
        ) : null}
        {renderStep()}
      </ScrollView>

      {stepId !== 'start' ? (
        <View style={[styles.footer, { borderTopColor: colors.border, backgroundColor: colors.background }]}>
          <Pressable
            onPress={goNext}
            disabled={!currentValid}
            style={({ pressed }) => [
              styles.primaryButton,
              { backgroundColor: currentValid ? colors.tint : colors.surfaceMuted },
              pressed && currentValid && { opacity: PRESSED_OPACITY },
            ]}
            accessibilityRole="button"
            accessibilityLabel={primaryLabel}
            accessibilityState={{ disabled: !currentValid }}
          >
            <Text
              style={[
                styles.primaryText,
                { color: currentValid ? colors.textOnBrand : colors.textMuted },
              ]}
            >
              {primaryLabel}
            </Text>
          </Pressable>
        </View>
      ) : null}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Space.lg,
    paddingTop: Space.md,
    paddingBottom: Space.sm,
  },
  headerButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  scroll: {
    padding: Space.xl,
    paddingTop: Space.md,
    paddingBottom: Space.xxxl,
    gap: Space.lg,
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
  },
  footer: {
    borderTopWidth: 1,
    paddingHorizontal: Space.xl,
    paddingTop: Space.md,
    paddingBottom: Space.xl,
  },
  primaryButton: {
    paddingVertical: Space.md,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  primaryText: { ...Type.bodyBold },
  capBanner: { padding: Space.md, borderRadius: Radius.lg, borderWidth: 1, gap: Space.xxs },
  capTitle: { ...Type.bodyBold },
  capSub: { ...Type.caption },
});
