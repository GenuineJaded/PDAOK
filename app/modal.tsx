import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';

import { Ally, ColorScheme, ContainerId } from './_constants/Types';

// --- AddAllyModal (Existing) ---

interface AddAllyModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSave: (name: string, face: string, invocation: string, func: string, shadow: string, ritual: string, mythicalName?: string) => void;
  colors: ColorScheme;
}

export const AddAllyModal: React.FC<AddAllyModalProps> = ({ isVisible, onClose, onSave, colors }) => {
  const [mythicalName, setMythicalName] = React.useState('');
  const [name, setName] = React.useState('');
  const [face, setFace] = React.useState('');
  const [invocation, setInvocation] = React.useState('');
  const [func, setFunc] = React.useState('');
  const [shadow, setShadow] = React.useState('');
  const [ritual, setRitual] = React.useState('');

  const handleSave = () => {
    if (name.trim()) {
      onSave(name, face || '✨', invocation, func, shadow, ritual, mythicalName);
      // Reset form
      setMythicalName('');
      setName('');
      setFace('');
      setInvocation('');
      setFunc('');
      setShadow('');
      setRitual('');
      onClose();
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.centeredView}
      >
        <View style={[styles.modalView, { backgroundColor: colors.bg }]}>
          <Text style={[styles.modalTitle, { color: colors.text }]}>Add New Ally</Text>
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.dim }]}>Mythological Name (optional)</Text>
              <TextInput
                style={[styles.input, { borderColor: colors.dim, color: colors.text, backgroundColor: colors.card }]}
                onChangeText={setMythicalName}
                value={mythicalName}
                placeholder="e.g., The Awakener, Liquid Focus"
                placeholderTextColor={colors.dim}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.dim }]}>Name* (required)</Text>
              <TextInput
                style={[styles.input, { borderColor: colors.dim, color: colors.text, backgroundColor: colors.card }]}
                onChangeText={setName}
                value={name}
                placeholder="e.g., Caffeine, Cannabis, Sunlight"
                placeholderTextColor={colors.dim}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.dim }]}>Face (optional)</Text>
              <TextInput
                style={[styles.input, { borderColor: colors.dim, color: colors.text, backgroundColor: colors.card }]}
                onChangeText={setFace}
                value={face}
                placeholder="✨"
                placeholderTextColor={colors.dim}
                maxLength={2}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.dim }]}>Invocation (optional)</Text>
              <TextInput
                style={[styles.input, { borderColor: colors.dim, color: colors.text, backgroundColor: colors.card }]}
                onChangeText={setInvocation}
                value={invocation}
                placeholder="How you call it to action"
                placeholderTextColor={colors.dim}
                multiline
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.dim }]}>Function (optional)</Text>
              <TextInput
                style={[styles.input, { borderColor: colors.dim, color: colors.text, backgroundColor: colors.card }]}
                onChangeText={setFunc}
                value={func}
                placeholder="What it does for you"
                placeholderTextColor={colors.dim}
                multiline
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.dim }]}>Shadow (optional)</Text>
              <TextInput
                style={[styles.input, { borderColor: colors.dim, color: colors.text, backgroundColor: colors.card }]}
                onChangeText={setShadow}
                value={shadow}
                placeholder="The downside/risk"
                placeholderTextColor={colors.dim}
                multiline
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.dim }]}>Ritual (optional)</Text>
              <TextInput
                style={[styles.input, { borderColor: colors.dim, color: colors.text, backgroundColor: colors.card }]}
                onChangeText={setRitual}
                value={ritual}
                placeholder="How you use it mindfully"
                placeholderTextColor={colors.dim}
                multiline
              />
            </View>
            <View style={{ height: 20 }} />
          </ScrollView>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton, { borderColor: colors.dim }]}
              onPress={onClose}
            >
              <Text style={[styles.textStyle, { color: colors.text }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.saveButton, { backgroundColor: colors.accent }]}
              onPress={handleSave}
              disabled={!name.trim()}
            >
              <Text style={[styles.textStyle, { color: colors.card }]}>Save Ally</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

// --- EditAllyModal (New) ---

interface EditAllyModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSave: (ally: Ally) => void;
  colors: ColorScheme;
  ally: Ally;
}

export const EditAllyModal: React.FC<EditAllyModalProps> = ({ isVisible, onClose, onSave, colors, ally }) => {
  const [name, setName] = React.useState(ally?.name || '');
  const [face, setFace] = React.useState(ally?.face || '');
  const [invocation, setInvocation] = React.useState(ally?.invocation || '');
  const [func, setFunc] = React.useState(ally?.function || '');
  const [shadow, setShadow] = React.useState(ally?.shadow || '');
  const [ritual, setRitual] = React.useState(ally?.ritual || '');

  React.useEffect(() => {
    if (ally) {
      setName(ally.name);
      setFace(ally.face);
      setInvocation(ally.invocation);
      setFunc(ally.function);
      setShadow(ally.shadow);
      setRitual(ally.ritual);
    } else {
      // Reset state if ally is null/undefined
      setName('');
      setFace('');
      setInvocation('');
      setFunc('');
      setShadow('');
      setRitual('');
    }
  }, [ally]);

  const handleSave = () => {
    if (name.trim()) {
      onSave({
        ...ally,
        name,
        face: face || '✨',
        invocation,
        function: func,
        shadow,
        ritual,
      });
      onClose();
    }
  };

  if (!ally) return null; // Prevent rendering if ally is not set

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.centeredView}
      >
        <View style={[styles.modalView, { backgroundColor: colors.bg }]}>
          <Text style={[styles.modalTitle, { color: colors.text }]}>Edit Ally: {ally.name}</Text>
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.dim }]}>Name* (required)</Text>
              <TextInput
                style={[styles.input, { borderColor: colors.dim, color: colors.text, backgroundColor: colors.card }]}
                onChangeText={setName}
                value={name}
                placeholder="Ally Name"
                placeholderTextColor={colors.dim}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.dim }]}>Face (optional)</Text>
              <TextInput
                style={[styles.input, { borderColor: colors.dim, color: colors.text, backgroundColor: colors.card }]}
                onChangeText={setFace}
                value={face}
                placeholder="✨"
                placeholderTextColor={colors.dim}
                maxLength={2}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.dim }]}>Invocation (optional)</Text>
              <TextInput
                style={[styles.input, { borderColor: colors.dim, color: colors.text, backgroundColor: colors.card }]}
                onChangeText={setInvocation}
                value={invocation}
                placeholder="How you call it to action"
                placeholderTextColor={colors.dim}
                multiline
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.dim }]}>Function (optional)</Text>
              <TextInput
                style={[styles.input, { borderColor: colors.dim, color: colors.text, backgroundColor: colors.card }]}
                onChangeText={setFunc}
                value={func}
                placeholder="What it does for you"
                placeholderTextColor={colors.dim}
                multiline
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.dim }]}>Shadow (optional)</Text>
              <TextInput
                style={[styles.input, { borderColor: colors.dim, color: colors.text, backgroundColor: colors.card }]}
                onChangeText={setShadow}
                value={shadow}
                placeholder="The downside/risk"
                placeholderTextColor={colors.dim}
                multiline
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.dim }]}>Ritual (optional)</Text>
              <TextInput
                style={[styles.input, { borderColor: colors.dim, color: colors.text, backgroundColor: colors.card }]}
                onChangeText={setRitual}
                value={ritual}
                placeholder="How you use it mindfully"
                placeholderTextColor={colors.dim}
                multiline
              />
            </View>
            <View style={{ height: 20 }} />
          </ScrollView>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton, { borderColor: colors.dim }]}
              onPress={onClose}
            >
              <Text style={[styles.textStyle, { color: colors.text }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.saveButton, { backgroundColor: colors.accent }]}
              onPress={handleSave}
              disabled={!name.trim()}
            >
              <Text style={[styles.textStyle, { color: colors.card }]}>Save Changes</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

// --- CraftMomentModal (Existing) ---

interface CraftMomentModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSave: (title: string, body: string, container: ContainerId) => void;
  colors: ColorScheme;
  container: ContainerId;
}

export const CraftMomentModal: React.FC<CraftMomentModalProps> = ({ isVisible, onClose, onSave, colors, container }) => {
  const [notice, setNotice] = React.useState('');
  const [act, setAct] = React.useState('');
  const [reflect, setReflect] = React.useState('');

  const handleSave = () => {
    // Combine Notice/Act/Reflect into title and body format for storage
    const title = notice.trim() || 'Personal Moment';
    const body = `Notice: ${notice}\n\nAct: ${act}\n\nReflect: ${reflect}`;
    
    if (notice.trim() || act.trim() || reflect.trim()) {
      onSave(title, body, container);
      setNotice('');
      setAct('');
      setReflect('');
      onClose();
    }
  };

  const containerLabels: Record<ContainerId, string> = {
    morning: 'Morning',
    afternoon: 'Afternoon',
    evening: 'Evening',
    late: 'Late',
    situational: 'Situational',
    uplift: 'Uplift',
  };

  const radioOptions = [
    { id: 'morning' as ContainerId, label: containerLabels.morning },
    { id: 'afternoon' as ContainerId, label: containerLabels.afternoon },
    { id: 'evening' as ContainerId, label: containerLabels.evening },
    { id: 'late' as ContainerId, label: containerLabels.late },
  ];

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.centeredView}
      >
        <View style={[styles.modalView, { backgroundColor: colors.bg }]}>
          <Text style={[styles.modalTitle, { color: colors.text }]}>Craft a Moment</Text>
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.dim }]}>Notice (optional)</Text>
              <TextInput
                style={[styles.input, { borderColor: colors.dim, color: colors.text, backgroundColor: colors.card }]}
                onChangeText={setNotice}
                value={notice}
                placeholder="What did you notice?"
                placeholderTextColor={colors.dim}
                multiline
                numberOfLines={2}
                textAlignVertical="top"
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.dim }]}>Act (optional)</Text>
              <TextInput
                style={[styles.input, { borderColor: colors.dim, color: colors.text, backgroundColor: colors.card }]}
                onChangeText={setAct}
                value={act}
                placeholder="What did you do?"
                placeholderTextColor={colors.dim}
                multiline
                numberOfLines={2}
                textAlignVertical="top"
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.dim }]}>Reflect (optional)</Text>
              <TextInput
                style={[styles.input, { borderColor: colors.dim, color: colors.text, backgroundColor: colors.card }]}
                onChangeText={setReflect}
                value={reflect}
                placeholder="What did you learn?"
                placeholderTextColor={colors.dim}
                multiline
                numberOfLines={2}
                textAlignVertical="top"
              />
            </View>
            <View style={{ height: 20 }} />
          </ScrollView>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton, { borderColor: colors.dim }]}
              onPress={onClose}
            >
              <Text style={[styles.textStyle, { color: colors.text }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.saveButton, { backgroundColor: colors.accent }]}
              onPress={handleSave}
            >
              <Text style={[styles.textStyle, { color: colors.card }]}>Craft Moment</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};


// --- Styles (Shared) ---

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  scrollView: {
    flexGrow: 1,
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 5,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    borderWidth: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    borderRadius: 10,
    padding: 15,
    elevation: 2,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  cancelButton: {
    borderWidth: 1,
  },
  saveButton: {
    opacity: 1, // Will be handled by disabled prop on TouchableOpacity
  },
  textStyle: {
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
  },
  radioGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  radio: {
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
});
