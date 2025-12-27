import React, { useCallback, useState } from 'react';
import Animated, { useSharedValue, withTiming, useAnimatedStyle } from 'react-native-reanimated';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { ContainerItem, ColorScheme, ContainerId } from '../_constants/Types';
import { getRandomNarrativePhrase, showMicroNote, triggerSoftPulseAnimation } from '../_utils/feedback';

interface Props {
  item: ContainerItem;
  completed: boolean;
  onToggle: () => void;
  colors: ColorScheme;
  onPress: () => void;
  onDelete: () => void;
  onEdit?: () => void; // Optional edit handler
  container?: ContainerId; // Add container to determine glow color
  aligned?: boolean; // Whether Align Flow was clicked for this task
}

// Atmospheric glow field colors by time of day
const getGlowFieldStyle = (container: ContainerId | undefined, colors: ColorScheme) => {
  // Base glow colors for each time period
  const glowColors: Record<string, { base: string; overlay: string; border: string }> = {
    morning: {
      base: '#F5E6CC', // Pale honey mist
      overlay: 'rgba(162, 184, 166, 0.25)', // Sage green at 25% - more visible
      border: 'rgba(162, 184, 166, 0.35)', // Stronger border
    },
    afternoon: {
      base: '#E0FFFF', // Soft glass with aqua reflection
      overlay: 'rgba(176, 224, 230, 0.28)', // 28% opacity - more visible
      border: 'rgba(176, 224, 230, 0.45)', // Stronger border
    },
    evening: {
      base: '#8C4B3F', // Faint rose gradient
      overlay: 'rgba(140, 75, 63, 0.25)', // 25% opacity for warmth
      border: 'rgba(140, 75, 63, 0.4)', // Stronger border
    },
    late: {
      base: '#5A6E5A', // Indigo haze
      overlay: 'rgba(90, 110, 90, 0.22)', // 22% opacity
      border: 'rgba(90, 110, 90, 0.35)', // Stronger border
    },
  };

  const glow = glowColors[container || 'morning'] || glowColors.morning;
  
  return {
    backgroundColor: glow.overlay,
    borderColor: glow.border,
  };
};

export const AnchorCard = React.memo(({ item, completed, onToggle, colors, onPress, onDelete, onEdit, container, aligned }: Props) => {
  const opacity = useSharedValue(1);
  const [showMenu, setShowMenu] = useState(false);

  const handleToggle = useCallback(() => {
    onToggle();
    if (!completed) {
      // Logic for completion: Somatic Layer & Narrative Layer
      const phrase = getRandomNarrativePhrase();
      showMicroNote(phrase);
      triggerSoftPulseAnimation(item.id);

      // Simple animation for the card itself (soft pulse effect)
      opacity.value = withTiming(0.95, { duration: 100 }, () => {
        opacity.value = withTiming(1, { duration: 300 });
      });
    }
  }, [completed, onToggle, item.id, opacity]);

  const handleLongPress = useCallback(() => {
    setShowMenu(true);
  }, []);

  const handleEdit = useCallback(() => {
    setShowMenu(false);
    if (onEdit) {
      onEdit();
    }
  }, [onEdit]);

  const handleDelete = useCallback(() => {
    setShowMenu(false);
    onDelete();
  }, [onDelete]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ scale: opacity.value === 1 ? 1 : 0.98 }],
    };
  });

  const glowStyle = getGlowFieldStyle(container, colors);

  return (
    <>
      <Animated.View style={[animatedStyle, styles.animatedWrapper]}>
        <TouchableOpacity
          style={[
            styles.card,
            glowStyle,
            {
              shadowColor: glowStyle.borderColor,
            }
          ]}
          onPress={onPress}
          onLongPress={handleLongPress}
          activeOpacity={0.7}
        >
          <View style={styles.row}>
            <Text style={[styles.emoji, { color: colors.dim }]}>
              {aligned ? '🜁' : (item.category === 'time' 
                ? (container === 'morning' ? '🌅' : container === 'afternoon' ? '☀️' : container === 'evening' ? '🌇' : '🌙')
                : item.category === 'situational' ? '⚡' : '✨')}
            </Text>
            <Text style={[styles.title, { color: colors.text }]}>{item.title}</Text>
            <Text style={[styles.emoji, { color: colors.dim }]}>
              {aligned ? '🜁' : (item.category === 'time' 
                ? (container === 'morning' ? '🌅' : container === 'afternoon' ? '☀️' : container === 'evening' ? '🌇' : '🌙')
                : item.category === 'situational' ? '⚡' : '✨')}
            </Text>
          </View>
        </TouchableOpacity>
      </Animated.View>

      {/* Edit/Delete Menu Modal */}
      <Modal
        visible={showMenu}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowMenu(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowMenu(false)}
        >
          <View style={[styles.menuContainer, { backgroundColor: colors.card }]}>
            <Text style={[styles.menuTitle, { color: colors.text }]}>{item.title}</Text>
            
            {onEdit && (
              <TouchableOpacity
                style={[styles.menuButton, { borderBottomColor: colors.dim }]}
                onPress={handleEdit}
              >
                <Text style={[styles.menuButtonText, { color: colors.accent }]}>Edit</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity
              style={styles.menuButton}
              onPress={handleDelete}
            >
              <Text style={[styles.menuButtonText, { color: '#ff4444' }]}>Delete</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.menuButton, { marginTop: 8 }]}
              onPress={() => setShowMenu(false)}
            >
              <Text style={[styles.menuButtonText, { color: colors.dim }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
});

const styles = StyleSheet.create({
  animatedWrapper: {
    marginBottom: 12,
  },
  card: {
    borderRadius: 16, // Increased from 12 for softer edges
    borderWidth: 1,
    overflow: 'hidden',
    // Atmospheric glow effect
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8, // Subtle blur for depth
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  bullet: {
    fontSize: 20,
    fontWeight: '600',
  },
  title: {
    fontSize: 17,
    fontWeight: '500',
    textAlign: 'center',
    // Text appears to float with subtle shadow
    textShadowColor: 'rgba(0, 0, 0, 0.05)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  emoji: {
    fontSize: 20,
    fontWeight: '300',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContainer: {
    width: '80%',
    maxWidth: 300,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  menuButton: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'transparent',
  },
  menuButtonText: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
});
