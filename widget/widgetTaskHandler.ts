import type { WidgetTaskHandler } from 'react-native-android-widget';
import { QuickLogWidget } from './QuickLogWidget';
import React from 'react';

/**
 * Headless task handler for the QuickLog Android widget.
 *
 * This file only renders and refreshes the widget surface.
 * Click behavior is defined directly on widget nodes via OPEN_URI,
 * which preserves the deep-link payload for the specific quick-log target.
 */
export const widgetTaskHandler: WidgetTaskHandler = async ({
  widgetAction,
  renderWidget,
}) => {
  switch (widgetAction) {
    case 'WIDGET_ADDED':
    case 'WIDGET_UPDATE':
    case 'WIDGET_RESIZED':
    case 'WIDGET_CLICK':
      renderWidget(React.createElement(QuickLogWidget));
      break;

    case 'WIDGET_DELETED':
    default:
      break;
  }
};
