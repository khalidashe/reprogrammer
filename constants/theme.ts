/**
 * Reprogrammer theme tokens.
 *
 * Palette is aligned to the shadcn/ui preset `b2oY2vzEG`:
 *   Style  → Vega
 *   Base   → Mist      (neutral scale with a whisper of green)
 *   Theme  → Green     (shadcn green-50..950, calm + AA-safe)
 *   Font   → Inter     (loaded in app/_layout.tsx)
 *   Icons  → Lucide-style (mapped through components/ui/icon-symbol)
 *   Radius → Default
 *
 * Semantic colors map below reflects the mental-health-app tuning:
 *   - 600/700 as primary brand (AA contrast on white/near-black)
 *   - 50–200 as soft surfaces / enabled-state tile fills
 *   - 400 reserved for celebration moments (streak milestones)
 *   - complementary amber / muted red / calm blue for semantic states
 */

import { Platform } from 'react-native';

/** Raw brand palette: shadcn Green (50–950). Calm, not neon. */
export const Green = {
  50: '#f0fdf4',
  100: '#dcfce7',
  200: '#bbf7d0',
  300: '#86efac',
  400: '#4ade80',
  500: '#22c55e',
  600: '#16a34a',
  700: '#15803d',
  800: '#166534',
  900: '#14532d',
} as const;

/**
 * Raw palette: Mist neutrals (1 = white, 13 = black).
 * Standard grays with a faint green undertone so surfaces feel cohesive
 * with the brand without sacrificing the light/dark contrast of the old
 * pure-gray scale.
 */
export const Mist = {
  1: '#ffffff',
  2: '#fafbfa',
  3: '#f4f6f4',
  4: '#eef1ee',
  5: '#dde2dd',
  6: '#c3c9c3',
  7: '#8f978f',
  8: '#5f665f',
  9: '#4a514a',
  10: '#2c322c',
  11: '#232923',
  12: '#161916',
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
    text: Mist[11],
    textMuted: Mist[8],
    textOnBrand: Mist[1],

    // Surfaces
    background: Mist[1],
    surface: Mist[2],
    surfaceMuted: Mist[3],
    border: Mist[5],

    // Brand — shadcn Green, calm and AA-safe on white
    tint: Green[600],
    tintMuted: Green[200],
    tintSoft: Green[50],
    /** Reserve for celebration / streak hits — used sparingly. */
    tintCelebrate: Green[400],

    // States — used by tile fills
    stateEnabledBg: Green[200],
    stateEnabledText: Green[900],
    stateDisabledBg: Green[50],
    stateDisabledStripe: Green[200],
    stateDisabledText: Mist[8],

    // Tabs
    icon: Mist[8],
    tabIconDefault: Mist[7],
    tabIconSelected: Green[600],
    tabBarBackground: Mist[1],

    // Semantic
    success: Green[600],
    successSoft: Green[100],
    warning: Semantic.amber,
    warningSoft: Semantic.amberSoft,
    danger: Semantic.danger,
    dangerSoft: Semantic.dangerSoft,
    info: Semantic.info,
    infoSoft: Semantic.infoSoft,
  },
  dark: {
    // Foreground / text
    text: Mist[3],
    textMuted: Mist[6],
    textOnBrand: Mist[1],

    // Surfaces
    background: Mist[12],
    surface: Mist[11],
    surfaceMuted: Mist[10],
    border: Mist[10],

    // Brand — brighter green for dark backgrounds
    tint: Green[500],
    tintMuted: Green[800],
    tintSoft: Green[900],
    tintCelebrate: Green[400],

    // States
    stateEnabledBg: Green[800],
    stateEnabledText: Green[50],
    stateDisabledBg: Green[900],
    stateDisabledStripe: Green[700],
    stateDisabledText: Mist[6],

    // Tabs
    icon: Mist[6],
    tabIconDefault: Mist[7],
    tabIconSelected: Green[500],
    tabBarBackground: Mist[12],

    // Semantic
    success: Green[500],
    successSoft: Green[900],
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
/**
 * Typography scale — 5 steps + a reserved display token.
 * Each token carries its Inter family weight so that `fontWeight` resolves to
 * the real loaded face instead of synthesizing from the regular cut.
 *   body/caption       → Inter (400)
 *   bodyBold/micro     → Inter_600SemiBold
 *   h1/h2/display      → Inter_700Bold
 *   display2           → Inter_800ExtraBold
 * Spread these (`{ ...Type.body }`) into style objects; apply `color` separately.
 */
export const Type = {
  h1: { fontSize: 24, lineHeight: 30, fontWeight: '700' as const, fontFamily: 'Inter_700Bold' },
  h2: { fontSize: 18, lineHeight: 24, fontWeight: '700' as const, fontFamily: 'Inter_700Bold' },
  body: { fontSize: 15, lineHeight: 22, fontWeight: '400' as const, fontFamily: 'Inter' },
  bodyBold: { fontSize: 15, lineHeight: 22, fontWeight: '600' as const, fontFamily: 'Inter_600SemiBold' },
  caption: { fontSize: 13, lineHeight: 18, fontWeight: '400' as const, fontFamily: 'Inter' },
  micro: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '600' as const,
    fontFamily: 'Inter_600SemiBold',
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
    fontFamily: 'Inter_800ExtraBold',
    letterSpacing: -0.5,
  },
  /** Streak / milestone moment — reserved. */
  display: { fontSize: 48, lineHeight: 54, fontWeight: '700' as const, fontFamily: 'Inter_700Bold' },
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
 * affordances. Tuned to the shadcn "Default" radius language.
 */
export const Radius = {
  xs: 8, // inputs, small chips
  sm: 10, // badges, pills, chips
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

/**
 * Font families. `sans` resolves to Inter once it has been loaded by
 * expo-font in app/_layout.tsx; until then RN falls back to the system font.
 */
/**
 * Font families. `sans` resolves to the Inter regular face once loaded by
 * expo-font in app/_layout.tsx. The weighted cuts (Inter_500Medium,
 * Inter_600SemiBold, Inter_700Bold, Inter_800ExtraBold) are referenced
 * directly from the `Type` tokens so headings/bold text use the true weights.
 */
export const Fonts = Platform.select({
  ios: {
    sans: 'Inter',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'Inter',
    serif: 'serif',
    rounded: 'Inter',
    mono: 'monospace',
  },
  web: {
    sans: "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "Inter, 'SF Pro Rounded', Meiryo, sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
