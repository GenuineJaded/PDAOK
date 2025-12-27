/**
 * Green Godmother Pattern Engine
 * 
 * Watches cannabis-related synthesis entries and anchor patterns to detect:
 * - Frequency shifts (clustering, gaps)
 * - Time-of-day pattern changes
 * - Anchor correlation (which anchors drop when substance use increases)
 * - Nervous system regulation patterns
 * 
 * Philosophy: Nervous system historian, not judge.
 * Tone: Observational, mythic, never shaming.
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

export interface GreenGodmotherPattern {
  // Activity metrics
  totalInvocations: number;
  recentInvocations: number; // Last 7 days
  previousInvocations: number; // Previous 7 days (for comparison)
  
  // Time patterns
  timeDistribution: {
    morning: number;
    afternoon: number;
    evening: number;
    late: number;
  };
  dominantTime: string;
  
  // Change signals
  frequencyShift: 'increasing' | 'decreasing' | 'stable' | 'clustered';
  timePatternShift: boolean;
  clusterDetected: boolean;
  longGapDetected: boolean;
  
  // Anchor correlation
  anchorDropOff: boolean;
  anchorStability: 'strong' | 'weak' | 'unknown';
  
  // Narrative context for transmission generation
  narrative: string[];
}

/**
 * Analyze cannabis use patterns over the past 14 days
 */
export async function analyzeGreenGodmotherPatterns(
  substanceEntries: SubstanceEntry[],
  anchorCompletions: any[]
): Promise<GreenGodmotherPattern> {
  const now = Date.now();
  const sevenDaysAgo = now - (7 * 24 * 60 * 60 * 1000);
  const fourteenDaysAgo = now - (14 * 24 * 60 * 60 * 1000);
  
  // Filter for cannabis entries only
  const cannabisEntries = substanceEntries.filter(e => 
    e.allyName.toLowerCase().includes('cannabis') || 
    e.allyName.toLowerCase().includes('green godmother')
  );
  
  // Split into time windows
  const recentEntries = cannabisEntries.filter(e => e.timestamp >= sevenDaysAgo);
  const previousEntries = cannabisEntries.filter(e => 
    e.timestamp >= fourteenDaysAgo && e.timestamp < sevenDaysAgo
  );
  
  // Time distribution
  const timeDistribution = {
    morning: 0,
    afternoon: 0,
    evening: 0,
    late: 0,
  };
  
  recentEntries.forEach(entry => {
    if (entry.timeContainer) {
      timeDistribution[entry.timeContainer]++;
    }
  });
  
  const dominantTime = Object.entries(timeDistribution)
    .sort(([, a], [, b]) => b - a)[0]?.[0] || 'unknown';
  
  // Detect frequency shift
  let frequencyShift: 'increasing' | 'decreasing' | 'stable' | 'clustered' = 'stable';
  if (recentEntries.length >= previousEntries.length * 1.5) {
    frequencyShift = 'increasing';
  } else if (recentEntries.length <= previousEntries.length * 0.5 && previousEntries.length > 0) {
    frequencyShift = 'decreasing';
  }
  
  // Detect clustering (3+ invocations within 48 hours)
  let clusterDetected = false;
  const sortedRecent = [...recentEntries].sort((a, b) => b.timestamp - a.timestamp);
  for (let i = 0; i < sortedRecent.length - 2; i++) {
    const window = sortedRecent[i].timestamp - sortedRecent[i + 2].timestamp;
    if (window <= (48 * 60 * 60 * 1000)) {
      clusterDetected = true;
      frequencyShift = 'clustered';
      break;
    }
  }
  
  // Detect long gap (14+ days since last invocation)
  const longGapDetected = recentEntries.length === 0 && previousEntries.length > 0;
  
  // Detect time pattern shift
  const previousTimeDistribution = { morning: 0, afternoon: 0, evening: 0, late: 0 };
  previousEntries.forEach(entry => {
    if (entry.timeContainer) {
      previousTimeDistribution[entry.timeContainer]++;
    }
  });
  const previousDominantTime = Object.entries(previousTimeDistribution)
    .sort(([, a], [, b]) => b - a)[0]?.[0] || 'unknown';
  const timePatternShift = dominantTime !== previousDominantTime && 
    previousEntries.length > 0 && 
    recentEntries.length > 0;
  
  // Analyze anchor correlation
  const recentAnchorCompletions = anchorCompletions.filter(a => a.timestamp >= sevenDaysAgo);
  const previousAnchorCompletions = anchorCompletions.filter(a => 
    a.timestamp >= fourteenDaysAgo && a.timestamp < sevenDaysAgo
  );
  
  const anchorDropOff = recentAnchorCompletions.length < previousAnchorCompletions.length * 0.7 &&
    recentEntries.length > previousEntries.length;
  
  const anchorStability: 'strong' | 'weak' | 'unknown' = 
    recentAnchorCompletions.length >= 10 ? 'strong' :
    recentAnchorCompletions.length >= 3 ? 'weak' :
    'unknown';
  
  // Build narrative context
  const narrative: string[] = [];
  
  if (clusterDetected) {
    narrative.push(`Cluster detected: ${recentEntries.length} invocations in recent days, with 3+ within 48 hours`);
  }
  
  if (frequencyShift === 'increasing' && !clusterDetected) {
    narrative.push(`Frequency increasing: ${recentEntries.length} recent vs ${previousEntries.length} previous week`);
  }
  
  if (frequencyShift === 'decreasing') {
    narrative.push(`Frequency decreasing: ${recentEntries.length} recent vs ${previousEntries.length} previous week`);
  }
  
  if (timePatternShift) {
    narrative.push(`Time pattern shifted: from ${previousDominantTime} to ${dominantTime}`);
  }
  
  if (anchorDropOff) {
    narrative.push(`Anchor drop-off detected: anchors decreased while invocations increased`);
  }
  
  if (longGapDetected) {
    narrative.push(`Long gap: no invocations in past 7 days after previous activity`);
  }
  
  if (recentEntries.length > 0 && anchorStability === 'strong') {
    narrative.push(`Anchors remain stable alongside invocations`);
  }
  
  return {
    totalInvocations: cannabisEntries.length,
    recentInvocations: recentEntries.length,
    previousInvocations: previousEntries.length,
    timeDistribution,
    dominantTime,
    frequencyShift,
    timePatternShift,
    clusterDetected,
    longGapDetected,
    anchorDropOff,
    anchorStability,
    narrative,
  };
}
