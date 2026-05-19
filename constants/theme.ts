/**
 * Reprogrammer theme tokens.
 *
 * Palette comes from the design system: a neon-green brand scale (50–900) and
 * a neutrals scale (1–13). The semantic colors map below reflects the
 * mental-health-app tuning recommended in the design review:
 *   - 700/800 as primary brand for body text and AA contrast
 *   - 50–200 as soft surfaces / enabled-state tile fills
 *   - 400/500 reserved for celebration moments (streak milestones)
 *   - complementary amber / muted red / calm blue for semantic states
 */

import { Platform } from 'react-native';

/** Raw brand palette: neon-green */
export const NeonGreen = {
  50: '#ebffe8',
  100: '#c1ffb6',
  200: '#a3ff93',
  300: '#79ff62',
  400: '#5fff43',
  500: '#37ff14',
  600: '#32e812',
  700: '#27b50e',
  800: '#1e8c0b',
  900: '#176b08',
} as const;

/** Raw palette: neutrals (1 = white, 13 = black) */
export const Neutrals = {
  1: '#ffffff',
  2: '#fcfcfc',
  3: '#f5f5f5',
  4: '#f0f0f0',
  5: '#d9d9d9',
  6: '#bfbfbf',
  7: '#8c8c8c',
  8: '#595959',
  9: '#454545',
  10: '#262626',
  11: '#1f1f1f',
  12: '#141414',
  13: '#000000',
} as const;

/** Complementary semantic colors not present in the brand scale. */
export const Semantic = {
  /** Warm amber for streaks, gentle warnings, level-ups. */
  amber: '#f59e0b',
  amberSoft: '#fef3c7',
  /** Muted red for "no" check-ins — readable, not alarming. */
  danger: '#ef4444',
  dangerSoft: '#fee2e2',
  /** Calm blue for educational / library content and links. */
  info: '#3b82f6',
  infoSoft: '#dbeafe',
} as const;

/**
 * Mapped semantic tokens. Use these in components — not the raw palette —
 * so that light/dark/accessibility tuning can change centrally.
 *
 * Note: we deliberately do NOT use `as const` here so that the two
 * variants (light/dark) remain structurally compatible. Using `as const`
 * would make each hex a literal type and cause assignability errors when
 * passing the runtime-selected variant to typed props.
 */
type ThemeVariant = {
  text: string;
  textMuted: string;
  textOnBrand: string;
  background: string;
  surface: string;
  surfaceMuted: string;
  border: string;
  tint: string;
  tintMuted: string;
  tintSoft: string;
  tintCelebrate: string;
  stateEnabledBg: string;
  stateEnabledText: string;
  stateDisabledBg: string;
  stateDisabledStripe: string;
  stateDisabledText: string;
  icon: string;
  tabIconDefault: string;
  tabIconSelected: string;
  tabBarBackground: string;
  success: string;
  successSoft: string;
  warning: string;
  warningSoft: string;
  danger: string;
  dangerSoft: string;
  info: string;
  infoSoft: string;
};

export const Colors: { light: ThemeVariant; dark: ThemeVariant } = {
  light: {
    // Foreground / text
    text: Neutrals[11],
    textMuted: Neutrals[8],
    textOnBrand: Neutrals[1],

    // Surfaces
    background: Neutrals[1],
    surface: Neutrals[2],
    surfaceMuted: Neutrals[3],
    border: Neutrals[5],

    // Brand — toned down for mental-health calm
    tint: NeonGreen[700],
    tintMuted: NeonGreen[200],
    tintSoft: NeonGreen[50],
    /** Reserve for celebration / streak hits — used sparingly. */
    tintCelebrate: NeonGreen[400],

    // States — used by tile fills
    stateEnabledBg: NeonGreen[200],
    stateEnabledText: NeonGreen[900],
    stateDisabledBg: NeonGreen[50],
    stateDisabledStripe: NeonGreen[200],
    stateDisabledText: Neutrals[8],

    // Tabs
    icon: Neutrals[8],
    tabIconDefault: Neutrals[7],
    tabIconSelected: NeonGreen[700],
    tabBarBackground: Neutrals[1],

    // Semantic
    success: NeonGreen[700],
    successSoft: NeonGreen[100],
    warning: Semantic.amber,
    warningSoft: Semantic.amberSoft,
    danger: Semantic.danger,
    dangerSoft: Semantic.dangerSoft,
    info: Semantic.info,
    infoSoft: Semantic.infoSoft,
  },
  dark: {
    // Foreground / text
    text: Neutrals[3],
    textMuted: Neutrals[6],
    textOnBrand: Neutrals[1],

    // Surfaces
    background: Neutrals[12],
    surface: Neutrals[11],
    surfaceMuted: Neutrals[10],
    border: Neutrals[10],

    // Brand — slightly brighter green for dark backgrounds, but still tamed
    tint: NeonGreen[500],
    tintMuted: NeonGreen[800],
    tintSoft: NeonGreen[900],
    tintCelebrate: NeonGreen[400],

    // States
    stateEnabledBg: NeonGreen[800],
    stateEnabledText: NeonGreen[50],
    stateDisabledBg: NeonGreen[900],
    stateDisabledStripe: NeonGreen[700],
    stateDisabledText: Neutrals[6],

    // Tabs
    icon: Neutrals[6],
    tabIconDefault: Neutrals[7],
    tabIconSelected: NeonGreen[500],
    tabBarBackground: Neutrals[12],

    // Semantic
    success: NeonGreen[500],
    successSoft: NeonGreen[900],
    warning: Semantic.amber,
    warningSoft: '#451a03',
    danger: '#f87171',
    dangerSoft: '#450a0a',
    info: '#60a5fa',
    infoSoft: '#172554',
  },
};

export type ThemeName = keyof typeof Colors;
export type ThemeColors = ThemeVariant;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
