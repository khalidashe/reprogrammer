import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as Notifications from 'expo-notifications';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import 'react-native-reanimated';
import { ConvexAuthProvider } from '@convex-dev/auth/react';
import { useConvexAuth } from 'convex/react';

import { useColorScheme } from '@/hooks/use-color-scheme';
import useStore from '@/store/useStore';
import {
  handleNotificationAction,
  requestNotificationPermission,
  rescheduleAll,
  setupNotificationCategory,
} from '@/services/notifications';
import { AnimatedSplash } from '@/components/animated-splash';
import { ContentModalsProvider } from '@/components/library/content-modals-provider';
import { FeedbackProvider } from '@/components/ui/feedback';
import { convex } from '@/services/convex-client';
import { authSecureStorage } from '@/services/secure-storage';
import { useCloudSyncBootstrap } from '@/hooks/useCloudSyncBootstrap';
import { DEV_SKIP_AUTH } from '@/services/dev-flags';

// Hold the native splash until the JS splash has painted, so the >R_ mark hands
// off seamlessly into the blinking-cursor AnimatedSplash (REP-43).
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  return (
    <ConvexAuthProvider client={convex} storage={authSecureStorage}>
      <AppShell />
    </ConvexAuthProvider>
  );
}

function AppShell() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const pathname = usePathname();
  const isHydrated = useStore((state) => state.isHydrated);
  const appProfile = useStore((state) => state.appProfile);
  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
  const notificationListener = useRef<any>(null);
  const responseListener = useRef<any>(null);

  useCloudSyncBootstrap();

  // Reveal the JS tree (AnimatedSplash, then the app) once it has mounted.
  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  // Launch gate (REP-46). The account is a hard wall: every user signs up
  // before reaching the app. `useConvexAuth` reads the cached token, so a
  // signed-in user still passes this gate offline.
  useEffect(() => {
    if (!isHydrated || authLoading) return;

    // Dev-only (double-gated): skip the onboarding/sign-in wall so local builds
    // land straight in the app for screenshots. Inert in production.
    if (DEV_SKIP_AUTH) {
      if (pathname === '/onboarding' || pathname === '/auth') router.replace('/(tabs)');
      return;
    }

    if (!appProfile.hasOnboarded) {
      // New users run the teaching flow; the sign-up wall sits at its end.
      if (pathname !== '/onboarding') router.replace('/onboarding');
    } else if (!isAuthenticated) {
      // Onboarded but signed out (signed out in Settings, or an expired
      // session): the account is mandatory, so re-gate at the sign-in wall.
      if (pathname !== '/auth') router.replace('/auth');
    } else if (pathname === '/onboarding' || pathname === '/auth') {
      // Signed in and onboarded: leave the gate screens for the app.
      router.replace('/(tabs)');
    }
  }, [isHydrated, authLoading, appProfile.hasOnboarded, isAuthenticated, pathname, router]);

  useEffect(() => {
    const setup = async () => {
      await useStore.getState().hydrate();
      // New users grant notifications inside onboarding, after the priming step
      // explains why. Only returning (onboarded) users get the prompt at launch.
      if (useStore.getState().appProfile.hasOnboarded) {
        const granted = await requestNotificationPermission();
        await useStore.getState().updateAppProfile({ notificationsDenied: !granted });
      }
      await setupNotificationCategory();

      notificationListener.current = Notifications.addNotificationReceivedListener(
        (notification) => {
          console.log('Notification received:', notification);
          rescheduleAll();
        }
      );

      responseListener.current = Notifications.addNotificationResponseReceivedListener(
        (response) => {
          const data = response.notification.request.content.data as {
            behaviorId?: string;
            attemptId?: string;
            phase?: string;
            onboardingDemo?: boolean;
          };

          // Onboarding's demo ping just walks the first-run tour forward (REP-39):
          // route back into onboarding and jump to the logging-options step.
          if (data.onboardingDemo) {
            router.navigate({ pathname: '/onboarding', params: { demo: 'logging' } });
            return;
          }

          const { behaviorId, attemptId, phase } = data;
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

  if (!isHydrated) {
    return <AnimatedSplash />;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <FeedbackProvider>
        <ContentModalsProvider>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="onboarding" options={{ headerShown: false }} />
            <Stack.Screen name="checkin" options={{ presentation: 'modal', title: 'Check In' }} />
            <Stack.Screen name="create" options={{ presentation: 'modal', headerShown: false }} />
            <Stack.Screen
              name="focus"
              options={{ presentation: 'fullScreenModal', headerShown: false, gestureEnabled: false }}
            />
            <Stack.Screen
              name="program-session"
              options={{ presentation: 'fullScreenModal', headerShown: false, gestureEnabled: false }}
            />
            <Stack.Screen name="behavior/[id]" options={{ title: 'Behavior' }} />
            <Stack.Screen name="auth" options={{ presentation: 'modal', title: 'Sign In' }} />
            <Stack.Screen name="paywall" options={{ presentation: 'modal', title: 'Reprogrammer Pro' }} />
            <Stack.Screen name="settings" options={{ title: 'Settings' }} />
            <Stack.Screen name="goals" options={{ presentation: 'modal', title: 'Your goals' }} />
            <Stack.Screen
              name="privacy-sync-consent"
              options={{ presentation: 'modal', title: 'Private sync' }}
            />
            <Stack.Screen name="how-it-works" options={{ title: 'How it works' }} />
            <Stack.Screen name="manage-behaviors" options={{ title: 'Saved & archived' }} />
            <Stack.Screen name="review" options={{ title: 'Weekly review' }} />
            <Stack.Screen name="reflections" options={{ title: 'Reflections' }} />
          </Stack>
        </ContentModalsProvider>
      </FeedbackProvider>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
