import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { ColorScheme } from '../_constants/Types';

interface AddPatternModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSave: (text: string, category?: string) => void;
  colors: ColorScheme;
}

export function AddPatternModal({ isVisible, onClose, onSave, colors }: AddPatternModalProps) {
  const [text, setText] = useState('');
  const [category, setCategory] = useState<string>('general');

  const handleSave = () => {
    onSave(text.trim(), category);
    setText('');
    setCategory('general');
    onClose();
  };

  const handleClose = () => {
    setText('');
    setCategory('general');
    onClose();
  };

  const categories = [
    { id: 'general', label: 'General', icon: '🌌' },
    { id: 'anchor', label: 'Anchor', icon: '⚓' },
    { id: 'substance', label: 'Substance', icon: '🍃' },
    { id: 'time', label: 'Time', icon: '⏰' },
  ];

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalOverlay}
      >
        <View style={[styles.modalContent, { backgroundColor: colors.bg }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>Record a Pattern</Text>
            <TouchableOpacity onPress={handleClose}>
              <Text style={[styles.closeButton, { color: colors.accent }]}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            <Text style={[styles.label, { color: colors.dim }]}>What pattern did you notice?</Text>
            <TextInput
              style={[styles.textInput, { 
                backgroundColor: colors.card, 
                color: colors.text,
                borderColor: colors.dim + '40',
              }]}
              value={text}
              onChangeText={setText}
              placeholder="e.g., I notice I need water face after coffee..."
              placeholderTextColor={colors.dim}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <Text style={[styles.label, { color: colors.dim, marginTop: 20 }]}>Category (optional)</Text>
            <View style={styles.categoryGrid}>
              {categories.map(cat => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryButton,
                    { backgroundColor: colors.card },
                    category === cat.id && { backgroundColor: colors.accent + '30', borderColor: colors.accent, borderWidth: 2 }
                  ]}
                  onPress={() => setCategory(cat.id)}
                >
                  <Text style={styles.categoryIcon}>{cat.icon}</Text>
                  <Text style={[styles.categoryLabel, { color: colors.text }]}>{cat.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton, { backgroundColor: colors.card }]}
              onPress={handleClose}
            >
              <Text style={[styles.buttonText, { color: colors.text }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.saveButton, { backgroundColor: colors.accent }]}
              onPress={handleSave}

            >
              <Text style={[styles.buttonText, { color: colors.card }]}>Save Pattern</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    paddingTop: 20,
    paddingBottom: 40,
    paddingHorizontal: 20,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
  },
  closeButton: {
    fontSize: 28,
    fontWeight: '300',
  },
  scrollView: {
    marginBottom: 20,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  textInput: {
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    minHeight: 100,
    borderWidth: 1,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryButton: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    gap: 8,
  },
  categoryIcon: {
    fontSize: 24,
  },
  categoryLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {},
  saveButton: {},
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

