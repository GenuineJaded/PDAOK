import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Modal } from 'react-native';
import { Picker } from '@react-native-picker/picker';

import { ContainerId, ColorScheme, Moment } from '../_constants/Types';
import { useApp } from '../_context/AppContext';
import useColors from '../_hooks/useColors';
import { generateSubstanceVoice } from '../_services/substanceVoice';
import { generateArchetypeToSubstance, generateSubstanceToArchetype } from '../_services/archetypeDialogue';

interface Props {
  isVisible: boolean;
  onClose: () => void;
  container: ContainerId;
  activeArchetype?: any;
}

// The 4 quick-access substances
const QUICK_SUBSTANCES = [
  { id: 'stimulants', name: 'Stimulants', mythicName: 'Firestarter', emoji: '⚡' },
  { id: 'nicotine', name: 'Nicotine', mythicName: 'The Tinkerer', emoji: '🔧' },
  { id: 'cannabis', name: 'Cannabis', mythicName: 'Green Godmother', emoji: '🌿' },
  { id: 'benzodiazepines', name: 'Benzodiazepines', mythicName: 'Mother of Silence', emoji: '🌊' },
];

/**
 * Quick Substance Synthesis Modal
 * Same as SubstanceSynthesisModal but with a substance selector dropdown
 * for quick logging from the home screen
 */
export const QuickSubstanceSynthesisModal = ({ isVisible, onClose, container, activeArchetype }: Props) => {
  const colors = useColors(container);
  const { 
    addSubstanceMoment,
    addConversation,
    conversations,
    patterns,
    journalEntries,
    substanceJournalEntries,
    allies,
  } = useApp();

  const [selectedSubstanceId, setSelectedSubstanceId] = useState<string>('');
  const [synthesisState, setSynthesisState] = useState({
    intention: '', // Time
    sensation: '', // Dose
    reflection: '', // Offering
    synthesis: '', // Synthesis & Reflection
  });

  // Get selected substance data
  const selectedSubstance = QUICK_SUBSTANCES.find(s => s.id === selectedSubstanceId);

  useEffect(() => {
    if (isVisible) {
      // Auto-populate time with current time in 12-hour format
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours % 12 || 12;
      const displayMinutes = minutes < 10 ? `0${minutes}` : minutes;
      const currentTime = `${displayHours}:${displayMinutes} ${ampm}`;
      
      setSynthesisState({
        intention: currentTime,
        sensation: '',
        reflection: '',
        synthesis: '',
      });
      setSelectedSubstanceId('');
    }
  }, [isVisible]);

  const handleSave = () => {
    if (!selectedSubstance) return;

    const finalMoment: Omit<Moment, 'id' | 'timestamp' | 'date'> = {
      allyName: selectedSubstance.name,
      container: container,
      // Map fields to Moment type structure
      tone: synthesisState.intention, // Time
      frequency: synthesisState.sensation, // Dose
      presence: synthesisState.reflection, // Offering
      context: synthesisState.synthesis, // Synthesis & Reflection
      action_reflection: '',
      result_shift: '',
      conclusion_offering: '',
      text: `${selectedSubstance.emoji} ${selectedSubstance.mythicName}`,
    } as Omit<Moment, 'id' | 'timestamp' | 'date'>;

    addSubstanceMoment(finalMoment);
    
    // Generate conversation silently for internal coherence
    if (selectedSubstance) {
      generateConversation(selectedSubstance.name, selectedSubstance.mythicName, synthesisState.intention, synthesisState.synthesis);
    }
    
    onClose();
  };

  const handleTextChange = (key: keyof typeof synthesisState, value: string) => {
    setSynthesisState(prev => ({ ...prev, [key]: value }));
  };

  const generateConversation = async (substanceName: string, mythicName: string, intention: string, synthesis: string) => {
    const messages: Array<{speaker: string; text: string; speakerType: 'substance' | 'archetype' | 'field'}> = [];

    try {
      // Prepare memory data
      const memoryData = {
        conversations,
        patterns,
        journalEntries: [...journalEntries, ...substanceJournalEntries],
        allies,
      };
      
      // Generate substance voice with memory
      const userNote = `${intention}. ${synthesis}`.trim();
      const displayName = mythicName || substanceName;
      const substanceMessage = await generateSubstanceVoice(substanceName, userNote, mythicName, memoryData);
      
      messages.push({
        speaker: displayName,
        text: substanceMessage,
        speakerType: 'substance',
      });

      // If archetype is active, generate dialogue
      if (activeArchetype) {
        const archetypeMessage = await generateArchetypeToSubstance(
          activeArchetype,
          substanceName,
          substanceMessage,
          memoryData
        );
        
        if (archetypeMessage) {
          messages.push({
            speaker: activeArchetype.name,
            text: archetypeMessage,
            speakerType: 'archetype',
          });
        }

        const substanceToArchetype = await generateSubstanceToArchetype(
          substanceName,
          activeArchetype,
          substanceMessage,
          memoryData
        );
        
        if (substanceToArchetype) {
          messages.push({
            speaker: substanceName,
            text: substanceToArchetype,
            speakerType: 'substance',
          });
        }
      }

      // Save conversation to storage
      if (messages.length > 0) {
        addConversation({
          substanceName,
          substanceMythicName: mythicName,
          archetypeName: activeArchetype?.name,
          messages,
        });
      }
    } catch (error) {
      console.error('Error generating conversation:', error);
    }
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
          {/* Header with title and substance selector */}
          <View style={styles.headerRow}>
            <View style={styles.titleSection}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Journalistic Synthesis</Text>
              <Text style={[styles.modalSubtitle, { color: colors.dim }]}>
                Reflect on the Moment.
              </Text>
            </View>
            
            {/* Substance Selector - Top Right */}
            <View style={styles.substanceSelectorContainer}>
              <View style={[styles.substanceSelector, { backgroundColor: colors.bg, borderColor: colors.accent }]}>
                <Picker
                  selectedValue={selectedSubstanceId}
                  onValueChange={(value) => setSelectedSubstanceId(value)}
                  style={[styles.substancePicker, { color: colors.text }]}
                  dropdownIconColor={colors.accent}
                >
                  <Picker.Item label="Select..." value="" />
                  {QUICK_SUBSTANCES.map((substance) => (
                    <Picker.Item 
                      key={substance.id}
                      label={`${substance.emoji} ${substance.mythicName}`}
                      value={substance.id}
                    />
                  ))}
                </Picker>
              </View>
            </View>
          </View>

          {/* Selected substance indicator */}
          {selectedSubstance && (
            <View style={[styles.selectedIndicator, { backgroundColor: colors.bg }]}>
              <Text style={[styles.selectedText, { color: colors.accent }]}>
                {selectedSubstance.emoji} {selectedSubstance.mythicName}
              </Text>
              <Text style={[styles.selectedSubtext, { color: colors.dim }]}>
                {selectedSubstance.name}
              </Text>
            </View>
          )}

          <ScrollView style={styles.scrollView}>
            <View style={styles.checkInSection}>
              <Text style={[styles.sectionTitle, { color: colors.accent }]}>THE 3-PART CHECK-IN</Text>

              <View style={styles.horizontalFieldsRow}>
                <View style={styles.horizontalField}>
                  <Text style={[styles.label, { color: colors.text }]}>Time</Text>
                  <TextInput
                    style={[styles.textInput, styles.miniTextInput, { color: colors.text, backgroundColor: colors.bg, borderColor: colors.dim }]}
                    placeholder="..."
                    placeholderTextColor={colors.dim}
                    value={synthesisState.intention}
                    onChangeText={(text) => handleTextChange('intention', text)}
                  />
                </View>

                <View style={styles.horizontalField}>
                  <Text style={[styles.label, { color: colors.text }]}>Dose</Text>
                  <TextInput
                    style={[styles.textInput, styles.miniTextInput, { color: colors.text, backgroundColor: colors.bg, borderColor: colors.dim }]}
                    placeholder="..."
                    placeholderTextColor={colors.dim}
                    value={synthesisState.sensation}
                    onChangeText={(text) => handleTextChange('sensation', text)}
                  />
                </View>

                <View style={styles.horizontalField}>
                  <Text style={[styles.label, { color: colors.text }]}>Offering</Text>
                  <View style={[styles.pickerContainer, { backgroundColor: colors.bg, borderColor: colors.dim }]}>
                    <Picker
                      selectedValue={synthesisState.reflection}
                      onValueChange={(value) => handleTextChange('reflection', value)}
                      style={[styles.picker, { color: colors.text }]}
                      dropdownIconColor={colors.text}
                    >
                      <Picker.Item label="Select..." value="" />
                      <Picker.Item label="Gratitude" value="Gratitude" />
                      <Picker.Item label="Intention" value="Intention" />
                      <Picker.Item label="Prayer" value="Prayer" />
                      <Picker.Item label="Silence" value="Silence" />
                      <Picker.Item label="Breath" value="Breath" />
                      <Picker.Item label="Water to earth" value="Water to earth" />
                      <Picker.Item label="Food to altar" value="Food to altar" />
                      <Picker.Item label="Time in nature" value="Time in nature" />
                      <Picker.Item label="Creative work" value="Creative work" />
                      <Picker.Item label="Service to others" value="Service to others" />
                    </Picker>
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.promptSection}>
              <Text style={[styles.guidedReflectionTitle, { color: colors.accent }]}>GUIDED INVOCATION</Text>
              <Text style={[styles.promptTitle, { color: colors.text }]}>Synthesis & Reflection</Text>
              <TextInput
                style={[styles.textInput, styles.largeTextInput, { color: colors.text, backgroundColor: colors.bg, borderColor: colors.dim }]}
                placeholder="Trace the atmosphere of the ritual — sensations, emotions, and any shift that followed..."
                placeholderTextColor={colors.dim}
                value={synthesisState.synthesis}
                onChangeText={(text) => handleTextChange('synthesis', text)}
                multiline
                numberOfLines={8}
              />
            </View>
          </ScrollView>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton, { backgroundColor: colors.dim }]}
              onPress={onClose}
            >
              <Text style={[styles.buttonText, { color: colors.card }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.saveButton, { backgroundColor: selectedSubstance ? colors.accent : colors.dim }]}
              onPress={handleSave}
              disabled={!selectedSubstance}
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
    width: '90%',
    maxHeight: '85%',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleSection: {
    flex: 1,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
  },
  substanceSelectorContainer: {
    marginLeft: 12,
  },
  substanceSelector: {
    borderRadius: 12,
    borderWidth: 2,
    overflow: 'hidden',
    minWidth: 160,
    minHeight: 52,
    justifyContent: 'center',
  },
  substancePicker: {
    height: 52,
    marginTop: -4,
    marginBottom: -4,
  },
  selectedIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  selectedText: {
    fontSize: 16,
    fontWeight: '600',
  },
  selectedSubtext: {
    fontSize: 13,
  },
  scrollView: {
    maxHeight: 350,
  },
  checkInSection: {
    marginBottom: 20,
  },
  horizontalFieldsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  horizontalField: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  textInput: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
    fontSize: 14,
  },
  miniTextInput: {
    minHeight: 44,
  },
  pickerContainer: {
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
    minHeight: 44,
    justifyContent: 'center',
  },
  picker: {
    height: 44,
  },
  largeTextInput: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  promptSection: {
    marginBottom: 20,
  },
  guidedReflectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  promptTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 12,
  },
  button: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {},
  saveButton: {},
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
