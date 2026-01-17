/**
 * Signal Collector - Gathers Data Signals for the Council
 * 
 * Signals are the raw observations that voices use to form petitions.
 * The collector transforms app data into weighted signals.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Signal } from './types';

// ============================================================================
// STORAGE KEYS (from main app)
// ============================================================================

const JOURNAL_ENTRIES_KEY = '@pda_journal_entries';
const ANCHORS_KEY = '@pda_anchors';
const LAST_SIGNAL_CHECK_KEY = '@pda_last_signal_check';

// ============================================================================
// DATA TYPES (matching main app)
// ============================================================================

interface JournalEntry {
  id?: string;
  timestamp: string;
  allyId?: string;
  allyName?: string;
  container?: string;
  context?: string;
  action_reflection?: string;
  result_shift?: string;
  category?: string;
  description?: string;
}

interface Anchor {
  id: string;
  name: string;
  completions?: Array<{
    timestamp: string;
    timeContainer: string;
  }>;
}

// ============================================================================
// SIGNAL GENERATION
// ============================================================================

/**
 * Calculate time weight - more recent = higher weight
 */
function calculateTimeWeight(timestamp: Date, maxAgeHours: number = 24): number {
  const ageMs = Date.now() - timestamp.getTime();
  const ageHours = ageMs / (60 * 60 * 1000);
  
  if (ageHours > maxAgeHours) return 0;
  
  // Exponential decay
  return Math.exp(-ageHours / (maxAgeHours / 3));
}

/**
 * Collect substance log signals
 */
async function collectSubstanceSignals(): Promise<Signal[]> {
  const signals: Signal[] = [];
  
  try {
    const json = await AsyncStorage.getItem(JOURNAL_ENTRIES_KEY);
    if (!json) return signals;
    
    const entries: JournalEntry[] = JSON.parse(json);
    const now = new Date();
    const last24h = entries.filter(e => {
      const entryTime = new Date(e.timestamp);
      const ageHours = (now.getTime() - entryTime.getTime()) / (60 * 60 * 1000);
      return ageHours <= 24 && e.allyName;
    });
    
    // Group by substance
    const bySubstance: Record<string, JournalEntry[]> = {};
    for (const entry of last24h) {
      const name = entry.allyName || 'Unknown';
      if (!bySubstance[name]) bySubstance[name] = [];
      bySubstance[name].push(entry);
    }
    
    // Generate signals for each substance
    for (const [substanceName, substanceEntries] of Object.entries(bySubstance)) {
      const latestEntry = substanceEntries[0];
      const entryTime = new Date(latestEntry.timestamp);
      const weight = calculateTimeWeight(entryTime);
      
      signals.push({
        type: 'substance_log',
        description: `${substanceName} logged ${substanceEntries.length} time(s) in last 24h`,
        timestamp: entryTime,
        weight,
        data: {
          substanceName,
          count: substanceEntries.length,
          latestEntry,
          container: latestEntry.container,
        },
      });
      
      // Check for frequency patterns
      if (substanceEntries.length >= 3) {
        signals.push({
          type: 'frequency_change',
          description: `High frequency: ${substanceName} logged ${substanceEntries.length} times today`,
          timestamp: entryTime,
          weight: Math.min(1, weight * 1.2),
          data: { substanceName, count: substanceEntries.length },
        });
      }
    }
    
    // Check for absences (substances not logged recently that usually are)
    // This would require historical data - simplified for now
    
  } catch (error) {
    console.error('[SignalCollector] Error collecting substance signals:', error);
  }
  
  return signals;
}

/**
 * Collect anchor/ritual completion signals
 */
async function collectAnchorSignals(): Promise<Signal[]> {
  const signals: Signal[] = [];
  
  try {
    const json = await AsyncStorage.getItem(ANCHORS_KEY);
    if (!json) return signals;
    
    const anchors: Anchor[] = JSON.parse(json);
    const now = new Date();
    
    for (const anchor of anchors) {
      if (!anchor.completions || anchor.completions.length === 0) continue;
      
      // Get today's completions
      const todayStart = new Date(now);
      todayStart.setHours(4, 0, 0, 0); // 4am reset
      if (now.getHours() < 4) {
        todayStart.setDate(todayStart.getDate() - 1);
      }
      
      const todayCompletions = anchor.completions.filter(c => 
        new Date(c.timestamp) >= todayStart
      );
      
      if (todayCompletions.length > 0) {
        const latestCompletion = todayCompletions[0];
        const completionTime = new Date(latestCompletion.timestamp);
        const weight = calculateTimeWeight(completionTime);
        
        signals.push({
          type: 'anchor_completion',
          description: `Anchor "${anchor.name}" completed`,
          timestamp: completionTime,
          weight,
          data: {
            anchorName: anchor.name,
            anchorId: anchor.id,
            timeContainer: latestCompletion.timeContainer,
            todayCount: todayCompletions.length,
          },
        });
      }
    }
    
  } catch (error) {
    console.error('[SignalCollector] Error collecting anchor signals:', error);
  }
  
  return signals;
}

/**
 * Collect time-based signals
 */
function collectTimeSignals(): Signal[] {
  const signals: Signal[] = [];
  const now = new Date();
  const hour = now.getHours();
  
  // Time container transitions
  if (hour === 6) {
    signals.push({
      type: 'time_elapsed',
      description: 'Morning begins',
      timestamp: now,
      weight: 0.6,
      data: { container: 'morning', transition: true },
    });
  } else if (hour === 12) {
    signals.push({
      type: 'time_elapsed',
      description: 'Afternoon begins',
      timestamp: now,
      weight: 0.5,
      data: { container: 'afternoon', transition: true },
    });
  } else if (hour === 18) {
    signals.push({
      type: 'time_elapsed',
      description: 'Evening begins',
      timestamp: now,
      weight: 0.6,
      data: { container: 'evening', transition: true },
    });
  } else if (hour === 22) {
    signals.push({
      type: 'time_elapsed',
      description: 'Late night begins',
      timestamp: now,
      weight: 0.7,
      data: { container: 'late', transition: true },
    });
  }
  
  return signals;
}

/**
 * Detect patterns in recent data
 */
async function collectPatternSignals(): Promise<Signal[]> {
  const signals: Signal[] = [];
  
  try {
    const json = await AsyncStorage.getItem(JOURNAL_ENTRIES_KEY);
    if (!json) return signals;
    
    const entries: JournalEntry[] = JSON.parse(json);
    const now = new Date();
    
    // Get last 7 days of entries
    const last7Days = entries.filter(e => {
      const entryTime = new Date(e.timestamp);
      const ageDays = (now.getTime() - entryTime.getTime()) / (24 * 60 * 60 * 1000);
      return ageDays <= 7;
    });
    
    // Check for patterns
    if (last7Days.length >= 5) {
      // Group by day
      const byDay: Record<string, JournalEntry[]> = {};
      for (const entry of last7Days) {
        const day = new Date(entry.timestamp).toDateString();
        if (!byDay[day]) byDay[day] = [];
        byDay[day].push(entry);
      }
      
      const daysWithEntries = Object.keys(byDay).length;
      
      if (daysWithEntries >= 5) {
        signals.push({
          type: 'pattern_detected',
          description: `Consistent logging pattern: ${daysWithEntries} days with entries`,
          timestamp: now,
          weight: 0.7,
          data: { daysWithEntries, totalEntries: last7Days.length },
        });
      }
      
      // Check for time-of-day patterns
      const byContainer: Record<string, number> = {};
      for (const entry of last7Days) {
        const container = entry.container || 'unknown';
        byContainer[container] = (byContainer[container] || 0) + 1;
      }
      
      const dominantContainer = Object.entries(byContainer)
        .sort((a, b) => b[1] - a[1])[0];
      
      if (dominantContainer && dominantContainer[1] >= 4) {
        signals.push({
          type: 'pattern_detected',
          description: `Time pattern: Most activity in ${dominantContainer[0]} (${dominantContainer[1]} entries)`,
          timestamp: now,
          weight: 0.5,
          data: { container: dominantContainer[0], count: dominantContainer[1] },
        });
      }
    }
    
  } catch (error) {
    console.error('[SignalCollector] Error collecting pattern signals:', error);
  }
  
  return signals;
}

// ============================================================================
// MAIN COLLECTOR
// ============================================================================

/**
 * Collect all signals from the app
 */
export async function collectAllSignals(): Promise<Signal[]> {
  const allSignals: Signal[] = [];
  
  // Collect from all sources
  const substanceSignals = await collectSubstanceSignals();
  const anchorSignals = await collectAnchorSignals();
  const timeSignals = collectTimeSignals();
  const patternSignals = await collectPatternSignals();
  
  allSignals.push(...substanceSignals);
  allSignals.push(...anchorSignals);
  allSignals.push(...timeSignals);
  allSignals.push(...patternSignals);
  
  // Sort by weight descending
  allSignals.sort((a, b) => b.weight - a.weight);
  
  // Update last check time
  await AsyncStorage.setItem(LAST_SIGNAL_CHECK_KEY, new Date().toISOString());
  
  console.log(`[SignalCollector] Collected ${allSignals.length} signals`);
  
  return allSignals;
}

/**
 * Get signals since last check (for incremental updates)
 */
export async function getNewSignals(): Promise<Signal[]> {
  try {
    const lastCheckStr = await AsyncStorage.getItem(LAST_SIGNAL_CHECK_KEY);
    const lastCheck = lastCheckStr ? new Date(lastCheckStr) : new Date(0);
    
    const allSignals = await collectAllSignals();
    
    // Filter to signals newer than last check
    return allSignals.filter(s => s.timestamp > lastCheck);
  } catch (error) {
    console.error('[SignalCollector] Error getting new signals:', error);
    return [];
  }
}

/**
 * Get signals for a specific time window
 */
export async function getSignalsInWindow(hours: number = 24): Promise<Signal[]> {
  const allSignals = await collectAllSignals();
  const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
  
  return allSignals.filter(s => s.timestamp >= cutoff);
}
