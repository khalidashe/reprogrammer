import { Text, type TextProps } from 'react-native';

import { Type } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
};

/**
 * Theme-aware wrapper around RN's Text. Variants resolve to the canonical
 * `Type` tokens so this component shares one typography scale with the rest
 * of the app instead of carrying its own.
 *
 * Variant → token map:
 *   default          → Type.body
 *   defaultSemiBold  → Type.bodyBold
 *   subtitle         → Type.h2
 *   title            → Type.display2  (magazine-y editorial size)
 *   link             → Type.body, colored with the theme's `info`
 */
export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const textColor = useThemeColor({ light: lightColor, dark: darkColor }, 'text');
  const linkColor = useThemeColor({}, 'info');

  const variant =
    type === 'title'
      ? Type.display2
      : type === 'subtitle'
        ? Type.h2
        : type === 'defaultSemiBold'
          ? Type.bodyBold
          : type === 'link'
            ? Type.body
            : Type.body;

  return (
    <Text
      style={[
        variant,
        { color: type === 'link' ? linkColor : textColor },
        style,
      ]}
      {...rest}
    />
  );
}
