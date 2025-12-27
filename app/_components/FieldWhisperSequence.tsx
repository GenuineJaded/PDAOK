import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { FieldWhisper } from './FieldWhisper';
import { ColorScheme } from '../_constants/Types';

interface FieldWhisperSequenceProps {
  whispers: string[];
  colors: ColorScheme;
  onComplete?: () => void;
}

/**
 * FieldWhisperSequence - Displays multiple whispers one at a time
 * Each whisper fades in, holds, fades out, then the next appears
 */
export const FieldWhisperSequence: React.FC<FieldWhisperSequenceProps> = ({
  whispers,
  colors,
  onComplete,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (whispers.length === 0) {
      setIsComplete(true);
      if (onComplete) {
        onComplete();
      }
    }
  }, [whispers]);

  const handleWhisperComplete = () => {
    if (currentIndex < whispers.length - 1) {
      // Move to next whisper after a brief pause
      setTimeout(() => {
        setCurrentIndex(currentIndex + 1);
      }, 500);
    } else {
      // All whispers complete
      setIsComplete(true);
      if (onComplete) {
        onComplete();
      }
    }
  };

  if (isComplete || whispers.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <FieldWhisper
        key={currentIndex}
        whisper={whispers[currentIndex]}
        colors={colors}
        onComplete={handleWhisperComplete}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
  },
});
