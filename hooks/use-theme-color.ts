import { Colors, type ThemeColors } from '@/constants/theme';
import { useColorScheme } from './use-color-scheme';

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof ThemeColors
): string {
  const theme = useColorScheme() ?? 'light';
  const fromProps = props[theme];
  if (fromProps) return fromProps;
  return Colors[theme][colorName];
}
