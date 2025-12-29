import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ColorScheme } from '../_constants/Types';
import { formatGroupDate } from '../_utils/journalStats';

interface JournalEntry {
  id: string;
  preview: string;
  fullContent: string;
  date?: string;
  timestamp?: number; // For sorting and date grouping
  groupKey?: string; // For grouping entries (e.g., substance name)
}

interface JournalListProps {
  title: string;
  entries: JournalEntry[];
  colors: ColorScheme;
  emptyMessage?: string;
  onEntryPress?: (entry: JournalEntry) => void;
  grouped?: boolean; // Enable 4-tier grouped mode
  statsSummary?: string; // Optional stats summary to display
}

/**
 * JournalList - Flexible hierarchy for viewing journal entries
 * 
 * Standard mode (3-tier):
 * Level 1: Collapsed (just title)
 * Level 2: Expanded list (up to 10 recent entries, one-line previews)
 * Level 3: Full detail (modal opened via onEntryPress)
 * 
 * Grouped mode (4-tier) - for substance journals:
 * Level 1: Collapsed (just title)
 * Level 2: Expanded groups (e.g., Cannabis, Nicotine, Stimulants)
 * Level 3: Expanded entries within a group
 * Level 4: Full detail (modal opened via onEntryPress)
 */
export const JournalList: React.FC<JournalListProps> = ({
  title,
  entries,
  colors,
  emptyMessage = 'No entries yet.',
  onEntryPress,
  grouped = false,
  statsSummary,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  if (grouped) {
    return (
      <View style={styles.container}>
        {/* Level 1: Collapsed card */}
        <TouchableOpacity
          style={[styles.header, { backgroundColor: colors.card + 'B3' }]}
          onPress={() => setIsExpanded(!isExpanded)}
        >
          <View style={styles.headerLeft}>
            <Text style={[styles.title, { color: colors.dim }]}>{title}</Text>
            {statsSummary && (
              <Text style={[styles.stats, { color: colors.dim }]}>{statsSummary}</Text>
            )}
          </View>
          <Text style={[styles.count, { color: colors.text }]}>
            {entries.length} {isExpanded ? '▼' : '▶'}
          </Text>
        </TouchableOpacity>

        {/* Level 2: Expanded groups */}
        {isExpanded && (
          <View style={[styles.listContainer, { backgroundColor: colors.card + 'B3' }]}>
            {entries.length === 0 ? (
              <Text style={[styles.emptyText, { color: colors.dim }]}>
                {emptyMessage}
              </Text>
            ) : (() => {
              // Group entries by groupKey (substance name)
              const groupedEntries = entries.reduce((acc, entry) => {
                const groupKey = entry.groupKey || 'Unknown';
                if (!acc[groupKey]) {
                  acc[groupKey] = [];
                }
                acc[groupKey].push(entry);
                return acc;
              }, {} as Record<string, JournalEntry[]>);

              // Sort group names alphabetically
              const sortedGroups = Object.keys(groupedEntries).sort();

              return sortedGroups.map((groupKey) => {
                const groupEntries = groupedEntries[groupKey];
                const isGroupExpanded = expandedGroups.has(groupKey);

                return (
                  <View key={groupKey}>
                    {/* Level 2: Group Header */}
                    <TouchableOpacity
                      style={[styles.groupHeader, { backgroundColor: colors.bg + '80' }]}
                      onPress={() => {
                        setExpandedGroups(prev => {
                          const newSet = new Set(prev);
                          if (newSet.has(groupKey)) {
                            newSet.delete(groupKey);
                          } else {
                            newSet.add(groupKey);
                          }
                          return newSet;
                        });
                      }}
                    >
                      <Text style={[styles.groupName, { color: colors.text }]}>
                        {groupKey}
                      </Text>
                      <Text style={[styles.groupCount, { color: colors.dim }]}>
                        {groupEntries.length} {isGroupExpanded ? '▼' : '▶'}
                      </Text>
                    </TouchableOpacity>

                    {/* Level 3: Date Groups within Substance */}
                    {isGroupExpanded && (() => {
                      // Group entries by date within this substance
                      const entriesByDate: Record<string, JournalEntry[]> = {};
                      
                      groupEntries.forEach(entry => {
                        if (entry.timestamp) {
                          const { display, raw } = formatGroupDate(new Date(entry.timestamp));
                          if (!entriesByDate[raw]) {
                            entriesByDate[raw] = [];
                          }
                          entriesByDate[raw].push(entry);
                        } else {
                          // Fallback for entries without timestamp
                          const fallbackKey = 'unknown';
                          if (!entriesByDate[fallbackKey]) {
                            entriesByDate[fallbackKey] = [];
                          }
                          entriesByDate[fallbackKey].push(entry);
                        }
                      });

                      // Sort dates (newest first)
                      const sortedDates = Object.keys(entriesByDate).sort((a, b) => b.localeCompare(a));

                      return sortedDates.map(dateKey => {
                        const dateEntries = entriesByDate[dateKey];
                        const { display } = dateKey !== 'unknown' 
                          ? formatGroupDate(new Date(dateEntries[0].timestamp!))
                          : { display: 'Unknown Date' };

                        return (
                          <View key={dateKey}>
                            {/* Date Header with Count */}
                            <View style={[styles.dateHeader, { backgroundColor: colors.bg + '40' }]}>
                              <Text style={[styles.dateLabel, { color: colors.dim }]}>
                                {display}
                              </Text>
                              <Text style={[styles.dateCount, { color: colors.dim }]}>
                                {dateEntries.length} {dateEntries.length === 1 ? 'entry' : 'entries'}
                              </Text>
                            </View>

                            {/* Individual Entries for this Date */}
                            {dateEntries.map((entry) => (
                              <TouchableOpacity
                                key={entry.id}
                                style={[styles.entryRow, styles.nestedEntry, { borderBottomColor: colors.dim + '33' }]}
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
                            ))}
                          </View>
                        );
                      });
                    })()}
                  </View>
                );
              });
            })()}
          </View>
        )}
      </View>
    );
  }

  // Standard 3-tier mode
  const recentEntries = entries.slice(0, 10);

  return (
    <View style={styles.container}>
      {/* Level 1: Collapsed card */}
      <TouchableOpacity
        style={[styles.header, { backgroundColor: colors.card + 'B3' }]}
        onPress={() => setIsExpanded(!isExpanded)}
      >
        <View style={styles.headerLeft}>
          <Text style={[styles.title, { color: colors.dim }]}>{title}</Text>
          {statsSummary && (
            <Text style={[styles.stats, { color: colors.dim }]}>{statsSummary}</Text>
          )}
        </View>
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
  headerLeft: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  stats: {
    fontSize: 10,
    fontWeight: '500',
    opacity: 0.7,
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
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 4,
  },
  groupName: {
    fontSize: 15,
    fontWeight: '600',
  },
  groupCount: {
    fontSize: 13,
    fontWeight: '500',
  },
  dateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginTop: 4,
    marginBottom: 2,
    borderRadius: 6,
  },
  dateLabel: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  dateCount: {
    fontSize: 11,
    fontWeight: '500',
    opacity: 0.8,
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
  nestedEntry: {
    paddingLeft: 20,
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
