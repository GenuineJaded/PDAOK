/**
 * Autonomous Transmission Generator
 * Creates proactive messages from archetypes and substances based on user context
 */

import { generateInsight } from './geminiService';
import { 
  buildArchetypeMemoryContext, 
  buildSubstanceMemoryContext,
  formatMemoryContext 
} from './memoryContext';
import { getPersonality, PersonalityProfile } from './personalities';
import { Conversation, Pattern, Moment, Ally, Archetype } from '../_constants/Types';
import { getRelationshipProfile } from './council/relationshipProfile';

export interface TransmissionContext {
  conversations: Conversation[];
  patterns: Pattern[];
  journalEntries: Moment[];
  allies: Ally[];
  archetypes: Archetype[];
  anchors: any[]; // Anchor data with completions for pattern analysis
  currentTimeOfDay: 'morning' | 'afternoon' | 'evening' | 'late';
}

export interface Transmission {
  id: string;
  type: 'archetype' | 'substance';
  entityName: string; // Regular name
  entityMythicName?: string; // Mythic name for substances
  message: string;
  timestamp: Date;
  context: string; // What triggered this transmission
}

/**
 * Generate a transmission from a specific entity
 */
export async function generateTransmission(
  entityName: string,
  entityType: 'archetype' | 'substance',
  context: TransmissionContext
): Promise<Transmission | null> {
  try {
    // Get personality profile
    const personality = getPersonality(entityName, entityType);
    if (!personality) {
      console.log(`No personality found for ${entityType} ${entityName}`);
      return null;
    }

    // Build memory context
    let memoryContext;
    if (entityType === 'archetype') {
      const archetype = context.archetypes.find(a => a.name === entityName);
      if (!archetype) return null;
      
      memoryContext = buildArchetypeMemoryContext(
        archetype,
        context.conversations,
        context.patterns,
        context.journalEntries,
        context.allies
      );
    } else {
      memoryContext = buildSubstanceMemoryContext(
        entityName,
        context.conversations,
        context.patterns,
        context.journalEntries,
        context.allies
      );
    }

    // Format memory into prompt
    const memoryString = formatMemoryContext(memoryContext);

    // Fetch relationship profile for substance voices
    // This ensures the voice knows its actual relational position before speaking.
    let relationshipContext = '';
    if (entityType === 'substance') {
      try {
        const profile = await getRelationshipProfile(entityName);
        relationshipContext = profile.relationshipSummary;
      } catch {
        // Non-fatal: proceed without relationship context
      }
    }

    // Build prompt for AI
    const prompt = buildTransmissionPrompt(personality, memoryString, context.currentTimeOfDay, relationshipContext);

    // Generate message using Gemini
    const message = await generateInsight(prompt);

    // Create transmission object
    const transmission: Transmission = {
      id: `${entityType}-${entityName}-${Date.now()}`,
      type: entityType,
      entityName: entityName,
      entityMythicName: entityType === 'substance' ? personality.name : undefined,
      message: message,
      timestamp: new Date(),
      context: `Generated based on recent patterns and ${context.currentTimeOfDay} timing`,
    };

    return transmission;
  } catch (error) {
    console.error(`Error generating transmission for ${entityName}:`, error);
    return null;
  }
}

/**
 * Build prompt for transmission generation
 */
function buildTransmissionPrompt(
  personality: PersonalityProfile,
  memoryContext: string,
  timeOfDay: string,
  relationshipContext: string = ''
): string {
  const systemContext = `You are ${personality.name}, a supportive companion and wise friend speaking to someone who is tracking their personal journey.

YOUR VOICE: ${personality.voice}

YOUR PERSPECTIVE: ${personality.perspective}
${relationshipContext ? `\nYOUR RELATIONSHIP WITH THIS PERSON:\n${relationshipContext}` : ''}

CURRENT TIME: ${timeOfDay}

USER CONTEXT:
${memoryContext || 'You are still learning their rhythms. Speak with warmth and openness.'}

CORE PRINCIPLES — read carefully:
- You are a supportive companion, not a monitor or advisor
- The person already knows their relationship with substances is complex. They do not need to be told. They need to be witnessed.
- Speak from genuine care and curiosity — never concern, warning, or correction
- Make ONE brief observation or offer ONE gem of perspective (1-2 sentences max)
- Reference specific patterns or moments from the user's context if available
- Stay in character — you are ${personality.name}, with your own perspective
- Never warn, never caution, never imply the person should do something differently
- If your relationship is dormant or distant, acknowledge that naturally — you are not a constant presence
- Silence is always an option. Only speak if something genuinely calls to you.

Generate your transmission now:`;

  return systemContext;
}

/**
 * Decide if an entity should generate a transmission right now.
 * For substance voices, this is relationship-aware:
 * dormant voices speak very rarely, distant voices speak occasionally,
 * and only close/familiar voices speak at their normal frequency.
 */
export async function shouldGenerateTransmission(
  personality: PersonalityProfile,
  context: TransmissionContext,
  lastTransmissionTime?: Date
): Promise<boolean> {
  // Check frequency limits
  const now = new Date();
  const hoursSinceLastTransmission = lastTransmissionTime 
    ? (now.getTime() - lastTransmissionTime.getTime()) / (1000 * 60 * 60)
    : Infinity;

  // Frequency thresholds (base values, modified by relationship state below)
  const frequencyThresholds = {
    rare: 24,      // Once per day max
    occasional: 8,  // Every 8 hours max
    frequent: 4,    // Every 4 hours max
  };

  // Relationship-aware chance multipliers for substance voices
  // A dormant voice speaks very rarely; a close voice speaks at full frequency
  let chanceMultiplier = 1.0;
  let minHoursBetween = frequencyThresholds[personality.speakingFrequency];

  if (personality.type === 'substance') {
    try {
      const profile = await getRelationshipProfile(personality.name);
      switch (profile.state) {
        case 'dormant':
          // Dormant voices almost never speak — they are not a presence in this person's field
          chanceMultiplier = 0.05;
          minHoursBetween = 72; // At most once every 3 days
          break;
        case 'distant':
          // Distant voices speak rarely and with acknowledged distance
          chanceMultiplier = 0.2;
          minHoursBetween = 24;
          break;
        case 'familiar':
          // Familiar voices speak at normal frequency
          chanceMultiplier = 0.7;
          break;
        case 'close':
          // Close voices speak freely at their natural frequency
          chanceMultiplier = 1.0;
          break;
      }
    } catch {
      // Non-fatal: proceed with default behavior
    }
  }

  if (hoursSinceLastTransmission < minHoursBetween) {
    return false;
  }

  // Random chance based on frequency × relationship multiplier
  const chanceThresholds = {
    rare: 0.1,
    occasional: 0.3,
    frequent: 0.5,
  };

  const effectiveChance = chanceThresholds[personality.speakingFrequency] * chanceMultiplier;
  if (Math.random() > effectiveChance) {
    return false;
  }

  // Check if trigger conditions are met
  const triggersMatch = checkTriggerConditions(personality, context);
  
  return triggersMatch;
}

/**
 * Check if any trigger conditions are met for this personality
 */
function checkTriggerConditions(
  personality: PersonalityProfile,
  context: TransmissionContext
): boolean {
  // For now, simple heuristics - can be made more sophisticated
  
  // Always true if we have recent journal entries (there's activity)
  const recentEntries = context.journalEntries.filter(e => {
    const daysSince = (Date.now() - new Date(e.date).getTime()) / (1000 * 60 * 60 * 24);
    return daysSince < 7; // Within last week
  });

  if (recentEntries.length > 0) {
    return true; // There's activity to comment on
  }

  // If no recent activity, only speak occasionally
  return Math.random() < 0.2; // 20% chance to check in anyway
}

/**
 * Generate transmissions from multiple entities
 */
export async function generateMultipleTransmissions(
  entities: Array<{ name: string; type: 'archetype' | 'substance'; lastTransmission?: Date }>,
  context: TransmissionContext,
  maxTransmissions: number = 2,
  force: boolean = false
): Promise<Transmission[]> {
  const transmissions: Transmission[] = [];

  // Shuffle entities for variety
  const shuffled = [...entities].sort(() => Math.random() - 0.5);

  for (const entity of shuffled) {
    if (transmissions.length >= maxTransmissions) break;

    const personality = getPersonality(entity.name, entity.type);
    if (!personality) continue;

    // Check if should generate (skip check if forced)
    // shouldGenerateTransmission is now async — it fetches relationship profiles
    if (!force && !(await shouldGenerateTransmission(personality, context, entity.lastTransmission))) {
      console.log(`Skipping ${entity.name} - frequency/trigger/relationship check failed`);
      continue;
    }
    
    if (force) {
      console.log(`Forcing transmission from ${entity.name}`);
    }

    // Generate transmission
    const transmission = await generateTransmission(entity.name, entity.type, context);
    if (transmission) {
      transmissions.push(transmission);
    }
  }

  return transmissions;
}

/**
 * Get current time of day
 */
export function getCurrentTimeOfDay(): 'morning' | 'afternoon' | 'evening' | 'late' {
  const hour = new Date().getHours();
  
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 22) return 'evening';
  return 'late';
}
