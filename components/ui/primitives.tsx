import { View, Text, Pressable, type ViewStyle, type StyleProp } from 'react-native';
import { type ReactNode } from 'react';
import { Space, Radius, Type, type ThemeColors } from '@/constants/theme';

/**
 * Vega-style layout primitives.
 *
 * Shared building blocks so every screen speaks the same visual language:
 *   - ScreenHeader   → consistent title + optional subtitle + right accessory
 *   - cardStyle      → shared surface/border treatment (used by Card + tappable cards)
 *   - Card           → static surface card
 *   - Pill           → small rounded tag (domain, PRO, status)
 *   - SectionTitle   → uppercase micro section eyebrow
 *   - SurfaceButton  → neutral surface button; pair with `primary` for brand fill
 *
 * All consume the shadcn-aligned `Colors`/`Radius` tokens from constants/theme.
 */

type CardVariant = 'surface' | 'brandSoft' | 'muted';

export function cardStyle(colors: ThemeColors, variant: CardVariant = 'surface'): ViewStyle {
  const palette: Record<CardVariant, { backgroundColor: string; borderColor: string }> = {
    surface: { backgroundColor: colors.surface, borderColor: colors.border },
    brandSoft: { backgroundColor: colors.tintSoft, borderColor: colors.tintMuted },
    muted: { backgroundColor: colors.surfaceMuted, borderColor: colors.border },
  };
  return {
    borderRadius: Radius.md,
    borderWidth: 1,
    ...palette[variant],
  };
}

export function ScreenHeader({
  title,
  subtitle,
  right,
  colors,
  insetsTop = 0,
}: {
  title: string;
  subtitle?: string;
  right?: ReactNode;
  colors: ThemeColors;
  insetsTop?: number;
}) {
  return (
    <View style={[styles.header, { paddingTop: insetsTop + Space.lg }]}>
      <View style={styles.headerText}>
        <Text style={[Type.h1, { color: colors.text }]}>{title}</Text>
        {subtitle ? (
          <Text style={[Type.caption, { color: colors.textMuted, marginTop: Space.xs }]}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {right}
    </View>
  );
}

export function Card({
  children,
  style,
  colors,
  variant = 'surface',
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  colors: ThemeColors;
  variant?: CardVariant;
}) {
  return <View style={[cardStyle(colors, variant), style]}>{children}</View>;
}

export function Pill({
  label,
  colors,
  tone = 'muted',
  color,
}: {
  label: string;
  colors: ThemeColors;
  tone?: 'muted' | 'brand';
  color?: string;
}) {
  const background = tone === 'brand' ? colors.tintSoft : colors.surfaceMuted;
  const textColor = color ?? (tone === 'brand' ? colors.tint : colors.textMuted);
  return (
    <View style={[styles.pill, { backgroundColor: background }]}>
      <Text style={[Type.micro, { color: textColor }]}>{label}</Text>
    </View>
  );
}

export function SectionTitle({
  title,
  colors,
  right,
}: {
  title: string;
  colors: ThemeColors;
  right?: ReactNode;
}) {
  return (
    <View style={styles.sectionTitleRow}>
      <Text
        style={[
          Type.micro,
          { fontSize: 12, color: colors.textMuted, letterSpacing: 1, marginLeft: Space.sm },
        ]}
      >
        {title.toUpperCase()}
      </Text>
      {right}
    </View>
  );
}

export function SurfaceButton({
  label,
  onPress,
  colors,
  primary,
  destructive,
  style,
}: {
  label: string;
  onPress: () => void;
  colors: ThemeColors;
  primary?: boolean;
  destructive?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const background = primary ? colors.tint : colors.surfaceMuted;
  const foreground = primary
    ? colors.textOnBrand
    : destructive
      ? colors.danger
      : colors.text;
  return (
    <Pressable
      onPress={onPress}
      style={[styles.button, { backgroundColor: background }, style]}
      accessibilityLabel={label}
    >
      <Text style={[Type.bodyBold, { color: foreground }]}>{label}</Text>
    </Pressable>
  );
}

const styles = {
  header: {
    paddingHorizontal: Space.lg,
    paddingBottom: Space.md,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
  },
  headerText: { flex: 1, gap: 2 },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: Space.sm,
    paddingVertical: Space.xxs,
    borderRadius: Radius.pill,
    gap: Space.xxs,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Space.xs - 1,
  },
  button: {
    paddingVertical: Space.md,
    paddingHorizontal: Space.lg,
    borderRadius: Radius.sm,
    alignItems: 'center' as const,
    marginTop: Space.xs,
  },
} as const;

export type { CardVariant };
