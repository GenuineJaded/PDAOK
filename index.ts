/**
 * index.ts — Custom app entry point
 *
 * This file replaces the default `expo-router/entry` so we can register the
 * Android widget task handler before the React Native app boots.
 *
 * The `registerWidgetTaskHandler` call must happen at module load time (i.e.
 * outside any component) so that the headless background task is available
 * even when the app is not in the foreground.
 */

import 'expo-router/entry';
import { registerWidgetTaskHandler } from 'react-native-android-widget';
import { widgetTaskHandler } from './widget/widgetTaskHandler';

registerWidgetTaskHandler(widgetTaskHandler);
