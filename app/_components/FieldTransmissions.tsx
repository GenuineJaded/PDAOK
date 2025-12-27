/**
 * Field Transmissions Component
 * Displays autonomous messages from archetypes and substances
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useTransmissions } from '../_hooks/useTransmissions';
import { useApp } from '../_context/AppContext';
import { THEMES, ThemeName } from '../_constants/Themes';

export default function FieldTransmissions() {
  const { transmissions, unreadCount, loading, markRead, forceCheck, refresh } = useTransmissions();
  const { selectedTheme, setSelectedTheme } = useApp();

  const handleTransmissionPress = (transmissionId: string, isRead: boolean) => {
    if (!isRead) {
      markRead(transmissionId);
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(timestamp).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days}d ago`;
    } else if (hours > 0) {
      return `${hours}h ago`;
    } else {
      return 'Just now';
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>✧ FIELD TRANSMISSIONS ✧</Text>
        <Text style={styles.headerSubtitle}>
          Autonomous messages from your archetypes and allies
        </Text>
        {unreadCount > 0 ? (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadText}>{unreadCount} unread</Text>
          </View>
        ) : null}
      </View>

      {/* Force Check Button (for testing) */}
      <TouchableOpacity 
        style={styles.forceCheckButton} 
        onPress={forceCheck}
      >
        <Text style={styles.forceCheckText}>⚡ Generate New Transmission ⚡</Text>
      </TouchableOpacity>

      {/* Transmissions List */}
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refresh} />
        }
      >
        {transmissions.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              The field is quiet. As you journal and track patterns, your archetypes and allies will begin to speak.
            </Text>
          </View>
        ) : (
          transmissions.map((transmission) => (
            <TouchableOpacity
              key={transmission.id}
              style={[
                styles.transmissionCard,
                !transmission.read ? styles.unreadCard : null,
              ]}
              onPress={() => handleTransmissionPress(transmission.id, transmission.read)}
            >
              {/* Header with entity name and timestamp */}
              <View style={styles.transmissionHeader}>
                <View style={styles.entityInfo}>
                  <Text style={styles.entityType}>
                    {transmission.type === 'archetype' ? '🌟' : '🧪'}
                  </Text>
                  <View>
                    <Text style={styles.entityName}>
                      {transmission.entityMythicName || transmission.entityName}
                    </Text>
                    {transmission.entityMythicName ? (
                      <Text style={styles.entitySubname}>
                        {transmission.entityName}
                      </Text>
                    ) : null}
                  </View>
                </View>
                <Text style={styles.timestamp}>
                  {formatTimestamp(transmission.timestamp)}
                </Text>
              </View>

              {/* Message */}
              <Text style={styles.message}>{transmission.message}</Text>

              {/* Unread indicator */}
              {!transmission.read ? (
                <View style={styles.unreadDot} />
              ) : null}
            </TouchableOpacity>
          ))
        )}

        {/* Theme Selector at Bottom */}
        <View style={styles.themeSelectorContainer}>
          <Text style={styles.themeSelectorTitle}>Visual Theme</Text>
          <View style={styles.themeOptions}>
            {Object.values(THEMES).map((theme) => (
              <TouchableOpacity 
                key={theme.name}
                style={[
                  styles.themeOption,
                  selectedTheme === theme.name ? styles.themeOptionActive : null
                ]}
                onPress={() => setSelectedTheme(theme.name)}
              >
                <Text style={styles.themeIcon}>{theme.icon}</Text>
                <Text style={[
                  styles.themeName,
                  selectedTheme === theme.name ? styles.themeNameActive : null
                ]}>{theme.displayName}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#111',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 2,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  unreadBadge: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: '#4a9eff',
    borderRadius: 12,
  },
  unreadText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  themeSelectorContainer: {
    margin: 16,
    marginBottom: 8,
    padding: 16,
    backgroundColor: '#111',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  themeSelectorTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#888',
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  themeOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 8,
  },
  themeOption: {
    flex: 1,
    padding: 12,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#444',
    alignItems: 'center',
  },
  themeIcon: {
    fontSize: 28,
    marginBottom: 6,
  },
  themeName: {
    fontSize: 12,
    color: '#aaa',
    fontWeight: '500',
  },
  themeOptionActive: {
    borderColor: '#4a9eff',
    backgroundColor: '#1a2030',
  },
  themeNameActive: {
    color: '#4a9eff',
    fontWeight: '700',
  },
  forceCheckButton: {
    margin: 16,
    marginTop: 8,
    padding: 12,
    backgroundColor: '#222',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#444',
    alignItems: 'center',
  },
  forceCheckText: {
    color: '#4a9eff',
    fontSize: 14,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    fontStyle: 'italic',
  },
  transmissionCard: {
    margin: 16,
    marginTop: 8,
    padding: 16,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
    position: 'relative',
  },
  unreadCard: {
    borderColor: '#4a9eff',
    backgroundColor: '#1a2030',
  },
  transmissionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  entityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  entityType: {
    fontSize: 24,
  },
  entityName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  entitySubname: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
  },
  message: {
    fontSize: 15,
    color: '#ddd',
    lineHeight: 22,
  },
  unreadDot: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4a9eff',
  },
});
