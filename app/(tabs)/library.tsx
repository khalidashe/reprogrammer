import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';

/**
 * Library content is intentionally scoped to **support practice** — short
 * articles that explain why a state matters or how to practice it well —
 * rather than general mental-health editorial. This keeps the app aligned
 * with its identity as a practice amplifier (not a wellness content
 * platform). Replace this in-memory data with a real content source when
 * available.
 */
interface Article {
  id: string;
  title: string;
  minutes: number;
  /** Optional state the article links to — surfaces "Try this state" CTA. */
  linkedStateId?: string;
}

interface Category {
  id: string;
  name: string;
  articles: Article[];
}

const CATEGORIES: Category[] = [
  {
    id: 'productivity',
    name: 'Productivity',
    articles: [
      { id: 'p-1', title: 'Why a single intention beats a to-do list', minutes: 5 },
      { id: 'p-2', title: 'Practicing the pause before context switching', minutes: 4 },
    ],
  },
  {
    id: 'assertiveness',
    name: 'Assertiveness',
    articles: [
      { id: 'a-1', title: 'Saying no without explaining yourself', minutes: 6 },
      { id: 'a-2', title: 'How body language shifts before you do', minutes: 5 },
    ],
  },
  {
    id: 'fearlessness',
    name: 'Fearlessness',
    articles: [
      { id: 'f-1', title: 'Noticing the freeze response in conversation', minutes: 5 },
      { id: 'f-2', title: 'Small reps build courage faster than big leaps', minutes: 4 },
    ],
  },
];

export default function LibraryScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Library</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          Short reads that support what you&apos;re practicing.
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {CATEGORIES.map((category) => (
          <View key={category.id} style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                {category.name}
              </Text>
              <Pressable style={styles.viewAll} accessibilityLabel={`View all in ${category.name}`}>
                <Text style={[styles.viewAllText, { color: colors.info }]}>View all</Text>
                <IconSymbol name="chevron.right" size={14} color={colors.info} />
              </Pressable>
            </View>

            {/* Featured article card per category */}
            <Pressable
              style={[
                styles.articleCard,
                { backgroundColor: colors.tintSoft, borderColor: colors.tintMuted },
              ]}
            >
              <Text
                numberOfLines={2}
                style={[styles.articleTitle, { color: colors.text }]}
              >
                {category.articles[0].title}
              </Text>
              <View style={styles.articleFooter}>
                <Text style={[styles.articleMeta, { color: colors.textMuted }]}>
                  {category.articles[0].minutes} minutes read
                </Text>
                <IconSymbol name="chevron.right" size={16} color={colors.textMuted} />
              </View>
            </Pressable>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 13,
    marginTop: 4,
  },
  scrollContent: {
    padding: 16,
    paddingTop: 8,
    gap: 24,
  },
  section: {
    gap: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  viewAll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '500',
  },
  articleCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  articleTitle: {
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 20,
  },
  articleFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  articleMeta: {
    fontSize: 12,
  },
});
