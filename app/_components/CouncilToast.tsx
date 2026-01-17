/**
 * CouncilToast - Displays transmissions from the Council of Voices
 * 
 * Appears when a voice's petition passes the Arbiter.
 * Shows the voice's message with optional Arbiter seal.
 */

import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, Dimensions } from 'react-native';
import { ColorScheme, ContainerId } from '../_constants/Types';
import { VoiceId } from '../_services/council/types';
import { CouncilTransmission } from '../_services/council/orchestrator';
import { getVoiceIdentity } from '../_services/council/voiceIdentities';

interface CouncilToastProps {
  transmission: CouncilTransmission | null;
  colors: ColorScheme;
  container: ContainerId;
  onDismiss: () => void;
  onPress?: () => void;
}

// Voice-specific accent colors (subtle, not overwhelming)
const VOICE_ACCENTS: Partial<Record<VoiceId, string>> = {
  firestarter: '#FF6B35',
  mirror_mystery: '#9B59B6',
  the_architecture: '#3498DB',
  the_tinkerer: '#95A5A6',
  entropys_embrace: '#8E44AD',
  green_godmother: '#27AE60',
  mother_of_silence: '#5DADE2',
  hollow_chalice: '#E74C3C',
  the_creator: '#F39C12',
  the_executor: '#E67E22',
  the_analyst: '#1ABC9C',
  the_regulator: '#16A085',
  the_witness: '#BDC3C7',
  pattern_weaver: '#9B59B6',
};

// Get time-of-day background color for toast
const getToastBackground = (container: ContainerId): string => {
  const backgrounds: Record<ContainerId, string> = {
    morning: '#D4A574E6',
    afternoon: '#C4956AE6',
    evening: '#8B7355E6',
    late: '#5C4A3AE6',
    situational: '#9B8B7AE6',
    uplift: '#A8957AE6',
  };
  return backgrounds[container] || backgrounds.afternoon;
};

// Aspect indicators
const ASPECT_INDICATORS = {
  light: '○',
  shadow: '●',
  neutral: '◐',
};

export const CouncilToast: React.FC<CouncilToastProps> = ({
  transmission,
  colors,
  container,
  onDismiss,
  onPress,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (transmission) {
      setIsVisible(true);
      fadeAnim.setValue(0);
      slideAnim.setValue(20);
      scaleAnim.setValue(0.95);

      // Fade in and slide up
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto-dismiss after 6 seconds (longer for council messages)
      const timer = setTimeout(() => {
        dismissToast();
      }, 6000);

      return () => clearTimeout(timer);
    }
  }, [transmission]);

  const dismissToast = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -10,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsVisible(false);
      onDismiss();
    });
  };

  if (!isVisible || !transmission) return null;

  const voiceIdentity = getVoiceIdentity(transmission.voiceId);
  const voiceAccent = VOICE_ACCENTS[transmission.voiceId as VoiceId] || colors.accent;
  const aspectIndicator = ASPECT_INDICATORS[transmission.aspect as keyof typeof ASPECT_INDICATORS];

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
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={onPress || dismissToast}
        style={[
          styles.toast,
          {
            backgroundColor: getToastBackground(container),
            borderColor: voiceAccent + '40',
            borderLeftColor: voiceAccent,
          },
        ]}
      >
        {/* Arbiter seal if present */}
        {transmission.arbiterText && (
          <View style={styles.arbiterSeal}>
            <Text style={[styles.arbiterText, { color: colors.text + '80' }]}>
              {transmission.arbiterText}
            </Text>
          </View>
        )}

        {/* Voice header */}
        <View style={styles.header}>
          <Text style={[styles.voiceName, { color: voiceAccent }]}>
            {aspectIndicator} {transmission.voiceName}
          </Text>
          {transmission.aspect === 'shadow' && (
            <Text style={[styles.shadowIndicator, { color: colors.text + '60' }]}>
              shadow
            </Text>
          )}
        </View>

        {/* Message */}
        <Text style={[styles.message, { color: colors.text }]}>
          {transmission.text}
        </Text>

        {/* Whisper hint */}
        {voiceIdentity?.whisper && (
          <Text style={[styles.whisper, { color: colors.text + '40' }]}>
            "{voiceIdentity.whisper.substring(0, 40)}..."
          </Text>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
    zIndex: 1000,
    alignItems: 'center',
  },
  toast: {
    width: width - 32,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  arbiterSeal: {
    position: 'absolute',
    top: 8,
    right: 12,
  },
  arbiterText: {
    fontSize: 16,
    fontWeight: '300',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  voiceName: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  shadowIndicator: {
    fontSize: 10,
    fontStyle: 'italic',
    marginLeft: 8,
    textTransform: 'lowercase',
  },
  message: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '400',
  },
  whisper: {
    fontSize: 11,
    fontStyle: 'italic',
    marginTop: 8,
  },
});
