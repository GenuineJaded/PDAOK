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

interface Props {
  isVisible: boolean;
  onClose: () => void;
}

export function WidgetFoodModal({ isVisible, onClose }: Props) {
  const { addFoodEntry, selectedTheme } = useApp();
  // Honor the current time container so the modal carries the field's signature
  // (Morning oranges, Afternoon blues, Evening purples, Late midnight tones)
  // instead of falling through to the dead system fallback.
  const container = getCurrentContainer();
  const colors = useColors(container, true, undefined, undefined, selectedTheme);

  return (
    <AddFoodModal
      isVisible={isVisible}
      onClose={onClose}
      onSave={(entry) => {
        addFoodEntry(entry);
        onClose();
      }}
      colors={colors}
    />
  );
}
