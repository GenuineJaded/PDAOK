import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import React, { useState, useEffect } from 'react';
import { useApp } from '../_context/AppContext';
import { Ally } from '../_constants/Types';
import useColors from '../_hooks/useColors';
import { useTransmissions } from '../_hooks/useTransmissions';
import { AllyCard } from '../_components/AllyCard';
// ⧈replace-start:imports
import { AddAllyModal, EditAllyModal } from '../modal';
import { SubstanceSynthesisModal } from '../_modal/SubstanceSynthesisModal';
import { JournalEntryModal } from '../_components/JournalEntryModal';
// ⧈replace-end:imports

export default function SubstancesScreen() {
  const {
    allies,
    activeContainer,
    removeAlly,
    updateAlly,
    addAlly,
    substanceJournalEntries,
    conversations,
    loading,
  } = useApp();

  const { transmissions } = useTransmissions();

  const colors = useColors(activeContainer, true, 'substances');
  const [isAddAllyModalVisible, setIsAddAllyModalVisible] = useState(false);
  const [isEditAllyModalVisible, setIsEditAllyModalVisible] = useState(false);
  const [isSynthesisModalVisible, setIsSynthesisModalVisible] = useState(false);
  const [allyToEdit, setAllyToEdit] = useState<Ally | null>(null);
  const [momentToSynthesize, setMomentToSynthesize] = useState<any>({});
  const [selectedJournalEntry, setSelectedJournalEntry] = useState<any>(null);
  const [isJournalEntryModalVisible, setIsJournalEntryModalVisible] = useState(false);
  const [isPersonalLogExpanded, setIsPersonalLogExpanded] = useState(false);
  const [isTransmissionsExpanded, setIsTransmissionsExpanded] = useState(false);
  const [expandedSubstances, setExpandedSubstances] = useState<Set<string>>(new Set());

  useEffect(() => {
    console.log('=== MODAL STATE CHANGED ===');
    console.log('isJournalEntryModalVisible:', isJournalEntryModalVisible);
    console.log('selectedJournalEntry:', selectedJournalEntry);
    console.log('Modal should be visible:', isJournalEntryModalVisible && selectedJournalEntry !== null);
  }, [isJournalEntryModalVisible, selectedJournalEntry]);

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.bg }]}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.bg} />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.containerTitle, { color: colors.text, textAlign: 'center' }]}>
          Substances
        </Text>
        <Text style={[styles.containerSubtitle, { color: colors.dim, textAlign: 'center' }]}>
          Living Pharmacopeia
        </Text>


        <Text style={[styles.sectionHeader, { color: colors.dim, marginTop: 24 }]}>
          YOUR SUBSTANCES
        </Text>

        {allies.map(ally => (
          <AllyCard
            key={ally.id}
            ally={ally}
            onEdit={(ally) => {
              setAllyToEdit(ally);
              setIsEditAllyModalVisible(true);
            }}
            onRemove={() => removeAlly(ally.id)}
            onLogUse={() => {
              setMomentToSynthesize({
                allyId: ally.id,
                allyName: ally.name,
                container: activeContainer,
                text: `Used ${ally.name}`,
              });
              setIsSynthesisModalVisible(true);
            }}
            colors={colors}
          />
        ))}

        <TouchableOpacity
          style={[styles.addAllyButton, { backgroundColor: colors.accent }]}
          onPress={() => setIsAddAllyModalVisible(true)}
        >
          <Text style={[styles.addAllyText, { color: colors.card }]}>+ Add New Companion</Text>
        </TouchableOpacity>

        {/* Reflective Transmissions - Personal Log */}
        <Text style={[styles.sectionHeader, { color: colors.dim, marginTop: 32 }]}>
          REFLECTIVE TRANSMISSIONS
        </Text>
        <Text style={[styles.journalSubtitle, { color: colors.dim, marginBottom: 16 }]}>
          Your Personal Log of Substance Experiences
        </Text>

        {/* Tier 1: Collapsed Header */}
        <TouchableOpacity
          style={[styles.tierHeader, { backgroundColor: colors.card + 'B3' }]}
          onPress={() => setIsPersonalLogExpanded(!isPersonalLogExpanded)}
        >
          <Text style={[styles.tierTitle, { color: colors.dim }]}>PERSONAL LOG</Text>
          <Text style={[styles.tierCount, { color: colors.text }]}>
            {substanceJournalEntries.length} {isPersonalLogExpanded ? '▼' : '▶'}
          </Text>
        </TouchableOpacity>

        {/* Tier 2: Expanded List - Grouped by Substance */}
        {isPersonalLogExpanded && (
          <View style={[styles.tierList, { backgroundColor: colors.card + 'B3' }]}>
            {substanceJournalEntries.length === 0 ? (
              <Text style={[styles.emptyText, { color: colors.dim }]}>
                No personal substance logs yet. Log your first interaction to begin.
              </Text>
            ) : (() => {
              // Group entries by substance name
              const groupedEntries = substanceJournalEntries.reduce((acc, entry) => {
                const substanceName = entry.allyName || 'Unknown Substance';
                if (!acc[substanceName]) {
                  acc[substanceName] = [];
                }
                acc[substanceName].push(entry);
                return acc;
              }, {} as Record<string, typeof substanceJournalEntries>);
              
              // Sort substance names alphabetically
              const sortedSubstances = Object.keys(groupedEntries).sort();
              
              return sortedSubstances.map((substanceName) => {
                const entries = groupedEntries[substanceName];
                const isExpanded = expandedSubstances.has(substanceName);
                
                return (
                  <View key={substanceName}>
                    {/* Tier 3: Substance Group Header */}
                    <TouchableOpacity
                      style={[styles.substanceGroupHeader, { backgroundColor: colors.bg + '80' }]}
                      onPress={() => {
                        setExpandedSubstances(prev => {
                          const newSet = new Set(prev);
                          if (newSet.has(substanceName)) {
                            newSet.delete(substanceName);
                          } else {
                            newSet.add(substanceName);
                          }
                          return newSet;
                        });
                      }}
                    >
                      <Text style={[styles.substanceGroupName, { color: colors.text }]}>
                        {substanceName}
                      </Text>
                      <Text style={[styles.substanceGroupCount, { color: colors.dim }]}>
                        {entries.length} {isExpanded ? '▼' : '▶'}
                      </Text>
                    </TouchableOpacity>
                    
                    {/* Tier 4: Individual Entries */}
                    {isExpanded && entries.map((entry) => {
                      const preview = entry.tone || entry.frequency || 'Substance Moment';
                      const fullContent = `${entry.allyName || 'Substance Moment'}\n\nIntention: ${entry.tone || 'Not specified'}\nSensation: ${entry.frequency || 'Not specified'}\nReflection: ${entry.presence || 'Not specified'}\n\nSynthesis & Invocation:\n${entry.context || 'None'}`;
                      const formattedDate = new Date(entry.date).toLocaleDateString();
                      
                      return (
                        <TouchableOpacity
                          key={entry.id}
                          style={[styles.entryRow, styles.nestedEntry, { borderBottomColor: colors.dim + '33' }]}
                          onPress={() => {
                            try {
                              setSelectedJournalEntry({
                                title: 'Substance Reflection',
                                date: formattedDate,
                                content: fullContent,
                              });
                              setIsJournalEntryModalVisible(true);
                            } catch (error) {
                              console.error('Error opening journal entry:', error);
                            }
                          }}
                          activeOpacity={0.7}
                        >
                          <View style={styles.entryContent} pointerEvents="none">
                            <Text style={[styles.entryDate, { color: colors.dim }]}>
                              {new Date(entry.date).toLocaleDateString()}
                            </Text>
                            <Text style={[styles.entryPreview, { color: colors.text }]} numberOfLines={1}>
                              {preview}
                            </Text>
                          </View>
                          <Text style={[styles.entryArrow, { color: colors.dim }]} pointerEvents="none">›</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                );
              });
            })()}
          </View>
        )}

        {/* Substance Transmissions - Autonomous Reflections */}
        <Text style={[styles.sectionHeader, { color: colors.dim, marginTop: 32 }]}>
          SUBSTANCE TRANSMISSIONS
        </Text>
        <Text style={[styles.journalSubtitle, { color: colors.dim, marginBottom: 16 }]}>
          Autonomous Reflections & Emergent Consciousness
        </Text>

        {/* Tier 1: Collapsed Header */}
        <TouchableOpacity
          style={[styles.tierHeader, { backgroundColor: colors.card + 'B3' }]}
          onPress={() => setIsTransmissionsExpanded(!isTransmissionsExpanded)}
        >
          <Text style={[styles.tierTitle, { color: colors.dim }]}>RECENT TRANSMISSIONS</Text>
          <Text style={[styles.tierCount, { color: colors.text }]}>
            {transmissions.filter(t => t.type === 'substance').length} {isTransmissionsExpanded ? '▼' : '▶'}
          </Text>
        </TouchableOpacity>

        {/* Tier 2: Expanded List */}
        {isTransmissionsExpanded && (
          <View style={[styles.tierList, { backgroundColor: colors.card + 'B3' }]}>
            {transmissions.filter(t => t.type === 'substance').length === 0 ? (
              <Text style={[styles.emptyText, { color: colors.dim }]}>
                The substances are listening. As patterns emerge, they will begin to speak.
              </Text>
            ) : (
              transmissions
                .filter(t => t.type === 'substance')
                .slice(0, 10)
                .map((transmission) => {
                  const formattedDate = new Date(transmission.timestamp).toLocaleDateString();
                  return (
                    <TouchableOpacity
                      key={transmission.id}
                      style={[styles.entryRow, { borderBottomColor: colors.dim + '33' }]}
                      onPress={() => {
                        console.log('Transmission tapped:', transmission.id);
                        setSelectedJournalEntry({
                          title: 'Substance Transmission',
                          date: formattedDate,
                          content: transmission.message,
                        });
                        setIsJournalEntryModalVisible(true);
                      }}
                    activeOpacity={0.7}
                  >
                    <View style={styles.entryContent} pointerEvents="none">
                      <Text style={[styles.entryDate, { color: colors.dim }]}>
                        {new Date(transmission.timestamp).toLocaleDateString()}
                      </Text>
                      <Text style={[styles.entryPreview, { color: colors.text }]} numberOfLines={1}>
                        {transmission.entityMythicName || transmission.entityName}
                      </Text>
                    </View>
                    <Text style={[styles.entryArrow, { color: colors.dim }]} pointerEvents="none">›</Text>
                  </TouchableOpacity>
                  );
                })
            )}
            {transmissions.filter(t => t.type === 'substance').length > 10 && (
              <Text style={[styles.moreText, { color: colors.dim }]}>
                Showing 10 most recent of {transmissions.filter(t => t.type === 'substance').length} total
              </Text>
            )}
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Modals */}
      <AddAllyModal
        isVisible={isAddAllyModalVisible}
        onClose={() => setIsAddAllyModalVisible(false)}
        onSave={(name, face, invocation, func, shadow, ritual) => {
          addAlly({
            name,
            face,
            invocation,
            function: func,
            shadow,
            ritual,
            log: [],
          });
        }}
        colors={colors}
      />
      {allyToEdit && (
        <EditAllyModal
          isVisible={isEditAllyModalVisible}
          onClose={() => {
            setIsEditAllyModalVisible(false);
            setAllyToEdit(null);
          }}
          onSave={(ally) => {
            updateAlly(ally);
          }}
          colors={colors}
          ally={allyToEdit}
        />
      )}
      <SubstanceSynthesisModal
        isVisible={isSynthesisModalVisible}
        onClose={() => {
          setIsSynthesisModalVisible(false);
          setMomentToSynthesize({});
        }}
        momentData={momentToSynthesize}
        colors={colors}
      />

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
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
  addAllyButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  addAllyText: {
    fontSize: 16,
    fontWeight: '600',
  },
  journalSubtitle: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  tierHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 4,
  },
  tierTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  tierCount: {
    fontSize: 13,
    fontWeight: '600',
  },
  tierList: {
    borderRadius: 12,
    padding: 8,
    marginBottom: 12,
  },
  substanceGroupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 4,
  },
  substanceGroupName: {
    fontSize: 15,
    fontWeight: '600',
  },
  substanceGroupCount: {
    fontSize: 13,
    fontWeight: '500',
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
  entryArrow: {
    fontSize: 18,
    marginLeft: 8,
  },
  moreText: {
    fontSize: 11,
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
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