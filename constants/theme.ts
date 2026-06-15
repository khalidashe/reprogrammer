/**
 * Reprogrammer theme tokens.
 *
 * Calm dark-premium system (Atoms north star). Surfaces are neutral; the green
 * brand (#46E06A, a calmer take on the original neon) is reserved as a sparse
 * accent for progress / mastery / affirmative moments — never a flood fill.
 * Amber marks streaks and "tried"; coral marks eliminate / destructive actions.
 * The raw NeonGreen / Neutrals / Semantic scales below are kept for reference;
 * components should consume the semantic `Colors[scheme]` tokens.
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
  accentText: string;
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
    text: '#1A1C1A',
    textMuted: '#5F655E',
    textOnBrand: '#FFFFFF',

    // Surfaces — neutral
    background: '#FBFCFB',
    surface: '#FFFFFF',
    surfaceMuted: '#F1F3F1',
    border: '#E3E6E3',

    // Brand green — calmer (#46E06A), darkened for AA on light surfaces
    tint: '#149544',
    tintMuted: '#BFE8CC',
    tintSoft: '#EAF8EF',
    /** Reserve for celebration / streak hits — used sparingly. */
    tintCelebrate: '#46E06A',
    /** Green text on a green-tint background (pills, labels). */
    accentText: '#15803D',

    // State tiles — now neutral surfaces (green is an accent, not the fill)
    stateEnabledBg: '#FFFFFF',
    stateEnabledText: '#1A1C1A',
    stateDisabledBg: '#F1F3F1',
    stateDisabledStripe: '#E3E6E3',
    stateDisabledText: '#5F655E',

    // Tabs
    icon: '#5F655E',
    tabIconDefault: '#9AA09A',
    tabIconSelected: '#149544',
    tabBarBackground: '#FFFFFF',

    // Semantic
    success: '#149544',
    successSoft: '#EAF8EF',
    warning: '#C97A0E',
    warningSoft: '#FBF0DA',
    danger: '#D4544C',
    dangerSoft: '#FCEBEA',
    info: '#2F6FD0',
    infoSoft: '#E6F0FB',
  },
  dark: {
    // Foreground / text
    text: '#ECEFE9',
    textMuted: '#8A908A',
    textOnBrand: '#0C2A13', // dark green — reads on the bright-green accent

    // Surfaces — neutral, dark-first
    background: '#111312',
    surface: '#1A1E1B',
    surfaceMuted: '#202420',
    border: '#2A2E2A',

    // Brand green — calmer #46E06A, used sparingly
    tint: '#46E06A',
    tintMuted: '#2E8F4A',
    tintSoft: 'rgba(70, 224, 106, 0.12)',
    tintCelebrate: '#5FE87E',
    /** Green text on a green-tint background (pills, labels). */
    accentText: '#7FE39A',

    // State tiles — neutral surfaces
    stateEnabledBg: '#1A1E1B',
    stateEnabledText: '#ECEFE9',
    stateDisabledBg: '#161917',
    stateDisabledStripe: '#2A2E2A',
    stateDisabledText: '#8A908A',

    // Tabs
    icon: '#8A908A',
    tabIconDefault: '#6C726A',
    tabIconSelected: '#46E06A',
    tabBarBackground: '#111312',

    // Semantic
    success: '#46E06A',
    successSoft: 'rgba(70, 224, 106, 0.12)',
    warning: '#F4B740',
    warningSoft: 'rgba(244, 183, 64, 0.12)',
    danger: '#E0726B',
    dangerSoft: 'rgba(224, 114, 107, 0.12)',
    info: '#6BA8F5',
    infoSoft: 'rgba(107, 168, 245, 0.12)',
  },
};

export type ThemeName = keyof typeof Colors;
export type ThemeColors = ThemeVariant;

/**
 * Typography scale — 5 steps + a reserved display token.
 * Use these as `{ ...Type.body }` spread into style objects, with `color`
 * applied separately at the call site.
 */
export const Type = {
  h1: { fontSize: 24, lineHeight: 30, fontWeight: '700' as const },
  h2: { fontSize: 18, lineHeight: 24, fontWeight: '700' as const },
  body: { fontSize: 15, lineHeight: 22, fontWeight: '400' as const },
  bodyBold: { fontSize: 15, lineHeight: 22, fontWeight: '600' as const },
  caption: { fontSize: 13, lineHeight: 18, fontWeight: '400' as const },
  micro: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '600' as const,
    letterSpacing: 0.5,
  },
  /**
   * Magazine-y display for guide titles and onboarding splash. Tighter
   * tracking than h1 to feel editorial; smaller than the celebration `display`.
   */
  display2: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '800' as const,
    letterSpacing: -0.5,
  },
  /** Streak / milestone moment — reserved. */
  display: { fontSize: 48, lineHeight: 54, fontWeight: '700' as const },
} as const;

/**
 * Spacing tokens — 4pt grid. Prefer these over raw numbers in styles.
 * `xxs` covers fine adjustments (chip gaps, accent bars); `massive` is the
 * top-of-screen breathing room you'd otherwise reach for with `paddingTop:60`.
 */
export const Space = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  massive: 48,
} as const;

/**
 * Border radius scale. `xs` for inputs/small chips, `pill` for fully-rounded
 * affordances.
 */
export const Radius = {
  xs: 8, // inputs, small chips
  sm: 6, // badges, pills, chips
  md: 12, // buttons, cards, inputs
  lg: 20, // tiles, modals
  pill: 9999, // fully rounded
} as const;

/**
 * Layout tokens — percentages and ratios shared across screens. Centralizing
 * these keeps grid math out of individual StyleSheets.
 */
export const Layout = {
  /** Tile grid: 2-column with a single gap between, both as % of container. */
  gridGapPct: 4,
  tileWidthPct: 48, // (100 - gridGapPct) / 2
} as const;

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
