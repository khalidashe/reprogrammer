import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Type, Space, Radius, PRESSED_OPACITY, type ThemeColors } from '@/constants/theme';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  colors: ThemeColors;
  accessibilityLabel?: string;
  autoFocus?: boolean;
  onCancel?: () => void;
}

export function SearchBar({
  value,
  onChangeText,
  placeholder = 'Search…',
  colors,
  accessibilityLabel,
  autoFocus = false,
  onCancel,
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
        autoFocus={autoFocus}
        accessibilityLabel={accessibilityLabel ?? placeholder}
        returnKeyType="search"
      />
      {value.length > 0 ? (
        <Pressable
          onPress={() => onChangeText('')}
          hitSlop={8}
          style={({ pressed }) => [styles.clearButton, pressed && { opacity: PRESSED_OPACITY }]}
          accessibilityRole="button"
          accessibilityLabel="Clear search"
        >
          <IconSymbol name="xmark" size={14} color={colors.textMuted} />
        </Pressable>
      ) : null}
      {onCancel ? (
        <Pressable
          onPress={onCancel}
          hitSlop={8}
          style={styles.cancelButton}
          accessibilityLabel="Cancel search"
        >
          <Text style={[Type.body, { color: colors.tint }]}>Cancel</Text>
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
  cancelButton: {
    paddingLeft: Space.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
