/**
 * Mother of Silence Pattern Engine
 * 
 * Watches psychedelic/entheogen use patterns to detect:
 * - Extended quiet periods after use (integration gaps)
 * - Excessive density of insight logs ("too many revelations")
 * - Missed anchors due to expansion events
 * - Overstimulation, spiritual bypass, or insight loops
 * 
 * Philosophy: Dissolver, the void that restores orientation.
 * Tone: Reverent, spacious, slightly uncanny.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

export interface SubstanceEntry {
  id: string;
  allyId: string;
  allyName: string;
  timestamp: number;
  intention?: string;
  sensation?: string;
  reflection?: string;
  timeContainer: 'morning' | 'afternoon' | 'evening' | 'late';
}

export interface MotherOfSilencePattern {
  // Activity metrics
  totalInvocations: number;
  recentInvocations: number; // Last 14 days
  previousInvocations: number; // Previous 14 days
  
  // Integration tracking
  averageGapBetweenUses: number; // Days
  shortestGap: number; // Days
  longestGap: number; // Days
  
  // Insight density
  insightDensity: 'low' | 'moderate' | 'excessive';
  reflectionWordCount: number;
  
  // Change signals
  integrationGapTooShort: boolean;
  insightOverload: boolean;
  anchorDropOffPostUse: boolean;
  rapidRepeatedUse: boolean; // Less than 7 days between uses
  
  // Anchor correlation
  anchorStability: 'strong' | 'weak' | 'unknown';
  
  // Narrative context
  narrative: string[];
}

/**
 * Analyze psychedelic use patterns over the past 28 days
 */
export async function analyzeMotherOfSilencePatterns(
  substanceEntries: SubstanceEntry[],
  anchorCompletions: any[]
): Promise<MotherOfSilencePattern> {
  const now = Date.now();
  const fourteenDaysAgo = now - (14 * 24 * 60 * 60 * 1000);
  const twentyEightDaysAgo = now - (28 * 24 * 60 * 60 * 1000);
  
  // Filter for psychedelic entries
  const psychedelicEntries = substanceEntries.filter(e => 
    e.allyName.toLowerCase().includes('psychedelic') || 
    e.allyName.toLowerCase().includes('mother of silence') ||
    e.allyName.toLowerCase().includes('entheogen')
  );
  
  // Split into time windows
  const recentEntries = psychedelicEntries.filter(e => e.timestamp >= fourteenDaysAgo);
  const previousEntries = psychedelicEntries.filter(e => 
    e.timestamp >= twentyEightDaysAgo && e.timestamp < fourteenDaysAgo
  );
  
  // Calculate gaps between uses
  const sortedEntries = [...psychedelicEntries].sort((a, b) => a.timestamp - b.timestamp);
  const gaps: number[] = [];
  for (let i = 1; i < sortedEntries.length; i++) {
    const gapMs = sortedEntries[i].timestamp - sortedEntries[i - 1].timestamp;
    const gapDays = gapMs / (24 * 60 * 60 * 1000);
    gaps.push(gapDays);
  }
  
  const averageGapBetweenUses = gaps.length > 0 
    ? gaps.reduce((a, b) => a + b, 0) / gaps.length 
    : 0;
  const shortestGap = gaps.length > 0 ? Math.min(...gaps) : 0;
  const longestGap = gaps.length > 0 ? Math.max(...gaps) : 0;
  
  // Check for rapid repeated use (less than 7 days between)
  const rapidRepeatedUse = shortestGap > 0 && shortestGap < 7;
  
  // Check for integration gap too short
  const integrationGapTooShort = recentEntries.length >= 2 && averageGapBetweenUses < 14;
  
  // Analyze insight density (word count in reflections)
  const reflectionWordCount = recentEntries.reduce((total, entry) => {
    const words = (entry.reflection || '').split(/\s+/).filter(w => w.length > 0);
    return total + words.length;
  }, 0);
  
  const avgWordsPerEntry = recentEntries.length > 0 
    ? reflectionWordCount / recentEntries.length 
    : 0;
  
  const insightDensity: 'low' | 'moderate' | 'excessive' = 
    avgWordsPerEntry > 200 ? 'excessive' :
    avgWordsPerEntry > 100 ? 'moderate' :
    'low';
  
  const insightOverload = insightDensity === 'excessive' && recentEntries.length >= 2;
  
  // Analyze anchor correlation (check for drop-off after use)
  const anchorDropOffPostUse = recentEntries.length > 0 && (() => {
    // Check if anchors dropped in the 3 days following each use
    let dropOffsDetected = 0;
    for (const entry of recentEntries) {
      const threeDaysAfter = entry.timestamp + (3 * 24 * 60 * 60 * 1000);
      const anchorsInWindow = anchorCompletions.filter(a => 
        a.timestamp >= entry.timestamp && a.timestamp <= threeDaysAfter
      );
      if (anchorsInWindow.length < 2) {
        dropOffsDetected++;
      }
    }
    return dropOffsDetected >= recentEntries.length * 0.5;
  })();
  
  const recentAnchorCompletions = anchorCompletions.filter(a => a.timestamp >= fourteenDaysAgo);
  const anchorStability: 'strong' | 'weak' | 'unknown' = 
    recentAnchorCompletions.length >= 10 ? 'strong' :
    recentAnchorCompletions.length >= 3 ? 'weak' :
    'unknown';
  
  // Build narrative context
  const narrative: string[] = [];
  
  if (rapidRepeatedUse) {
    narrative.push(`Rapid repeated use: ${shortestGap.toFixed(1)} days between invocations`);
  }
  
  if (integrationGapTooShort) {
    narrative.push(`Integration gap too short: average ${averageGapBetweenUses.toFixed(1)} days between uses`);
  }
  
  if (insightOverload) {
    narrative.push(`Insight overload detected: ${avgWordsPerEntry.toFixed(0)} words per reflection, ${recentEntries.length} recent uses`);
  }
  
  if (anchorDropOffPostUse) {
    narrative.push(`Anchors dropped after expansion events`);
  }
  
  if (recentEntries.length === 0 && previousEntries.length > 0) {
    narrative.push(`Extended silence: no invocations in past 14 days`);
  }
  
  if (recentEntries.length >= 2 && !rapidRepeatedUse && !integrationGapTooShort) {
    narrative.push(`Spacious integration: ${averageGapBetweenUses.toFixed(1)} days between uses`);
  }
  
  return {
    totalInvocations: psychedelicEntries.length,
    recentInvocations: recentEntries.length,
    previousInvocations: previousEntries.length,
    averageGapBetweenUses,
    shortestGap,
    longestGap,
    insightDensity,
    reflectionWordCount,
    integrationGapTooShort,
    insightOverload,
    anchorDropOffPostUse,
    rapidRepeatedUse,
    anchorStability,
    narrative,
  };
}
