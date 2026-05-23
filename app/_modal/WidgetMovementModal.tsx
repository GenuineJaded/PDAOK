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

interface Props {
  isVisible: boolean;
  onClose: () => void;
}

export function WidgetMovementModal({ isVisible, onClose }: Props) {
  const { addMovementEntry, selectedTheme } = useApp();
  // Honor the current time container so the modal carries the field's signature
  // (Morning oranges, Afternoon blues, Evening purples, Late midnight tones)
  // instead of falling through to the dead system fallback.
  const container = getCurrentContainer();
  const colors = useColors(container, true, undefined, undefined, selectedTheme);

  return (
    <AddMovementModal
      isVisible={isVisible}
      onClose={onClose}
      onAdd={(entry) => {
        addMovementEntry(entry);
        onClose();
      }}
      colors={colors}
    />
  );
}
