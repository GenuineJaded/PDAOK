/**
 * +not-found.tsx
 *
 * Safety net for the widget deep-link flow.
 *
 * The Android home-screen widget fires URLs of the form
 *   pdaok://?action=quick-log&type=<category>
 *
 * which our handler in _layout.tsx catches and turns into a modal. But
 * Expo Router also subscribes to Linking events and tries to match the
 * URL against a route — so on the second-and-later taps of the widget
 * the router sometimes wins the race, navigates to a non-existent
 * route, and lands the user on this screen.
 *
 * Rather than stranding the user, this screen quietly redirects back to
 * the tabs root. If they were trying to quick-log, _layout's deep-link
 * handler still fires on the way through and the correct modal opens.
 * They'll never see this screen for more than a single frame.
 */

import { Redirect } from 'expo-router';

export default function NotFound() {
  return <Redirect href="/(tabs)" />;
}
