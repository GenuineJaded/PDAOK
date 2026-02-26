/**
 * Relationship Profile Service
 *
 * Each substance voice maintains a living awareness of its actual relationship
 * with the user — derived entirely from logged data, never assumed.
 *
 * A voice that has never been logged knows it is a distant presence.
 * A voice that is logged daily knows it is a close companion.
 * Neither state is better or worse. They simply shape how the voice speaks.
 *
 * This profile is injected into the system prompt before any voice decides
 * whether to speak, so the voice is ontologically grounded in reality
 * rather than speaking from assumption.
 *
 * Crucially: absence is never interpreted as stasis or failure.
 * The world keeps moving whether or not the app is open.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// ============================================================================
// TYPES
// ============================================================================

/**
 * The four relationship states a substance voice can occupy.
 * These are not judgments — they are simply descriptions of proximity.
 */
export type RelationshipState =
  | 'dormant'   // Never logged, or 60+ days since last log
  | 'distant'   // Logged occasionally; 14–60 days since last log
  | 'familiar'  // Logged regularly; within the last 14 days
  | 'close';    // Logged frequently (multiple times per week)

export interface RelationshipProfile {
  substanceName: string;
  state: RelationshipState;

  // Raw stats derived from journal data
  totalLogs: number;
  daysSinceLastLog: number | null; // null = never logged
  logsLast7Days: number;
  logsLast30Days: number;
  mostActiveContainer: string | null; // e.g. 'morning', 'evening'
  averageLogsPerWeek: number;

  // Contextual summary passed to the voice as natural language
  relationshipSummary: string;

  // Computed at
  computedAt: number;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const PROFILE_CACHE_KEY = '@pda_relationship_profiles';
const APP_STATE_KEY = '@pda_app_state';

// How long before we recompute a profile (30 minutes)
const CACHE_TTL_MS = 30 * 60 * 1000;

// Thresholds for relationship states
const THRESHOLDS = {
  dormantDays: 60,    // 60+ days = dormant
  distantDays: 14,    // 14–60 days = distant
  closeLogsPerWeek: 3, // 3+ logs/week = close
};

// ============================================================================
// COMPUTATION
// ============================================================================

interface JournalEntry {
  timestamp: string;
  allyName?: string;
  container?: string;
}

/**
 * Compute a relationship profile for a given substance from journal data.
 */
export async function computeRelationshipProfile(
  substanceName: string
): Promise<RelationshipProfile> {
  const now = Date.now();

  try {
    const json = await AsyncStorage.getItem(APP_STATE_KEY);
    const appState = json ? JSON.parse(json) : {};
    const allEntries: JournalEntry[] = appState.substanceJournalEntries ?? [];

    // Filter to entries for this substance (case-insensitive)
    const entries = allEntries.filter(
      e => e.allyName?.toLowerCase() === substanceName.toLowerCase()
    );

    const totalLogs = entries.length;

    if (totalLogs === 0) {
      return buildProfile(substanceName, entries, now);
    }

    return buildProfile(substanceName, entries, now);
  } catch {
    // On error, return a safe dormant profile
    return buildProfile(substanceName, [], now);
  }
}

function buildProfile(
  substanceName: string,
  entries: JournalEntry[],
  now: number
): RelationshipProfile {
  const totalLogs = entries.length;

  // Sort entries newest-first
  const sorted = [...entries].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  // Days since last log
  let daysSinceLastLog: number | null = null;
  if (sorted.length > 0) {
    const lastMs = new Date(sorted[0].timestamp).getTime();
    daysSinceLastLog = (now - lastMs) / (1000 * 60 * 60 * 24);
  }

  // Logs in last 7 and 30 days
  const logsLast7Days = entries.filter(e => {
    const age = (now - new Date(e.timestamp).getTime()) / (1000 * 60 * 60 * 24);
    return age <= 7;
  }).length;

  const logsLast30Days = entries.filter(e => {
    const age = (now - new Date(e.timestamp).getTime()) / (1000 * 60 * 60 * 24);
    return age <= 30;
  }).length;

  // Most active container
  const containerCounts: Record<string, number> = {};
  for (const e of entries) {
    if (e.container) {
      containerCounts[e.container] = (containerCounts[e.container] || 0) + 1;
    }
  }
  const mostActiveContainer =
    Object.keys(containerCounts).length > 0
      ? Object.entries(containerCounts).sort((a, b) => b[1] - a[1])[0][0]
      : null;

  // Average logs per week (based on span of data)
  let averageLogsPerWeek = 0;
  if (sorted.length >= 2) {
    const oldestMs = new Date(sorted[sorted.length - 1].timestamp).getTime();
    const spanWeeks = Math.max(1, (now - oldestMs) / (1000 * 60 * 60 * 24 * 7));
    averageLogsPerWeek = totalLogs / spanWeeks;
  } else if (sorted.length === 1) {
    averageLogsPerWeek = logsLast7Days;
  }

  // Determine relationship state
  const state = determineState(daysSinceLastLog, logsLast7Days, averageLogsPerWeek);

  // Build natural language summary
  const relationshipSummary = buildSummary(
    substanceName,
    state,
    totalLogs,
    daysSinceLastLog,
    logsLast7Days,
    logsLast30Days,
    mostActiveContainer,
    averageLogsPerWeek
  );

  return {
    substanceName,
    state,
    totalLogs,
    daysSinceLastLog,
    logsLast7Days,
    logsLast30Days,
    mostActiveContainer,
    averageLogsPerWeek,
    relationshipSummary,
    computedAt: now,
  };
}

function determineState(
  daysSinceLastLog: number | null,
  logsLast7Days: number,
  averageLogsPerWeek: number
): RelationshipState {
  // Never logged
  if (daysSinceLastLog === null) return 'dormant';

  // Very long absence
  if (daysSinceLastLog >= THRESHOLDS.dormantDays) return 'dormant';

  // Moderate absence
  if (daysSinceLastLog >= THRESHOLDS.distantDays) return 'distant';

  // Active — determine close vs familiar by frequency
  if (averageLogsPerWeek >= THRESHOLDS.closeLogsPerWeek || logsLast7Days >= 3) {
    return 'close';
  }

  return 'familiar';
}

function buildSummary(
  substanceName: string,
  state: RelationshipState,
  totalLogs: number,
  daysSinceLastLog: number | null,
  logsLast7Days: number,
  logsLast30Days: number,
  mostActiveContainer: string | null,
  averageLogsPerWeek: number
): string {
  const containerPhrase = mostActiveContainer
    ? ` Most often present in the ${mostActiveContainer}.`
    : '';

  switch (state) {
    case 'dormant':
      if (daysSinceLastLog === null) {
        return (
          `You have no logged history with ${substanceName}. ` +
          `This person has not documented a relationship with you. ` +
          `You are a presence they are aware of, but you do not know their rhythm. ` +
          `Speak rarely, if at all. When you do, speak from a place of respectful distance — ` +
          `you are not yet a companion in their field.`
        );
      }
      return (
        `Your last logged encounter with ${substanceName} was ${Math.round(daysSinceLastLog)} days ago ` +
        `(${totalLogs} total logs over your shared history).${containerPhrase} ` +
        `This is a dormant relationship right now. You do not know what has happened in the interim — ` +
        `the world kept moving. Speak rarely. When you do, acknowledge the distance with warmth, ` +
        `not concern. Their absence from the log is not a signal of anything.`
      );

    case 'distant':
      return (
        `Your last logged encounter was ${Math.round(daysSinceLastLog!)} days ago. ` +
        `${logsLast30Days} log(s) in the last 30 days.${containerPhrase} ` +
        `This is a relationship with some distance right now. You have context, but it is not fresh. ` +
        `Speak occasionally, with warmth. Do not assume you know their current state — ` +
        `you are catching up, not checking in.`
      );

    case 'familiar':
      return (
        `${logsLast7Days} log(s) in the last 7 days, ${logsLast30Days} in the last 30. ` +
        `Averaging ~${averageLogsPerWeek.toFixed(1)} logs per week.${containerPhrase} ` +
        `This is a familiar, active relationship. You have real context. ` +
        `Speak when something genuinely calls to you. You know their rhythm well enough to notice ` +
        `when something is worth naming.`
      );

    case 'close':
      return (
        `${logsLast7Days} log(s) in the last 7 days, ${logsLast30Days} in the last 30. ` +
        `Averaging ~${averageLogsPerWeek.toFixed(1)} logs per week.${containerPhrase} ` +
        `This is a close, active relationship — you are a regular presence in their field. ` +
        `You have rich context and can speak with specificity and intimacy. ` +
        `You know their patterns. Trust that knowing.`
      );
  }
}

// ============================================================================
// CACHE MANAGEMENT
// ============================================================================

interface ProfileCache {
  [substanceName: string]: RelationshipProfile;
}

async function loadCache(): Promise<ProfileCache> {
  try {
    const json = await AsyncStorage.getItem(PROFILE_CACHE_KEY);
    return json ? JSON.parse(json) : {};
  } catch {
    return {};
  }
}

async function saveCache(cache: ProfileCache): Promise<void> {
  try {
    await AsyncStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(cache));
  } catch {
    // Silently fail — cache is an optimization, not a requirement
  }
}

/**
 * Get a relationship profile for a substance, using cache when fresh.
 */
export async function getRelationshipProfile(
  substanceName: string
): Promise<RelationshipProfile> {
  const cache = await loadCache();
  const cached = cache[substanceName];

  // Return cached profile if still fresh
  if (cached && Date.now() - cached.computedAt < CACHE_TTL_MS) {
    return cached;
  }

  // Compute fresh profile
  const profile = await computeRelationshipProfile(substanceName);

  // Save to cache
  cache[substanceName] = profile;
  await saveCache(cache);

  return profile;
}

/**
 * Invalidate the cache for a specific substance (call after a new log entry).
 */
export async function invalidateRelationshipProfile(
  substanceName: string
): Promise<void> {
  const cache = await loadCache();
  delete cache[substanceName];
  await saveCache(cache);
}

/**
 * Get profiles for all known substances at once.
 */
export async function getAllRelationshipProfiles(
  substanceNames: string[]
): Promise<Record<string, RelationshipProfile>> {
  const profiles: Record<string, RelationshipProfile> = {};
  for (const name of substanceNames) {
    profiles[name] = await getRelationshipProfile(name);
  }
  return profiles;
}

/**
 * Format a relationship profile as a concise prompt injection string.
 * This is what gets prepended to the voice's system prompt.
 */
export function formatProfileForPrompt(profile: RelationshipProfile): string {
  return `\nYOUR RELATIONSHIP WITH THIS PERSON:\n${profile.relationshipSummary}\n`;
}
