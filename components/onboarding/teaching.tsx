import { View, Text, StyleSheet } from 'react-native';
import {
  Type,
  Space,
  Radius,
  controlSelected,
  type ThemeColors,
} from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { GROUND_RULES } from '@/services/ground-rules';

/**
 * The *teaching* slides shared by first-run onboarding (REP-39) and the
 * standalone "How it works" recap (REP-45). These render the conceptual model
 * only — the two kinds + the loop, the ground rules, and how you respond to a
 * ping — and deliberately contain none of the first-run *setup* (notifications,
 * pick a behavior, demo ping). Keeping the model copy in one place means the
 * recap can never drift from what onboarding taught.
 */

const KIND_ROWS = [
  {
    icon: 'checkmark' as const,
    label: 'Adopt',
    text: 'Build a good behavior until it runs on its own.',
  },
  {
    icon: 'minus.circle' as const,
    label: 'Eliminate',
    text: 'Catch an automatic bad one in the act.',
  },
];

const LOOP_ROWS = [
  {
    icon: 'bell.fill' as const,
    label: 'A gentle ping',
    text: 'arrives at random times inside the window you choose.',
  },
  {
    icon: 'checkmark' as const,
    label: 'You respond',
    text: 'check in if you did it, or snooze it for later.',
  },
  {
    icon: 'flame.fill' as const,
    label: 'A streak grows',
    text: 'each time you show up — a missed day is data, not failure.',
  },
  {
    icon: 'sparkles' as const,
    label: 'You level up',
    text: 'streaks raise your level, and pings space out as the habit sets.',
  },
];

const LOGGING_OPTIONS = [
  {
    icon: 'checkmark' as const,
    label: 'Check-in',
    tone: 'tint' as const,
    text: 'You did it. Logs the rep and grows your streak.',
  },
  {
    icon: 'circle.lefthalf.filled' as const,
    label: 'Tried',
    tone: 'warning' as const,
    text: 'You showed up but did not fully finish. It still counts — showing up is the habit.',
  },
  {
    icon: 'pause.fill' as const,
    label: 'Snooze',
    tone: 'muted' as const,
    text: 'Not now. Reschedules the ping for later; your streak stays safe.',
  },
];

/** The two kinds of behavior + the gentle-ping loop they share. */
export function ModelTeaching({ colors }: { colors: ThemeColors }) {
  return (
    <View style={styles.block}>
      <View style={styles.kindRow}>
        {KIND_ROWS.map((r) => (
          <View
            key={r.label}
            style={[
              styles.kindCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <View
              style={[
                styles.kindIcon,
                {
                  backgroundColor:
                    r.label === 'Adopt' ? colors.tintSoft : colors.dangerSoft,
                },
              ]}
            >
              <IconSymbol
                name={r.icon}
                size={20}
                color={r.label === 'Adopt' ? colors.accentText : colors.danger}
              />
            </View>
            <Text style={[styles.kindLabel, { color: colors.text }]}>{r.label}</Text>
            <Text style={[styles.kindText, { color: colors.textMuted }]}>{r.text}</Text>
          </View>
        ))}
      </View>

      <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>The loop</Text>
      <View style={[styles.loopCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        {LOOP_ROWS.map((r, i) => (
          <View
            key={r.label}
            style={[
              styles.loopRow,
              i < LOOP_ROWS.length - 1 && {
                borderBottomWidth: 1,
                borderBottomColor: colors.border,
              },
            ]}
          >
            <View style={[styles.loopIcon, controlSelected(colors)]}>
              <IconSymbol name={r.icon} size={16} color={colors.accentText} />
            </View>
            <Text style={[styles.loopText, { color: colors.text }]}>
              <Text style={{ fontWeight: '700' }}>{r.label}</Text> — {r.text}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

/** The five ground rules that decide whether the method works for you. */
export function GroundRulesTeaching({ colors }: { colors: ThemeColors }) {
  return (
    <View style={styles.block}>
      {GROUND_RULES.map((rule, idx) => (
        <View
          key={rule.id}
          style={[styles.ruleCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
        >
          <View style={styles.ruleHeader}>
            <View style={[styles.ruleNumber, controlSelected(colors)]}>
              <Text style={[styles.ruleNumberText, { color: colors.accentText }]}>
                {idx + 1}
              </Text>
            </View>
            <Text style={[styles.ruleTitle, { color: colors.text }]}>{rule.title}</Text>
          </View>
          <Text style={[styles.ruleBody, { color: colors.text }]}>{rule.body}</Text>
          <Text style={[styles.ruleCitation, { color: colors.textMuted }]}>
            {rule.citation}
          </Text>
        </View>
      ))}
    </View>
  );
}

/** The three ways to respond when a ping arrives. */
export function LoggingTeaching({ colors }: { colors: ThemeColors }) {
  return (
    <View style={styles.block}>
      {LOGGING_OPTIONS.map((opt) => (
        <View
          key={opt.label}
          style={[styles.optionRow, { backgroundColor: colors.surface, borderColor: colors.border }]}
        >
          <View
            style={[
              styles.optionIcon,
              {
                backgroundColor:
                  opt.tone === 'tint'
                    ? colors.tintSoft
                    : opt.tone === 'warning'
                      ? colors.warningSoft
                      : colors.surfaceMuted,
              },
            ]}
          >
            <IconSymbol
              name={opt.icon}
              size={18}
              color={
                opt.tone === 'tint'
                  ? colors.accentText
                  : opt.tone === 'warning'
                    ? colors.warning
                    : colors.textMuted
              }
            />
          </View>
          <View style={styles.optionTextWrap}>
            <Text style={[styles.optionLabel, { color: colors.text }]}>{opt.label}</Text>
            <Text style={[styles.optionText, { color: colors.textMuted }]}>{opt.text}</Text>
          </View>
        </View>
      ))}

      <Text style={[styles.loggingClose, { color: colors.textMuted }]}>
        That is the whole loop. A few reps a day and it starts to run on its own.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  block: { gap: Space.md },

  // Model — kind cards
  sectionLabel: {
    ...Type.micro,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: Space.sm,
  },
  kindRow: { flexDirection: 'row', gap: Space.sm },
  kindCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Space.md + Space.xxs,
    gap: Space.xs,
  },
  kindIcon: {
    width: Space.xxl,
    height: Space.xxl,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Space.xxs,
  },
  kindLabel: { ...Type.bodyBold, fontWeight: '700' },
  kindText: { ...Type.caption },

  // Model — the loop
  loopCard: {
    borderWidth: 1,
    borderRadius: Radius.lg,
    overflow: 'hidden',
  },
  loopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.sm + Space.xxs,
    padding: Space.md + Space.xxs,
  },
  loopIcon: {
    width: Space.xl + Space.xs,
    height: Space.xl + Space.xs,
    borderRadius: Radius.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loopText: { ...Type.caption, flex: 1, lineHeight: 19 },

  // Rules
  ruleCard: {
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Space.md + Space.xxs,
    gap: Space.sm,
  },
  ruleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.sm + Space.xxs,
  },
  ruleNumber: {
    width: Space.xxl,
    height: Space.xxl,
    borderRadius: Radius.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ruleNumberText: { ...Type.caption, fontSize: 12, fontWeight: '700' },
  ruleTitle: { ...Type.bodyBold, fontWeight: '700', flex: 1 },
  ruleBody: { ...Type.body },
  ruleCitation: { ...Type.micro, fontWeight: '400', fontStyle: 'italic' },

  // Logging — response options
  optionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Space.md,
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Space.md + Space.xxs,
  },
  optionIcon: {
    width: Space.xxl,
    height: Space.xxl,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionTextWrap: { flex: 1, gap: Space.xxs },
  optionLabel: { ...Type.bodyBold, fontWeight: '700' },
  optionText: { ...Type.caption, lineHeight: 19 },
  loggingClose: { ...Type.caption, fontStyle: 'italic', marginTop: Space.sm },
});
