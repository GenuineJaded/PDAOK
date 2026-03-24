/**
 * widgetTaskHandler.ts
 *
 * Headless task handler for the QuickLog Android widget.
 *
 * Lifecycle events handled:
 *   WIDGET_ADDED   – draw the initial widget UI
 *   WIDGET_UPDATE  – redraw (called periodically or on demand)
 *   WIDGET_RESIZED – redraw at new size
 *   WIDGET_DELETED – no-op (clean-up not needed for this widget)
 *   WIDGET_CLICK   – open the app via a deep link to the correct modal
 *
 * The WIDGET_CLICK path uses Linking.openURL with the `pdaok://` scheme
 * so the app can intercept the URL in its root layout and navigate
 * directly to the requested quick-log modal.
 */

import { Linking } from 'react-native';
import type { WidgetTaskHandler } from 'react-native-android-widget';
import { QuickLogWidget } from './QuickLogWidget';
import React from 'react';

// ---------------------------------------------------------------------------
// Deep-link scheme (must match the `scheme` field in app.json)
// ---------------------------------------------------------------------------

const SCHEME = 'pdaok';

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

export const widgetTaskHandler: WidgetTaskHandler = async ({
  widgetAction,
  renderWidget,
  clickAction,
  clickActionData,
}) => {
  switch (widgetAction) {
    // -----------------------------------------------------------------------
    // Render / refresh the widget
    // -----------------------------------------------------------------------
    case 'WIDGET_ADDED':
    case 'WIDGET_UPDATE':
    case 'WIDGET_RESIZED':
      renderWidget(<QuickLogWidget />);
      break;

    // -----------------------------------------------------------------------
    // User tapped one of the rows
    // -----------------------------------------------------------------------
    case 'WIDGET_CLICK': {
      // Re-render so the widget stays fresh
      renderWidget(<QuickLogWidget />);

      // Determine which category was tapped
      const category =
        (clickActionData as { category?: string } | undefined)?.category ??
        clickAction ??
        'substance';

      // Open the app at the correct quick-log modal via deep link
      const url = `${SCHEME}://quick-log?type=${category}`;
      try {
        await Linking.openURL(url);
      } catch (err) {
        // Fallback: just open the app root if the deep link fails
        await Linking.openURL(`${SCHEME}://`).catch(() => null);
      }
      break;
    }

    case 'WIDGET_DELETED':
    default:
      // Nothing to do
      break;
  }
};
