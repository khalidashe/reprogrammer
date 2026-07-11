import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
} from '@expo-google-fonts/inter';
import * as Notifications from 'expo-notifications';
import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import 'react-native-reanimated';
import { ConvexAuthProvider } from '@convex-dev/auth/react';

import { useColorScheme } from '@/hooks/use-color-scheme';
import useStore from '@/store/useStore';
import {
  handleNotificationAction,
  requestNotificationPermission,
  rescheduleAll,
  setupNotificationCategory,
} from '@/services/notifications';
import { ContentModalsProvider } from '@/components/library/content-modals-provider';
import { convex } from '@/services/convex-client';
import { authSecureStorage } from '@/services/secure-storage';
import { useCloudSyncBootstrap } from '@/hooks/useCloudSyncBootstrap';

export default function RootLayout() {
  return (
    <ConvexAuthProvider client={convex} storage={authSecureStorage}>
      <AppShell />
    </ConvexAuthProvider>
  );
}

function AppShell() {
  const colorScheme = useColorScheme();
  const [fontsLoaded] = useFonts({
    Inter: Inter_400Regular,
    Inter_500Medium: Inter_500Medium,
    Inter_600SemiBold: Inter_600SemiBold,
    Inter_700Bold: Inter_700Bold,
    Inter_800ExtraBold: Inter_800ExtraBold,
  });
  const router = useRouter();
  const pathname = usePathname();
  const isHydrated = useStore((state) => state.isHydrated);
  const appProfile = useStore((state) => state.appProfile);
  const notificationListener = useRef<any>(null);
  const responseListener = useRef<any>(null);

  useCloudSyncBootstrap();

  useEffect(() => {
    if (!isHydrated) return;
    if (!appProfile.hasOnboarded && pathname !== '/onboarding') {
      router.replace('/onboarding');
    } else if (appProfile.hasOnboarded && pathname === '/onboarding') {
      router.replace('/(tabs)');
    }
  }, [isHydrated, appProfile.hasOnboarded, pathname, router]);

  useEffect(() => {
    const setup = async () => {
      await useStore.getState().hydrate();
      const granted = await requestNotificationPermission();
      await useStore.getState().updateAppProfile({ notificationsDenied: !granted });
      await setupNotificationCategory();

      notificationListener.current = Notifications.addNotificationReceivedListener(
        (notification) => {
          console.log('Notification received:', notification);
          rescheduleAll();
        }
      );

      responseListener.current = Notifications.addNotificationResponseReceivedListener(
        (response) => {
          const { behaviorId, attemptId, phase } = response.notification.request.content.data as {
            behaviorId?: string;
            attemptId?: string;
            phase?: string;
          };
          const actionId = response.actionIdentifier;

          if (!behaviorId || !attemptId) return;

          if (actionId === Notifications.DEFAULT_ACTION_IDENTIFIER) {
            router.push({
              pathname: '/checkin',
              params: { behaviorId, attemptId, phase: phase || 'initial' },
            });
          } else {
            handleNotificationAction(behaviorId, attemptId, actionId);
          }
        }
      );

      await rescheduleAll({ force: true });
    };

    setup();

    const onAppStateChange = (state: AppStateStatus) => {
      if (state === 'active') {
        rescheduleAll();
      }
    };
    const sub = AppState.addEventListener('change', onAppStateChange);

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
      sub.remove();
    };
  }, [router]);

  if (!isHydrated || !fontsLoaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <ContentModalsProvider>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="onboarding" options={{ headerShown: false }} />
          <Stack.Screen name="checkin" options={{ presentation: 'modal', title: 'Check In' }} />
          <Stack.Screen name="create" options={{ presentation: 'modal', title: 'Create State' }} />
          <Stack.Screen name="behavior/[id]" options={{ title: 'State' }} />
          <Stack.Screen name="auth" options={{ presentation: 'modal', title: 'Sign In' }} />
          <Stack.Screen name="paywall" options={{ presentation: 'modal', title: 'Reprogrammer Pro' }} />
          <Stack.Screen name="settings" options={{ title: 'Settings' }} />
        </Stack>
      </ContentModalsProvider>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
