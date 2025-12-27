/**
 * The Alchemist Pattern Engine
 * 
 * Watches nicotine/caffeine/cognitive alteration patterns to detect:
 * - Micro-uses without intention
 * - Jitter patterns (overlap with stimulant data)
 * - Anchor fragmentation (many starts, no completions)
 * - Dependence patterns or scattered focus
 * 
 * Philosophy: Transformer, the nervous system's subtle chemist.
 * Tone: Brisk, inquisitive, lightly mercurial.
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

export interface AlchemistPattern {
  totalInvocations: number;
  recentInvocations: number;
  previousInvocations: number;
  
  // Micro-use tracking
  microUsesDetected: boolean; // 5+ uses in 7 days
  averageGapHours: number;
  intentionlessUses: number; // Uses without intention field
  
  // Jitter detection
  jitterPattern: boolean; // Frequent use with scattered anchors
  scatteredFocus: boolean;
  
  // Anchor correlation
  anchorFragmentation: boolean; // Many anchor starts, few completions
  completionRate: number;
  anchorStability: 'strong' | 'weak' | 'unknown';
  
  // Change signals
  frequencyIncreasing: boolean;
  dependenceSignals: boolean;
  
  narrative: string[];
}

export async function analyzeAlchemistPatterns(
  substanceEntries: SubstanceEntry[],
  anchorCompletions: any[]
): Promise<AlchemistPattern> {
  const now = Date.now();
  const sevenDaysAgo = now - (7 * 24 * 60 * 60 * 1000);
  const fourteenDaysAgo = now - (14 * 24 * 60 * 60 * 1000);
  
  const alchemistEntries = substanceEntries.filter(e => 
    e.allyName.toLowerCase().includes('nicotine') || 
    e.allyName.toLowerCase().includes('caffeine') ||
    e.allyName.toLowerCase().includes('alchemist') ||
    e.allyName.toLowerCase().includes('coffee') ||
    e.allyName.toLowerCase().includes('tobacco')
  );
  
  const recentEntries = alchemistEntries.filter(e => e.timestamp >= sevenDaysAgo);
  const previousEntries = alchemistEntries.filter(e => 
    e.timestamp >= fourteenDaysAgo && e.timestamp < sevenDaysAgo
  );
  
  // Detect micro-uses (5+ in 7 days)
  const microUsesDetected = recentEntries.length >= 5;
  
  // Calculate average gap
  const sortedRecent = [...recentEntries].sort((a, b) => a.timestamp - b.timestamp);
  const gaps: number[] = [];
  for (let i = 1; i < sortedRecent.length; i++) {
    const gapMs = sortedRecent[i].timestamp - sortedRecent[i - 1].timestamp;
    gaps.push(gapMs / (60 * 60 * 1000)); // Convert to hours
  }
  const averageGapHours = gaps.length > 0 
    ? gaps.reduce((a, b) => a + b, 0) / gaps.length 
    : 0;
  
  // Count intentionless uses
  const intentionlessUses = recentEntries.filter(e => 
    !e.intention || e.intention.trim().length < 10
  ).length;
  
  // Detect jitter pattern (frequent use + many anchors started but few completed)
  const recentAnchorCompletions = anchorCompletions.filter(a => a.timestamp >= sevenDaysAgo);
  const uniqueAnchorsStarted = new Set(recentAnchorCompletions.map(a => a.anchorId)).size;
  const completionRate = uniqueAnchorsStarted > 0 
    ? recentAnchorCompletions.length / uniqueAnchorsStarted 
    : 0;
  
  const anchorFragmentation = uniqueAnchorsStarted >= 5 && completionRate < 1.5;
  const jitterPattern = microUsesDetected && anchorFragmentation;
  const scatteredFocus = intentionlessUses >= recentEntries.length * 0.6;
  
  const anchorStability: 'strong' | 'weak' | 'unknown' = 
    recentAnchorCompletions.length >= 10 ? 'strong' :
    recentAnchorCompletions.length >= 3 ? 'weak' :
    'unknown';
  
  const frequencyIncreasing = recentEntries.length >= previousEntries.length * 1.5;
  const dependenceSignals = microUsesDetected && averageGapHours < 24 && intentionlessUses >= 3;
  
  // Build narrative
  const narrative: string[] = [];
  
  if (dependenceSignals) {
    narrative.push(`Dependence signals: ${recentEntries.length} uses, avg ${averageGapHours.toFixed(1)}h gap, ${intentionlessUses} without intention`);
  }
  
  if (jitterPattern) {
    narrative.push(`Jitter pattern: ${uniqueAnchorsStarted} anchors started, ${completionRate.toFixed(1)}x completion rate`);
  }
  
  if (scatteredFocus) {
    narrative.push(`Scattered focus: ${intentionlessUses}/${recentEntries.length} uses without clear intention`);
  }
  
  if (anchorFragmentation) {
    narrative.push(`Anchor fragmentation: many starts, few completions`);
  }
  
  if (frequencyIncreasing) {
    narrative.push(`Frequency increasing: ${recentEntries.length} recent vs ${previousEntries.length} previous`);
  }
  
  return {
    totalInvocations: alchemistEntries.length,
    recentInvocations: recentEntries.length,
    previousInvocations: previousEntries.length,
    microUsesDetected,
    averageGapHours,
    intentionlessUses,
    jitterPattern,
    scatteredFocus,
    anchorFragmentation,
    completionRate,
    anchorStability,
    frequencyIncreasing,
    dependenceSignals,
    narrative,
  };
}
