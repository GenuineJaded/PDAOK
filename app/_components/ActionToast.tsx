import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { ColorScheme, ContainerId } from '../_constants/Types';

type ActionType = 'skipped' | 'forgot' | 'couldn\'t' | 'not relevant';

interface ActionToastProps {
  isVisible: boolean;
  actionType: ActionType;
  colors: ColorScheme;
  container: ContainerId;
  onDismiss: () => void;
}

// Single static message for each action type
const actionMessages: Record<ActionType, string> = {
  'skipped': 'Not this one; the cadence continues.',
  'forgot': 'Memory blinked; the thread is still here.',
  "couldn't": 'Limits were true; the system listened.',
  'not relevant': 'Right call; this one didn\'t belong.',
};

// Get message and duration for each action type
const getActionConfig = (actionType: ActionType) => {
  const message = actionMessages[actionType] || actionMessages['skipped'];
  
  const configs: Record<ActionType, { duration: number; animation: string }> = {
    'skipped': {
      duration: 1800,
      animation: 'ripple',
    },
    'forgot': {
      duration: 2000,
      animation: 'shimmer',
    },
    "couldn't": {
      duration: 2000,
      animation: 'dim',
    },
    'not relevant': {
      duration: 1800,
      animation: 'horizontal-shimmer',
    },
  };

  return { message, ...configs[actionType] };
};

// Get time-of-day background color for toast
const getToastBackground = (container: ContainerId) => {
  const backgrounds: Record<string, string> = {
    morning: '#D4A574E6',
    afternoon: '#5FA8B8E6',
    evening: '#E8B4A8E6',
    late: '#8B9DC3E6',
    situational: '#B0B0B0E6',
    uplift: '#B19CD9E6',
  };
  return backgrounds[container] || backgrounds.morning;
};

export const ActionToast: React.FC<ActionToastProps> = ({ 
  isVisible, 
  actionType,
  colors,
  container,
  onDismiss 
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current; // Slide up from bottom
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  
  // Get config directly from actionType
  const config = actionType ? getActionConfig(actionType) : { message: '', duration: 2000, animation: 'ripple' };

  useEffect(() => {
    if (isVisible && actionType) {
      // Reset animations
      fadeAnim.setValue(0);
      slideAnim.setValue(20);
      scaleAnim.setValue(0.95);
      shimmerAnim.setValue(0);

      // Fade in and slide up gently
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

      // Shimmer effect for "forgot" action
      if (config.animation === 'shimmer') {
        Animated.sequence([
          Animated.timing(shimmerAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(shimmerAnim, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ]).start();
      }

      // Horizontal shimmer for "not relevant" - single pass
      if (config.animation === 'horizontal-shimmer') {
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }).start();
      }

      // Auto-dismiss based on action duration
      const timer = setTimeout(() => {
        dismissToast();
      }, config.duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible]); // Only depend on isVisible, not actionType

  const dismissToast = () => {
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

  if (!isVisible && (fadeAnim as any)._value === 0) return null;

  // Apply different opacity based on animation type
  const getOpacityStyle = () => {
    if (config.animation === 'dim') {
      return fadeAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 0.85], // Slightly dimmed
      });
    }
    if (config.animation === 'fade-through') {
      return fadeAnim.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [0, 1, 0], // Fade in then out
      });
    }
    return fadeAnim;
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: getOpacityStyle(),
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
            backgroundColor: getToastBackground(container),
            borderColor: colors.accent + '30',
          },
        ]}
      >
        {/* Shimmer overlay for "forgot" */}
        {config.animation === 'shimmer' && (
          <Animated.View
            style={[
              styles.shimmerOverlay,
              {
                opacity: shimmerAnim,
                backgroundColor: colors.accent + '20',
              },
            ]}
          />
        )}

        {/* Horizontal shimmer for "not relevant" */}
        {config.animation === 'horizontal-shimmer' && (
          <Animated.View
            style={[
              styles.horizontalShimmer,
              {
                opacity: shimmerAnim.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [0, 0.4, 0],
                }),
                transform: [
                  {
                    translateX: shimmerAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-200, 200],
                    }),
                  },
                ],
              },
            ]}
          />
        )}
        
        <Text style={[styles.text, { color: colors.text }]}>
          {config.message}
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
    paddingVertical: 10,
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
  text: {
    fontSize: 13,
    fontWeight: '500',
    fontStyle: 'italic',
    letterSpacing: 0.2,
    textAlign: 'center',
    lineHeight: 18,
  },
  shimmerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 16,
  },
  horizontalShimmer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 100,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
  },
});
