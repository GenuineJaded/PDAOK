import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

interface BloomEffectProps {
  isVisible: boolean;
  color: string;
  onComplete?: () => void;
}

export const BloomEffect: React.FC<BloomEffectProps> = ({ 
  isVisible, 
  color,
  onComplete 
}) => {
  const bloomAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isVisible) {
      // Reset animations
      bloomAnim.setValue(0);
      opacityAnim.setValue(0.6);

      // Create the blooming radial glow effect
      Animated.parallel([
        // Expand outward like a flower opening
        Animated.timing(bloomAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
        // Fade out gently
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 1200,
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

  const scale = bloomAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 3],
  });

  return (
    <View style={styles.container} pointerEvents="none">
      {/* Multiple layers for richer bloom effect */}
      <Animated.View
        style={[
          styles.bloomLayer,
          {
            backgroundColor: color,
            opacity: opacityAnim.interpolate({
              inputRange: [0, 0.6],
              outputRange: [0, 0.4],
            }),
            transform: [{ scale }],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.bloomLayer,
          {
            backgroundColor: color,
            opacity: opacityAnim.interpolate({
              inputRange: [0, 0.6],
              outputRange: [0, 0.3],
            }),
            transform: [{ scale: scale.interpolate({
              inputRange: [0.5, 3],
              outputRange: [0.7, 2.5],
            }) }],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.bloomLayer,
          {
            backgroundColor: color,
            opacity: opacityAnim.interpolate({
              inputRange: [0, 0.6],
              outputRange: [0, 0.2],
            }),
            transform: [{ scale: scale.interpolate({
              inputRange: [0.5, 3],
              outputRange: [0.9, 2],
            }) }],
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
  bloomLayer: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
  },
});
