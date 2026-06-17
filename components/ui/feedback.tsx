/**
 * Themed feedback primitives — a calm dark-premium replacement for the native
 * `Alert.alert`, which is un-themed and does not render on web at all.
 *
 * - `useFeedback().showSheet({ title, message?, actions })` — a bottom sheet for
 *   confirmations and action choices. Mirrors Alert.alert(title, message, buttons)
 *   so call sites convert 1:1. Cancel-styled actions float to the bottom.
 * - `useFeedback().showToast(message)` — a transient, auto-dismissing toast for
 *   success / info notifications that don't need a decision.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { View, Text, Pressable, Modal, StyleSheet } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import {
  Colors,
  Type,
  Space,
  Radius,
  PRESSED_OPACITY,
  type ThemeColors,
} from '@/constants/theme';
import { haptics } from '@/services/haptics';

export type SheetActionStyle = 'default' | 'cancel' | 'destructive';

export interface SheetAction {
  label: string;
  onPress?: () => void;
  style?: SheetActionStyle;
}

export interface SheetConfig {
  title: string;
  message?: string;
  actions: SheetAction[];
}

interface FeedbackApi {
  showSheet: (config: SheetConfig) => void;
  showToast: (message: string) => void;
}

const FeedbackContext = createContext<FeedbackApi | null>(null);

export function useFeedback(): FeedbackApi {
  const ctx = useContext(FeedbackContext);
  if (!ctx) {
    throw new Error('useFeedback must be used inside FeedbackProvider');
  }
  return ctx;
}

const TOAST_MS = 2600;

export function FeedbackProvider({ children }: { children: ReactNode }) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [sheet, setSheet] = useState<SheetConfig | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showSheet = useCallback((config: SheetConfig) => setSheet(config), []);

  const showToast = useCallback((message: string) => {
    setToast(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), TOAST_MS);
  }, []);

  useEffect(
    () => () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    },
    []
  );

  const dismissSheet = useCallback(() => setSheet(null), []);

  const runAction = useCallback((action: SheetAction) => {
    setSheet(null);
    if (action.style === 'destructive') haptics.warning();
    else if (action.style === 'cancel') haptics.selection();
    else haptics.light();
    action.onPress?.();
  }, []);

  const api = useMemo<FeedbackApi>(() => ({ showSheet, showToast }), [showSheet, showToast]);

  // Cancel actions float to the bottom (iOS action-sheet convention), regardless
  // of where they sat in the source button array.
  const ordered = sheet
    ? [
        ...sheet.actions.filter((a) => a.style !== 'cancel'),
        ...sheet.actions.filter((a) => a.style === 'cancel'),
      ]
    : [];

  return (
    <FeedbackContext.Provider value={api}>
      <View style={styles.root}>
        {children}
        {toast ? (
          <View style={styles.toastWrap} pointerEvents="none">
            <View
              style={[
                styles.toast,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <Text style={[styles.toastText, { color: colors.text }]}>{toast}</Text>
            </View>
          </View>
        ) : null}
      </View>

      <Modal
        visible={sheet !== null}
        transparent
        animationType="slide"
        onRequestClose={dismissSheet}
      >
        <Pressable style={styles.backdrop} onPress={dismissSheet} accessibilityLabel="Dismiss">
          <Pressable
            style={[
              styles.sheet,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
            // Swallow taps on the sheet body so they don't dismiss.
            onPress={() => {}}
          >
            {sheet ? (
              <>
                <Text style={[styles.sheetTitle, { color: colors.text }]}>{sheet.title}</Text>
                {sheet.message ? (
                  <Text style={[styles.sheetMessage, { color: colors.textMuted }]}>
                    {sheet.message}
                  </Text>
                ) : null}
                <View style={styles.actions}>
                  {ordered.map((action, i) => (
                    <ActionButton
                      key={`${action.label}-${i}`}
                      action={action}
                      colors={colors}
                      onRun={runAction}
                    />
                  ))}
                </View>
              </>
            ) : null}
          </Pressable>
        </Pressable>
      </Modal>
    </FeedbackContext.Provider>
  );
}

function ActionButton({
  action,
  colors,
  onRun,
}: {
  action: SheetAction;
  colors: ThemeColors;
  onRun: (a: SheetAction) => void;
}) {
  const destructive = action.style === 'destructive';
  const cancel = action.style === 'cancel';
  const bg = destructive
    ? colors.dangerSoft
    : cancel
      ? 'transparent'
      : colors.surfaceMuted;
  const fg = destructive ? colors.danger : cancel ? colors.textMuted : colors.text;
  return (
    <Pressable
      onPress={() => onRun(action)}
      accessibilityRole="button"
      accessibilityLabel={action.label}
      style={({ pressed }) => [
        styles.actionButton,
        { backgroundColor: bg, borderColor: colors.border },
        cancel && styles.actionCancel,
        pressed && { opacity: PRESSED_OPACITY },
      ]}
    >
      <Text style={[styles.actionText, { color: fg }]}>{action.label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
    borderTopLeftRadius: Radius.lg,
    borderTopRightRadius: Radius.lg,
    borderWidth: 1,
    paddingHorizontal: Space.xl,
    paddingTop: Space.xl,
    paddingBottom: Space.xxxl,
    gap: Space.xs,
  },
  sheetTitle: { ...Type.h2, textAlign: 'center' },
  sheetMessage: { ...Type.body, textAlign: 'center', marginTop: Space.xs },
  actions: { gap: Space.sm, marginTop: Space.lg },
  actionButton: {
    minHeight: 50,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Space.lg,
  },
  actionCancel: { marginTop: Space.xs },
  actionText: { ...Type.bodyBold },
  toastWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: Space.massive,
    alignItems: 'center',
    paddingHorizontal: Space.xl,
  },
  toast: {
    maxWidth: 440,
    borderWidth: 1,
    borderRadius: Radius.pill,
    paddingHorizontal: Space.lg,
    paddingVertical: Space.md,
  },
  toastText: { ...Type.caption, textAlign: 'center' },
});
