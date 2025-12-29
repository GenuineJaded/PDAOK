import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, ScrollView } from 'react-native';
import { ColorScheme, Moment } from '../_constants/Types';

interface EditSubstanceModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSave: (updates: Partial<Moment>) => void;
  entry: Moment | null;
  colors: ColorScheme;
}

/**
 * Edit Substance Log Modal
 * Allows editing of substance journal entries
 */
export const EditSubstanceModal: React.FC<EditSubstanceModalProps> = ({
  isVisible,
  onClose,
  onSave,
  entry,
  colors,
}) => {
  const [intention, setIntention] = useState('');
  const [sensation, setSensation] = useState('');
  const [reflection, setReflection] = useState('');

  // Populate form when entry changes
  useEffect(() => {
    if (entry) {
      setIntention(entry.tone || '');
      setSensation(entry.frequency || '');
      setReflection(entry.presence || '');
    }
  }, [entry]);

  const handleSave = () => {
    onSave({
      tone: intention.trim(),
      frequency: sensation.trim(),
      presence: reflection.trim(),
    });
    handleClose();
  };

  const handleClose = () => {
    setIntention('');
    setSensation('');
    setReflection('');
    onClose();
  };

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: colors.card }]}>
          <Text style={[styles.title, { color: colors.text }]}>Edit Substance Log</Text>
          
          {/* Substance Name (Read-only) */}
          {entry && (
            <View style={styles.section}>
              <Text style={[styles.label, { color: colors.dim }]}>Substance</Text>
              <View style={[styles.readonlyField, { backgroundColor: colors.bg }]}>
                <Text style={[styles.readonlyText, { color: colors.text }]}>
                  {entry.allyName || 'Substance Moment'}
                </Text>
              </View>
            </View>
          )}

          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            {/* Intention */}
            <View style={styles.section}>
              <Text style={[styles.label, { color: colors.dim }]}>Intention</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.bg, color: colors.text, borderColor: colors.dim }]}
                value={intention}
                onChangeText={setIntention}
                placeholder="Why this moment?"
                placeholderTextColor={colors.dim}
                multiline
              />
            </View>

            {/* Sensation */}
            <View style={styles.section}>
              <Text style={[styles.label, { color: colors.dim }]}>Sensation</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.bg, color: colors.text, borderColor: colors.dim }]}
                value={sensation}
                onChangeText={setSensation}
                placeholder="What do you notice?"
                placeholderTextColor={colors.dim}
                multiline
              />
            </View>

            {/* Reflection */}
            <View style={styles.section}>
              <Text style={[styles.label, { color: colors.dim }]}>Reflection</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.bg, color: colors.text, borderColor: colors.dim }]}
                value={reflection}
                onChangeText={setReflection}
                placeholder="What emerges?"
                placeholderTextColor={colors.dim}
                multiline
              />
            </View>
          </ScrollView>

          {/* Buttons */}
          <View style={styles.buttons}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton, { borderColor: colors.dim }]}
              onPress={handleClose}
            >
              <Text style={[styles.buttonText, { color: colors.dim }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.button,
                styles.saveButton,
                { backgroundColor: colors.accent },
              ]}
              onPress={handleSave}
            >
              <Text style={[styles.buttonText, { color: colors.card }]}>Save Changes</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  container: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '90%',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
  },
  scrollView: {
    maxHeight: 400,
  },
  section: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  readonlyField: {
    padding: 14,
    borderRadius: 10,
  },
  readonlyText: {
    fontSize: 16,
    fontWeight: '600',
  },
  input: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    fontSize: 15,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelButton: {
    borderWidth: 1,
  },
  saveButton: {
    // backgroundColor set dynamically
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
