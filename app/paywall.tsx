import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useQuery } from 'convex/react';
import type { PurchasesOffering, PurchasesPackage } from 'react-native-purchases';
import { api } from '@/convex/_generated/api';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, Type, Space, Radius } from '@/constants/theme';
import {
  configureRevenueCat,
  getCurrentOffering,
  identifyRevenueCatUser,
  isRevenueCatAvailable,
  purchasePackage,
  restorePurchases,
} from '@/services/revenuecat';

const BULLETS = [
  'Unlimited states (free is capped at 3)',
  'Cloud sync across all your devices',
  'AI assistant for refining behaviors',
  'Full library — every guide and pack',
];

export default function PaywallScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const userId = useQuery(api.users.getCurrentUserId);
  const isSignedIn = userId != null;

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
          Alert.alert('Could not load offers', e?.message ?? 'Unknown error');
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const handlePurchase = async (pkg: PurchasesPackage) => {
    if (!isSignedIn) {
      router.push('/auth');
      return;
    }
    setPurchasing(pkg.identifier);
    try {
      await purchasePackage(pkg);
      Alert.alert('Welcome to Pro', 'Your subscription is active.');
      router.back();
    } catch (e: any) {
      if (!e?.userCancelled) {
        Alert.alert('Purchase failed', e?.message ?? 'Unknown error');
      }
    } finally {
      setPurchasing(null);
    }
  };

  const handleRestore = async () => {
    try {
      await restorePurchases();
      Alert.alert('Purchases restored', 'Any active subscription is now applied.');
    } catch (e: any) {
      Alert.alert('Restore failed', e?.message ?? 'Unknown error');
    }
  };

  const monthly = offering?.monthly ?? null;
  const annual = offering?.annual ?? null;

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>Reprogrammer Pro</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          Go deeper. Sync everywhere. Use the assistant.
        </Text>

        <View style={[styles.bulletCard, { backgroundColor: colors.tintSoft, borderColor: colors.tintMuted }]}>
          {BULLETS.map((b) => (
            <View key={b} style={styles.bulletRow}>
              <Text style={[styles.bulletDot, { color: colors.tint }]}>•</Text>
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

        <Pressable onPress={handleRestore} style={styles.restoreRow}>
          <Text style={[Type.caption, { color: colors.tint }]}>Restore purchases</Text>
        </Pressable>

        <Pressable onPress={() => router.back()} style={styles.cancelRow}>
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
  colors: ReturnType<typeof useColorScheme> extends 'light' ? typeof Colors.light : typeof Colors.dark;
  disabled: boolean;
  loading: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.priceCard,
        {
          backgroundColor: isPrimary ? colors.tint : colors.surface,
          borderColor: isPrimary ? colors.tint : colors.border,
          opacity: disabled && !loading ? 0.6 : 1,
        },
      ]}
      accessibilityLabel={`${title} ${priceLabel}${period}`}
    >
      <Text
        style={[
          styles.priceTitle,
          { color: isPrimary ? colors.textOnBrand : colors.text },
        ]}
      >
        {title}
      </Text>
      <View style={styles.priceRow}>
        <Text
          style={[
            styles.priceAmount,
            { color: isPrimary ? colors.textOnBrand : colors.text },
          ]}
        >
          {priceLabel}
        </Text>
        <Text
          style={[
            styles.pricePeriod,
            { color: isPrimary ? colors.textOnBrand : colors.textMuted },
          ]}
        >
          {period}
        </Text>
      </View>
      {badge && (
        <Text
          style={[
            styles.priceBadge,
            { color: isPrimary ? colors.textOnBrand : colors.tint },
          ]}
        >
          {badge}
        </Text>
      )}
      {loading && (
        <ActivityIndicator
          style={styles.priceSpinner}
          color={isPrimary ? colors.textOnBrand : colors.tint}
        />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: Space.xxl, gap: Space.lg },
  title: { ...Type.h1, textAlign: 'center' },
  subtitle: { ...Type.body, textAlign: 'center' },
  bulletCard: {
    padding: Space.lg,
    borderRadius: Radius.md,
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
    borderRadius: Radius.md,
    borderWidth: 2,
    gap: Space.xs,
  },
  priceTitle: { ...Type.bodyBold },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: Space.xs },
  priceAmount: { ...Type.h1 },
  pricePeriod: { ...Type.caption },
  priceBadge: { ...Type.caption, fontWeight: '600' },
  priceSpinner: { position: 'absolute', right: Space.md, top: Space.md },
  restoreRow: { alignItems: 'center', paddingTop: Space.md },
  cancelRow: { alignItems: 'center', paddingTop: Space.xs },
});
