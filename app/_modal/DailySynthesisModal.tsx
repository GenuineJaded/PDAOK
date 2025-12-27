import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { ColorScheme } from '../_constants/Types';
import { useApp } from '../_context/AppContext';
import { generateDailySynthesis, getTodaySynthesis, DailySynthesis } from '../_services/dailySynthesis';
import { Modal } from '../_components/Modal';

interface Props {
  visible: boolean;
  onClose: () => void;
  colors: ColorScheme;
}

export const DailySynthesisModal = ({ visible, onClose, colors }: Props) => {
  const { items } = useApp();
  const [synthesis, setSynthesis] = useState<DailySynthesis | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      loadOrGenerate();
    }
  }, [visible]);

  const loadOrGenerate = async () => {
    // Check if already generated today
    const existing = await getTodaySynthesis();
    if (existing) {
      setSynthesis(existing);
      return;
    }

    // Generate new synthesis
    if (items.length === 0) {
      return;
    }

    setIsLoading(true);
    try {
      const newSynthesis = await generateDailySynthesis(items);
      setSynthesis(newSynthesis);
    } catch (error) {
      console.error('Error generating synthesis:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isVisible={visible} onClose={onClose}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Daily Synthesis</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={[styles.closeText, { color: colors.accent }]}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.accent} />
              <Text style={[styles.loadingText, { color: colors.dim }]}>
                Weaving the day's threads...
              </Text>
            </View>
          ) : synthesis ? (
            <View style={styles.synthesisContainer}>
              <Text style={[styles.synthesisText, { color: colors.text }]}>
                {synthesis.synthesis}
              </Text>
              
              <View style={[styles.statsContainer, { borderTopColor: colors.dim + '33' }]}>
                <View style={styles.statRow}>
                  <Text style={[styles.statLabel, { color: colors.dim }]}>Completed:</Text>
                  <Text style={[styles.statValue, { color: colors.text }]}>{synthesis.stats.completed}</Text>
                </View>
                <View style={styles.statRow}>
                  <Text style={[styles.statLabel, { color: colors.dim }]}>Released:</Text>
                  <Text style={[styles.statValue, { color: colors.text }]}>
                    {synthesis.stats.skipped + synthesis.stats.forgot + synthesis.stats.couldnt + synthesis.stats.notRelevant}
                  </Text>
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: colors.dim }]}>
                No tasks today to synthesize.
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 24,
    padding: 24,
    width: '90%',
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  closeButton: {
    padding: 4,
  },
  closeText: {
    fontSize: 28,
    fontWeight: '300',
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 16,
  },
  loadingText: {
    fontSize: 14,
  },
  synthesisContainer: {
    gap: 20,
  },
  synthesisText: {
    fontSize: 16,
    lineHeight: 26,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 24,
    paddingTop: 16,
    borderTopWidth: 1,
  },
  statRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  statValue: {
    fontSize: 13,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
  },
});
