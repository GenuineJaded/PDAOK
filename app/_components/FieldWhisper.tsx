import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { ColorScheme } from '../_constants/Types';

interface FieldWhisperProps {
  whisper: string;
  colors: ColorScheme;
  onComplete?: () => void;
}

/**
 * FieldWhisper - Ephemeral, glowing text that fades in and out
 * Appears mid-screen with no background (or very opaque), glowing accent-colored text
 * Auto-fades based on sentence count: 1 sentence = 2s, 2 sentences = 4s, etc.
 */
export const FieldWhisper: React.FC<FieldWhisperProps> = ({ whisper, colors, onComplete }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Calculate display duration based on sentence count
    const sentenceCount = (whisper.match(/[.!?]+/g) || []).length || 1;
    const displayDuration = sentenceCount * 2000; // 2 seconds per sentence
    const fadeDuration = 800; // Fade in/out duration

    // Sequence: fade in → glow pulse → hold → fade out
    Animated.sequence([
      // Fade in
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: fadeDuration,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: fadeDuration,
          useNativeDriver: true,
        }),
      ]),
      // Hold
      Animated.delay(displayDuration),
      // Fade out
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: fadeDuration,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: fadeDuration,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      if (onComplete) {
        onComplete();
      }
    });

    // Subtle continuous glow pulse while visible
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1.2,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.8,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [whisper]);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
        },
      ]}
      pointerEvents="none" // Allow interaction with elements behind
    >
      <Animated.View
        style={[
          styles.whisperContainer,
          {
            backgroundColor: colors.bg + '1A', // Very opaque background (10% opacity)
            transform: [{ scale: glowAnim }],
          },
        ]}
      >
        <Text
          style={[
            styles.whisperText,
            {
              color: colors.accent,
              textShadowColor: colors.accent,
              textShadowOffset: { width: 0, height: 0 },
              textShadowRadius: 12,
            },
          ]}
        >
          {whisper}
        </Text>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: '40%', // Slightly above mid-screen
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    zIndex: 1000,
  },
  whisperContainer: {
    paddingVertical: 24,
    paddingHorizontal: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  whisperText: {
    fontSize: 17,
    lineHeight: 26,
    textAlign: 'center',
    fontStyle: 'italic',
    fontWeight: '400',
    letterSpacing: 0.5,
  },
});
