import { Conversation, Pattern, Moment, Ally, Archetype } from '../_constants/Types';

/**
 * Memory Context Service
 * Gathers user rhythms, patterns, and conversation history to provide context for AI agents
 */

interface MemoryContext {
  recentConversations: string;
  userPatterns: string;
  archetypeHistory: string;
  substanceHistory: string;
  timePatterns: string;
  anchorUsage: string;
}

/**
 * Build memory context for substance voice generation
 */
export function buildSubstanceMemoryContext(
  substanceName: string,
  conversations: Conversation[],
  patterns: Pattern[],
  journalEntries: Moment[],
  allies: Ally[]
): MemoryContext {
  // Filter conversations involving this substance
  const substanceConversations = conversations
    .filter(c => c.substanceName.toLowerCase() === substanceName.toLowerCase())
    .slice(0, 3); // Last 3 conversations

  const recentConversations = substanceConversations.length > 0
    ? `Past encounters with ${substanceName}:\n` + 
      substanceConversations.map(c => {
        const msgs = c.messages.map(m => `${m.speaker}: ${m.text}`).join('\n');
        return `[${new Date(c.date).toLocaleDateString()}] ${msgs}`;
      }).join('\n\n')
    : '';

  // Get substance-related patterns
  const substancePatterns = patterns
    .filter(p => p.category === 'substance' || p.text.toLowerCase().includes(substanceName.toLowerCase()))
    .slice(0, 3);

  const userPatterns = substancePatterns.length > 0
    ? `User's observed patterns with ${substanceName}:\n` +
      substancePatterns.map(p => `- ${p.text}`).join('\n')
    : '';

  // Get substance journal entries
  const substanceEntries = journalEntries
    .filter(e => e.allyName?.toLowerCase() === substanceName.toLowerCase())
    .slice(0, 5);

  const substanceHistory = substanceEntries.length > 0
    ? `Recent ${substanceName} moments:\n` +
      substanceEntries.map(e => {
        const parts = [];
        if (e.tone) parts.push(`Intention: ${e.tone}`);
        if (e.frequency) parts.push(`Sensation: ${e.frequency}`);
        if (e.presence) parts.push(`Reflection: ${e.presence}`);
        return `[${new Date(e.date).toLocaleDateString()}] ${parts.join(', ')}`;
      }).join('\n')
    : '';

  // Time-of-day patterns for this substance
  const timePatterns = analyzeTimePatterns(substanceEntries, substanceName);

  return {
    recentConversations,
    userPatterns,
    archetypeHistory: '',
    substanceHistory,
    timePatterns,
    anchorUsage: '',
  };
}

/**
 * Build memory context for archetype dialogue
 */
export function buildArchetypeMemoryContext(
  archetype: Archetype,
  conversations: Conversation[],
  patterns: Pattern[],
  journalEntries: Moment[],
  allies: Ally[]
): MemoryContext {
  // Filter conversations involving this archetype
  const archetypeConversations = conversations
    .filter(c => c.archetypeName?.toLowerCase() === archetype.name.toLowerCase())
    .slice(0, 3);

  const recentConversations = archetypeConversations.length > 0
    ? `Past conversations with ${archetype.name}:\n` +
      archetypeConversations.map(c => {
        const msgs = c.messages.map(m => `${m.speaker}: ${m.text}`).join('\n');
        return `[${new Date(c.date).toLocaleDateString()}] With ${c.substanceMythicName || c.substanceName}:\n${msgs}`;
      }).join('\n\n')
    : '';

  // Get all user patterns (archetype observes all patterns)
  const allPatterns = patterns.slice(0, 5);
  const userPatterns = allPatterns.length > 0
    ? `User's self-observed patterns:\n` +
      allPatterns.map(p => `- [${p.category || 'general'}] ${p.text}`).join('\n')
    : '';

  // Analyze archetype invocation patterns
  const archetypeHistory = analyzeArchetypeUsage(archetype, journalEntries);

  // Get anchor usage patterns
  const anchorUsage = analyzeAnchorUsage(allies);

  return {
    recentConversations,
    userPatterns,
    archetypeHistory,
    substanceHistory: '',
    timePatterns: '',
    anchorUsage,
  };
}

/**
 * Analyze time-of-day patterns for substance use
 */
function analyzeTimePatterns(entries: Moment[], substanceName: string): string {
  if (entries.length === 0) return '';

  const timeDistribution: Record<string, number> = {
    morning: 0,
    afternoon: 0,
    evening: 0,
    late: 0,
  };

  entries.forEach(e => {
    if (e.container) {
      timeDistribution[e.container]++;
    }
  });

  const mostCommon = Object.entries(timeDistribution)
    .filter(([_, count]) => count > 0)
    .sort((a, b) => b[1] - a[1])[0];

  if (mostCommon && mostCommon[1] > 1) {
    return `Time pattern: User tends to use ${substanceName} during ${mostCommon[0]} (${mostCommon[1]} times).`;
  }

  return '';
}

/**
 * Analyze archetype invocation patterns
 */
function analyzeArchetypeUsage(archetype: Archetype, entries: Moment[]): string {
  // Count how many journal entries were made while this archetype was active
  // (This would require tracking archetype state in journal entries - for now, simplified)
  return `${archetype.name} has been invoked and is learning the user's rhythms.`;
}

/**
 * Analyze anchor/ally usage patterns
 */
function analyzeAnchorUsage(allies: Ally[]): string {
  const frequentAllies = allies
    .filter(a => a.log && a.log.length > 2)
    .sort((a, b) => (b.log?.length || 0) - (a.log?.length || 0))
    .slice(0, 3);

  if (frequentAllies.length === 0) return '';

  return `Frequently used anchors: ${frequentAllies.map(a => `${a.name} (${a.log.length} times)`).join(', ')}.`;
}

/**
 * Format memory context into a prompt-ready string
 */
export function formatMemoryContext(context: MemoryContext): string {
  const parts = [];

  if (context.recentConversations) {
    parts.push(context.recentConversations);
  }
  if (context.userPatterns) {
    parts.push(context.userPatterns);
  }
  if (context.archetypeHistory) {
    parts.push(context.archetypeHistory);
  }
  if (context.substanceHistory) {
    parts.push(context.substanceHistory);
  }
  if (context.timePatterns) {
    parts.push(context.timePatterns);
  }
  if (context.anchorUsage) {
    parts.push(context.anchorUsage);
  }

  return parts.join('\n\n');
}
