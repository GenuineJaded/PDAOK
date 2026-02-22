import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { ColorScheme } from '../_constants/Types';

interface Message {
  speaker: string; // "Cannabis", "Analyst", "The Field"
  text: string;
  speakerType: 'substance' | 'archetype' | 'field';
}

interface ConversationCardProps {
  isVisible: boolean;
  messages: Message[];
  colors: ColorScheme;
  onDismiss: () => void;
}

const { width } = Dimensions.get('window');

export function ConversationCard({ isVisible, messages, colors, onDismiss }: ConversationCardProps) {
  const translateY = useRef(new Animated.Value(20)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    if (isVisible && messages.length > 0) {
      // Fade in animation
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto-dismiss after reading time (500ms per message + 2s base)
      const displayTime = 2000 + (messages.length * 500);
      const timer = setTimeout(() => {
        dismissCard();
      }, displayTime);

      return () => clearTimeout(timer);
    }
  }, [isVisible, messages]);

  const dismissCard = () => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 20,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 0.95,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss();
    });
  };

  if (!isVisible || messages.length === 0) {
    return null;
  }

  const getSpeakerColor = (speakerType: Message['speakerType']) => {
    switch (speakerType) {
      case 'substance':
        return colors.accent + 'CC'; // Substance in accent color
      case 'archetype':
        return (colors.primary || colors.accent) + 'CC'; // Archetype in primary/accent color
      case 'field':
        return colors.dim + 'CC'; // Field in dim color
      default:
        return colors.text + 'CC';
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity,
          transform: [{ translateY }, { scale }],
        },
      ]}
    >
      <View
        style={[
          styles.card,
          {
            backgroundColor: (colors.background || colors.bg) + 'F5',
            borderColor: colors.accent + '30',
          },
        ]}
      >
        <Text style={[styles.title, { color: colors.dim }]}>
          CONVERSATION
        </Text>

        {messages.map((message, index) => (
          <View key={index} style={styles.messageContainer}>
            <Text
              style={[
                styles.speaker,
                { color: getSpeakerColor(message.speakerType) },
              ]}
            >
              {message.speaker}:
            </Text>
            <Text
              style={[
                styles.messageText,
                { color: colors.text },
              ]}
            >
              {message.text}
            </Text>
          </View>
        ))}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1001,
  },
  card: {
    width: width - 40,
    maxWidth: 400,
    borderRadius: 16,
    borderWidth: 1,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 12,
    textAlign: 'center',
  },
  messageContainer: {
    marginBottom: 12,
  },
  speaker: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  messageText: {
    fontSize: 13,
    fontStyle: 'italic',
    lineHeight: 18,
    fontWeight: '500',
  },
});
