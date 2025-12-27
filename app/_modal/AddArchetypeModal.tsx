import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal as RNModal,
} from 'react-native';
import { generateHarmonicTheme, regenerateColors, regenerateEmoji } from '../_utils/themeGenerator';

interface AddArchetypeModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSave: (archetype: {
    name: string;
    subtitle: string;
    bio: string;
    icon: string;
    theme: {
      primary: string;
      secondary: string;
      accent: string;
      background: string;
    };
  }) => void;
  colors: any;
}

export function AddArchetypeModal({ isVisible, onClose, onSave, colors }: AddArchetypeModalProps) {
  const [name, setName] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [bio, setBio] = useState('');
  const [theme, setTheme] = useState(generateHarmonicTheme());

  const handleSave = () => {
    onSave({
      name: name.trim(),
      subtitle: subtitle.trim() || 'Custom Archetype',
      bio: bio.trim() || 'A unique archetype created for your practice.',
      icon: theme.emoji,
      theme: {
        primary: theme.primary,
        secondary: theme.secondary,
        accent: theme.accent,
        background: theme.background,
      },
    });

    // Reset form
    setName('');
    setSubtitle('');
    setBio('');
    setTheme(generateHarmonicTheme());
    onClose();
  };

  const handleRegenerateTheme = () => {
    setTheme(generateHarmonicTheme());
  };

  const handleRegenerateColors = () => {
    setTheme(regenerateColors(theme.emoji));
  };

  const handleRegenerateEmoji = () => {
    setTheme(regenerateEmoji({
      primary: theme.primary,
      secondary: theme.secondary,
      accent: theme.accent,
      background: theme.background,
    }));
  };

  return (
    <RNModal
      visible={isVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: colors.bg }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>Create Custom Archetype</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={[styles.closeText, { color: colors.dim }]}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Theme Preview */}
            <View style={[styles.themePreview, { backgroundColor: theme.background }]}>
              <Text style={styles.previewEmoji}>{theme.emoji}</Text>
              <View style={styles.colorRow}>
                <View style={[styles.colorSwatch, { backgroundColor: theme.primary }]} />
                <View style={[styles.colorSwatch, { backgroundColor: theme.secondary }]} />
                <View style={[styles.colorSwatch, { backgroundColor: theme.accent }]} />
              </View>
            </View>

            {/* Theme Regeneration Buttons */}
            <View style={styles.regenButtons}>
              <TouchableOpacity
                style={[styles.regenButton, { backgroundColor: colors.accent + '20', borderColor: colors.accent }]}
                onPress={handleRegenerateTheme}
              >
                <Text style={[styles.regenButtonText, { color: colors.accent }]}>🎲 New Theme</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.regenButton, { backgroundColor: colors.accent + '20', borderColor: colors.accent }]}
                onPress={handleRegenerateColors}
              >
                <Text style={[styles.regenButtonText, { color: colors.accent }]}>🎨 New Colors</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.regenButton, { backgroundColor: colors.accent + '20', borderColor: colors.accent }]}
                onPress={handleRegenerateEmoji}
              >
                <Text style={[styles.regenButtonText, { color: colors.accent }]}>✨ New Icon</Text>
              </TouchableOpacity>
            </View>

            {/* Name Input */}
            <Text style={[styles.label, { color: colors.text }]}>Name *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.dim }]}
              value={name}
              onChangeText={setName}
              placeholder="The Wanderer"
              placeholderTextColor={colors.dim}
            />

            {/* Subtitle Input */}
            <Text style={[styles.label, { color: colors.text }]}>Subtitle</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.dim }]}
              value={subtitle}
              onChangeText={setSubtitle}
              placeholder="One who seeks"
              placeholderTextColor={colors.dim}
            />

            {/* Bio Input */}
            <Text style={[styles.label, { color: colors.text }]}>Bio</Text>
            <TextInput
              style={[styles.input, styles.bioInput, { backgroundColor: colors.card, color: colors.text, borderColor: colors.dim }]}
              value={bio}
              onChangeText={setBio}
              placeholder="Describe this archetype's essence..."
              placeholderTextColor={colors.dim}
              multiline
              numberOfLines={4}
            />
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton, { backgroundColor: colors.card }]}
              onPress={onClose}
            >
              <Text style={[styles.buttonText, { color: colors.dim }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.saveButton, { backgroundColor: colors.accent }]}
              onPress={handleSave}
            >
              <Text style={[styles.buttonText, { color: colors.bg }]}>Create</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  closeButton: {
    padding: 4,
  },
  closeText: {
    fontSize: 24,
    fontWeight: '300',
  },
  content: {
    maxHeight: 400,
  },
  themePreview: {
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  previewEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  colorRow: {
    flexDirection: 'row',
    gap: 8,
  },
  colorSwatch: {
    width: 40,
    height: 40,
    borderRadius: 8,
  },
  regenButtons: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  regenButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  regenButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
  },
  bioInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: '#ccc',
  },
  saveButton: {},
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
