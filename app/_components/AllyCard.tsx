import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Pressable, Alert } from 'react-native';
import { Ally, ColorScheme } from '../_constants/Types';

interface Props {
  ally: Ally;
  onEdit: (ally: Ally) => void;
  onRemove?: () => void;
  onLogUse: () => void;
  colors: ColorScheme;
}

export const AllyCard = React.memo(({ ally, onEdit, onRemove, onLogUse, colors }: Props) => {
  const [expanded, setExpanded] = useState(false);

  const handleLongPress = () => {
    Alert.alert(
      `${ally.name}`,
      'Choose an action:',
      [
        {
          text: 'Edit',
          onPress: () => onEdit(ally),
        },
        {
          text: 'Delete',
          onPress: () => {
            if (onRemove) {
              Alert.alert(
                'Confirm Delete',
                `Are you sure you want to remove ${ally.name}?`,
                [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Delete', onPress: onRemove, style: 'destructive' },
                ]
              );
            }
          },
          style: 'destructive',
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  // Build display name with emojis on both sides
  // Strip any embedded emojis from mythicName/name before adding face emojis
  const cleanMythicName = ally.mythicName
    ? ally.mythicName
        .replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F000}-\u{1F02F}\u{1F0A0}-\u{1F0FF}\u{1F100}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}]/gu, '')
        .trim()
    : '';
  
  const displayName = ally.mythicName
    ? `${ally.face} ${cleanMythicName} ${ally.face}`
    : `${ally.face} ${ally.name} ${ally.face}`;

  return (
    <Pressable
      onPress={() => setExpanded(!expanded)}
      onLongPress={handleLongPress}
      delayLongPress={500}
      style={[styles.card, { backgroundColor: colors.card }]}
    >
      <View style={styles.header}>
        <View style={styles.nameContainer}>
          {ally.mythicName ? (
            <View style={styles.nameRow}>
              <Text style={[styles.mythicName, { color: colors.text }]}>{ally.face}</Text>
              <Text style={[styles.mythicName, { color: colors.text }]}> {cleanMythicName} </Text>
              <Text style={[styles.mythicName, { color: colors.text }]}>{ally.face}</Text>
            </View>
          ) : (
            <Text style={[styles.name, { color: colors.text }]}>
              {displayName}
            </Text>
          )}
          {ally.mythicName && (
            <Text style={[styles.realName, { color: colors.dim }]}>
              {ally.name}
            </Text>
          )}
        </View>
        <Text style={[styles.expandIcon, { color: colors.dim }]}>
          {expanded ? '∧' : '∨'}
        </Text>
      </View>

      {expanded && (
        <View style={styles.details}>
          <Text style={[styles.invocation, { color: colors.accent, fontStyle: 'italic' }]}>
            "{ally.invocation}"
          </Text>

          <View style={styles.section}>
            <Text style={[styles.label, { color: colors.dim }]}>ROLE:</Text>
            <Text style={[styles.text, { color: colors.text }]}>{ally.function || ''}</Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.label, { color: colors.dim }]}>EDGE:</Text>
            <Text style={[styles.text, { color: colors.text }]}>{ally.shadow || ''}</Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.label, { color: colors.dim }]}>CONTACT:</Text>
            <Text style={[styles.text, { color: colors.text }]}>{ally.ritual || ''}</Text>
          </View>

          <TouchableOpacity
            onPress={onLogUse}
            style={[styles.logButton, { backgroundColor: colors.accent }]}
          >
            <Text style={[styles.logButtonText, { color: colors.card }]}>+ log interaction</Text>
          </TouchableOpacity>
        </View>
      )}
    </Pressable>
  );
});

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  nameContainer: {
    flex: 1,
    gap: 4,
    alignItems: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mythicName: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.3,
    textAlign: 'center',
  },
  realName: {
    fontSize: 13,
    fontWeight: '400',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  name: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
  },
  expandIcon: {
    fontSize: 16,
    fontWeight: '300',
  },
  details: {
    marginTop: 16,
    gap: 14,
  },
  invocation: {
    fontSize: 15,
    lineHeight: 22,
  },
  section: {
    gap: 4,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  text: {
    fontSize: 14,
    lineHeight: 20,
  },
  logButton: {
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  logButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
