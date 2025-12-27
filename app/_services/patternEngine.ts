/**
 * Pattern Engine v0.1
 * 
 * Observes anchor completion patterns and detects changes.
 * Designed to work with sparse data in "seed mode".
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

export interface AnchorCompletion {
  id: string;
  title: string;
  completedAt: Date;
  container: string; // morning, afternoon, evening, late
}

export interface PatternSummary {
  // Time window analyzed
  daysAnalyzed: number;
  startDate: Date;
  endDate: Date;
  
  // Activity metrics
  totalCompletions: number;
  uniqueAnchors: string[];
  completionsByContainer: Record<string, number>;
  
  // Change detection
  hasRecentActivity: boolean;
  hasDropOff: boolean;
  hasNewAnchor: boolean;
  hasTimeShift: boolean;
  
  // Narrative elements
  dominantContainer: string | null;
  absenceNote: string | null;
  changeNote: string | null;
  
  // Raw data for debugging
  completions: AnchorCompletion[];
}

/**
 * Analyzes anchor completion patterns over the last 3-7 days
 */
export async function analyzePatterns(days: number = 7): Promise<PatternSummary> {
  const now = new Date();
  const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  
  // Load anchor completion data
  const completions = await loadRecentCompletions(startDate, now);
  
  // Calculate basic metrics
  const totalCompletions = completions.length;
  const uniqueAnchors = [...new Set(completions.map(c => c.title))];
  
  const completionsByContainer: Record<string, number> = {
    morning: 0,
    afternoon: 0,
    evening: 0,
    late: 0,
  };
  
  completions.forEach(c => {
    completionsByContainer[c.container] = (completionsByContainer[c.container] || 0) + 1;
  });
  
  // Detect changes
  const hasRecentActivity = totalCompletions >= 2;
  const hasDropOff = await detectDropOff(completions, days);
  const hasNewAnchor = await detectNewAnchor(completions);
  const hasTimeShift = detectTimeShift(completionsByContainer);
  
  // Find dominant container
  const dominantContainer = findDominantContainer(completionsByContainer);
  
  // Generate narrative notes
  const absenceNote = totalCompletions === 0 
    ? "The anchors wait unlit. Even that is a pattern."
    : null;
    
  const changeNote = generateChangeNote(hasDropOff, hasNewAnchor, hasTimeShift, completionsByContainer);
  
  return {
    daysAnalyzed: days,
    startDate,
    endDate: now,
    totalCompletions,
    uniqueAnchors,
    completionsByContainer,
    hasRecentActivity,
    hasDropOff,
    hasNewAnchor,
    hasTimeShift,
    dominantContainer,
    absenceNote,
    changeNote,
    completions,
  };
}

/**
 * Load recent anchor completions from storage
 */
async function loadRecentCompletions(startDate: Date, endDate: Date): Promise<AnchorCompletion[]> {
  try {
    // Load items from AsyncStorage
    const itemsJson = await AsyncStorage.getItem('items');
    if (!itemsJson) return [];
    
    const items = JSON.parse(itemsJson);
    
    // Filter for completed anchors in time window
    const completions: AnchorCompletion[] = [];
    
    for (const item of items) {
      if (item.completed && item.completedAt) {
        const completedAt = new Date(item.completedAt);
        if (completedAt >= startDate && completedAt <= endDate) {
          completions.push({
            id: item.id,
            title: item.title,
            completedAt,
            container: item.container || 'morning',
          });
        }
      }
    }
    
    // Sort by completion time
    completions.sort((a, b) => a.completedAt.getTime() - b.completedAt.getTime());
    
    return completions;
  } catch (error) {
    console.error('Error loading completions:', error);
    return [];
  }
}

/**
 * Detect if there's been a drop-off in activity
 */
async function detectDropOff(completions: AnchorCompletion[], days: number): Promise<boolean> {
  if (completions.length < 3) return false;
  
  const midpoint = Math.floor(days / 2);
  const midpointDate = new Date(Date.now() - midpoint * 24 * 60 * 60 * 1000);
  
  const firstHalf = completions.filter(c => c.completedAt < midpointDate);
  const secondHalf = completions.filter(c => c.completedAt >= midpointDate);
  
  // Drop-off if second half has significantly fewer completions
  return firstHalf.length >= 2 && secondHalf.length < firstHalf.length * 0.5;
}

/**
 * Detect if a new anchor has appeared recently
 */
async function detectNewAnchor(completions: AnchorCompletion[]): Promise<boolean> {
  if (completions.length < 2) return false;
  
  // Check if any anchor appears for the first time in the last 2 days
  const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
  const recentCompletions = completions.filter(c => c.completedAt >= twoDaysAgo);
  const olderCompletions = completions.filter(c => c.completedAt < twoDaysAgo);
  
  const recentAnchors = new Set(recentCompletions.map(c => c.title));
  const olderAnchors = new Set(olderCompletions.map(c => c.title));
  
  // New anchor if it appears in recent but not in older
  for (const anchor of recentAnchors) {
    if (!olderAnchors.has(anchor)) {
      return true;
    }
  }
  
  return false;
}

/**
 * Detect if there's been a shift in time-of-day patterns
 */
function detectTimeShift(completionsByContainer: Record<string, number>): boolean {
  const containers = Object.keys(completionsByContainer);
  const counts = Object.values(completionsByContainer);
  const total = counts.reduce((sum, count) => sum + count, 0);
  
  if (total < 3) return false;
  
  // Time shift if one container dominates (>60%) or if there's a notable absence
  const maxCount = Math.max(...counts);
  return maxCount > total * 0.6;
}

/**
 * Find the container with most completions
 */
function findDominantContainer(completionsByContainer: Record<string, number>): string | null {
  const entries = Object.entries(completionsByContainer);
  if (entries.length === 0) return null;
  
  const sorted = entries.sort((a, b) => b[1] - a[1]);
  return sorted[0][1] > 0 ? sorted[0][0] : null;
}

/**
 * Generate a narrative note about detected changes
 */
function generateChangeNote(
  hasDropOff: boolean,
  hasNewAnchor: boolean,
  hasTimeShift: boolean,
  completionsByContainer: Record<string, number>
): string | null {
  const notes: string[] = [];
  
  if (hasDropOff) {
    notes.push("A run of completions, then the pattern breaks.");
  }
  
  if (hasNewAnchor) {
    notes.push("A new anchor appears in the field.");
  }
  
  if (hasTimeShift) {
    const dominant = findDominantContainer(completionsByContainer);
    if (dominant) {
      notes.push(`The ${dominant} anchors hold the rhythm now.`);
    }
  }
  
  return notes.length > 0 ? notes.join(' ') : null;
}

/**
 * Check if conditions are met for The Witness to speak
 */
export function shouldWitnessSpeak(
  pattern: PatternSummary,
  config: {
    minHoursSinceLastTransmission: number;
    baseChanceToSpeak: number;
  }
): boolean {
  // Always allow speaking on absence
  if (pattern.absenceNote) {
    return Math.random() < config.baseChanceToSpeak * 0.5; // Lower chance for absence
  }
  
  // Require some activity
  if (!pattern.hasRecentActivity) {
    return false;
  }
  
  // Prioritize speaking when there's a notable change
  if (pattern.hasDropOff || pattern.hasNewAnchor || pattern.hasTimeShift) {
    return Math.random() < config.baseChanceToSpeak * 1.5; // Higher chance for changes
  }
  
  // Otherwise, base chance
  return Math.random() < config.baseChanceToSpeak;
}
