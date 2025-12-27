import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Modal } from 'react-native';
import { Picker } from '@react-native-picker/picker'; // Assuming Picker is available or will be installed

import { ContainerId, ColorScheme, Moment } from '../_constants/Types';
import { useApp } from '../_context/AppContext';
import useColors from '../_hooks/useColors';

interface Props {
  isVisible: boolean;
  onClose: () => void;
  momentData: Partial<Moment>;
  colors: ColorScheme;
}

const synthesisPrompts = [
  // Combining the first two prompts into a single "Reflection" field
  { key: 'reflection', title: 'Reflection & Invocation', placeholder: 'Describe the physical and emotional landscape, and how the ritual felt in the body.' },
  // Combining the last two prompts into a single "Insight" field
  { key: 'insight', title: 'Field Report & Offering', placeholder: 'What was the most surprising shift, and what is the one lesson you will carry forward?' },
];

const checkInOptions = {
  tone: ['Lighter', 'Same', 'Spikier'],
  frequency: ['Water', 'Light', 'Movement', 'Sound', 'Novelty', 'Social'],
  presence: ['Focused', 'Scattered', 'Present', 'Distant'],
};

export const PatternSynthesisModal = ({ isVisible, onClose, momentData }: Props) => {
  const colors = useColors(momentData?.container || 'morning');
  const { addMoment } = useApp();

  const [synthesisState, setSynthesisState] = useState({
    reflection: '', // New combined field
    insight: '',     // New combined field
    tone: '',
    frequency: '',
    presence: '',
  });

  useEffect(() => {
    if (isVisible && momentData) {
      // Reset state when modal opens
      setSynthesisState({
        reflection: '', // New combined field
        insight: '',     // New combined field
        tone: '',
        frequency: '',
        presence: '',
      });
    }
  }, [isVisible]);

  const handleSave = () => {
    const finalMoment: Omit<Moment, 'id' | 'timestamp' | 'date'> = {
      ...momentData,
      ...synthesisState,
      // The original fields are no longer in synthesisState, so we need to ensure Moment type is updated
      // For now, we will map the new fields to the old ones for compatibility with the existing Moment type structure
      // A more complete solution would update the Moment type, but for a quick fix:
      context: synthesisState.reflection,
      action_reflection: '',
      result_shift: synthesisState.insight,
      conclusion_offering: '',
      text: momentData.text || 'Moment recorded', // Fallback text
      container: momentData.container || 'morning', // Fallback container
    } as Omit<Moment, 'id' | 'timestamp' | 'date'>; // Cast to ensure correct type

    addMoment(finalMoment);
    onClose();
  };

  const handleSelect = (key: keyof typeof synthesisState, value: string) => {
    setSynthesisState(prev => ({ ...prev, [key]: value }));
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={[styles.centeredView, { backgroundColor: colors.bg + 'CC' }]}>
        <View style={[styles.modalView, { backgroundColor: colors.card }]}>
          <Text style={[styles.modalTitle, { color: colors.text }]}>Journalistic Synthesis</Text>
          <Text style={[styles.modalSubtitle, { color: colors.dim }]}>
            Reflect on the Moment with guided prompts.
          </Text>

          <ScrollView style={styles.scrollView}>
            {/* The 3-Part Check-in (Tone, Frequency, Presence) - Now as Dropdowns */}
            <View style={styles.checkInSection}>
              <Text style={[styles.sectionTitle, { color: colors.accent }]}>The 3-Part Check-in</Text>

              <View style={styles.dropdownRow}>
                {/* Tone Dropdown */}
                <View style={styles.dropdownContainer}>
                  <Text style={[styles.promptLabel, { color: colors.text }]}>Tone</Text>
                  <View style={[styles.pickerWrapper, { borderColor: colors.dim, backgroundColor: colors.bg }]}>
                    <Picker
                      selectedValue={synthesisState.tone}
                      onValueChange={(itemValue) => handleSelect('tone', itemValue)}
                      style={[styles.picker, { color: colors.text }]}
                      dropdownIconColor={colors.text}
                    >
                      <Picker.Item label="How did it feel?" value="" enabled={false} />
                      {checkInOptions.tone.map(option => (
                        <Picker.Item key={option} label={option} value={option} />
                      ))}
                    </Picker>
                  </View>
                </View>

                {/* Frequency Dropdown */}
                <View style={styles.dropdownContainer}>
                  <Text style={[styles.promptLabel, { color: colors.text }]}>Frequency</Text>
                  <View style={[styles.pickerWrapper, { borderColor: colors.dim, backgroundColor: colors.bg }]}>
                    <Picker
                      selectedValue={synthesisState.frequency}
                      onValueChange={(itemValue) => handleSelect('frequency', itemValue)}
                      style={[styles.picker, { color: colors.text }]}
                      dropdownIconColor={colors.text}
                    >
                      <Picker.Item label="What helped?" value="" enabled={false} />
                      {checkInOptions.frequency.map(option => (
                        <Picker.Item key={option} label={option} value={option} />
                      ))}
                    </Picker>
                  </View>
                </View>

                {/* Presence Dropdown */}
                <View style={styles.dropdownContainer}>
                  <Text style={[styles.promptLabel, { color: colors.text }]}>Presence</Text>
                  <View style={[styles.pickerWrapper, { borderColor: colors.dim, backgroundColor: colors.bg }]}>
                    <Picker
                      selectedValue={synthesisState.presence}
                      onValueChange={(itemValue) => handleSelect('presence', itemValue)}
                      style={[styles.picker, { color: colors.text }]}
                      dropdownIconColor={colors.text}
                    >
                      <Picker.Item label="Where was your mind?" value="" enabled={false} />
                      {checkInOptions.presence.map(option => (
                        <Picker.Item key={option} label={option} value={option} />
                      ))}
                    </Picker>
                  </View>
                </View>
              </View>
            </View>

            {/* Guided Reflection Prompts */}
            <View style={styles.reflectionSection}>
              <Text style={[styles.sectionTitle, { color: colors.accent }]}>Guided Reflection</Text>
              {synthesisPrompts.map(prompt => (
                <View key={prompt.key} style={styles.promptContainer}>
                  <Text style={[styles.promptLabel, { color: colors.text }]}>{prompt.title}</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.bg, color: colors.text, borderColor: colors.dim }]}
                    placeholder={prompt.placeholder}
                    placeholderTextColor={colors.dim}
                    multiline
                    numberOfLines={4}
                    value={synthesisState[prompt.key as keyof typeof synthesisState] as string}
                    onChangeText={(text) => handleSelect(prompt.key as keyof typeof synthesisState, text)}
                  />
                </View>
              ))}
            </View>
          </ScrollView>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.cancelButton, { borderColor: colors.dim, borderWidth: 1 }]}
              onPress={onClose}
            >
              <Text style={[styles.buttonText, { color: colors.text }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: colors.accent }]}
              onPress={handleSave}
            >
              <Text style={[styles.buttonText, { color: colors.card }]}>Synthesize Moment</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalView: {
    margin: 20,
    borderRadius: 20,
    padding: 25,
    alignItems: 'stretch',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '90%',
    maxWidth: 600,
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    marginBottom: 16,
  },
  scrollView: {
    maxHeight: '75%',
    paddingVertical: 10,
  },
  checkInSection: {
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc3',
  },
  reflectionSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  promptContainer: {
    marginBottom: 15,
  },
  promptLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
  },
  input: {
    borderRadius: 8,
    padding: 10,
    minHeight: 80,
    textAlignVertical: 'top',
    fontSize: 14,
    borderWidth: 1,
  },
  // New styles for the dropdown layout
  dropdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  dropdownContainer: {
    flex: 1,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    height: 40, // Adjust height as needed
    width: '100%',
  },
  // Removed old button styles
  optionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  optionText: {
    fontSize: 13,
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginRight: 10,
  },
  saveButton: {
    flex: 2,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

