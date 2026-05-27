import { AppProvider, useApp } from './_context/AppContext';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useCallback, useEffect, useRef, useState } from 'react';
import { OleoScript_700Bold } from '@expo-google-fonts/oleo-script';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { BackHandler, Linking, LogBox, Platform } from 'react-native';

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
import { getCurrentContainer } from './_utils/time';

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
 * Parse a quick-log deep link and return the category, or null if it isn't one.
 *
 * Accepts three URL shapes for resilience:
 *   1. pdaok://?action=quick-log&type=<category>   (current — no hostname,
 *      so Expo Router has nothing to try to route to)
 *   2. pdaok://quick-log?type=<category>           (legacy — older widgets
 *      still installed on devices may emit this)
 *   3. pdaok://quicklog?type=<category>            (defensive — in case
 *      Android ever normalizes the hyphen out)
 */
function parseQuickLogDeepLink(url: string): QuickLogCategory | null {
  try {
    const parsed = new URL(url);

    const action = parsed.searchParams.get('action');
    const hostname = parsed.hostname;

    const isQuickLog =
      action === 'quick-log' ||
      hostname === 'quick-log' ||
      hostname === 'quicklog';

    if (!isQuickLog) return null;

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
// Widget quick-log host
//
// Owns the quick-log modals surfaced by the home-screen widget. Lives inside
// AppProvider so it can flush pending writes before the app is backgrounded.
//
// Two behaviors that matter when these are launched from the widget:
//   1. Only ONE quick-log modal is ever open. A single `active` value (instead
//      of independent booleans) means repeated widget taps replace the current
//      modal rather than stacking a pile of them inside the app.
//   2. Dismissing a modal (cancel OR save) returns the user to the home screen
//      on Android, so they aren't stranded inside the app after a quick log.
//      We flush pending writes first so a just-submitted entry survives the
//      activity finishing (the auto-save is otherwise debounced).
// ---------------------------------------------------------------------------

function WidgetQuickLogHost() {
  const { flushPendingWrites } = useApp();
  const [active, setActive] = useState<QuickLogCategory | null>(null);

  // True while the picker hands off to a specific category — distinguishes a
  // selection (don't return home) from a real dismissal of the picker.
  const transitioning = useRef(false);
  // True when the current close should return the user to the launcher.
  const returnHome = useRef(false);

  // ---- Deep links (cold-start + foreground). This host only mounts once the
  // app is ready, so getInitialURL covers the cold-start case directly. ----
  useEffect(() => {
    Linking.getInitialURL().then((url) => {
      if (!url) return;
      const category = parseQuickLogDeepLink(url);
      if (category) setActive(category);
    });

    const subscription = Linking.addEventListener('url', ({ url }) => {
      const category = parseQuickLogDeepLink(url);
      if (category) setActive(category);
    });

    return () => subscription.remove();
  }, []);

  // ---- After a dismissal commits, flush writes and background the app ----
  useEffect(() => {
    if (active === null && returnHome.current) {
      returnHome.current = false;
      (async () => {
        await flushPendingWrites();
        if (Platform.OS === 'android') {
          BackHandler.exitApp();
        }
      })();
    }
  }, [active, flushPendingWrites]);

  const dismiss = useCallback(() => {
    returnHome.current = true;
    setActive(null);
  }, []);

  // The picker calls onSelectCategory then its own onClose. Mark the handoff so
  // that trailing onClose neither returns home nor clears the new category.
  const handlePickerClose = useCallback(() => {
    if (transitioning.current) {
      transitioning.current = false;
      return;
    }
    dismiss();
  }, [dismiss]);

  const handleSelectCategory = useCallback((category: QuickLogCategory) => {
    transitioning.current = true;
    setActive(category);
  }, []);

  return (
    <>
      {/* Step 1: Category picker (shown when widget tap has no specific type) */}
      <QuickLogModal
        isVisible={active === 'picker'}
        onClose={handlePickerClose}
        onSelectCategory={handleSelectCategory}
      />

      {/* Step 2a: Substance quick-log
          Pass the current time container so the modal carries the field's
          signature color (Morning / Afternoon / Evening / Late) instead of
          falling through to the dead default. */}
      <QuickSubstanceSynthesisModal
        isVisible={active === 'substance'}
        onClose={dismiss}
        container={getCurrentContainer()}
        activeArchetype={undefined}
      />

      {/* Step 2b: Nourish / food log */}
      <WidgetFoodModal isVisible={active === 'nourish'} onClose={dismiss} />

      {/* Step 2c: Movement log */}
      <WidgetMovementModal isVisible={active === 'movement'} onClose={dismiss} />
    </>
  );
}

// ---------------------------------------------------------------------------
// Root layout
// ---------------------------------------------------------------------------

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [appIsReady, setAppIsReady] = useState(false);

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

            {/* Quick-log modals surfaced by the Android home-screen widget.
                Kept at the root so they are available regardless of the active
                tab, and inside AppProvider so they can persist before exit. */}
            <WidgetQuickLogHost />
          </ErrorBoundary>
        </ThemeProvider>
      </AppProvider>
    </SafeAreaProvider>
  );
}
