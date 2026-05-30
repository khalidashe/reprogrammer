import { Platform } from 'react-native';
import Purchases, {
  LOG_LEVEL,
  type CustomerInfo,
  type PurchasesPackage,
  type PurchasesOffering,
} from 'react-native-purchases';

const IOS_KEY = process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY;
const ANDROID_KEY = process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY;

let configured = false;

function apiKey(): string | null {
  if (Platform.OS === 'ios') return IOS_KEY ?? null;
  if (Platform.OS === 'android') return ANDROID_KEY ?? null;
  return null;
}

export function isRevenueCatAvailable(): boolean {
  return apiKey() !== null;
}

export async function configureRevenueCat(): Promise<void> {
  if (configured) return;
  const key = apiKey();
  if (!key) {
    // Web or missing key — RevenueCat skipped silently. The paywall screen
    // surfaces a friendlier error to the user when this happens.
    return;
  }
  Purchases.setLogLevel(LOG_LEVEL.WARN);
  await Purchases.configure({ apiKey: key });
  configured = true;
}

export async function identifyRevenueCatUser(userId: string): Promise<void> {
  if (!configured) await configureRevenueCat();
  if (!configured) return;
  await Purchases.logIn(userId);
}

export async function logoutRevenueCat(): Promise<void> {
  if (!configured) return;
  await Purchases.logOut();
}

export async function getCurrentOffering(): Promise<PurchasesOffering | null> {
  if (!configured) await configureRevenueCat();
  if (!configured) return null;
  const offerings = await Purchases.getOfferings();
  return offerings.current ?? null;
}

export async function purchasePackage(pkg: PurchasesPackage): Promise<CustomerInfo> {
  const result = await Purchases.purchasePackage(pkg);
  return result.customerInfo;
}

export async function restorePurchases(): Promise<CustomerInfo> {
  if (!configured) await configureRevenueCat();
  return await Purchases.restorePurchases();
}

export function addCustomerInfoListener(
  cb: (info: CustomerInfo) => void,
): () => void {
  Purchases.addCustomerInfoUpdateListener(cb);
  return () => Purchases.removeCustomerInfoUpdateListener(cb);
}
