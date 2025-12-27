import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
} from 'react-native';
import { Archetype } from '../_constants/Types';

interface ArchetypeDetailModalProps {
  archetype: Archetype | null;
  isVisible: boolean;
  onClose: () => void;
  onInvoke: (archetype: Archetype) => void;
  colors: any;
}

export function ArchetypeDetailModal({
  archetype,
  isVisible,
  onClose,
  onInvoke,
  colors,
}: ArchetypeDetailModalProps) {
  if (!archetype) return null;

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.modalContainer, { backgroundColor: colors.bg }]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Text style={styles.icon}>{archetype.icon}</Text>
              <View style={styles.titleContainer}>
                <Text style={[styles.name, { color: colors.text }]}>{archetype.name}</Text>
                <Text style={[styles.subtitle, { color: colors.dim }]}>"{archetype.subtitle}"</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={[styles.closeText, { color: colors.dim }]}>×</Text>
            </TouchableOpacity>
          </View>

          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Bio */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.accent }]}>Bio</Text>
              <Text style={[styles.bodyText, { color: colors.text }]}>{archetype.bio}</Text>
            </View>

            {/* Activation Phrase */}
            <View style={[styles.section, styles.highlightSection, { backgroundColor: colors.accent + '15' }]}>
              <Text style={[styles.sectionTitle, { color: colors.accent }]}>Activation Phrase</Text>
              <Text style={[styles.activationText, { color: colors.text }]}>
                "{archetype.activation_phrase}"
              </Text>
            </View>

            {/* Body Cue */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.accent }]}>Body Cue</Text>
              <Text style={[styles.bodyText, { color: colors.text }]}>{archetype.body_cue}</Text>
            </View>

            {/* Invocation Visualization */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.accent }]}>Invocation Visualization</Text>
              <Text style={[styles.bodyText, { color: colors.text }]}>{archetype.invocation_visualization}</Text>
            </View>

            {/* Deactivation Phrase */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.accent }]}>Deactivation Phrase</Text>
              <Text style={[styles.bodyText, { color: colors.dim, fontStyle: 'italic' }]}>
                "{archetype.deactivation_phrase}"
              </Text>
            </View>

            <View style={{ height: 100 }} />
          </ScrollView>

          {/* Invoke Button */}
          <View style={[styles.footer, { borderTopColor: colors.dim + '30' }]}>
            <TouchableOpacity
              style={[styles.invokeButton, { backgroundColor: archetype.color_theme.accent }]}
              onPress={() => {
                onInvoke(archetype);
                onClose();
              }}
            >
              <Text style={[styles.invokeButtonText, { color: '#fff' }]}>
                ✨ Invoke {archetype.name}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    height: '85%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: 'column',
    alignItems: 'center',
    flex: 1,
  },
  icon: {
    fontSize: 40,
    marginBottom: 8,
  },
  titleContainer: {
    alignItems: 'center',
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  closeButton: {
    padding: 4,
  },
  closeText: {
    fontSize: 36,
    fontWeight: '300',
    lineHeight: 36,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 24,
  },
  highlightSection: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  bodyText: {
    fontSize: 16,
    lineHeight: 24,
  },
  activationText: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '500',
    fontStyle: 'italic',
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
  },
  invokeButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  invokeButtonText: {
    fontSize: 18,
    fontWeight: '600',
  },
});
