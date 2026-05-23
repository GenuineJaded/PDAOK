/**
 * WidgetFoodModal.tsx
 *
 * A self-contained wrapper around AddFoodModal for use from the root layout
 * (i.e. when launched from the Android home screen widget).  It pulls
 * addFoodEntry from AppContext and the colour scheme from useColors so the
 * caller does not need to pass either.
 */

import React from 'react';
import { useApp } from '../_context/AppContext';
import useColors from '../_hooks/useColors';
import { AddFoodModal } from './AddFoodModal';
import { getCurrentContainer } from '../_utils/time';
import { getWidgetBackdrop } from '../_constants/WidgetBackdrops';

interface Props {
  isVisible: boolean;
  onClose: () => void;
}

export function WidgetFoodModal({ isVisible, onClose }: Props) {
  const { addFoodEntry, selectedTheme } = useApp();
  // Honor the current time container so the modal carries the field's signature
  const container = getCurrentContainer();
  const colors = useColors(container, true, undefined, undefined, selectedTheme);
  // The widget interaction is a quick, light moment — the backdrop behind the
  // card brightens to the time-of-day signature so it feels like opening into
  // a brighter space, not falling into the app's normal dark restraint.
  const backdropColor = getWidgetBackdrop(container);

  return (
    <AddFoodModal
      isVisible={isVisible}
      onClose={onClose}
      onSave={(entry) => {
        addFoodEntry(entry);
        onClose();
      }}
      colors={colors}
      backdropColor={backdropColor}
    />
  );
}
