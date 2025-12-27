import { AppProvider } from './_context/AppContext';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useCallback, useEffect, useState } from 'react';
import { OleoScript_700Bold } from '@expo-google-fonts/oleo-script';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { LogBox } from 'react-native';

// Suppress non-critical warnings that clutter the screen
LogBox.ignoreLogs([
  'Text strings must be rendered within a <Text> component.',
  'Non-serializable values were found in the navigation state',
]);
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ErrorBoundary } from './_components/ErrorBoundary';

import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Load custom fonts
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
      // This tells the splash screen to hide immediately! If we didn't call this,
      // we would see the splash screen stay visible until the first render.
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
          </ErrorBoundary>
        </ThemeProvider>
      </AppProvider>
    </SafeAreaProvider>
  );
}
