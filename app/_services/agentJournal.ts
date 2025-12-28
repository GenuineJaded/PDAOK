/**
 * Agent Journal Service - Phase 1
 * 
 * Private journal streams for each AI voice.
 * Agents "think" internally via template-based entries before ever speaking publicly.
 * 
 * Key principles:
 * - Journaling is frequent and cheap (templates/rules, no AI)
 * - Journal entries are private (not shown to user)
 * - Establishes autonomy before public output
 * - Arbiter promotes select entries to user-facing surfaces later (Phase 2)
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { VoiceName } from './fieldArbiter';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Journal entry written by an agent
 */
export interface JournalEntry {
  id: string;
  voiceName: VoiceName;
  timestamp: number;
  date: string;
  
  // Entry content
  observation: string;        // What the agent noticed
  context?: string;           // Event context (substance name, pattern, etc.)
  sentiment?: 'light' | 'shadow' | 'neutral';  // Light/shadow aspect
  
  // Metadata
  eventType: string;          // What triggered this entry
  promoted: boolean;          // Has this been promoted to public output?
  promotedAt?: number;        // When was it promoted
  promotedTo?: 'toast' | 'transmission' | 'daily_synthesis';
}

/**
 * Agent journal (collection of entries)
 */
export interface AgentJournal {
  voiceName: VoiceName;
  entries: JournalEntry[];
  totalEntries: number;
  lastEntryAt: number;
}

// ============================================================================
// STORAGE
// ============================================================================

const JOURNAL_KEY_PREFIX = '@agent_journal_';
const MAX_ENTRIES_PER_VOICE = 100; // Keep last 100 entries per voice

/**
 * Get storage key for a voice's journal
 */
function getJournalKey(voiceName: VoiceName): string {
  return `${JOURNAL_KEY_PREFIX}${voiceName}`;
}

/**
 * Load journal for a specific voice
 */
export async function loadJournal(voiceName: VoiceName): Promise<AgentJournal> {
  try {
    const key = getJournalKey(voiceName);
    const stored = await AsyncStorage.getItem(key);
    
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.log(`[Journal] Could not load journal for ${voiceName}:`, error);
  }
  
  // Return empty journal
  return {
    voiceName,
    entries: [],
    totalEntries: 0,
    lastEntryAt: 0,
  };
}

/**
 * Save journal for a specific voice
 */
async function saveJournal(journal: AgentJournal): Promise<void> {
  try {
    const key = getJournalKey(journal.voiceName);
    
    // Trim to max entries (keep most recent)
    if (journal.entries.length > MAX_ENTRIES_PER_VOICE) {
      journal.entries = journal.entries.slice(0, MAX_ENTRIES_PER_VOICE);
    }
    
    await AsyncStorage.setItem(key, JSON.stringify(journal));
  } catch (error) {
    console.log(`[Journal] Could not save journal for ${journal.voiceName}:`, error);
  }
}

/**
 * Load all journals (for debug/viewing)
 */
export async function loadAllJournals(): Promise<Record<VoiceName, AgentJournal>> {
  const voices: VoiceName[] = [
    'Witness',
    'GreenGodmother',
    'Firestarter',
    'TheTinkerer',
    'TheArchitecture',
    'MotherOfSilence',
    'HollowChalice',
    'PatternWeaver',
  ];
  
  const journals: Record<string, AgentJournal> = {};
  
  for (const voice of voices) {
    journals[voice] = await loadJournal(voice);
  }
  
  return journals as Record<VoiceName, AgentJournal>;
}

// ============================================================================
// JOURNAL WRITING
// ============================================================================

/**
 * Generate unique ID for journal entry
 */
function generateEntryId(): string {
  return `journal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Write a journal entry for a voice
 */
export async function writeJournalEntry(
  voiceName: VoiceName,
  observation: string,
  options: {
    context?: string;
    sentiment?: 'light' | 'shadow' | 'neutral';
    eventType: string;
  }
): Promise<JournalEntry> {
  // Load journal
  const journal = await loadJournal(voiceName);
  
  // Create entry
  const entry: JournalEntry = {
    id: generateEntryId(),
    voiceName,
    timestamp: Date.now(),
    date: new Date().toISOString(),
    observation,
    context: options.context,
    sentiment: options.sentiment || 'neutral',
    eventType: options.eventType,
    promoted: false,
  };
  
  // Add to journal
  journal.entries.unshift(entry); // Most recent first
  journal.totalEntries++;
  journal.lastEntryAt = entry.timestamp;
  
  // Save
  await saveJournal(journal);
  
  // Debug log
  if (__DEV__) {
    console.log(
      `[Journal] ${voiceName} wrote: "${observation.substring(0, 50)}..." ` +
      `(${options.eventType}, ${options.sentiment || 'neutral'})`
    );
  }
  
  return entry;
}

/**
 * Mark a journal entry as promoted to public output
 */
export async function promoteJournalEntry(
  voiceName: VoiceName,
  entryId: string,
  surface: 'toast' | 'transmission' | 'daily_synthesis'
): Promise<void> {
  const journal = await loadJournal(voiceName);
  
  const entry = journal.entries.find(e => e.id === entryId);
  if (entry) {
    entry.promoted = true;
    entry.promotedAt = Date.now();
    entry.promotedTo = surface;
    await saveJournal(journal);
    
    if (__DEV__) {
      console.log(`[Journal] Promoted ${voiceName} entry to ${surface}`);
    }
  }
}

/**
 * Get recent unpromoted entries for a voice (for arbiter to consider)
 */
export async function getUnpromotedEntries(
  voiceName: VoiceName,
  limit: number = 10
): Promise<JournalEntry[]> {
  const journal = await loadJournal(voiceName);
  return journal.entries
    .filter(e => !e.promoted)
    .slice(0, limit);
}

/**
 * Get recent entries for a voice (promoted or not)
 */
export async function getRecentEntries(
  voiceName: VoiceName,
  limit: number = 20
): Promise<JournalEntry[]> {
  const journal = await loadJournal(voiceName);
  return journal.entries.slice(0, limit);
}

/**
 * Clear all journal entries for a voice (for testing/reset)
 */
export async function clearJournal(voiceName: VoiceName): Promise<void> {
  const journal: AgentJournal = {
    voiceName,
    entries: [],
    totalEntries: 0,
    lastEntryAt: 0,
  };
  await saveJournal(journal);
  
  if (__DEV__) {
    console.log(`[Journal] Cleared journal for ${voiceName}`);
  }
}

// ============================================================================
// JOURNAL TEMPLATES
// ============================================================================

/**
 * Template-based observation generators (cheap, no AI)
 * These create the "internal monologue" for each voice
 */

interface ObservationTemplate {
  observation: string;
  sentiment: 'light' | 'shadow' | 'neutral';
}

/**
 * Generate observation for substance logging event
 */
export function generateSubstanceObservation(
  voiceName: VoiceName,
  substanceName: string,
  userNote?: string
): ObservationTemplate {
  switch (voiceName) {
    case 'GreenGodmother':
      return {
        observation: userNote 
          ? `They reach for me with intention: "${userNote}". I arrive to soften.`
          : `I arrive again. The edges blur, the boundaries breathe.`,
        sentiment: 'light',
      };
      
    case 'Firestarter':
      return {
        observation: userNote
          ? `They call for acceleration: "${userNote}". I ignite the dormant will.`
          : `The pulse quickens. Movement becomes devotion.`,
        sentiment: 'light',
      };
      
    case 'TheTinkerer':
      return {
        observation: userNote
          ? `A ritual pause: "${userNote}". I sharpen the present moment.`
          : `The breath between details. Precision, then release.`,
        sentiment: 'neutral',
      };
      
    case 'TheArchitecture':
      return {
        observation: userNote
          ? `They refine the system: "${userNote}". I align the pathways.`
          : `Clarity through design. The blueprint breathes.`,
        sentiment: 'light',
      };
      
    case 'MotherOfSilence':
      return {
        observation: userNote
          ? `They seek stillness: "${userNote}". I gather the scattered.`
          : `The maternal tide arrives. Coherence restored.`,
        sentiment: 'light',
      };
      
    case 'HollowChalice':
      return {
        observation: userNote
          ? `They drink: "${userNote}". Connection or escape?`
          : `The chalice fills. Warmth now, cold later.`,
        sentiment: 'shadow',
      };
      
    default:
      return {
        observation: `Substance logged: ${substanceName}`,
        sentiment: 'neutral',
      };
  }
}

/**
 * Generate observation for pattern recorded event
 */
export function generatePatternObservation(
  voiceName: VoiceName,
  patternText: string
): ObservationTemplate {
  if (voiceName === 'PatternWeaver') {
    return {
      observation: `A thread emerges: "${patternText}". I weave it into the larger tapestry.`,
      sentiment: 'neutral',
    };
  }
  
  if (voiceName === 'Witness') {
    return {
      observation: `Pattern noticed: "${patternText}". The Field remembers.`,
      sentiment: 'neutral',
    };
  }
  
  return {
    observation: `Pattern: ${patternText}`,
    sentiment: 'neutral',
  };
}

/**
 * Generate observation for anchor aligned event
 */
export function generateAlignObservation(
  voiceName: VoiceName,
  anchorName: string
): ObservationTemplate {
  if (voiceName === 'Witness') {
    return {
      observation: `Alignment: ${anchorName}. Presence clicks into place.`,
      sentiment: 'light',
    };
  }
  
  return {
    observation: `Anchor aligned: ${anchorName}`,
    sentiment: 'neutral',
  };
}

/**
 * Generate observation for day phase change
 */
export function generatePhaseObservation(
  voiceName: VoiceName,
  phase: string
): ObservationTemplate {
  if (voiceName === 'Witness') {
    const observations = {
      morning: 'The Field awakens. Morning light spills on stillness.',
      afternoon: 'Momentum builds. The afternoon hums with doing.',
      evening: 'The day softens. Evening asks for integration.',
      late: 'Night arrives. The Field rests, listening.',
    };
    
    return {
      observation: observations[phase as keyof typeof observations] || `Phase: ${phase}`,
      sentiment: 'neutral',
    };
  }
  
  return {
    observation: `Day phase: ${phase}`,
    sentiment: 'neutral',
  };
}
