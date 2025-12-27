/**
 * The Tempest Pattern Engine
 * 
 * Watches digital overstimulation/screen exposure patterns to detect:
 * - Excessive device sessions
 * - Late-night anchor drop-offs
 * - Rapid log entries without reflection
 * - Overstimulation, doom-scroll loops, loss of circadian anchors
 * 
 * Philosophy: Storm, the breath of the modern ether.
 * Tone: Kinetic, alert, electrically poetic.
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

export interface TempestPattern {
  totalInvocations: number;
  recentInvocations: number;
  previousInvocations: number;
  
  // Screen time patterns
  lateNightSessions: number;
  lateNightRatio: number;
  excessiveSessions: boolean; // 5+ sessions in 7 days
  
  // Rapid logging (overstimulation signal)
  rapidEntries: number; // Entries within 1 hour of each other
  doomScrollDetected: boolean;
  
  // Anchor correlation
  lateNightAnchorDropOff: boolean;
  circadianDisruption: boolean;
  anchorStability: 'strong' | 'weak' | 'unknown';
  
  // Change signals
  frequencyIncreasing: boolean;
  overstimulationSignals: boolean;
  
  narrative: string[];
}

export async function analyzeTempestPatterns(
  substanceEntries: SubstanceEntry[],
  anchorCompletions: any[]
): Promise<TempestPattern> {
  const now = Date.now();
  const sevenDaysAgo = now - (7 * 24 * 60 * 60 * 1000);
  const fourteenDaysAgo = now - (14 * 24 * 60 * 60 * 1000);
  
  const tempestEntries = substanceEntries.filter(e => 
    e.allyName.toLowerCase().includes('screen') || 
    e.allyName.toLowerCase().includes('tempest') ||
    e.allyName.toLowerCase().includes('digital') ||
    e.allyName.toLowerCase().includes('device') ||
    e.allyName.toLowerCase().includes('phone')
  );
  
  const recentEntries = tempestEntries.filter(e => e.timestamp >= sevenDaysAgo);
  const previousEntries = tempestEntries.filter(e => 
    e.timestamp >= fourteenDaysAgo && e.timestamp < sevenDaysAgo
  );
  
  // Analyze late-night patterns
  const lateNightSessions = recentEntries.filter(e => e.timeContainer === 'late').length;
  const lateNightRatio = recentEntries.length > 0 ? lateNightSessions / recentEntries.length : 0;
  const excessiveSessions = recentEntries.length >= 5;
  
  // Detect rapid entries (doom-scroll signal)
  const sortedRecent = [...recentEntries].sort((a, b) => a.timestamp - b.timestamp);
  let rapidEntries = 0;
  for (let i = 1; i < sortedRecent.length; i++) {
    const gapMs = sortedRecent[i].timestamp - sortedRecent[i - 1].timestamp;
    if (gapMs <= (60 * 60 * 1000)) { // Within 1 hour
      rapidEntries++;
    }
  }
  const doomScrollDetected = rapidEntries >= 3;
  
  // Analyze anchor correlation (late-night anchors)
  const recentAnchorCompletions = anchorCompletions.filter(a => a.timestamp >= sevenDaysAgo);
  const lateNightAnchors = recentAnchorCompletions.filter(a => a.timeContainer === 'late').length;
  
  const previousAnchorCompletions = anchorCompletions.filter(a => 
    a.timestamp >= fourteenDaysAgo && a.timestamp < sevenDaysAgo
  );
  const previousLateNightAnchors = previousAnchorCompletions.filter(a => a.timeContainer === 'late').length;
  
  const lateNightAnchorDropOff = lateNightAnchors < previousLateNightAnchors * 0.5 && 
    previousLateNightAnchors > 0 &&
    lateNightSessions > previousEntries.filter(e => e.timeContainer === 'late').length;
  
  // Detect circadian disruption (late sessions + morning anchor drop)
  const morningAnchors = recentAnchorCompletions.filter(a => a.timeContainer === 'morning').length;
  const previousMorningAnchors = previousAnchorCompletions.filter(a => a.timeContainer === 'morning').length;
  const circadianDisruption = lateNightSessions >= 3 && 
    morningAnchors < previousMorningAnchors * 0.6 &&
    previousMorningAnchors > 0;
  
  const anchorStability: 'strong' | 'weak' | 'unknown' = 
    recentAnchorCompletions.length >= 10 ? 'strong' :
    recentAnchorCompletions.length >= 3 ? 'weak' :
    'unknown';
  
  const frequencyIncreasing = recentEntries.length >= previousEntries.length * 1.5;
  const overstimulationSignals = doomScrollDetected || (excessiveSessions && lateNightRatio >= 0.5);
  
  // Build narrative
  const narrative: string[] = [];
  
  if (doomScrollDetected) {
    narrative.push(`Doom-scroll detected: ${rapidEntries} rapid entries within short windows`);
  }
  
  if (overstimulationSignals) {
    narrative.push(`Overstimulation signals: ${recentEntries.length} sessions, ${(lateNightRatio * 100).toFixed(0)}% late-night`);
  }
  
  if (circadianDisruption) {
    narrative.push(`Circadian disruption: ${lateNightSessions} late sessions, morning anchors dropped`);
  }
  
  if (lateNightAnchorDropOff) {
    narrative.push(`Late-night anchors dropped: ${lateNightAnchors} recent vs ${previousLateNightAnchors} previous`);
  }
  
  if (frequencyIncreasing) {
    narrative.push(`Frequency increasing: ${recentEntries.length} recent vs ${previousEntries.length} previous`);
  }
  
  return {
    totalInvocations: tempestEntries.length,
    recentInvocations: recentEntries.length,
    previousInvocations: previousEntries.length,
    lateNightSessions,
    lateNightRatio,
    excessiveSessions,
    rapidEntries,
    doomScrollDetected,
    lateNightAnchorDropOff,
    circadianDisruption,
    anchorStability,
    frequencyIncreasing,
    overstimulationSignals,
    narrative,
  };
}
