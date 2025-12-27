import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { ColorScheme, ContainerId } from '../_constants/Types';

interface ThresholdCardProps {
  isVisible: boolean;
  fromContainer: ContainerId;
  toContainer: ContainerId;
  colors: ColorScheme;
  onDismiss: () => void;
}

// Ritual prompts for each transition
const THRESHOLD_RITUALS: Record<string, string[]> = {
  'morning-afternoon': [
    'The sun climbs higher. Wash your hands under warm water.',
    'Midday approaches. Take three breaths at the window.',
    'Energy shifts upward. Stretch your shoulders once.',
  ],
  'afternoon-evening': [
    'Light begins to soften. Dim one lamp.',
    'The day releases its grip. Place your hand on your heart.',
    'Dusk settles in. Look once toward the horizon.',
  ],
  'evening-late': [
    'Stillness deepens. Close one door gently.',
    'Night arrives. Light a candle or turn off a screen.',
    'The day completes itself. Whisper "thank you".',
  ],
  'late-morning': [
    'Dawn returns. Open a window to fresh air.',
    'A new cycle begins. Drink water slowly.',
    'You wake again. Say your name aloud.',
  ],
};

const getTransitionKey = (from: ContainerId, to: ContainerId): string => {
  return `${from}-${to}`;
};

const getRandomRitual = (from: ContainerId, to: ContainerId): string => {
  const key = getTransitionKey(from, to);
  const rituals = THRESHOLD_RITUALS[key] || ['Time shifts. Pause for a moment.'];
  return rituals[Math.floor(Math.random() * rituals.length)];
};

const getContainerLabel = (container: ContainerId): string => {
  const labels: Record<ContainerId, string> = {
    morning: 'Morning',
    afternoon: 'Afternoon',
    evening: 'Evening',
    late: 'Late',
  };
  return labels[container];
};

// Get time-of-day background color for toast (matching ActionToast)
const getToastBackground = (container: ContainerId) => {
  const backgrounds = {
    morning: '#D4A574E6',
    afternoon: '#5FA8B8E6',
    evening: '#E8B4A8E6',
    late: '#8B9DC3E6',
  };
  return backgrounds[container] || backgrounds.morning;
};

export const ThresholdCard: React.FC<ThresholdCardProps> = ({ 
  isVisible, 
  fromContainer,
  toContainer,
  colors,
  onDismiss 
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current; // Slide up from bottom
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const ritual = useRef(getRandomRitual(fromContainer, toContainer)).current;

  useEffect(() => {
    if (isVisible) {
      // Reset animations
      fadeAnim.setValue(0);
      slideAnim.setValue(20);
      scaleAnim.setValue(0.95);

      // Fade in and slide up gently (matching ActionToast)
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto-dismiss after 2500ms
      const timer = setTimeout(() => {
        dismissCard();
      }, 2500);

      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  const dismissCard = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 20,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss();
    });
  };

  if (!isVisible && fadeAnim._value === 0) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [
            { translateY: slideAnim },
            { scale: scaleAnim },
          ],
        },
      ]}
    >
      <View
        style={[
          styles.toast,
          { 
            backgroundColor: getToastBackground(toContainer),
            borderColor: colors.accent + '30',
          },
        ]}
      >
        {/* Transition label */}
        <Text style={[styles.transition, { color: colors.text }]}>
          {getContainerLabel(fromContainer)} → {getContainerLabel(toContainer)}
        </Text>
        
        {/* Ritual message */}
        <Text style={[styles.ritual, { color: colors.text }]}>
          {ritual}
        </Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    zIndex: 1001,
    alignItems: 'center',
  },
  toast: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
    overflow: 'hidden',
  },
  transition: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    textAlign: 'center',
    marginBottom: 6,
    opacity: 0.7,
  },
  ritual: {
    fontSize: 13,
    fontWeight: '500',
    fontStyle: 'italic',
    letterSpacing: 0.2,
    textAlign: 'center',
    lineHeight: 18,
  },
});
