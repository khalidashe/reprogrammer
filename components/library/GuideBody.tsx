import { View, Text, StyleSheet, Pressable, Linking } from 'react-native';
import type { ThemeColors } from '@/constants/theme';
import type { ResearchEntry, Tactic } from '@/services/library/types';

export function StoryBlock({ text, colors }: { text: string; colors: ThemeColors }) {
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>The Story</Text>
      {text.split('\n\n').map((para, idx) => (
        <Text key={idx} style={[styles.storyPara, { color: colors.text }]}>
          {para}
        </Text>
      ))}
    </View>
  );
}

export function RevealsBlock({ text, colors }: { text: string; colors: ThemeColors }) {
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>What It Reveals</Text>
      {text.split('\n\n').map((para, idx) => (
        <Text key={idx} style={[styles.bodyPara, { color: colors.text }]}>
          {para}
        </Text>
      ))}
    </View>
  );
}

export function PrincipleBlock({ text, colors }: { text: string; colors: ThemeColors }) {
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>The Principle</Text>
      <View
        style={[
          styles.principle,
          { borderLeftColor: colors.tint, backgroundColor: colors.tintSoft },
        ]}
      >
        <Text style={[styles.principleText, { color: colors.text }]}>{text}</Text>
      </View>
    </View>
  );
}

export function ResearchBlock({
  entries,
  colors,
}: {
  entries: ResearchEntry[];
  colors: ThemeColors;
}) {
  if (entries.length === 0) return null;
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>The Research</Text>
      {entries.map((entry, idx) => {
        const isLink = !!entry.sourceUrl;
        return (
          <View
            key={idx}
            style={[styles.researchRow, { borderBottomColor: colors.border }]}
          >
            <Text style={[styles.researchFact, { color: colors.text }]}>{entry.fact}</Text>
            <Pressable
              disabled={!isLink}
              onPress={() => entry.sourceUrl && Linking.openURL(entry.sourceUrl)}
            >
              <Text
                style={[
                  styles.researchSource,
                  { color: isLink ? colors.info : colors.textMuted },
                ]}
              >
                {entry.source}
              </Text>
            </Pressable>
          </View>
        );
      })}
    </View>
  );
}

export function TacticsBlock({
  tactics,
  colors,
  title = 'How to Apply It',
}: {
  tactics: Tactic[];
  colors: ThemeColors;
  title?: string;
}) {
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>{title}</Text>
      {tactics.map((tactic, idx) => (
        <View key={idx} style={styles.tacticRow}>
          <Text style={[styles.tacticNumber, { color: colors.tint }]}>{idx + 1}.</Text>
          <Text style={[styles.tacticBody, { color: colors.text }]}>
            <Text style={{ fontWeight: '700' }}>{tactic.heading} </Text>
            {tactic.body}
          </Text>
        </View>
      ))}
    </View>
  );
}

export function StringListBlock({
  title,
  items,
  colors,
}: {
  title: string;
  items: string[];
  colors: ThemeColors;
}) {
  if (items.length === 0) return null;
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>{title}</Text>
      {items.map((item, idx) => (
        <View key={idx} style={styles.bulletRow}>
          <Text style={[styles.bullet, { color: colors.tint }]}>•</Text>
          <Text style={[styles.bulletBody, { color: colors.text }]}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

export function ConnectionBlock({ text, colors }: { text: string; colors: ThemeColors }) {
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>
        Connection to the System
      </Text>
      <Text style={[styles.bodyPara, { color: colors.text }]}>{text}</Text>
    </View>
  );
}

export function ProseBlock({
  title,
  text,
  colors,
}: {
  title: string;
  text: string;
  colors: ThemeColors;
}) {
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>{title}</Text>
      {text.split('\n\n').map((para, idx) => (
        <Text key={idx} style={[styles.bodyPara, { color: colors.text }]}>
          {para}
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  storyPara: {
    fontSize: 15,
    lineHeight: 23,
    fontStyle: 'italic',
    marginBottom: 12,
  },
  bodyPara: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 12,
  },
  principle: {
    borderLeftWidth: 3,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 6,
  },
  principleText: {
    fontSize: 16,
    lineHeight: 24,
    fontStyle: 'italic',
    fontWeight: '600',
  },
  researchRow: {
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 4,
  },
  researchFact: {
    fontSize: 14,
    lineHeight: 20,
  },
  researchSource: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  tacticRow: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 8,
  },
  tacticNumber: {
    fontSize: 15,
    fontWeight: '700',
    minWidth: 22,
  },
  tacticBody: {
    flex: 1,
    fontSize: 14,
    lineHeight: 21,
  },
  bulletRow: {
    flexDirection: 'row',
    marginBottom: 8,
    gap: 8,
  },
  bullet: {
    fontSize: 16,
    fontWeight: '700',
    minWidth: 14,
  },
  bulletBody: {
    flex: 1,
    fontSize: 14,
    lineHeight: 21,
  },
});
