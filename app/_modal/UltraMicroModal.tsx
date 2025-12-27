import React, { useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ColorScheme, ContainerId } from '../_constants/Types';

interface UltraMicroModalProps {
  visible: boolean;
  anchorTitle: string;
  ultraMicro: string;
  colors: ColorScheme;
  container: ContainerId;
  onClose: () => void;
}

// Time-of-day color theming for modal background - FULL OPACITY for maximum readability
const getTimeGlowStyle = (container: ContainerId) => {
  const glowStyles = {
    morning: {
      backgroundColor: 'rgba(212, 165, 116, 1)', // 100% opacity
      borderColor: 'rgba(212, 165, 116, 1)',
      textColor: '#2A1810', // Dark brown for contrast
    },
    afternoon: {
      backgroundColor: 'rgba(95, 168, 184, 1)', // 100% opacity
      borderColor: 'rgba(95, 168, 184, 1)',
      textColor: '#0F2A30', // Dark teal for contrast
    },
    evening: {
      backgroundColor: 'rgba(232, 180, 168, 1)', // 100% opacity
      borderColor: 'rgba(232, 180, 168, 1)',
      textColor: '#3A1810', // Dark for contrast
    },
    late: {
      backgroundColor: 'rgba(139, 157, 195, 1)', // 100% opacity
      borderColor: 'rgba(139, 157, 195, 1)',
      textColor: '#1A1F2E', // Very dark blue for contrast
    },
  };

  return glowStyles[container] || glowStyles.morning;
};

export default function UltraMicroModal({
  visible,
  anchorTitle,
  ultraMicro,
  colors,
  container,
  onClose,
}: UltraMicroModalProps) {
  // Auto-dismiss after 1.7 seconds
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        onClose();
      }, 1700);
      return () => clearTimeout(timer);
    }
  }, [visible, onClose]);

  const timeGlow = getTimeGlowStyle(container);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={[
          styles.modalContainer,
          {
            backgroundColor: timeGlow.backgroundColor,
            borderColor: timeGlow.borderColor,
          }
        ]}>
          <Text style={[styles.title, { color: timeGlow.textColor }]}>
            {anchorTitle}
          </Text>
          <Text style={[styles.ultraMicro, { color: timeGlow.textColor }]}>
            {ultraMicro}
          </Text>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)', // Darkened from 50% to 60%
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    maxWidth: 280,
    width: '85%',
    borderWidth: 2, // Increased from 1 for stronger presence
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, // Increased shadow
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 17,
    fontWeight: '700', // Increased from 600 for better readability
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  ultraMicro: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    fontWeight: '500', // Increased from 400 for better readability
    letterSpacing: -0.1,
  },
});
