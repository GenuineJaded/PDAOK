import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

interface RingPulseProps {
  isVisible: boolean;
  color: string;
  onComplete?: () => void;
}

export const RingPulse: React.FC<RingPulseProps> = ({ 
  isVisible, 
  color,
  onComplete 
}) => {
  const ringPulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isVisible) {
      // Reset animation
      ringPulseAnim.setValue(0);

      // Ring pulse animation - expands outward like a soft wave
      Animated.timing(ringPulseAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }).start(() => {
        if (onComplete) {
          onComplete();
        }
      });
    }
  }, [isVisible]);

  if (!isVisible) return null;

  const ringScale = ringPulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 2.5],
  });

  const ringOpacity = ringPulseAnim.interpolate({
    inputRange: [0, 0.3, 1],
    outputRange: [0.6, 0.3, 0],
  });

  return (
    <View style={styles.container} pointerEvents="none">
      <Animated.View
        style={[
          styles.ringPulse,
          {
            borderColor: color,
            opacity: ringOpacity,
            transform: [{ scale: ringScale }],
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  ringPulse: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
  },
});
