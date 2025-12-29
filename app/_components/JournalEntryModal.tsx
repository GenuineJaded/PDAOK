import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { ColorScheme } from '../_constants/Types';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface JournalEntryModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  date?: string;
  content: string;
  colors: ColorScheme;
  onDelete?: () => void;
  onEdit?: () => void;
  entryId?: string;
}

/**
 * JournalEntryModal - Level 3 detail view for journal entries
 * Shows full content in a centered modal
 */
export const JournalEntryModal: React.FC<JournalEntryModalProps> = ({
  visible,
  onClose,
  title,
  date,
  content,
  colors,
  onDelete,
  onEdit,
  entryId,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.modalContainer, { maxHeight: SCREEN_HEIGHT * 0.8 }]}>
          <View style={[styles.header, { backgroundColor: colors.card + 'B3' }]}>
            <View style={styles.headerText}>
              <Text style={[styles.title, { color: colors.dim }]}>{title}</Text>
              {date && (
                <Text style={[styles.date, { color: colors.dim }]}>{date}</Text>
              )}
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={[styles.closeText, { color: colors.text }]}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={[styles.contentContainer, { backgroundColor: colors.card + 'B3' }]}
            contentContainerStyle={styles.contentInner}
          >
            <Text style={[styles.content, { color: colors.text }]}>{content}</Text>
          </ScrollView>

          {/* Action Buttons */}
          {(onDelete || onEdit) && (
            <View style={[styles.actionButtons, { backgroundColor: colors.card + 'B3' }]}>
              {onEdit && (
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: colors.bg }]}
                  onPress={onEdit}
                >
                  <Text style={[styles.actionButtonText, { color: colors.text }]}>✏️ Edit</Text>
                </TouchableOpacity>
              )}
              {onDelete && (
                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton, { backgroundColor: '#ff4444' }]}
                  onPress={onDelete}
                >
                  <Text style={[styles.actionButtonText, { color: '#ffffff' }]}>🗑️ Delete</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 500,
    borderRadius: 16,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    paddingBottom: 16,
  },
  headerText: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  date: {
    fontSize: 12,
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
    marginLeft: 12,
  },
  closeText: {
    fontSize: 24,
    fontWeight: '300',
  },
  contentContainer: {
    maxHeight: SCREEN_HEIGHT * 0.6,
  },
  contentInner: {
    padding: 20,
    paddingTop: 0,
  },
  content: {
    fontSize: 15,
    lineHeight: 24,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    paddingTop: 16,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  deleteButton: {
    // backgroundColor set inline
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
