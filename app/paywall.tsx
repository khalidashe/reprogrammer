import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useQuery } from 'convex/react';
import type { PurchasesOffering, PurchasesPackage } from 'react-native-purchases';
import { api } from '@/convex/_generated/api';
import { useColorScheme } from '@/hooks/use-color-scheme';
import {
  Colors,
  Type,
  Space,
  Radius,
  PRESSED_OPACITY,
  controlSelected,
  type ThemeColors,
} from '@/constants/theme';
import {
  configureRevenueCat,
  getCurrentOffering,
  identifyRevenueCatUser,
  isRevenueCatAvailable,
  purchasePackage,
  restorePurchases,
} from '@/services/revenuecat';
import { useFeedback } from '@/components/ui/feedback';

const BULLETS = [
  'Build as many behaviors as you like',
  'Your progress, synced across all your devices',
  'A personal AI assistant to refine each behavior',
  'The full library of guides and programs',
];

export default function PaywallScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const userId = useQuery(api.users.getCurrentUserId);
  const isSignedIn = userId != null;
  const { showSheet } = useFeedback();

  const [offering, setOffering] = useState<PurchasesOffering | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [unsupported, setUnsupported] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!isRevenueCatAvailable()) {
        setUnsupported(true);
        setLoading(false);
        return;
      }
      try {
        await configureRevenueCat();
        if (userId) {
          await identifyRevenueCatUser(userId);
        }
        const current = await getCurrentOffering();
        if (!cancelled) {
          setOffering(current);
          setLoading(false);
        }
      } catch (e: any) {
        if (!cancelled) {
          setLoading(false);
          showSheet({
            title: 'Could not load offers',
            message: e?.message ?? 'Something went wrong. Please try again.',
            actions: [{ label: 'OK' }],
          });
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId, showSheet]);

  const handlePurchase = async (pkg: PurchasesPackage) => {
    if (!isSignedIn) {
      router.push('/auth');
      return;
    }
    setPurchasing(pkg.identifier);
    try {
      await purchasePackage(pkg);
      showSheet({
        title: 'Welcome to Pro',
        message: 'Your subscription is active.',
        actions: [{ label: 'Great', onPress: () => router.back() }],
      });
    } catch (e: any) {
      if (!e?.userCancelled) {
        showSheet({
          title: 'Purchase failed',
          message: e?.message ?? 'Something went wrong. Please try again.',
          actions: [{ label: 'OK' }],
        });
      }
    } finally {
      setPurchasing(null);
    }
  };

  const handleRestore = async () => {
    try {
      await restorePurchases();
      showSheet({
        title: 'Purchases restored',
        message: 'Any active subscription is now applied.',
        actions: [{ label: 'OK' }],
      });
    } catch (e: any) {
      showSheet({
        title: 'Restore failed',
        message: e?.message ?? 'Something went wrong. Please try again.',
        actions: [{ label: 'OK' }],
      });
    }
  };

  const monthly = offering?.monthly ?? null;
  const annual = offering?.annual ?? null;

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>Reprogrammer Pro</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          Unlock everything, and keep your momentum going.
        </Text>

        <View style={[styles.bulletCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {BULLETS.map((b) => (
            <View key={b} style={styles.bulletRow}>
              <Text style={[styles.bulletDot, { color: colors.accentText }]}>•</Text>
              <Text style={[styles.bulletText, { color: colors.text }]}>{b}</Text>
            </View>
          ))}
        </View>

        {loading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator />
          </View>
        ) : unsupported ? (
          <Text style={[Type.body, { color: colors.textMuted, textAlign: 'center' }]}>
            {Platform.OS === 'web'
              ? 'In-app purchases are not available on the web yet. Open Reprogrammer on iOS or Android to subscribe.'
              : 'Subscriptions are unavailable on this device.'}
          </Text>
        ) : !offering ? (
          <Text style={[Type.body, { color: colors.textMuted, textAlign: 'center' }]}>
            Offers are temporarily unavailable. Please try again later.
          </Text>
        ) : (
          <View style={styles.pricing}>
            {annual && (
              <PriceCard
                title="Annual"
                priceLabel={annual.product.priceString}
                period="/ year"
                badge="7-day free trial · save ~50%"
                isPrimary
                colors={colors}
                disabled={purchasing !== null}
                loading={purchasing === annual.identifier}
                onPress={() => handlePurchase(annual)}
              />
            )}
            {monthly && (
              <PriceCard
                title="Monthly"
                priceLabel={monthly.product.priceString}
                period="/ month"
                colors={colors}
                disabled={purchasing !== null}
                loading={purchasing === monthly.identifier}
                onPress={() => handlePurchase(monthly)}
              />
            )}
          </View>
        )}

        {!isSignedIn && !unsupported && (
          <Text style={[Type.caption, { color: colors.textMuted, textAlign: 'center' }]}>
            You&apos;ll be asked to sign in before purchasing.
          </Text>
        )}

        {!unsupported && (
          <Text style={[Type.caption, { color: colors.textMuted, textAlign: 'center' }]}>
            About the price of a coffee a month. It keeps Reprogrammer independent and ad-free — and your data stays private.
          </Text>
        )}

        <Pressable
          onPress={handleRestore}
          style={({ pressed }) => [styles.restoreRow, pressed && { opacity: PRESSED_OPACITY }]}
          accessibilityRole="button"
          accessibilityLabel="Restore purchases"
        >
          <Text style={[Type.caption, { color: colors.accentText }]}>Restore purchases</Text>
        </Pressable>

        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [styles.cancelRow, pressed && { opacity: PRESSED_OPACITY }]}
          accessibilityRole="button"
          accessibilityLabel="Not now"
        >
          <Text style={[Type.caption, { color: colors.textMuted }]}>Not now</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

function PriceCard({
  title,
  priceLabel,
  period,
  badge,
  isPrimary,
  colors,
  disabled,
  loading,
  onPress,
}: {
  title: string;
  priceLabel: string;
  period: string;
  badge?: string;
  isPrimary?: boolean;
  colors: ThemeColors;
  disabled: boolean;
  loading: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.priceCard,
        isPrimary
          ? { ...controlSelected(colors), borderWidth: 2 }
          : { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 },
        disabled && !loading && { opacity: 0.6 },
        pressed && { opacity: PRESSED_OPACITY },
      ]}
      accessibilityRole="button"
      accessibilityState={{ disabled, busy: loading }}
      accessibilityLabel={`${title} ${priceLabel}${period}${isPrimary ? ', recommended' : ''}`}
    >
      <Text
        style={[styles.priceTitle, { color: isPrimary ? colors.accentText : colors.text }]}
      >
        {title}
      </Text>
      <View style={styles.priceRow}>
        <Text style={[styles.priceAmount, { color: colors.text }]}>{priceLabel}</Text>
        <Text style={[styles.pricePeriod, { color: colors.textMuted }]}>{period}</Text>
      </View>
      {badge && (
        <Text style={[styles.priceBadge, { color: colors.accentText }]}>{badge}</Text>
      )}
      {loading && (
        <ActivityIndicator style={styles.priceSpinner} color={colors.accentText} />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    padding: Space.xxl,
    gap: Space.lg,
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
  },
  title: { ...Type.h1, textAlign: 'center' },
  subtitle: { ...Type.body, textAlign: 'center' },
  bulletCard: {
    padding: Space.lg,
    borderRadius: Radius.lg,
    borderWidth: 1,
    gap: Space.sm,
  },
  bulletRow: { flexDirection: 'row', gap: Space.sm },
  bulletDot: { ...Type.bodyBold, lineHeight: 22 },
  bulletText: { ...Type.body, flex: 1 },
  loadingWrap: { padding: Space.lg, alignItems: 'center' },
  pricing: { gap: Space.md },
  priceCard: {
    padding: Space.lg,
    borderRadius: Radius.lg,
    borderWidth: 1,
    gap: Space.xs,
  },
  priceTitle: { ...Type.bodyBold },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: Space.xs },
  priceAmount: { ...Type.h1 },
  pricePeriod: { ...Type.caption },
  priceBadge: { ...Type.caption, fontWeight: '600' },
  priceSpinner: { position: 'absolute', right: Space.md, top: Space.md },
  restoreRow: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    paddingTop: Space.sm,
  },
  cancelRow: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
});
