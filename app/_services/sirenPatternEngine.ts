/**
 * The Siren Pattern Engine
 * 
 * Watches music/sound/emotional immersion patterns to detect:
 * - Use following emotional spikes
 * - Decreased anchor completion in reflection spaces
 * - Long sessions of immersion without expression
 * - Dissociative looping or avoidance through emotional flooding
 * 
 * Philosophy: Emotional resonance weaver.
 * Tone: Lyrical, tidal, empathic.
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

export interface SirenPattern {
  totalInvocations: number;
  recentInvocations: number;
  previousInvocations: number;
  
  // Emotional pattern tracking
  lateNightUseRatio: number;
  consecutiveLateUses: number;
  
  // Immersion detection
  longSessionsDetected: boolean;
  reflectionGapDetected: boolean; // Uses without reflection
  
  // Anchor correlation
  reflectionAnchorDropOff: boolean;
  anchorStability: 'strong' | 'weak' | 'unknown';
  
  // Change signals
  frequencyIncreasing: boolean;
  dissociativeLooping: boolean; // Repeated use without processing
  avoidancePattern: boolean; // Use replacing reflection/expression
  
  narrative: string[];
}

export async function analyzeSirenPatterns(
  substanceEntries: SubstanceEntry[],
  anchorCompletions: any[]
): Promise<SirenPattern> {
  const now = Date.now();
  const sevenDaysAgo = now - (7 * 24 * 60 * 60 * 1000);
  const fourteenDaysAgo = now - (14 * 24 * 60 * 60 * 1000);
  
  const sirenEntries = substanceEntries.filter(e => 
    e.allyName.toLowerCase().includes('music') || 
    e.allyName.toLowerCase().includes('siren') ||
    e.allyName.toLowerCase().includes('sound') ||
    e.allyName.toLowerCase().includes('emotional')
  );
  
  const recentEntries = sirenEntries.filter(e => e.timestamp >= sevenDaysAgo);
  const previousEntries = sirenEntries.filter(e => 
    e.timestamp >= fourteenDaysAgo && e.timestamp < sevenDaysAgo
  );
  
  // Analyze time patterns (late night = emotional flooding)
  const lateUses = recentEntries.filter(e => e.timeContainer === 'late').length;
  const lateNightUseRatio = recentEntries.length > 0 ? lateUses / recentEntries.length : 0;
  
  const sortedRecent = [...recentEntries].sort((a, b) => a.timestamp - b.timestamp);
  let consecutiveLateUses = 0;
  let currentStreak = 0;
  for (const entry of sortedRecent) {
    if (entry.timeContainer === 'late') {
      currentStreak++;
      consecutiveLateUses = Math.max(consecutiveLateUses, currentStreak);
    } else {
      currentStreak = 0;
    }
  }
  
  // Detect long sessions (entries with very long reflections or multiple in short time)
  const longSessionsDetected = recentEntries.some(e => 
    (e.reflection && e.reflection.length > 500) ||
    (e.sensation && e.sensation.length > 300)
  );
  
  // Detect reflection gap (uses without meaningful reflection)
  const entriesWithoutReflection = recentEntries.filter(e => 
    !e.reflection || e.reflection.trim().length < 20
  ).length;
  const reflectionGapDetected = entriesWithoutReflection >= recentEntries.length * 0.6;
  
  // Analyze anchor correlation
  const recentAnchorCompletions = anchorCompletions.filter(a => a.timestamp >= sevenDaysAgo);
  const reflectionAnchors = recentAnchorCompletions.filter(a => 
    a.anchorName && (
      a.anchorName.toLowerCase().includes('journal') ||
      a.anchorName.toLowerCase().includes('write') ||
      a.anchorName.toLowerCase().includes('reflect')
    )
  ).length;
  
  const previousAnchorCompletions = anchorCompletions.filter(a => 
    a.timestamp >= fourteenDaysAgo && a.timestamp < sevenDaysAgo
  );
  const previousReflectionAnchors = previousAnchorCompletions.filter(a => 
    a.anchorName && (
      a.anchorName.toLowerCase().includes('journal') ||
      a.anchorName.toLowerCase().includes('write') ||
      a.anchorName.toLowerCase().includes('reflect')
    )
  ).length;
  
  const reflectionAnchorDropOff = reflectionAnchors < previousReflectionAnchors * 0.5 && 
    previousReflectionAnchors > 0 &&
    recentEntries.length > previousEntries.length;
  
  const anchorStability: 'strong' | 'weak' | 'unknown' = 
    recentAnchorCompletions.length >= 10 ? 'strong' :
    recentAnchorCompletions.length >= 3 ? 'weak' :
    'unknown';
  
  const frequencyIncreasing = recentEntries.length >= previousEntries.length * 1.5;
  
  // Detect dissociative looping (3+ uses in 3 days with no reflection)
  const dissociativeLooping = recentEntries.length >= 3 && 
    reflectionGapDetected && 
    consecutiveLateUses >= 2;
  
  // Detect avoidance pattern
  const avoidancePattern = reflectionAnchorDropOff && frequencyIncreasing;
  
  // Build narrative
  const narrative: string[] = [];
  
  if (dissociativeLooping) {
    narrative.push(`Dissociative looping: ${recentEntries.length} uses with minimal reflection`);
  }
  
  if (avoidancePattern) {
    narrative.push(`Avoidance pattern: immersion replacing expression`);
  }
  
  if (reflectionAnchorDropOff) {
    narrative.push(`Reflection anchors dropped: ${reflectionAnchors} recent vs ${previousReflectionAnchors} previous`);
  }
  
  if (consecutiveLateUses >= 3) {
    narrative.push(`${consecutiveLateUses} consecutive late-night immersions`);
  }
  
  if (longSessionsDetected) {
    narrative.push(`Long immersion sessions detected`);
  }
  
  if (frequencyIncreasing) {
    narrative.push(`Frequency increasing: ${recentEntries.length} recent vs ${previousEntries.length} previous`);
  }
  
  return {
    totalInvocations: sirenEntries.length,
    recentInvocations: recentEntries.length,
    previousInvocations: previousEntries.length,
    lateNightUseRatio,
    consecutiveLateUses,
    longSessionsDetected,
    reflectionGapDetected,
    reflectionAnchorDropOff,
    anchorStability,
    frequencyIncreasing,
    dissociativeLooping,
    avoidancePattern,
    narrative,
  };
}
