import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { Archetype } from '../_constants/Types';

interface ArchetypeCardProps {
  archetype: Archetype;
  onPress: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  colors: any;
  isDefault?: boolean; // Protect default archetypes from deletion
}

export function ArchetypeCard({ archetype, onPress, onEdit, onDelete, colors, isDefault = false }: ArchetypeCardProps) {
  const [showMenu, setShowMenu] = useState(false);

  const handleLongPress = useCallback(() => {
    if (onEdit || onDelete) {
      setShowMenu(true);
    }
  }, [onEdit, onDelete]);

  const handleEdit = useCallback(() => {
    setShowMenu(false);
    if (onEdit) {
      onEdit();
    }
  }, [onEdit]);

  const handleDelete = useCallback(() => {
    setShowMenu(false);
    if (onDelete && !isDefault) {
      onDelete();
    }
  }, [onDelete, isDefault]);

  return (
    <>
      <TouchableOpacity
        style={[styles.card, { backgroundColor: colors.card + 'CC' }]}
        onPress={onPress}
        onLongPress={handleLongPress}
        activeOpacity={0.7}
      >
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={[styles.name, { color: colors.text }]}>
              {archetype.icon} {archetype.name} {archetype.icon}
            </Text>
            <Text style={[styles.subtitle, { color: colors.dim }]}>"{archetype.subtitle}"</Text>
          </View>
        </View>
        <Text style={[styles.bio, { color: colors.text }]} numberOfLines={2}>
          {archetype.bio}
        </Text>
      </TouchableOpacity>

      {/* Edit/Delete Menu Modal */}
      <Modal
        visible={showMenu}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowMenu(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowMenu(false)}
        >
          <View style={[styles.menuContainer, { backgroundColor: colors.card }]}>
            <Text style={[styles.menuTitle, { color: colors.text }]}>{archetype.name}</Text>
            
            {onEdit && (
              <TouchableOpacity
                style={[styles.menuButton, { borderBottomColor: colors.dim }]}
                onPress={handleEdit}
              >
                <Text style={[styles.menuButtonText, { color: colors.accent }]}>Edit</Text>
              </TouchableOpacity>
            )}
            
            {onDelete && !isDefault && (
              <TouchableOpacity
                style={styles.menuButton}
                onPress={handleDelete}
              >
                <Text style={[styles.menuButtonText, { color: '#FF6B6B' }]}>Delete</Text>
              </TouchableOpacity>
            )}
            
            {isDefault && (
              <View style={styles.menuButton}>
                <Text style={[styles.menuButtonText, { color: colors.dim, fontStyle: 'italic' }]}>
                  Default archetype (cannot delete)
                </Text>
              </View>
            )}
            
            <TouchableOpacity
              style={styles.menuButton}
              onPress={() => setShowMenu(false)}
            >
              <Text style={[styles.menuButtonText, { color: colors.dim }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    justifyContent: 'center',
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  name: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 2,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  bio: {
    fontSize: 14,
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContainer: {
    width: '80%',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  menuButton: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'transparent',
  },
  menuButtonText: {
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '500',
  },
});
