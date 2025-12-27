/**
 * The Groundkeeper Pattern Engine
 * 
 * Watches food/nourishment patterns to detect:
 * - Inconsistent intake logs
 * - Energy anchors dropping post-meal
 * - Emotional linkage (comfort eating patterns)
 * - Nourishment rhythm breaks (skipped meals, binge cycles)
 * 
 * Philosophy: Stabilizer, body's memory of belonging.
 * Tone: Nurturing, slow, maternal.
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

export interface GroundkeeperPattern {
  totalInvocations: number;
  recentInvocations: number;
  previousInvocations: number;
  
  // Rhythm tracking
  mealsPerDay: number;
  inconsistentRhythm: boolean;
  skippedMeals: boolean; // Less than 2 meals/day
  
  // Emotional patterns
  comfortEatingDetected: boolean;
  emotionalLinkage: boolean;
  
  // Anchor correlation
  energyAnchorDropOff: boolean;
  anchorStability: 'strong' | 'weak' | 'unknown';
  
  // Change signals
  rhythmBreaking: boolean;
  bingeCycleDetected: boolean;
  
  narrative: string[];
}

export async function analyzeGroundkeeperPatterns(
  substanceEntries: SubstanceEntry[],
  anchorCompletions: any[]
): Promise<GroundkeeperPattern> {
  const now = Date.now();
  const sevenDaysAgo = now - (7 * 24 * 60 * 60 * 1000);
  const fourteenDaysAgo = now - (14 * 24 * 60 * 60 * 1000);
  
  const foodEntries = substanceEntries.filter(e => 
    e.allyName.toLowerCase().includes('food') || 
    e.allyName.toLowerCase().includes('groundkeeper') ||
    e.allyName.toLowerCase().includes('nourishment') ||
    e.allyName.toLowerCase().includes('meal')
  );
  
  const recentEntries = foodEntries.filter(e => e.timestamp >= sevenDaysAgo);
  const previousEntries = foodEntries.filter(e => 
    e.timestamp >= fourteenDaysAgo && e.timestamp < sevenDaysAgo
  );
  
  // Calculate meals per day
  const mealsPerDay = recentEntries.length / 7;
  const skippedMeals = mealsPerDay < 2;
  
  // Detect inconsistent rhythm (variance in meal timing)
  const sortedRecent = [...recentEntries].sort((a, b) => a.timestamp - b.timestamp);
  const gaps: number[] = [];
  for (let i = 1; i < sortedRecent.length; i++) {
    const gapHours = (sortedRecent[i].timestamp - sortedRecent[i - 1].timestamp) / (60 * 60 * 1000);
    gaps.push(gapHours);
  }
  
  const avgGap = gaps.length > 0 ? gaps.reduce((a, b) => a + b, 0) / gaps.length : 0;
  const gapVariance = gaps.length > 0 
    ? gaps.reduce((sum, gap) => sum + Math.pow(gap - avgGap, 2), 0) / gaps.length 
    : 0;
  const inconsistentRhythm = gapVariance > 50; // High variance in meal timing
  
  // Detect comfort eating (emotional words in intention/reflection)
  const emotionalWords = ['comfort', 'stress', 'anxiety', 'sad', 'lonely', 'bored', 'numb', 'escape'];
  const emotionalEntries = recentEntries.filter(e => {
    const text = `${e.intention} ${e.reflection}`.toLowerCase();
    return emotionalWords.some(word => text.includes(word));
  });
  const comfortEatingDetected = emotionalEntries.length >= 2;
  const emotionalLinkage = emotionalEntries.length >= recentEntries.length * 0.4;
  
  // Detect binge cycle (3+ meals in 4 hours, then long gap)
  let bingeCycleDetected = false;
  for (let i = 0; i < sortedRecent.length - 2; i++) {
    const windowMs = sortedRecent[i + 2].timestamp - sortedRecent[i].timestamp;
    if (windowMs <= (4 * 60 * 60 * 1000)) {
      // Found potential binge, check for gap after
      if (i + 3 < sortedRecent.length) {
        const gapAfter = (sortedRecent[i + 3].timestamp - sortedRecent[i + 2].timestamp) / (60 * 60 * 1000);
        if (gapAfter >= 12) {
          bingeCycleDetected = true;
          break;
        }
      }
    }
  }
  
  // Analyze anchor correlation (energy anchors)
  const recentAnchorCompletions = anchorCompletions.filter(a => a.timestamp >= sevenDaysAgo);
  const energyAnchors = recentAnchorCompletions.filter(a => 
    a.anchorName && (
      a.anchorName.toLowerCase().includes('energy') ||
      a.anchorName.toLowerCase().includes('move') ||
      a.anchorName.toLowerCase().includes('exercise')
    )
  ).length;
  
  const previousAnchorCompletions = anchorCompletions.filter(a => 
    a.timestamp >= fourteenDaysAgo && a.timestamp < sevenDaysAgo
  );
  const previousEnergyAnchors = previousAnchorCompletions.filter(a => 
    a.anchorName && (
      a.anchorName.toLowerCase().includes('energy') ||
      a.anchorName.toLowerCase().includes('move') ||
      a.anchorName.toLowerCase().includes('exercise')
    )
  ).length;
  
  const energyAnchorDropOff = energyAnchors < previousEnergyAnchors * 0.5 && previousEnergyAnchors > 0;
  
  const anchorStability: 'strong' | 'weak' | 'unknown' = 
    recentAnchorCompletions.length >= 10 ? 'strong' :
    recentAnchorCompletions.length >= 3 ? 'weak' :
    'unknown';
  
  const rhythmBreaking = skippedMeals || inconsistentRhythm || bingeCycleDetected;
  
  // Build narrative
  const narrative: string[] = [];
  
  if (skippedMeals) {
    narrative.push(`Skipped meals: ${mealsPerDay.toFixed(1)} meals/day (less than 2)`);
  }
  
  if (bingeCycleDetected) {
    narrative.push(`Binge cycle detected: clustering followed by long gaps`);
  }
  
  if (comfortEatingDetected || emotionalLinkage) {
    narrative.push(`Emotional linkage: ${emotionalEntries.length}/${recentEntries.length} meals with emotional context`);
  }
  
  if (inconsistentRhythm) {
    narrative.push(`Inconsistent rhythm: high variance in meal timing`);
  }
  
  if (energyAnchorDropOff) {
    narrative.push(`Energy anchors dropped: ${energyAnchors} recent vs ${previousEnergyAnchors} previous`);
  }
  
  return {
    totalInvocations: foodEntries.length,
    recentInvocations: recentEntries.length,
    previousInvocations: previousEntries.length,
    mealsPerDay,
    inconsistentRhythm,
    skippedMeals,
    comfortEatingDetected,
    emotionalLinkage,
    energyAnchorDropOff,
    anchorStability,
    rhythmBreaking,
    bingeCycleDetected,
    narrative,
  };
}
