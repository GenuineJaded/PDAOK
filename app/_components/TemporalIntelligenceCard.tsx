import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { ColorScheme } from '../_constants/Types';
import { useApp } from '../_context/AppContext';
import { analyzePatterns, generatePrompt, getCachedInsight, cacheInsight } from '../_services/patternAnalysis';
import { generateInsight } from '../_services/geminiService';

interface Props {
  colors: ColorScheme;
}

const DEFAULT_MESSAGE = "The system is listening. As patterns emerge, I will offer a quiet observation here.";

export const TemporalIntelligenceCard = React.memo(({ colors }: Props) => {
  const { items } = useApp();
  const [message, setMessage] = useState<string>(DEFAULT_MESSAGE);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadInsight();
  }, [items.length]); // Re-analyze when task count changes

  const loadInsight = async () => {
    // Check cache first
    const cached = await getCachedInsight();
    if (cached) {
      setMessage(cached);
      return;
    }

    // Only generate if we have enough data
    if (items.length < 3) {
      setMessage(DEFAULT_MESSAGE);
      return;
    }

    // Generate new insight
    setIsLoading(true);
    try {
      const patterns = analyzePatterns(items);
      const prompt = generatePrompt(patterns);
      const insight = await generateInsight(prompt);
      
      setMessage(insight);
      await cacheInsight(insight);
    } catch (error) {
      // Log as info to avoid error toast - already handled gracefully
      console.log('Insight loading skipped (handled):', error);
      setMessage(DEFAULT_MESSAGE);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.dim }]}>
      <Text style={[styles.title, { color: colors.dim }]}>
        THE FIELD'S WHISPER
      </Text>
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colors.accent} />
          <Text style={[styles.loadingText, { color: colors.dim }]}>
            Observing patterns...
          </Text>
        </View>
      ) : (
        <Text style={[styles.message, { color: colors.text }]}>
          {message}
        </Text>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
  },
  title: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  message: {
    fontSize: 15,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: 13,
    fontStyle: 'italic',
  },
});
