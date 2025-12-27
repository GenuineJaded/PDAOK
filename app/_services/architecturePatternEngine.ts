/**
 * The Architecture Pattern Engine
 * 
 * Watches stimulant use patterns to detect:
 * - Overuse of morning anchors
 * - Short bursts followed by crashes
 * - Sleep or nourishment neglect
 * - Order becoming rigidity, drive becoming depletion
 * 
 * Philosophy: Precision engineer, structure incarnate.
 * Tone: Analytic clarity with reverence for form.
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

export interface ArchitecturePattern {
  // Activity metrics
  totalInvocations: number;
  recentInvocations: number; // Last 7 days
  previousInvocations: number; // Previous 7 days
  
  // Time patterns
  morningUseRatio: number; // Percentage of uses in morning
  consecutiveMorningUses: number;
  
  // Crash detection
  burstAndCrashDetected: boolean;
  averageUseDuration: number; // Hours between uses
  
  // Anchor correlation
  morningAnchorOveruse: boolean;
  eveningAnchorDropOff: boolean;
  anchorStability: 'strong' | 'weak' | 'unknown';
  
  // Change signals
  frequencyIncreasing: boolean;
  rigidityDetected: boolean; // Same time, same pattern, no flexibility
  depletionSignals: boolean; // Evening/late anchors dropping
  
  // Narrative context
  narrative: string[];
}

export async function analyzeArchitecturePatterns(
  substanceEntries: SubstanceEntry[],
  anchorCompletions: any[]
): Promise<ArchitecturePattern> {
  const now = Date.now();
  const sevenDaysAgo = now - (7 * 24 * 60 * 60 * 1000);
  const fourteenDaysAgo = now - (14 * 24 * 60 * 60 * 1000);
  
  // Filter for stimulant entries
  const stimulantEntries = substanceEntries.filter(e => 
    e.allyName.toLowerCase().includes('stimulant') || 
    e.allyName.toLowerCase().includes('architecture') ||
    e.allyName.toLowerCase().includes('focus') ||
    e.allyName.toLowerCase().includes('adderall') ||
    e.allyName.toLowerCase().includes('caffeine')
  );
  
  const recentEntries = stimulantEntries.filter(e => e.timestamp >= sevenDaysAgo);
  const previousEntries = stimulantEntries.filter(e => 
    e.timestamp >= fourteenDaysAgo && e.timestamp < sevenDaysAgo
  );
  
  // Analyze time patterns
  const morningUses = recentEntries.filter(e => e.timeContainer === 'morning').length;
  const morningUseRatio = recentEntries.length > 0 ? morningUses / recentEntries.length : 0;
  
  // Check for consecutive morning uses
  const sortedRecent = [...recentEntries].sort((a, b) => a.timestamp - b.timestamp);
  let consecutiveMorningUses = 0;
  let currentStreak = 0;
  for (const entry of sortedRecent) {
    if (entry.timeContainer === 'morning') {
      currentStreak++;
      consecutiveMorningUses = Math.max(consecutiveMorningUses, currentStreak);
    } else {
      currentStreak = 0;
    }
  }
  
  // Detect burst and crash (3+ uses in 2 days, then 3+ days gap)
  let burstAndCrashDetected = false;
  if (sortedRecent.length >= 3) {
    for (let i = 0; i < sortedRecent.length - 2; i++) {
      const burstWindow = sortedRecent[i + 2].timestamp - sortedRecent[i].timestamp;
      if (burstWindow <= (2 * 24 * 60 * 60 * 1000)) {
        // Found burst, check for crash
        if (i + 3 < sortedRecent.length) {
          const gapAfterBurst = sortedRecent[i + 3].timestamp - sortedRecent[i + 2].timestamp;
          if (gapAfterBurst >= (3 * 24 * 60 * 60 * 1000)) {
            burstAndCrashDetected = true;
            break;
          }
        }
      }
    }
  }
  
  // Calculate average use duration
  const gaps: number[] = [];
  for (let i = 1; i < sortedRecent.length; i++) {
    const gapMs = sortedRecent[i].timestamp - sortedRecent[i - 1].timestamp;
    gaps.push(gapMs / (60 * 60 * 1000)); // Convert to hours
  }
  const averageUseDuration = gaps.length > 0 
    ? gaps.reduce((a, b) => a + b, 0) / gaps.length 
    : 0;
  
  // Analyze anchor patterns
  const recentAnchorCompletions = anchorCompletions.filter(a => a.timestamp >= sevenDaysAgo);
  const morningAnchors = recentAnchorCompletions.filter(a => a.timeContainer === 'morning').length;
  const eveningAnchors = recentAnchorCompletions.filter(a => 
    a.timeContainer === 'evening' || a.timeContainer === 'late'
  ).length;
  
  const previousAnchorCompletions = anchorCompletions.filter(a => 
    a.timestamp >= fourteenDaysAgo && a.timestamp < sevenDaysAgo
  );
  const previousEveningAnchors = previousAnchorCompletions.filter(a => 
    a.timeContainer === 'evening' || a.timeContainer === 'late'
  ).length;
  
  const morningAnchorOveruse = morningAnchors > eveningAnchors * 2 && recentEntries.length >= 3;
  const eveningAnchorDropOff = eveningAnchors < previousEveningAnchors * 0.5 && 
    previousEveningAnchors > 0 &&
    recentEntries.length > previousEntries.length;
  
  const anchorStability: 'strong' | 'weak' | 'unknown' = 
    recentAnchorCompletions.length >= 10 ? 'strong' :
    recentAnchorCompletions.length >= 3 ? 'weak' :
    'unknown';
  
  // Detect frequency increase
  const frequencyIncreasing = recentEntries.length >= previousEntries.length * 1.5;
  
  // Detect rigidity (same time pattern, no flexibility)
  const rigidityDetected = consecutiveMorningUses >= 5 && morningUseRatio >= 0.9;
  
  // Detect depletion signals
  const depletionSignals = eveningAnchorDropOff || (burstAndCrashDetected && recentEntries.length >= 4);
  
  // Build narrative
  const narrative: string[] = [];
  
  if (morningAnchorOveruse) {
    narrative.push(`Morning anchor overuse: ${morningAnchors} morning vs ${eveningAnchors} evening anchors`);
  }
  
  if (burstAndCrashDetected) {
    narrative.push(`Burst-and-crash pattern detected: short bursts followed by gaps`);
  }
  
  if (rigidityDetected) {
    narrative.push(`Rigidity detected: ${consecutiveMorningUses} consecutive morning uses, ${(morningUseRatio * 100).toFixed(0)}% morning ratio`);
  }
  
  if (eveningAnchorDropOff) {
    narrative.push(`Evening anchors dropping: ${eveningAnchors} recent vs ${previousEveningAnchors} previous`);
  }
  
  if (frequencyIncreasing) {
    narrative.push(`Frequency increasing: ${recentEntries.length} recent vs ${previousEntries.length} previous`);
  }
  
  if (depletionSignals) {
    narrative.push(`Depletion signals: drive outpacing recovery`);
  }
  
  return {
    totalInvocations: stimulantEntries.length,
    recentInvocations: recentEntries.length,
    previousInvocations: previousEntries.length,
    morningUseRatio,
    consecutiveMorningUses,
    burstAndCrashDetected,
    averageUseDuration,
    morningAnchorOveruse,
    eveningAnchorDropOff,
    anchorStability,
    frequencyIncreasing,
    rigidityDetected,
    depletionSignals,
    narrative,
  };
}
