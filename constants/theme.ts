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
