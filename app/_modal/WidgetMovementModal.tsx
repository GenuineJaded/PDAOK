/**
 * WidgetMovementModal.tsx
 *
 * A self-contained wrapper around AddMovementModal for use from the root layout
 * (i.e. when launched from the Android home screen widget).  It pulls
 * addMovementEntry from AppContext and the colour scheme from useColors so the
 * caller does not need to pass either.
 */

import React from 'react';
import { useApp } from '../_context/AppContext';
import useColors from '../_hooks/useColors';
import { AddMovementModal } from './AddMovementModal';
import { getCurrentContainer } from '../_utils/time';
import { getWidgetBackdrop } from '../_constants/WidgetBackdrops';

interface Props {
  isVisible: boolean;
  onClose: () => void;
}

export function WidgetMovementModal({ isVisible, onClose }: Props) {
  const { addMovementEntry, selectedTheme } = useApp();
  // Honor the current time container so the modal carries the field's signature
  const container = getCurrentContainer();
  const colors = useColors(container, true, undefined, undefined, selectedTheme);
  // The widget interaction is a quick, light moment — the backdrop behind the
  // card brightens to the time-of-day signature so it feels like opening into
  // a brighter space, not falling into the app's normal dark restraint.
  const backdropColor = getWidgetBackdrop(container);

  return (
    <AddMovementModal
      isVisible={isVisible}
      onClose={onClose}
      onAdd={(entry) => {
        addMovementEntry(entry);
        onClose();
      }}
      colors={colors}
      backdropColor={backdropColor}
    />
  );
}
