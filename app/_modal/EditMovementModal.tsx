import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { ColorScheme, MovementEntry } from '../_constants/Types';

interface EditMovementModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSave: (updates: Partial<MovementEntry>) => void;
  entry: MovementEntry | null;
  colors: ColorScheme;
}

const RESISTANCE_LEVELS = [
  'Minimal',
  'Noticeable',
  'Overwhelming',
  'Paralyzing',
];

export function EditMovementModal({ isVisible, onClose, onSave, entry, colors }: EditMovementModalProps) {
  const [act, setAct] = useState('');
  const [resistance, setResistance] = useState('');
  const [gainingInertia, setGainingInertia] = useState('');
  const [goalposts, setGoalposts] = useState('');
  const [showResistanceDropdown, setShowResistanceDropdown] = useState(false);

  // Populate form when entry changes
  useEffect(() => {
    if (entry) {
      setAct(entry.act || '');
      setResistance(entry.resistance || '');
      setGainingInertia(entry.gainingInertia || '');
      setGoalposts(entry.goalposts || '');
    }
  }, [entry]);

  const handleSave = () => {
    onSave({
      act: act.trim(),
      resistance: resistance || '',
      gainingInertia: gainingInertia.trim(),
      goalposts: goalposts.trim(),
    });
    handleClose();
  };

  const handleClose = () => {
    setAct('');
    setResistance('');
    setGainingInertia('');
    setGoalposts('');
    setShowResistanceDropdown(false);
    onClose();
  };

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalOverlay}
      >
        <View style={[styles.modalContent, { backgroundColor: colors.bg }]}>
          {/* Header with X button */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>Edit Movement</Text>
            <TouchableOpacity onPress={handleClose}>
              <Text style={[styles.closeButton, { color: colors.accent }]}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
            {/* Act */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.dim }]}>What physical action?</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.dim }]}
                placeholder="e.g., Morning walk, Yoga, Stretching"
                placeholderTextColor={colors.dim}
                value={act}
                onChangeText={setAct}
              />
            </View>

            {/* Resistance */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.dim }]}>Resistance Level</Text>
              <TouchableOpacity
                style={[styles.dropdown, { backgroundColor: colors.card, borderColor: colors.dim }]}
                onPress={() => setShowResistanceDropdown(!showResistanceDropdown)}
              >
                <Text style={[styles.dropdownText, { color: resistance ? colors.text : colors.dim }]}>
                  {resistance || 'Select resistance level...'}
                </Text>
                <Text style={[styles.dropdownArrow, { color: colors.dim }]}>
                  {showResistanceDropdown ? '▲' : '▼'}
                </Text>
              </TouchableOpacity>

              {showResistanceDropdown && (
                <View style={[styles.dropdownMenu, { backgroundColor: colors.card, borderColor: colors.dim }]}>
                  {RESISTANCE_LEVELS.map((level) => (
                    <TouchableOpacity
                      key={level}
                      style={[
                        styles.dropdownItem,
                        resistance === level && { backgroundColor: colors.accent + '20' },
                      ]}
                      onPress={() => {
                        setResistance(level);
                        setShowResistanceDropdown(false);
                      }}
                    >
                      <Text style={[styles.dropdownItemText, { color: colors.text }]}>
                        {level}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Gaining Inertia */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.dim }]}>What momentum was gathered?</Text>
              <TextInput
                style={[styles.textArea, { backgroundColor: colors.card, color: colors.text, borderColor: colors.dim }]}
                placeholder="What did you notice shifting?"
                placeholderTextColor={colors.dim}
                value={gainingInertia}
                onChangeText={setGainingInertia}
                multiline
                numberOfLines={3}
              />
            </View>

            {/* Goalposts */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.dim }]}>Markers & Reflections</Text>
              <TextInput
                style={[styles.textArea, { backgroundColor: colors.card, color: colors.text, borderColor: colors.dim }]}
                placeholder="What stood out along the path?"
                placeholderTextColor={colors.dim}
                value={goalposts}
                onChangeText={setGoalposts}
                multiline
                numberOfLines={3}
              />
            </View>
          </ScrollView>

          {/* Save Button */}
          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: act.trim() ? colors.accent : colors.dim }]}
            onPress={handleSave}
            disabled={!act.trim()}
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
    minHeight: 80,
    textAlignVertical: 'top',
  },
  dropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
  },
  dropdownText: {
    fontSize: 16,
  },
  dropdownArrow: {
    fontSize: 12,
  },
  dropdownMenu: {
    marginTop: 4,
    borderRadius: 10,
    borderWidth: 1,
    overflow: 'hidden',
  },
  dropdownItem: {
    padding: 14,
  },
  dropdownItemText: {
    fontSize: 16,
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
