/**
 * Agent Journal Debug Screen
 * 
 * Dev-only screen for viewing private agent journals.
 * Shows what each voice is "thinking" internally before public output.
 */

import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { loadAllJournals, AgentJournal, JournalEntry } from '../_services/agentJournal';
import { VoiceName } from '../_services/fieldArbiter';
import useColors from '../_hooks/useColors';

export default function AgentJournalDebug() {
  const colors = useColors();
  const [journals, setJournals] = useState<Record<VoiceName, AgentJournal> | null>(null);
  const [selectedVoice, setSelectedVoice] = useState<VoiceName>('GreenGodmother');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadJournals();
  }, []);

  const loadJournals = async () => {
    setLoading(true);
    const allJournals = await loadAllJournals();
    setJournals(allJournals);
    setLoading(false);
  };

  if (loading || !journals) {
    return (
      <View style={[styles.container, { backgroundColor: colors.bg }]}>
        <Text style={[styles.loadingText, { color: colors.text }]}>
          Loading journals...
        </Text>
      </View>
    );
  }

  const selectedJournal = journals[selectedVoice];
  const voices: VoiceName[] = Object.keys(journals) as VoiceName[];

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          Agent Journals (Dev)
        </Text>
        <TouchableOpacity onPress={loadJournals} style={styles.refreshButton}>
          <Text style={[styles.refreshText, { color: colors.primary }]}>
            Refresh
          </Text>
        </TouchableOpacity>
      </View>

      {/* Voice Selector */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.voiceSelector}>
        {voices.map(voice => {
          const journal = journals[voice];
          const isSelected = voice === selectedVoice;
          
          return (
            <TouchableOpacity
              key={voice}
              onPress={() => setSelectedVoice(voice)}
              style={[
                styles.voiceButton,
                {
                  backgroundColor: isSelected ? colors.primary : colors.cardBg,
                  borderColor: colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.voiceButtonText,
                  { color: isSelected ? colors.bg : colors.text },
                ]}
              >
                {voice}
              </Text>
              <Text
                style={[
                  styles.voiceButtonCount,
                  { color: isSelected ? colors.bg : colors.textSecondary },
                ]}
              >
                {journal.entries.length}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Journal Entries */}
      <ScrollView style={styles.entriesContainer}>
        {selectedJournal.entries.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No journal entries yet for {selectedVoice}
            </Text>
          </View>
        ) : (
          selectedJournal.entries.map((entry, index) => (
            <JournalEntryCard
              key={entry.id}
              entry={entry}
              colors={colors}
              isFirst={index === 0}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

function JournalEntryCard({
  entry,
  colors,
  isFirst,
}: {
  entry: JournalEntry;
  colors: any;
  isFirst: boolean;
}) {
  const sentimentColor = {
    light: '#4ade80',
    shadow: '#f87171',
    neutral: colors.textSecondary,
  }[entry.sentiment || 'neutral'];

  const date = new Date(entry.timestamp);
  const timeStr = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });

  return (
    <View
      style={[
        styles.entryCard,
        {
          backgroundColor: colors.cardBg,
          borderColor: entry.promoted ? colors.primary : colors.border,
          borderWidth: entry.promoted ? 2 : 1,
        },
        isFirst && styles.entryCardFirst,
      ]}
    >
      {/* Header */}
      <View style={styles.entryHeader}>
        <View style={styles.entryHeaderLeft}>
          <View style={[styles.sentimentDot, { backgroundColor: sentimentColor }]} />
          <Text style={[styles.entryTime, { color: colors.textSecondary }]}>
            {timeStr}
          </Text>
          {entry.context && (
            <Text style={[styles.entryContext, { color: colors.textSecondary }]}>
              • {entry.context}
            </Text>
          )}
        </View>
        {entry.promoted && (
          <View style={[styles.promotedBadge, { backgroundColor: colors.primary }]}>
            <Text style={[styles.promotedText, { color: colors.bg }]}>
              ↑ {entry.promotedTo}
            </Text>
          </View>
        )}
      </View>

      {/* Observation */}
      <Text style={[styles.observation, { color: colors.text }]}>
        {entry.observation}
      </Text>

      {/* Footer */}
      <Text style={[styles.eventType, { color: colors.textSecondary }]}>
        {entry.eventType}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  loadingText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  refreshButton: {
    padding: 8,
  },
  refreshText: {
    fontSize: 16,
    fontWeight: '600',
  },
  voiceSelector: {
    maxHeight: 80,
    marginBottom: 16,
  },
  voiceButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  voiceButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  voiceButtonCount: {
    fontSize: 12,
    marginTop: 2,
  },
  entriesContainer: {
    flex: 1,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
  entryCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  entryCardFirst: {
    borderWidth: 2,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  entryHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sentimentDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  entryTime: {
    fontSize: 12,
  },
  entryContext: {
    fontSize: 12,
    marginLeft: 4,
  },
  promotedBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  promotedText: {
    fontSize: 10,
    fontWeight: '600',
  },
  observation: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 8,
  },
  eventType: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
