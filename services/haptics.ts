/**
 * Thin semantic wrapper over expo-haptics. iOS-only (matching `HapticTab`);
 * on web/Android every call is a harmless no-op, so callers never need a guard.
 *
 * Use the *meaning*, not the raw API:
 * - `selection()` — toggling a chip / pill / segment / switch.
 * - `light()`     — confirming a primary, non-destructive action.
 * - `success()`   — an earned moment (a completed check-in, a behavior added).
 * - `warning()`   — a destructive confirmation (delete).
 */
import * as Haptics from 'expo-haptics';

const enabled = (): boolean => process.env.EXPO_OS === 'ios';

export const haptics = {
  selection() {
    if (enabled()) void Haptics.selectionAsync();
  },
  light() {
    if (enabled()) void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  },
  success() {
    if (enabled()) void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  },
  warning() {
    if (enabled()) void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  },
};
