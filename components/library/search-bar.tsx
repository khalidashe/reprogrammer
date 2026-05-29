import { View, TextInput, Pressable, StyleSheet } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Type, Space, Radius, type ThemeColors } from '@/constants/theme';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  colors: ThemeColors;
  accessibilityLabel?: string;
}

export function SearchBar({
  value,
  onChangeText,
  placeholder = 'Search…',
  colors,
  accessibilityLabel,
}: SearchBarProps) {
  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.surfaceMuted, borderColor: colors.border },
      ]}
    >
      <IconSymbol name="magnifyingglass" size={16} color={colors.textMuted} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        style={[styles.input, { color: colors.text }]}
        autoCorrect={false}
        autoCapitalize="none"
        clearButtonMode="never"
        accessibilityLabel={accessibilityLabel ?? placeholder}
        returnKeyType="search"
      />
      {value.length > 0 ? (
        <Pressable
          onPress={() => onChangeText('')}
          hitSlop={8}
          style={styles.clearButton}
          accessibilityLabel="Clear search"
        >
          <IconSymbol name="xmark" size={14} color={colors.textMuted} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.sm,
    height: 44,
    paddingHorizontal: Space.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    marginHorizontal: Space.lg,
  },
  input: {
    flex: 1,
    ...Type.body,
    paddingVertical: 0,
  },
  clearButton: {
    padding: Space.xs,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
