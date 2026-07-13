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
>>>>>>> mine/main
  },
};

export type ThemeName = keyof typeof Colors;
export type ThemeColors = ThemeVariant;

/**
 * Standard pressed-state opacity for tappable surfaces. Use via Pressable's
 * function-style: `style={({ pressed }) => [base, pressed && { opacity: PRESSED_OPACITY }]}`.
 * Keeps touch feedback consistent and calm across the app.
 */
export const PRESSED_OPACITY = 0.85;

/**
 * Canonical "selected / active control" treatment — a soft tint, NEVER a
 * saturated fill. This is the single source of truth for selected chips, the
 * active segment of a toggle, on-state switches, open pickers, and any control
 * the user has chosen. Pair the label/icon with `colors.accentText`.
 *
 * The brand green (`tint`) is reserved as a surgical accent for genuinely
 * affirmative / progress / mastery moments — typically the ONE primary action
 * on a screen — not for every selectable control. The base style should set
 * `borderWidth: 1` so the border reads.
 */
export function controlSelected(c: ThemeColors): { backgroundColor: string; borderColor: string } {
  return { backgroundColor: c.tintSoft, borderColor: c.tintMuted };
}

/** Resting (unselected) counterpart to {@link controlSelected}. */
export function controlResting(c: ThemeColors): { backgroundColor: string; borderColor: string } {
  return { backgroundColor: c.surfaceMuted, borderColor: c.border };
}

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
