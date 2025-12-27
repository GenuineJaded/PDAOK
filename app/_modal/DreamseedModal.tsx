import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { ColorScheme } from '../_constants/Types';

interface Props {
  isVisible: boolean;
  onClose: () => void;
  onSave: (word: string) => void;
  colors: ColorScheme;
}

export function DreamseedModal({ isVisible, onClose, onSave, colors }: Props) {
  const [word, setWord] = useState('');

  const handleSave = () => {
    onSave(word.trim());
    setWord('');
    onClose();
  };

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
            style={styles.container}
          >
            {/* Liminal Interface - Black background with soft glow */}
            <View style={styles.innerContainer}>
              {/* Title */}
              <Text style={styles.title}>✨ Dreamseed</Text>
              
              {/* Instruction */}
              <Text style={styles.instruction}>
                The day dissolves. Write one word to carry into sleep.
              </Text>

              {/* Input Field */}
              <TextInput
                style={styles.input}
                value={word}
                onChangeText={setWord}
                placeholder="Mystery..."
                placeholderTextColor="rgba(255, 255, 255, 0.3)"
                autoFocus
                maxLength={50}
                returnKeyType="done"
                onSubmitEditing={handleSave}
              />

              {/* Buttons */}
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={onClose}
                  activeOpacity={0.7}
                >
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.button, styles.saveButton]}
                  onPress={handleSave}
                  activeOpacity={0.7}
                >
                  <Text style={styles.saveText}>Release</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
  },
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '85%',
    maxWidth: 400,
  },
  innerContainer: {
    backgroundColor: '#0a0a0a',
    borderRadius: 20,
    padding: 32,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: 1,
  },
  instruction: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 24,
    fontWeight: '500',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  saveButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  cancelText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 16,
    fontWeight: '600',
  },
  saveText: {
    color: '#0a0a0a',
    fontSize: 16,
    fontWeight: '600',
  },
});
