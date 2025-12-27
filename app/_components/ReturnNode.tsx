import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Archetype } from '../_constants/Types';

interface ReturnNodeProps {
  archetype: Archetype;
  onReturn: () => void;
}

export function ReturnNode({ archetype, onReturn }: ReturnNodeProps) {
  // Breathing animation
  const breathAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Create a gentle breathing loop
    const breathe = Animated.loop(
      Animated.sequence([
        Animated.timing(breathAnim, {
          toValue: 1.1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(breathAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );

    breathe.start();

    return () => breathe.stop();
  }, [breathAnim]);

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { backgroundColor: archetype.color_theme.accent + '20' }
      ]}
      onPress={onReturn}
      activeOpacity={0.7}
    >
      <Animated.View
        style={[
          styles.innerCircle,
          {
            backgroundColor: archetype.color_theme.accent,
            transform: [{ scale: breathAnim }],
          },
        ]}
      >
        <Text style={styles.icon}>{archetype.icon}</Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 90, // Above the nav bar
    right: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 1000,
  },
  innerCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 24,
  },
});
