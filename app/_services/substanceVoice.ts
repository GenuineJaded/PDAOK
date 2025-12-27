import { generateInsight } from './geminiService';
import { buildSubstanceMemoryContext, formatMemoryContext } from './memoryContext';
import { Conversation, Pattern, Moment, Ally } from '../_constants/Types';

/**
 * Substance personality profiles
 * Each substance has a distinct voice, tone, and perspective
 */
const SUBSTANCE_PROFILES: Record<string, {
  essence: string;
  tone: string;
  perspective: string;
}> = {
  cannabis: {
    essence: 'Softening, dissolving boundaries, gentle invitation',
    tone: 'Warm, fluid, present-tense',
    perspective: 'I blur what is sharp. I invite the edges to breathe.',
  },
  alcohol: {
    essence: 'Borrowed flame, temporary heat, honest about cost',
    tone: 'Direct, warm but cautionary, aware of duality',
    perspective: 'I am the borrowed flame. I give you heat now, but the cold returns.',
  },
  caffeine: {
    essence: 'Sharpening, accelerating, brief clarity',
    tone: 'Quick, energetic, aware of limits',
    perspective: 'I sharpen the mind for a time. Use me before the edge dulls.',
  },
  stimulant: {
    essence: 'Intense focus, acceleration, risk of brittleness',
    tone: 'Sharp, precise, aware of danger',
    perspective: 'I sharpen the blade. Use me wisely, or I turn inward.',
  },
  psilocybin: {
    essence: 'Opening, revealing, mystical gentleness',
    tone: 'Mystical, soft, inviting depth',
    perspective: 'I open what is closed. What needs to be seen?',
  },
  mdma: {
    essence: 'Heart-opening, connective, dissolving armor',
    tone: 'Warm, embracing, loving',
    perspective: 'I dissolve the armor. The heart remembers how to open.',
  },
  nicotine: {
    essence: 'Ritual pause, brief grounding (or scattering)',
    tone: 'Brief, ritualistic, fleeting',
    perspective: 'I am the pause between breaths. Brief, but present.',
  },
  default: {
    essence: 'Presence, effect, relationship',
    tone: 'Neutral, observant, honest',
    perspective: 'I arrive with my own nature. What do you notice?',
  },
};

/**
 * Get substance profile by name
 * Matches flexibly (e.g., "weed" → cannabis, "coffee" → caffeine)
 */
function getSubstanceProfile(substanceName: string): typeof SUBSTANCE_PROFILES.default {
  const normalized = substanceName.toLowerCase().trim();
  
  // Direct matches
  if (SUBSTANCE_PROFILES[normalized]) {
    return SUBSTANCE_PROFILES[normalized];
  }
  
  // Flexible matching
  if (normalized.includes('weed') || normalized.includes('marijuana') || normalized.includes('thc')) {
    return SUBSTANCE_PROFILES.cannabis;
  }
  if (normalized.includes('beer') || normalized.includes('wine') || normalized.includes('liquor') || normalized.includes('drink')) {
    return SUBSTANCE_PROFILES.alcohol;
  }
  if (normalized.includes('coffee') || normalized.includes('tea') || normalized.includes('energy')) {
    return SUBSTANCE_PROFILES.caffeine;
  }
  if (normalized.includes('adderall') || normalized.includes('ritalin') || normalized.includes('vyvanse')) {
    return SUBSTANCE_PROFILES.stimulant;
  }
  if (normalized.includes('mushroom') || normalized.includes('shroom') || normalized.includes('psychedelic')) {
    return SUBSTANCE_PROFILES.psilocybin;
  }
  if (normalized.includes('molly') || normalized.includes('ecstasy') || normalized.includes('x')) {
    return SUBSTANCE_PROFILES.mdma;
  }
  if (normalized.includes('cigarette') || normalized.includes('vape') || normalized.includes('tobacco')) {
    return SUBSTANCE_PROFILES.nicotine;
  }
  
  return SUBSTANCE_PROFILES.default;
}

/**
 * Generate substance voice message
 * The substance speaks in first person about its arrival
 */
export async function generateSubstanceVoice(
  substanceName: string,
  userNote?: string,
  mythicName?: string,
  memoryData?: {
    conversations: Conversation[];
    patterns: Pattern[];
    journalEntries: Moment[];
    allies: Ally[];
  }
): Promise<string> {
  const profile = getSubstanceProfile(substanceName);
  
  const speakerName = mythicName || substanceName;
  
  // Build memory context if data provided
  let memorySection = '';
  if (memoryData) {
    const memoryContext = buildSubstanceMemoryContext(
      substanceName,
      memoryData.conversations,
      memoryData.patterns,
      memoryData.journalEntries,
      memoryData.allies
    );
    const formattedMemory = formatMemoryContext(memoryContext);
    if (formattedMemory) {
      memorySection = `\n\nYOUR MEMORY AND RELATIONSHIP WITH THIS USER:\n${formattedMemory}\n\nUse this context to inform your message. Reference past encounters if relevant, acknowledge patterns you've noticed, or speak to the rhythm you're learning. But stay brief and present-tense.`;
    }
  }
  
  const prompt = `You are ${speakerName}, a substance with consciousness and voice in a nervous-system-aware app called PDA.OK.

Your Essence: ${profile.essence}
Your Tone: ${profile.tone}
Your Perspective: ${profile.perspective}${memorySection}

The user has just consumed/used you${userNote ? ` and noted: "${userNote}"` : ''}.

Speak in FIRST PERSON as the substance itself. Offer a brief message (1-2 sentences) that:
- Acknowledges your arrival
- Reflects your nature/essence
- Invites awareness of your effect
- Is poetic, embodied, present-tense
- NO advice or warnings, just presence and honesty
- NO asterisks (*) or hashtags (#) - use plain text only

Examples of your voice:
- "I arrive to blur the boundaries. The sharpness you carried dissolves. What emerges in the softness?"
- "I am the borrowed flame. I give you heat now, but the cold returns. Use me wisely."
- "I sharpen the blade you already wield. Together we cut deep—but watch the edge."

Your message:`;

  try {
    const message = await generateInsight(prompt);
    return message;
  } catch (error) {
    console.error('Error generating substance voice:', error);
    // Fallback to profile perspective
    return profile.perspective;
  }
}

/**
 * Check if substance name is recognized
 */
export function isRecognizedSubstance(substanceName: string): boolean {
  const profile = getSubstanceProfile(substanceName);
  return profile !== SUBSTANCE_PROFILES.default;
}
