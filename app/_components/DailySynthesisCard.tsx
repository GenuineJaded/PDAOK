import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { ColorScheme } from '../_constants/Types';
import { useApp } from '../_context/AppContext';
import { generateDailySynthesis, getTodaySynthesis, DailySynthesis } from '../_services/dailySynthesis';

interface Props {
  colors: ColorScheme;
  onViewHistory?: () => void;
}

export const DailySynthesisCard = React.memo(({ colors, onViewHistory }: Props) => {
  const { items } = useApp();
  const [synthesis, setSynthesis] = useState<DailySynthesis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);

  useEffect(() => {
    loadSynthesis();
  }, []);

  const loadSynthesis = async () => {
    // Check if already generated today
    const existing = await getTodaySynthesis();
    if (existing) {
      setSynthesis(existing);
      setHasGenerated(true);
      return;
    }

    // Not generated yet - show generate button
    setHasGenerated(false);
  };

  const handleGenerate = async () => {
    if (items.length === 0) {
      // No tasks today
      return;
    }

    setIsLoading(true);
    try {
      const newSynthesis = await generateDailySynthesis(items);
      setSynthesis(newSynthesis);
      setHasGenerated(true);
    } catch (error) {
      console.error('Error generating synthesis:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Check if it's evening (after 6 PM)
  const isEvening = () => {
    const hour = new Date().getHours();
    return hour >= 18; // 6 PM or later
  };

  // Don't show card if not evening and not generated
  if (!isEvening() && !hasGenerated) {
    return null;
  }

  return (
    <View style={[styles.card, { backgroundColor: colors.card + 'B3' }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.dim }]}>
          DAILY SYNTHESIS
        </Text>
        {hasGenerated && onViewHistory && (
          <TouchableOpacity onPress={onViewHistory}>
            <Text style={[styles.historyLink, { color: colors.accent }]}>
              History
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colors.accent} />
          <Text style={[styles.loadingText, { color: colors.dim }]}>
            Weaving the day's threads...
          </Text>
        </View>
      ) : hasGenerated && synthesis ? (
        <View style={styles.synthesisContainer}>
          <Text style={[styles.synthesisText, { color: colors.text }]}>
            {synthesis.synthesis}
          </Text>
          
          <View style={styles.statsContainer}>
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
        <View style={styles.generateContainer}>
          <Text style={[styles.promptText, { color: colors.text }]}>
            Gather the fragments of today. Let movement and stillness weave into meaning.
          </Text>
          <TouchableOpacity
            style={[styles.generateButton, { backgroundColor: colors.accent }]}
            onPress={handleGenerate}
          >
            <Text style={styles.generateButtonText}>
              🌙 Reflect on Today
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  historyLink: {
    fontSize: 13,
    fontWeight: '600',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  loadingText: {
    fontSize: 13,
    fontStyle: 'italic',
  },
  synthesisContainer: {
    gap: 16,
  },
  synthesisText: {
    fontSize: 15,
    lineHeight: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 24,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  statRow: {
    flexDirection: 'row',
    gap: 6,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  statValue: {
    fontSize: 12,
  },
  generateContainer: {
    gap: 16,
    alignItems: 'center',
  },
  promptText: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
  },
  generateButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  generateButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0f0f23',
  },
});
