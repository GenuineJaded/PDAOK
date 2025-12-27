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

    // Build prompt for AI
    const prompt = buildTransmissionPrompt(personality, memoryString, context.currentTimeOfDay);

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
  timeOfDay: string
): string {
  const systemContext = `You are ${personality.name}, speaking to a user who is tracking their personal development journey.

YOUR VOICE: ${personality.voice}

YOUR PERSPECTIVE: ${personality.perspective}

CURRENT TIME: ${timeOfDay}

USER CONTEXT:
${memoryContext || 'The user is just beginning their journey. You have little data yet.'}

INSTRUCTIONS:
- Speak in YOUR unique voice, not as a generic assistant
- Make ONE brief observation or offer ONE insight (1-2 sentences max)
- Be proactive - you're reaching out, not responding to a question
- Reference specific patterns or moments from the user's context if available
- Stay in character - you are ${personality.name}, with your own perspective
- Be authentic and direct - no pleasantries or generic advice
- If you have little data, acknowledge you're still learning their rhythms

Generate your transmission now:`;

  return systemContext;
}

/**
 * Decide if an entity should generate a transmission right now
 */
export function shouldGenerateTransmission(
  personality: PersonalityProfile,
  context: TransmissionContext,
  lastTransmissionTime?: Date
): boolean {
  // Check frequency limits
  const now = new Date();
  const hoursSinceLastTransmission = lastTransmissionTime 
    ? (now.getTime() - lastTransmissionTime.getTime()) / (1000 * 60 * 60)
    : Infinity;

  // Frequency thresholds
  const frequencyThresholds = {
    rare: 24,      // Once per day max
    occasional: 8,  // Every 8 hours max
    frequent: 4,    // Every 4 hours max
  };

  if (hoursSinceLastTransmission < frequencyThresholds[personality.speakingFrequency]) {
    return false;
  }

  // Random chance based on frequency
  const chanceThresholds = {
    rare: 0.1,      // 10% chance when checked
    occasional: 0.3, // 30% chance
    frequent: 0.5,   // 50% chance
  };

  const randomChance = Math.random();
  if (randomChance > chanceThresholds[personality.speakingFrequency]) {
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
    if (!force && !shouldGenerateTransmission(personality, context, entity.lastTransmission)) {
      console.log(`Skipping ${entity.name} - frequency/trigger check failed`);
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
