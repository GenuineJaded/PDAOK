import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import React, { useState } from 'react';
import { useApp } from '../_context/AppContext';
import useColors from '../_hooks/useColors';
import { JournalList } from '../_components/JournalList';
import { JournalEntryModal } from '../_components/JournalEntryModal';

export default function JournalScreen() {
  const { activeContainer, journalEntries } = useApp();
  const colors = useColors(activeContainer, true, 'patterns');
  const [selectedJournalEntry, setSelectedJournalEntry] = useState<any>(null);
  const [isJournalEntryModalVisible, setIsJournalEntryModalVisible] = useState(false);

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.bg} />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.containerTitle, { color: colors.text }]}>
          Field Transmissions
        </Text>
        <Text style={[styles.containerSubtitle, { color: colors.dim }]}>
          pattern recognition in progress
        </Text>

        {/* Placeholder for AI Pattern Recognition */}
        <View style={[styles.placeholderCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.placeholderIcon, { color: colors.accent }]}>🌌</Text>
          <Text style={[styles.placeholderTitle, { color: colors.text }]}>
            Pattern Recognition Module
          </Text>
          <Text style={[styles.placeholderText, { color: colors.dim }]}>
            This space will soon reveal the hidden rhythms in your practice — tracking how anchors, allies, and moments weave together across time.
          </Text>
          <Text style={[styles.placeholderText, { color: colors.dim, marginTop: 12 }]}>
            For now, your transmissions are being collected and stored, waiting for the pattern-weaver to arrive.
          </Text>
        </View>

        {/* Recent Transmissions */}
        <Text style={[styles.sectionHeader, { color: colors.dim, marginTop: 32 }]}>
          RECENT TRANSMISSIONS
        </Text>

        <JournalList
          title="FIELD TRANSMISSIONS"
          entries={journalEntries.map(entry => {
            const fullContent = `${entry.allyName || entry.anchorTitle || 'Moment'}\n\nTone: ${entry.tone || 'Not specified'}\nFrequency: ${entry.frequency || 'Not specified'}\nPresence: ${entry.presence || 'Not specified'}\n\nThe Setting:\n${entry.context || 'None'}\n\nThe Shift:\n${entry.result_shift || 'None'}`;
            return {
              id: entry.id,
              preview: entry.allyName || entry.anchorTitle || 'Moment',
              fullContent,
              date: new Date(entry.date).toLocaleDateString(),
            };
          })}
          colors={colors}
          emptyMessage="No transmissions yet. Log your first interaction with an anchor or ally to begin."
          onEntryPress={(entry) => {
            setSelectedJournalEntry({
              title: 'Field Transmission',
              date: entry.date,
              content: entry.fullContent,
            });
            setIsJournalEntryModalVisible(true);
          }}
        />

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Journal Entry Detail Modal */}
      {selectedJournalEntry && (
        <JournalEntryModal
          visible={isJournalEntryModalVisible}
          onClose={() => {
            setIsJournalEntryModalVisible(false);
            setSelectedJournalEntry(null);
          }}
          title={selectedJournalEntry.title}
          date={selectedJournalEntry.date}
          content={selectedJournalEntry.content}
          colors={colors}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  containerTitle: {
    fontSize: 28,
    fontWeight: '600',
    marginBottom: 4,
    marginTop: 16,
  },
  containerSubtitle: {
    fontSize: 16,
    fontStyle: 'italic',
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 16,
  },
  placeholderCard: {
    borderRadius: 16,
    padding: 24,
    marginTop: 24,
    alignItems: 'center',
  },
  placeholderIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  placeholderTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  placeholderText: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  emptyCard: {
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  entryCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  entryTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  entryDate: {
    fontSize: 13,
  },
  checkInRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 6,
  },
  checkInLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  checkInValue: {
    fontSize: 13,
  },
  reflectionSection: {
    marginTop: 12,
    gap: 4,
  },
  reflectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  reflectionText: {
    fontSize: 14,
    lineHeight: 20,
  },
});

