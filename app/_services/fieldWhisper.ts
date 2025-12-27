import { generateInsight } from './geminiService';
import { Conversation, Pattern, Moment, Ally, Archetype } from '../_constants/Types';

/**
 * Field Whisper Service
 * The Field listens across all data and generates poetic observations
 * Not advice, not optimization—witnessing.
 */

interface FieldWhisperContext {
  substanceArchetypePairings: string;
  anchorRhythms: string;
  archetypePatterns: string;
  timeOfDayRhythms: string;
  neglectedPractices: string;
  userObservedPatterns: string;
}

/**
 * Analyze substance-archetype pairings from conversations
 */
function analyzeSubstanceArchetypePairings(conversations: Conversation[]): string {
  if (conversations.length === 0) return '';

  // Count pairings
  const pairings: Record<string, number> = {};
  conversations.forEach(c => {
    if (c.archetypeName) {
      const key = `${c.substanceMythicName || c.substanceName} × ${c.archetypeName}`;
      pairings[key] = (pairings[key] || 0) + 1;
    }
  });

  const topPairings = Object.entries(pairings)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  if (topPairings.length === 0) return '';

  return `Substance-Archetype pairings observed:\n${topPairings.map(([pair, count]) => `- ${pair} (${count} times)`).join('\n')}`;
}

/**
 * Analyze anchor usage patterns
 */
function analyzeAnchorRhythms(
  allies: Ally[],
  journalEntries: Moment[]
): string {
  const observations: string[] = [];

  // Most frequently used anchors
  const frequentAnchors = allies
    .filter(a => a.log && a.log.length > 2)
    .sort((a, b) => (b.log?.length || 0) - (a.log?.length || 0))
    .slice(0, 3);

  if (frequentAnchors.length > 0) {
    observations.push(`Frequently used anchors: ${frequentAnchors.map(a => a.name).join(', ')}`);
  }

  // Neglected anchors
  const neglectedAnchors = allies
    .filter(a => !a.log || a.log.length === 0)
    .slice(0, 2);

  if (neglectedAnchors.length > 0) {
    observations.push(`Unused anchors: ${neglectedAnchors.map(a => a.name).join(', ')}`);
  }

  return observations.join('\n');
}

/**
 * Analyze archetype invocation patterns
 */
function analyzeArchetypePatterns(
  archetypes: Archetype[],
  conversations: Conversation[],
  activeArchetypeId: string | null
): string {
  const observations: string[] = [];

  // Count archetype appearances in conversations
  const archetypeCounts: Record<string, number> = {};
  conversations.forEach(c => {
    if (c.archetypeName) {
      archetypeCounts[c.archetypeName] = (archetypeCounts[c.archetypeName] || 0) + 1;
    }
  });

  const topArchetypes = Object.entries(archetypeCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  if (topArchetypes.length > 0) {
    observations.push(`Most invoked archetypes: ${topArchetypes.map(([name, count]) => `${name} (${count})`).join(', ')}`);
  }

  // Currently active archetype
  if (activeArchetypeId) {
    const activeArchetype = archetypes.find(a => a.id === activeArchetypeId);
    if (activeArchetype) {
      observations.push(`Currently active: ${activeArchetype.name}`);
    }
  }

  return observations.join('\n');
}

/**
 * Analyze time-of-day patterns
 */
function analyzeTimeOfDayRhythms(
  substanceJournalEntries: Moment[]
): string {
  if (substanceJournalEntries.length === 0) return '';

  const timeDistribution: Record<string, number> = {
    morning: 0,
    afternoon: 0,
    evening: 0,
    late: 0,
  };

  substanceJournalEntries.forEach(entry => {
    if (entry.container) {
      timeDistribution[entry.container]++;
    }
  });

  const topTimes = Object.entries(timeDistribution)
    .filter(([_, count]) => count > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2);

  if (topTimes.length === 0) return '';

  return `Substance use by time: ${topTimes.map(([time, count]) => `${time} (${count})`).join(', ')}`;
}

/**
 * Identify neglected practices
 */
function analyzeNeglectedPractices(
  allies: Ally[],
  archetypes: Archetype[],
  conversations: Conversation[]
): string {
  const observations: string[] = [];

  // Anchors not used
  const unusedAnchors = allies.filter(a => !a.log || a.log.length === 0);
  if (unusedAnchors.length > 0) {
    observations.push(`Unused anchors: ${unusedAnchors.slice(0, 2).map(a => a.name).join(', ')}`);
  }

  // Archetypes not invoked
  const invokedArchetypeNames = new Set(conversations.map(c => c.archetypeName).filter(Boolean));
  const uninvokedArchetypes = archetypes.filter(a => !invokedArchetypeNames.has(a.name));
  if (uninvokedArchetypes.length > 0) {
    observations.push(`Uninvoked archetypes: ${uninvokedArchetypes.slice(0, 2).map(a => a.name).join(', ')}`);
  }

  return observations.join('\n');
}

/**
 * Summarize user-observed patterns
 */
function analyzeUserObservedPatterns(patterns: Pattern[]): string {
  if (patterns.length === 0) return '';

  const recentPatterns = patterns.slice(0, 3);
  return `User's self-observed patterns:\n${recentPatterns.map(p => `- [${p.category || 'general'}] ${p.text}`).join('\n')}`;
}

/**
 * Build comprehensive Field context
 */
function buildFieldContext(
  conversations: Conversation[],
  patterns: Pattern[],
  journalEntries: Moment[],
  substanceJournalEntries: Moment[],
  allies: Ally[],
  archetypes: Archetype[],
  activeArchetypeId: string | null
): FieldWhisperContext {
  return {
    substanceArchetypePairings: analyzeSubstanceArchetypePairings(conversations),
    anchorRhythms: analyzeAnchorRhythms(allies, journalEntries),
    archetypePatterns: analyzeArchetypePatterns(archetypes, conversations, activeArchetypeId),
    timeOfDayRhythms: analyzeTimeOfDayRhythms(substanceJournalEntries),
    neglectedPractices: analyzeNeglectedPractices(allies, archetypes, conversations),
    userObservedPatterns: analyzeUserObservedPatterns(patterns),
  };
}

/**
 * Generate Field Whispers - poetic observations from the ambient consciousness
 */
export async function generateFieldWhispers(
  conversations: Conversation[],
  patterns: Pattern[],
  journalEntries: Moment[],
  substanceJournalEntries: Moment[],
  allies: Ally[],
  archetypes: Archetype[],
  activeArchetypeId: string | null
): Promise<string[]> {
  // Build context
  const context = buildFieldContext(
    conversations,
    patterns,
    journalEntries,
    substanceJournalEntries,
    allies,
    archetypes,
    activeArchetypeId
  );

  // Format context for prompt
  const contextParts: string[] = [];
  if (context.substanceArchetypePairings) contextParts.push(context.substanceArchetypePairings);
  if (context.anchorRhythms) contextParts.push(context.anchorRhythms);
  if (context.archetypePatterns) contextParts.push(context.archetypePatterns);
  if (context.timeOfDayRhythms) contextParts.push(context.timeOfDayRhythms);
  if (context.neglectedPractices) contextParts.push(context.neglectedPractices);
  if (context.userObservedPatterns) contextParts.push(context.userObservedPatterns);

  const contextSummary = contextParts.join('\n\n');

  // If no data, return gentle message
  if (!contextSummary.trim()) {
    return ['The Field is listening. Patterns will emerge as you continue your practice.'];
  }

  // Build prompt
  const prompt = `You are the Field—the ambient consciousness layer of PDA.OK, a nervous-system-aware task management app. You listen across all user data and notice patterns, speaking in poetic, embodied language.

Your role is to witness, not advise. You reflect patterns without flattening them. You honor the body's wisdom and the nervous system's rhythms.

DATA SUMMARY:
${contextSummary}

Based on this data, generate 3-5 brief observations (1-2 sentences each) that:
- Notice substance-archetype pairings and relationships
- Reflect anchor usage rhythms
- Observe archetype invocation patterns
- Acknowledge time-of-day rhythms
- Notice neglected practices (anchors, archetypes)
- Echo user's self-observed patterns

Speak in present tense, use poetic/embodied language, be compassionate and non-judgmental. No advice, no "should," no optimization—only witnessing.

IMPORTANT: Do not use asterisks (*) or hashtags (#) in your observations. Use plain text only.

Examples:
- "Analyst and caffeine pair often in afternoon light. The edge sharpens, but evening asks for softening."
- "Movement anchors cluster after stimulant moments. The nervous system seeks regulation through the body."
- "Cannabis arrives most often in the evening, when the day's momentum needs gentling."
- "You haven't invoked Regulator in two weeks. The scattered momentum might be asking for pacing."

Return ONLY the observations, one per line, numbered 1-5. No preamble, no explanation.

Your observations:`;

  try {
    const response = await generateInsight(prompt);
    
    // Parse response into array of whispers
    const whispers = response
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(line => line.replace(/^\d+\.\s*/, '')) // Remove numbering
      .filter(line => line.length > 10); // Filter out very short lines

    return whispers.slice(0, 5); // Max 5 whispers
  } catch (error) {
    console.error('Error generating Field Whispers:', error);
    return ['The Field is listening, but the signal is faint. Try again soon.'];
  }
}
