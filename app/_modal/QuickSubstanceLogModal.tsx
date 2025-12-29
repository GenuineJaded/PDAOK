import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, ScrollView } from 'react-native';
import { useColors } from '../_hooks/useColors';
import { ContainerId } from '../_constants/Types';

interface QuickSubstanceLogModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSave: (data: {
    substance: string;
    mythicName: string;
    intention: string;
    sensation: string;
    reflection: string;
  }) => void;
  container: ContainerId;
}

/**
 * Quick Substance Log Modal
 * Simplified logging for 4 main substance companions
 */
export const QuickSubstanceLogModal: React.FC<QuickSubstanceLogModalProps> = ({
  isVisible,
  onClose,
  onSave,
  container,
}) => {
  const colors = useColors();
  
  const [selectedSubstance, setSelectedSubstance] = useState<string>('');
  const [intention, setIntention] = useState('');
  const [sensation, setSensation] = useState('');
  const [reflection, setReflection] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  const substances = [
    { id: 'stimulants', name: 'Stimulants', mythicName: 'Firestarter', emoji: '⚡' },
    { id: 'nicotine', name: 'Nicotine', mythicName: 'The Tinkerer', emoji: '🔧' },
    { id: 'cannabis', name: 'Cannabis', mythicName: 'Green Godmother', emoji: '🌿' },
    { id: 'benzodiazepines', name: 'Benzodiazepines', mythicName: 'Mother of Silence', emoji: '🌊' },
  ];

  const handleSave = () => {
    if (!selectedSubstance) return;
    
    const substance = substances.find(s => s.id === selectedSubstance);
    if (!substance) return;

    onSave({
      substance: substance.name,
      mythicName: substance.mythicName,
      intention,
      sensation,
      reflection,
    });

    // Reset form
    setSelectedSubstance('');
    setIntention('');
    setSensation('');
    setReflection('');
    onClose();
  };

  const handleClose = () => {
    setSelectedSubstance('');
    setIntention('');
    setSensation('');
    setReflection('');
    setShowDropdown(false);
    onClose();
  };

  const selectedSubstanceData = substances.find(s => s.id === selectedSubstance);

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: colors.card }]}>
          <Text style={[styles.title, { color: colors.text }]}>Quick Substance Log</Text>
          
          {/* Substance Dropdown */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: colors.dim }]}>Substance</Text>
            <TouchableOpacity
              style={[styles.dropdown, { backgroundColor: colors.bg, borderColor: colors.dim }]}
              onPress={() => setShowDropdown(!showDropdown)}
            >
              <Text style={[styles.dropdownText, { color: selectedSubstance ? colors.text : colors.dim }]}>
                {selectedSubstanceData 
                  ? `${selectedSubstanceData.emoji} ${selectedSubstanceData.mythicName}`
                  : 'Select a substance...'}
              </Text>
              <Text style={[styles.dropdownArrow, { color: colors.dim }]}>
                {showDropdown ? '▲' : '▼'}
              </Text>
            </TouchableOpacity>

            {showDropdown && (
              <View style={[styles.dropdownMenu, { backgroundColor: colors.bg, borderColor: colors.dim }]}>
                {substances.map((substance) => (
                  <TouchableOpacity
                    key={substance.id}
                    style={[
                      styles.dropdownItem,
                      selectedSubstance === substance.id && { backgroundColor: colors.card },
                    ]}
                    onPress={() => {
                      setSelectedSubstance(substance.id);
                      setShowDropdown(false);
                    }}
                  >
                    <Text style={styles.dropdownEmoji}>{substance.emoji}</Text>
                    <View style={styles.dropdownItemText}>
                      <Text style={[styles.dropdownItemName, { color: colors.text }]}>
                        {substance.mythicName}
                      </Text>
                      <Text style={[styles.dropdownItemSubname, { color: colors.dim }]}>
                        {substance.name}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

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
                { backgroundColor: selectedSubstance ? colors.accent : colors.dim },
              ]}
              onPress={handleSave}
              disabled={!selectedSubstance}
            >
              <Text style={[styles.buttonText, { color: colors.card }]}>Save</Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
  },
  dropdownEmoji: {
    fontSize: 24,
  },
  dropdownItemText: {
    flex: 1,
  },
  dropdownItemName: {
    fontSize: 16,
    fontWeight: '600',
  },
  dropdownItemSubname: {
    fontSize: 13,
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
