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

interface Props {
  isVisible: boolean;
  onClose: () => void;
}

export function WidgetFoodModal({ isVisible, onClose }: Props) {
  const { addFoodEntry } = useApp();
  const colors = useColors();

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
