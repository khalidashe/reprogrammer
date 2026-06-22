import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, Type, Space, Radius, PRESSED_OPACITY, type ThemeColors } from '@/constants/theme';
import {
  ModelTeaching,
  GroundRulesTeaching,
  LoggingTeaching,
} from '@/components/onboarding/teaching';
import { haptics } from '@/services/haptics';

/**
 * "How it works" recap (REP-45). A standalone, read-only refresher of the
 * teaching slides for returning users — reachable from the profile. It reuses
 * onboarding's teaching components, but lives on its own route (not
 * `/onboarding`), so it never trips the launch redirect that bounces onboarded
 * users back to the tabs (see app/_layout.tsx). It shows only the *concepts*
 * and skips first-run setup (notifications, picking a behavior, the demo ping).
 */
export default function HowItWorksScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const done = () => {
    haptics.light();
    router.back();
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      <Text style={[styles.title, { color: colors.text }]}>How it works</Text>
      <Text style={[styles.lead, { color: colors.textMuted }]}>
        A quick refresher on the idea behind Reprogrammer — the same thing the
        intro walked you through.
      </Text>

      <Section label="The model" colors={colors}>
        <Text style={[styles.sectionLead, { color: colors.textMuted }]}>
          You train one behavior at a time. Each is one of two kinds:
        </Text>
        <ModelTeaching colors={colors} />
      </Section>

      <Section label="The ground rules" colors={colors}>
        <Text style={[styles.sectionLead, { color: colors.textMuted }]}>
          Five rules that decide whether this works for you.
        </Text>
        <GroundRulesTeaching colors={colors} />
      </Section>

      <Section label="Responding to a ping" colors={colors}>
        <Text style={[styles.sectionLead, { color: colors.textMuted }]}>
          When a ping arrives, you have three replies:
        </Text>
        <LoggingTeaching colors={colors} />
      </Section>

      <Pressable
        onPress={done}
        style={({ pressed }) => [
          styles.done,
          { backgroundColor: colors.tint },
          pressed && { opacity: PRESSED_OPACITY },
        ]}
        accessibilityRole="button"
        accessibilityLabel="Done"
      >
        <Text style={[Type.bodyBold, { color: colors.textOnBrand }]}>Got it</Text>
      </Pressable>
    </ScrollView>
  );
}

function Section({
  label,
  colors,
  children,
}: {
  label: string;
  colors: ThemeColors;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionLabel, { color: colors.accentText }]}>{label}</Text>
      {children}
    </View>
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
  section: { gap: Space.sm, marginTop: Space.sm },
  sectionLabel: {
    ...Type.micro,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  sectionLead: { ...Type.body },
  done: {
    paddingVertical: Space.md,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
    marginTop: Space.lg,
  },
});
