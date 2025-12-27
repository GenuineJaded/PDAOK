import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

interface CompletionPulseProps {
  isVisible: boolean;
  color: string;
  onComplete?: () => void;
}

export const CompletionPulse: React.FC<CompletionPulseProps> = ({ 
  isVisible, 
  color,
  onComplete 
}) => {
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isVisible) {
      // Reset animations
      pulseAnim.setValue(0);
      opacityAnim.setValue(1);

      // Create the breathing pulse effect
      Animated.parallel([
        // Expand outward like an exhale
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        // Fade out gently
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ]).start(() => {
        if (onComplete) {
          onComplete();
        }
      });
    }
  }, [isVisible]);

  if (!isVisible) return null;

  const scale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 2.5],
  });

  return (
    <View style={styles.container} pointerEvents="none">
      <Animated.View
        style={[
          styles.pulse,
          {
            backgroundColor: color,
            opacity: opacityAnim,
            transform: [{ scale }],
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
  pulse: {
    width: 60,
    height: 60,
    borderRadius: 30,
    opacity: 0.3,
  },
});
