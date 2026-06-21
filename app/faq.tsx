import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, Type, Space, Radius } from '@/constants/theme';

/**
 * In-app FAQ (REP-17). The questions and answers are ported from the
 * Quiescence wiki's "Top questions new users ask", with the mechanics aligned
 * to what the app actually ships: the Check-in / Tried / Snooze responses, the
 * 15 → 30 min snooze cadence, the three-in-a-row daily rest, the one-day streak
 * grace, and the ground-rules timeline. Keep these in sync with the onboarding
 * teaching slides (components/onboarding/teaching.tsx) and services/ground-rules.
 */
const FAQ: { q: string; a: string }[] = [
  {
    q: "What's a behavior?",
    a: 'Any pattern you want to build or break — confident posture, assertiveness, pausing before you react, and many more in the Library. You name it, the app trains it.',
  },
  {
    q: 'How many should I start with?',
    a: 'One. Get it to automatic before adding another — one behavior at a time is the whole method.',
  },
  {
    q: 'What do Check-in, Tried, and Snooze do?',
    a: 'Check-in means you did it: it logs the rep and grows your streak. Tried means you showed up but did not fully finish — it still counts, because showing up is the habit. Snooze means not now: the ping comes back in 15 minutes, then 30. Snooze three times in a row and the behavior rests until tomorrow — honesty that it is not accessible right now, not a punishment. As your streak grows, the pings naturally space out.',
  },
  {
    q: 'What if I miss a day?',
    a: 'A missed day will not break your streak — there is a one-day grace. Habits form from showing up more days than not, not from perfection. A missed day is data, not failure; come back tomorrow.',
  },
  {
    q: 'How long until I actually change?',
    a: 'About 66 days on average, so plan for a 3-to-12-month journey. Most people who quit, quit too early — the behavior feels effortful right up until it does not. Lower the expectation; raise the commitment.',
  },
  {
    q: 'Is this just a habit tracker?',
    a: 'No. A habit tracker records what you did. Reprogrammer brings your awareness to what you are doing right now — and repeated conscious attention is what moves a behavior from effortful to automatic. The reminders are the mechanism, not a log of outcomes.',
  },
];

export default function FaqScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      <Text style={[styles.title, { color: colors.text }]}>Common questions</Text>
      <Text style={[styles.lead, { color: colors.textMuted }]}>
        The things people most often ask when they are getting started.
      </Text>

      {FAQ.map((item) => (
        <View
          key={item.q}
          style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
        >
          <Text style={[styles.question, { color: colors.text }]}>{item.q}</Text>
          <Text style={[styles.answer, { color: colors.textMuted }]}>{item.a}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
    padding: Space.xl,
    paddingBottom: Space.xxxl,
    gap: Space.md,
  },
  title: { ...Type.display2 },
  lead: { ...Type.body, marginBottom: Space.sm },
  card: {
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Space.md + Space.xxs,
    gap: Space.xs,
  },
  question: { ...Type.bodyBold, fontWeight: '700' },
  answer: { ...Type.caption, lineHeight: 20 },
});
