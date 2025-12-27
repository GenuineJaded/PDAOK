import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Modal } from 'react-native';
import { Picker } from '@react-native-picker/picker';

import { ContainerId, ColorScheme, Moment } from '../_constants/Types';
import { useApp } from '../_context/AppContext';
import useColors from '../_hooks/useColors';

interface Props {
  isVisible: boolean;
  onClose: () => void;
  momentData: Partial<Moment>;
  colors: ColorScheme;
}

const checkInOptions = {
  tone: ['Lighter', 'Same', 'Spikier'],
  frequency: ['Water', 'Light', 'Movement', 'Sound', 'Novelty', 'Social'],
  presence: ['Focused', 'Scattered', 'Present', 'Distant'],
};

export const DailyBlockSynthesisModal = ({ isVisible, onClose, momentData }: Props) => {
  const colors = useColors(momentData?.container || 'morning');
  const { addMoment } = useApp();

  const [synthesisState, setSynthesisState] = useState({
    tracesAndEchoes: '',
    tone: '',
    frequency: '',
    presence: '',
  });

  useEffect(() => {
    if (isVisible && momentData) {
      // Reset state when modal opens
      setSynthesisState({
        tracesAndEchoes: '',
        tone: '',
        frequency: '',
        presence: '',
      });
    }
  }, [isVisible]);

  const handleSave = () => {
    // No validation required - all fields are optional
    const finalMoment: Omit<Moment, 'id' | 'timestamp' | 'date'> = {
      ...momentData,
      tone: synthesisState.tone,
      frequency: synthesisState.frequency,
      presence: synthesisState.presence,
      context: synthesisState.tracesAndEchoes,
      action_reflection: '',
      result_shift: '',
      conclusion_offering: '',
      text: momentData.text || 'Moment recorded',
      container: momentData.container || 'morning',
    } as Omit<Moment, 'id' | 'timestamp' | 'date'>;

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
            Reflect on this moment.
          </Text>

          <ScrollView style={styles.scrollView}>
            {/* The 3-Part Check-in (Tone, Frequency, Presence) - Optional */}
            <View style={styles.checkInSection}>
              <Text style={[styles.sectionTitle, { color: colors.accent }]}>THE 3-PART CHECK-IN</Text>

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
                      <Picker.Item label="..." value="" />
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
                      <Picker.Item label="..." value="" />
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
                      <Picker.Item label="..." value="" />
                      {checkInOptions.presence.map(option => (
                        <Picker.Item key={option} label={option} value={option} />
                      ))}
                    </Picker>
                  </View>
                </View>
              </View>
            </View>

            {/* Single Text Field - Traces & Echoes */}
            <View style={styles.reflectionSection}>
              <Text style={[styles.promptLabel, { color: colors.text }]}>Traces & Echoes</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.bg, color: colors.text, borderColor: colors.dim }]}
                placeholder="Let the moment speak back through you..."
                placeholderTextColor={colors.dim}
                multiline
                numberOfLines={8}
                value={synthesisState.tracesAndEchoes}
                onChangeText={(text) => handleSelect('tracesAndEchoes', text)}
              />
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
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  promptLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderRadius: 8,
    padding: 12,
    minHeight: 120,
    textAlignVertical: 'top',
    fontSize: 14,
    borderWidth: 1,
  },
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
    height: 40,
    width: '100%',
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
