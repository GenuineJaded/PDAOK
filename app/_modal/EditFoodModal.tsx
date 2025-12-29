import React, { useState, useEffect } from 'react';
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
import { ColorScheme, FoodEntry } from '../_constants/Types';

interface EditFoodModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSave: (updates: Partial<FoodEntry>) => void;
  entry: FoodEntry | null;
  colors: ColorScheme;
}

export function EditFoodModal({ isVisible, onClose, onSave, entry, colors }: EditFoodModalProps) {
  const [name, setName] = useState('');
  const [feeling, setFeeling] = useState('');
  const [notes, setNotes] = useState('');
  const [energyLevel, setEnergyLevel] = useState<string>('');

  // Populate form when entry changes
  useEffect(() => {
    if (entry) {
      setName(entry.name || '');
      setFeeling(entry.feeling || '');
      setNotes(entry.notes || '');
      setEnergyLevel(entry.energy_level || '');
    }
  }, [entry]);

  const handleSave = () => {
    onSave({
      name: name.trim(),
      feeling: feeling.trim() || undefined,
      notes: notes.trim() || undefined,
      energy_level: energyLevel || undefined,
    });
    handleClose();
  };

  const handleClose = () => {
    setName('');
    setFeeling('');
    setNotes('');
    setEnergyLevel('');
    onClose();
  };

  const energyLevels = [
    { id: 'low', label: 'Low', icon: '🔋' },
    { id: 'medium', label: 'Medium', icon: '⚡' },
    { id: 'high', label: 'High', icon: '✨' },
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
            <Text style={[styles.title, { color: colors.text }]}>Edit Nourishment</Text>
            <TouchableOpacity onPress={handleClose}>
              <Text style={[styles.closeButton, { color: colors.accent }]}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
            {/* What did you eat? */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.dim }]}>What did you eat?</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.dim }]}
                placeholder="e.g., Oatmeal with berries"
                placeholderTextColor={colors.dim}
                value={name}
                onChangeText={setName}
              />
            </View>

            {/* Energy Level */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.dim }]}>Energy Level</Text>
              <View style={styles.energyButtons}>
                {energyLevels.map((level) => (
                  <TouchableOpacity
                    key={level.id}
                    style={[
                      styles.energyButton,
                      { backgroundColor: colors.card, borderColor: colors.dim },
                      energyLevel === level.id && { backgroundColor: colors.accent, borderColor: colors.accent },
                    ]}
                    onPress={() => setEnergyLevel(level.id)}
                  >
                    <Text style={styles.energyIcon}>{level.icon}</Text>
                    <Text
                      style={[
                        styles.energyLabel,
                        { color: colors.text },
                        energyLevel === level.id && { color: colors.card },
                      ]}
                    >
                      {level.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* How do you feel? */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.dim }]}>How do you feel?</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.dim }]}
                placeholder="e.g., Satisfied, energized"
                placeholderTextColor={colors.dim}
                value={feeling}
                onChangeText={setFeeling}
                multiline
              />
            </View>

            {/* Notes */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.dim }]}>Notes</Text>
              <TextInput
                style={[styles.textArea, { backgroundColor: colors.card, color: colors.text, borderColor: colors.dim }]}
                placeholder="Any observations about this meal..."
                placeholderTextColor={colors.dim}
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={4}
              />
            </View>
          </ScrollView>

          {/* Save Button */}
          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: name.trim() ? colors.accent : colors.dim }]}
            onPress={handleSave}
            disabled={!name.trim()}
          >
            <Text style={[styles.saveButtonText, { color: colors.card }]}>Save Changes</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 40,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  closeButton: {
    fontSize: 28,
    fontWeight: '300',
  },
  form: {
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  energyButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  energyButton: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    borderWidth: 2,
  },
  energyIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  energyLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  saveButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 17,
    fontWeight: '600',
  },
});
