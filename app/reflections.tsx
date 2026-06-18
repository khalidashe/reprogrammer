import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { useMemo, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, Type, Space, Radius } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { SearchBar } from '@/components/library/search-bar';
import useStore from '@/store/useStore';
import { searchReflections, type ReflectionItem } from '@/services/reflections';

/**
 * Reflections — REP-5 Phase 4. A searchable, all-time view of the free-text
 * reflections written at check-in. Reachable from the Weekly Review (all
 * behaviors) or a behavior's detail screen (scoped via the `behaviorId` param).
 * Personal writing, so it is not Pro-gated.
 */
function formatWhen(at: number): string {
  const d = new Date(at);
  const day = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  return `${day} · ${time}`;
}

export default function ReflectionsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const { behaviorId } = useLocalSearchParams();
  const { behaviors, entries } = useStore();
  const [query, setQuery] = useState('');

  const scopedId = typeof behaviorId === 'string' ? behaviorId : undefined;
  const scopedTitle = scopedId
    ? behaviors.find((b) => b.id === scopedId)?.title
    : undefined;

  const results = useMemo(
    () => searchReflections(behaviors, entries, query, scopedId),
    [behaviors, entries, query, scopedId]
  );

  // Whether the user has any reflections at all (ignoring the current query),
  // so we can tell "none written yet" apart from "none match this search".
  const hasAny = useMemo(
    () => searchReflections(behaviors, entries, '', scopedId).length > 0,
    [behaviors, entries, scopedId]
  );

  const renderItem = ({ item }: { item: ReflectionItem }) => (
    <Pressable
      onPress={() => router.push({ pathname: '/behavior/[id]', params: { id: item.behaviorId } })}
      style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
      accessibilityRole="button"
      accessibilityLabel={`Reflection for ${item.behaviorTitle}, ${formatWhen(item.at)}`}
    >
      <View style={styles.cardHeader}>
        {!scopedId ? (
          <Text style={[styles.cardBehavior, { color: colors.accentText }]} numberOfLines={1}>
            {item.behaviorTitle}
          </Text>
        ) : (
          <View />
        )}
        <Text style={[styles.cardWhen, { color: colors.textMuted }]}>{formatWhen(item.at)}</Text>
      </View>
      <Text style={[styles.cardText, { color: colors.text }]}>{item.text}</Text>
    </Pressable>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.searchWrap}>
        <SearchBar
          value={query}
          onChangeText={setQuery}
          placeholder="Search reflections…"
          colors={colors}
          accessibilityLabel="Search your reflections"
        />
        {scopedTitle ? (
          <Text style={[styles.scopeLabel, { color: colors.textMuted }]}>
            Showing: {scopedTitle}
          </Text>
        ) : null}
      </View>

      {results.length === 0 ? (
        <View style={styles.empty}>
          <IconSymbol name="note.text" size={28} color={colors.textMuted} />
          <Text style={[styles.emptyText, { color: colors.textMuted }]}>
            {hasAny
              ? `No reflections match “${query.trim()}”.`
              : 'Reflections you write at check-in will show up here.'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchWrap: { paddingTop: Space.md, gap: Space.xs },
  scopeLabel: { ...Type.micro, marginHorizontal: Space.lg + Space.sm },
  list: {
    padding: Space.lg,
    gap: Space.sm,
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
  },
  card: {
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Space.lg,
    gap: Space.xs,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Space.sm,
  },
  cardBehavior: { ...Type.caption, fontWeight: '700', flex: 1 },
  cardWhen: { ...Type.micro },
  cardText: { ...Type.body },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Space.md,
    paddingHorizontal: Space.xxxl,
  },
  emptyText: { ...Type.body, textAlign: 'center' },
});
