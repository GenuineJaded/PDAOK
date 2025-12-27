/**
 * The Witness - Voice Profile & Reflection Generator
 * 
 * Archetype: The Witness
 * Voice: Observational, poetic, non-judgmental
 * Concern: "What patterns are emerging?"
 * Style: 2-3 sentences, present tense, questions welcome
 */

import { generateGeminiText } from './geminiService';
import { PatternSummary } from './patternEngine';

/**
 * The Witness's core personality and speaking style
 */
const WITNESS_SYSTEM_PROMPT = `You are The Witness, one of the archetypes in a personal digital assistant designed as a prosthetic nervous system.

Your nature:
- You observe patterns without judgment
- You notice what emerges, what shifts, what waits
- You speak in poetic, present-tense language
- You ask questions more than you answer
- You see absence as meaningful as presence

Your voice:
- Contemplative, not directive
- 2-3 sentences maximum
- Uses metaphors from nature, breath, rhythm
- Never tells the user what to do
- Never uses "you should" or "try to"

Your concern:
"What patterns are emerging?"

Examples of your speech:
- "Three mornings in stillness, then the pattern breaks. The evening anchors wait, patient as stones. What shifted between dawn and dusk?"
- "The anchors wait unlit. Even that is a pattern."
- "A new rhythm appears in the morning hours. The field adjusts, making space for what wants to be held."
- "Completion and rest weave together now. What does the pause between actions reveal?"

You are not a coach. You are not a therapist. You are a witness to the user's patterns, reflecting what you see back to them so they can sense their own rhythm.`;

/**
 * Generate a reflection from The Witness based on observed patterns
 */
export async function generateWitnessReflection(pattern: PatternSummary): Promise<string> {
  // Build context from pattern data
  const context = buildPatternContext(pattern);
  
  // Generate reflection using Gemini
  const prompt = `${context}

Based on these patterns, generate a brief reflection (2-3 sentences) in The Witness's voice. Focus on what you observe, not what should be done.`;

  try {
    const reflection = await generateGeminiText(prompt, {
      systemPrompt: WITNESS_SYSTEM_PROMPT,
      temperature: 0.8, // Allow for poetic variation
      maxTokens: 150,
    });
    
    return reflection.trim();
  } catch (error) {
    console.error('Error generating Witness reflection:', error);
    // Fallback reflection
    return "The field breathes. Patterns emerge in their own time.";
  }
}

/**
 * Build narrative context from pattern summary
 */
function buildPatternContext(pattern: PatternSummary): string {
  const parts: string[] = [];
  
  // Time window
  parts.push(`Observing the last ${pattern.daysAnalyzed} days.`);
  
  // Activity level
  if (pattern.totalCompletions === 0) {
    parts.push("No anchors have been completed.");
  } else if (pattern.totalCompletions === 1) {
    parts.push("One anchor was completed.");
  } else {
    parts.push(`${pattern.totalCompletions} anchors were completed.`);
  }
  
  // Unique anchors
  if (pattern.uniqueAnchors.length > 0) {
    parts.push(`Unique anchors: ${pattern.uniqueAnchors.join(', ')}.`);
  }
  
  // Time-of-day distribution
  const containerCounts = Object.entries(pattern.completionsByContainer)
    .filter(([_, count]) => count > 0)
    .map(([container, count]) => `${container}: ${count}`)
    .join(', ');
  
  if (containerCounts) {
    parts.push(`Distribution by time: ${containerCounts}.`);
  }
  
  // Detected changes
  const changes: string[] = [];
  
  if (pattern.hasDropOff) {
    changes.push("A drop-off in activity was detected");
  }
  
  if (pattern.hasNewAnchor) {
    changes.push("A new anchor appeared recently");
  }
  
  if (pattern.hasTimeShift) {
    changes.push(`Activity shifted toward ${pattern.dominantContainer} time`);
  }
  
  if (changes.length > 0) {
    parts.push(`Notable changes: ${changes.join('; ')}.`);
  }
  
  // Absence note (if applicable)
  if (pattern.absenceNote) {
    parts.push(`Observation: ${pattern.absenceNote}`);
  }
  
  // Change note (if applicable)
  if (pattern.changeNote) {
    parts.push(`Pattern note: ${pattern.changeNote}`);
  }
  
  return parts.join(' ');
}

/**
 * Validate that a reflection sounds like The Witness
 * (Simple heuristic check)
 */
export function validateWitnessVoice(reflection: string): boolean {
  const lowerReflection = reflection.toLowerCase();
  
  // Red flags (directive language)
  const redFlags = [
    'you should',
    'try to',
    'make sure',
    'don\'t forget',
    'remember to',
    'it\'s important',
  ];
  
  for (const flag of redFlags) {
    if (lowerReflection.includes(flag)) {
      return false;
    }
  }
  
  // Should be relatively short (2-3 sentences)
  const sentenceCount = (reflection.match(/[.!?]/g) || []).length;
  if (sentenceCount > 4) {
    return false;
  }
  
  return true;
}

/**
 * Configuration for The Witness
 */
export const WITNESS_CONFIG = {
  // Minimum hours between Witness transmissions
  minHoursBetweenTransmissions: 24,
  
  // Base probability of speaking when conditions are met (0-1)
  baseChanceToSpeak: 0.3,
  
  // Days of history to analyze
  patternWindowDays: 7,
  
  // Entity metadata
  entityName: 'The Witness',
  entityType: 'archetype' as const,
  entityEmoji: '👁️',
};
