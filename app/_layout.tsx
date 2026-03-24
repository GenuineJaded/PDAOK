import { AppProvider } from './_context/AppContext';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useCallback, useEffect, useRef, useState } from 'react';
import { OleoScript_700Bold } from '@expo-google-fonts/oleo-script';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { Linking, LogBox } from 'react-native';

// Suppress non-critical warnings that clutter the screen
LogBox.ignoreLogs([
  'Text strings must be rendered within a <Text> component.',
  'Non-serializable values were found in the navigation state',
  '[Layout children]:', // Expo Router incorrectly warns about underscore-prefixed folders
]);
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ErrorBoundary } from './_components/ErrorBoundary';

import { useColorScheme } from '@/hooks/use-color-scheme';

// Quick-log modals surfaced by the Android home screen widget
import { QuickLogModal } from './_modal/QuickLogModal';
import { QuickSubstanceSynthesisModal } from './_modal/QuickSubstanceSynthesisModal';
import { WidgetFoodModal } from './_modal/WidgetFoodModal';
import { WidgetMovementModal } from './_modal/WidgetMovementModal';

export const unstable_settings = {
  anchor: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// ---------------------------------------------------------------------------
// Deep-link helpers
// ---------------------------------------------------------------------------

type QuickLogCategory = 'substance' | 'nourish' | 'movement' | 'picker';

/**
 * Parse a pdaok://quick-log?type=<category> URL and return the category,
 * or null if the URL is not a quick-log deep link.
 */
function parseQuickLogDeepLink(url: string): QuickLogCategory | null {
  try {
    const parsed = new URL(url);
    if (parsed.hostname !== 'quick-log') return null;
    const type = parsed.searchParams.get('type');
    if (type === 'substance' || type === 'nourish' || type === 'movement') {
      return type;
    }
    // No specific type → show the picker
    return 'picker';
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Root layout
// ---------------------------------------------------------------------------

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [appIsReady, setAppIsReady] = useState(false);

  // ---- Widget quick-log modal state ----
  const [isQuickLogPickerVisible, setIsQuickLogPickerVisible] = useState(false);
  const [isQuickSubstanceVisible, setIsQuickSubstanceVisible] = useState(false);
  const [isAddFoodVisible, setIsAddFoodVisible] = useState(false);
  const [isAddMovementVisible, setIsAddMovementVisible] = useState(false);

  // Pending category to open once the app is ready (cold-start case)
  const pendingCategory = useRef<QuickLogCategory | null>(null);

  // ---- Open the correct modal for a given category ----
  const openQuickLogCategory = useCallback(
    (category: QuickLogCategory) => {
      if (category === 'substance') {
        setIsQuickSubstanceVisible(true);
      } else if (category === 'nourish') {
        setIsAddFoodVisible(true);
      } else if (category === 'movement') {
        setIsAddMovementVisible(true);
      } else {
        // 'picker' — show the category chooser
        setIsQuickLogPickerVisible(true);
      }
    },
    []
  );

  // ---- Handle an incoming deep-link URL ----
  const handleDeepLink = useCallback(
    (url: string) => {
      const category = parseQuickLogDeepLink(url);
      if (!category) return;

      if (!appIsReady) {
        // App is still loading; queue the action
        pendingCategory.current = category;
      } else {
        openQuickLogCategory(category);
      }
    },
    [appIsReady, openQuickLogCategory]
  );

  // ---- Font loading ----
  useEffect(() => {
    async function prepare() {
      try {
        await Font.loadAsync({
          'OleoScript-Bold': OleoScript_700Bold,
        });
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
      }
    }
    prepare();
  }, []);

  // ---- Process any pending deep link once the app is ready ----
  useEffect(() => {
    if (appIsReady && pendingCategory.current) {
      openQuickLogCategory(pendingCategory.current);
      pendingCategory.current = null;
    }
  }, [appIsReady, openQuickLogCategory]);

  // ---- Subscribe to deep links (foreground + cold-start) ----
  useEffect(() => {
    // Cold-start: app was not running when the widget was tapped
    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink(url);
    });

    // Foreground: app was already running
    const subscription = Linking.addEventListener('url', ({ url }) => {
      handleDeepLink(url);
    });

    return () => subscription.remove();
  }, [handleDeepLink]);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }

  return (
    <SafeAreaProvider onLayout={onLayoutRootView}>
      <AppProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <ErrorBoundary>
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
            </Stack>
            <StatusBar style="auto" />

            {/* ----------------------------------------------------------------
                Widget quick-log modals
                These live at the root layout level so they are always available
                regardless of which tab or screen is currently active.
            ---------------------------------------------------------------- */}

            {/* Step 1: Category picker (shown when widget tap has no specific type) */}
            <QuickLogModal
              isVisible={isQuickLogPickerVisible}
              onClose={() => setIsQuickLogPickerVisible(false)}
              onSelectCategory={(category) => {
                setIsQuickLogPickerVisible(false);
                openQuickLogCategory(category);
              }}
            />

            {/* Step 2a: Substance quick-log */}
            <QuickSubstanceSynthesisModal
              isVisible={isQuickSubstanceVisible}
              onClose={() => setIsQuickSubstanceVisible(false)}
              container={undefined as any}
              activeArchetype={undefined}
            />

            {/* Step 2b: Nourish / food log */}
            <WidgetFoodModal
              isVisible={isAddFoodVisible}
              onClose={() => setIsAddFoodVisible(false)}
            />

            {/* Step 2c: Movement log */}
            <WidgetMovementModal
              isVisible={isAddMovementVisible}
              onClose={() => setIsAddMovementVisible(false)}
            />
          </ErrorBoundary>
        </ThemeProvider>
      </AppProvider>
    </SafeAreaProvider>
  );
}
