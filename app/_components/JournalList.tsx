import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ColorScheme } from '../_constants/Types';

interface JournalEntry {
  id: string;
  preview: string;
  fullContent: string;
  date?: string;
}

interface JournalListProps {
  title: string;
  entries: JournalEntry[];
  colors: ColorScheme;
  emptyMessage?: string;
  onEntryPress?: (entry: JournalEntry) => void;
}

/**
 * JournalList - 3-level hierarchy for viewing journal entries
 * Level 1: Collapsed (just title)
 * Level 2: Expanded list (up to 10 recent entries, one-line previews)
 * Level 3: Full detail (modal opened via onEntryPress)
 */
export const JournalList: React.FC<JournalListProps> = ({
  title,
  entries,
  colors,
  emptyMessage = 'No entries yet.',
  onEntryPress,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const recentEntries = entries.slice(0, 10);

  return (
    <View style={styles.container}>
      {/* Level 1: Collapsed card */}
      <TouchableOpacity
        style={[styles.header, { backgroundColor: colors.card + 'B3' }]}
        onPress={() => setIsExpanded(!isExpanded)}
      >
        <Text style={[styles.title, { color: colors.dim }]}>{title}</Text>
        <Text style={[styles.count, { color: colors.text }]}>
          {entries.length} {isExpanded ? '▼' : '▶'}
        </Text>
      </TouchableOpacity>

      {/* Level 2: Expanded list */}
      {isExpanded && (
        <View style={[styles.listContainer, { backgroundColor: colors.card + 'B3' }]}>
          {recentEntries.length === 0 ? (
            <Text style={[styles.emptyText, { color: colors.dim }]}>
              {emptyMessage}
            </Text>
          ) : (
            recentEntries.map((entry) => (
              <TouchableOpacity
                key={entry.id}
                style={[styles.entryRow, { borderBottomColor: colors.dim + '33' }]}
                onPress={() => {
                  console.log('JournalList: Entry tapped', entry.id);
                  onEntryPress?.(entry);
                }}
                activeOpacity={0.7}
              >
                <View style={styles.entryContent} pointerEvents="none">
                  {entry.date && (
                    <Text style={[styles.entryDate, { color: colors.dim }]}>
                      {entry.date}
                    </Text>
                  )}
                  <Text
                    style={[styles.entryPreview, { color: colors.text }]}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {entry.preview}
                  </Text>
                </View>
                <Text style={[styles.arrow, { color: colors.dim }]} pointerEvents="none">›</Text>
              </TouchableOpacity>
            ))
          )}
          {entries.length > 10 && (
            <Text style={[styles.moreText, { color: colors.dim }]}>
              Showing 10 most recent of {entries.length} total
            </Text>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderRadius: 12,
  },
  title: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  count: {
    fontSize: 13,
    fontWeight: '600',
  },
  listContainer: {
    marginTop: 4,
    borderRadius: 12,
    padding: 8,
  },
  emptyText: {
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: 16,
  },
  entryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    minHeight: 60,
  },
  entryContent: {
    flex: 1,
    gap: 4,
  },
  entryDate: {
    fontSize: 11,
    fontWeight: '600',
  },
  entryPreview: {
    fontSize: 14,
  },
  arrow: {
    fontSize: 18,
    marginLeft: 8,
  },
  moreText: {
    fontSize: 11,
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
});
