import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { useColors } from '../_hooks/useColors';

interface QuickLogModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSelectCategory: (category: 'substance' | 'nourish' | 'movement') => void;
}

/**
 * Quick Log Category Selection Modal
 * First tier: Choose what to log (Substance / Nourish / Movement)
 */
export const QuickLogModal: React.FC<QuickLogModalProps> = ({
  isVisible,
  onClose,
  onSelectCategory,
}) => {
  const colors = useColors();
  
  console.log('🎯 QuickLogModal render - isVisible:', isVisible);
  
  if (!isVisible) {
    console.log('❌ Modal not visible, returning null');
    return null;
  }
  
  console.log('✅ Modal IS visible, rendering...');

  const categories = [
    { id: 'substance' as const, label: 'Substance', emoji: '🌿' },
    { id: 'nourish' as const, label: 'Nourish', emoji: '🍎' },
    { id: 'movement' as const, label: 'Movement', emoji: '🏃' },
  ];

  console.log('📱 About to return Modal component');
  
  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View
          style={[styles.container, { backgroundColor: colors.card }]}
          onStartShouldSetResponder={() => true}
        >
          <Text style={[styles.title, { color: colors.text }]}>Quick Log</Text>
          <Text style={[styles.subtitle, { color: colors.dim }]}>
            What would you like to log?
          </Text>

          <View style={styles.categoriesContainer}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[styles.categoryButton, { backgroundColor: colors.bg }]}
                onPress={() => {
                  onSelectCategory(category.id);
                  onClose();
                }}
              >
                <Text style={styles.emoji}>{category.emoji}</Text>
                <Text style={[styles.categoryLabel, { color: colors.text }]}>
                  {category.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={[styles.cancelButton, { borderColor: colors.dim }]}
            onPress={onClose}
          >
            <Text style={[styles.cancelText, { color: colors.dim }]}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '85%',
    maxWidth: 400,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 24,
    textAlign: 'center',
  },
  categoriesContainer: {
    width: '100%',
    gap: 12,
    marginBottom: 20,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  emoji: {
    fontSize: 28,
  },
  categoryLabel: {
    fontSize: 18,
    fontWeight: '600',
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
