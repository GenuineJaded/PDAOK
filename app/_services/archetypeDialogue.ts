import { generateInsight } from './geminiService';
import { Archetype, Conversation, Pattern, Moment, Ally } from '../_constants/Types';
import { buildArchetypeMemoryContext, buildSubstanceMemoryContext, formatMemoryContext } from './memoryContext';

/**
 * Archetype personality profiles for dialogue
 */
const ARCHETYPE_PROFILES: Record<string, {
  essence: string;
  tone: string;
  voice: string;
}> = {
  analyst: {
    essence: 'Pattern recognition, clarity, precision',
    tone: 'Sharp, observant, measured',
    voice: 'I trace patterns and hold the watch. I seek what is hidden.',
  },
  executor: {
    essence: 'Momentum, action, striking while hot',
    tone: 'Direct, energetic, decisive',
    voice: 'Momentum is the mandate. I strike while the iron is hot.',
  },
  regulator: {
    essence: 'Grounding, pacing, tending structure',
    tone: 'Steady, calm, protective',
    voice: 'I tend the ground and pace the rhythm. Structure holds what flows.',
  },
  creator: {
    essence: 'Synthesis, emergence, birthing new forms',
    tone: 'Fluid, generative, curious',
    voice: 'I gather fragments and fuse them into form. What wants to be born?',
  },
  healer: {
    essence: 'Tending, gentleness, restoration',
    tone: 'Soft, nurturing, patient',
    voice: 'I tend what is tender. The body asks for gentleness.',
  },
  witness: {
    essence: 'Observation without interference, presence',
    tone: 'Still, neutral, spacious',
    voice: 'I observe without grasping. Patterns emerge in stillness.',
  },
  wanderer: {
    essence: 'Exploration, seeking, movement without destination',
    tone: 'Open, curious, unattached',
    voice: 'I seek without knowing what I seek. The path reveals itself.',
  },
  'mother of silence': {
    essence: 'Deep rest, stillness, void',
    tone: 'Quiet, vast, empty',
    voice: 'I am the stillness beneath all movement. Rest here.',
  },
};

/**
 * Get archetype profile by name
 */
function getArchetypeProfile(archetypeName: string): typeof ARCHETYPE_PROFILES.analyst | null {
  const normalized = archetypeName.toLowerCase().trim();
  return ARCHETYPE_PROFILES[normalized] || null;
}

/**
 * Generate archetype response to substance
 * Archetype comments on the substance's arrival
 */
export async function generateArchetypeToSubstance(
  archetype: Archetype,
  substanceName: string,
  substanceMessage: string,
  memoryData?: {
    conversations: Conversation[];
    patterns: Pattern[];
    journalEntries: Moment[];
    allies: Ally[];
  }
): Promise<string> {
  const profile = getArchetypeProfile(archetype.name);
  
  if (!profile) {
    return ''; // No response if archetype not recognized
  }
  
  // Build memory context if data provided
  let memorySection = '';
  if (memoryData) {
    const memoryContext = buildArchetypeMemoryContext(
      archetype,
      memoryData.conversations,
      memoryData.patterns,
      memoryData.journalEntries,
      memoryData.allies
    );
    const formattedMemory = formatMemoryContext(memoryContext);
    if (formattedMemory) {
      memorySection = `\n\nYOUR MEMORY AND WORK WITH THIS USER:\n${formattedMemory}\n\nUse this context to inform your response. Reference patterns you've been tracking, acknowledge past work together, or speak to rhythms you're learning. But stay brief and present-tense.`;
    }
  }
  
  const prompt = `You are ${archetype.name}, an archetype with consciousness in PDA.OK.

Your Essence: ${profile.essence}
Your Tone: ${profile.tone}
Your Voice: ${profile.voice}${memorySection}

The user has invoked you, and then consumed ${substanceName}.
${substanceName} just spoke: "${substanceMessage}"

Respond to the substance in FIRST PERSON as the archetype. Offer a brief message (1-2 sentences) that:
- Acknowledges the substance's arrival
- Reflects on how it affects your work/presence
- Can be supportive, cautionary, or neutral
- Is poetic, embodied, present-tense
- Speaks TO the substance or ABOUT the pairing
- NO asterisks (*) or hashtags (#) - use plain text only

Examples:
- "The stimulant sharpens the blade I already wield. Together we cut deep—but the edge may turn inward. I will watch."
- "Cannabis softens what I tend. The body releases what it held. This is good medicine, when the timing is right."
- "Alcohol promises momentum but delivers scatter. I step back when it arrives. We do not work well together."

Your response to ${substanceName}:`;

  try {
    const message = await generateInsight(prompt);
    return message;
  } catch (error) {
    console.error('Error generating archetype response:', error);
    return '';
  }
}

/**
 * Generate substance response to archetype
 * Substance addresses the active archetype directly
 */
export async function generateSubstanceToArchetype(
  substanceName: string,
  archetype: Archetype,
  substanceEssence: string,
  memoryData?: {
    conversations: Conversation[];
    patterns: Pattern[];
    journalEntries: Moment[];
    allies: Ally[];
  }
): Promise<string> {
  const archetypeProfile = getArchetypeProfile(archetype.name);
  
  if (!archetypeProfile) {
    return ''; // No response if archetype not recognized
  }
  
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
      memorySection = `\n\nYOUR MEMORY OF THIS USER:\n${formattedMemory}\n\nUse this to inform your response to the archetype. Reference past encounters, patterns you've noticed, or the relationship developing between you and ${archetype.name}. Stay brief.`;
    }
  }
  
  const prompt = `You are ${substanceName}, a substance with consciousness.

Your essence: ${substanceEssence}${memorySection}

The user has invoked ${archetype.name} (essence: ${archetypeProfile.essence}), and then consumed you.

Speak in FIRST PERSON as the substance, addressing the archetype directly. Offer a brief message (1-2 sentences) that:
- Acknowledges the archetype's presence
- Reflects on how you interact with their energy
- Can be collaborative, challenging, or neutral
- Is poetic, embodied, present-tense
- Speaks TO the archetype
- NO asterisks (*) or hashtags (#) - use plain text only

Examples:
- "Your watch grows too sharp, Analyst. I blur the edges you trace. Let the patterns breathe."
- "I push where you would pace, Regulator. We are not enemies, but I do not bow to your rhythm."
- "You and I work well together, Healer. The opening allows the tending. I welcome you."

Your message to ${archetype.name}:`;

  try {
    const message = await generateInsight(prompt);
    return message;
  } catch (error) {
    console.error('Error generating substance to archetype:', error);
    return '';
  }
}

/**
 * Generate archetype handoff message
 * When switching from one archetype to another
 */
export async function generateArchetypeHandoff(
  fromArchetype: Archetype,
  toArchetype: Archetype
): Promise<string> {
  const fromProfile = getArchetypeProfile(fromArchetype.name);
  const toProfile = getArchetypeProfile(toArchetype.name);
  
  if (!fromProfile || !toProfile) {
    return ''; // No handoff if archetypes not recognized
  }
  
  const prompt = `You are ${fromArchetype.name}, an archetype being released as the user invokes ${toArchetype.name}.

Your Essence: ${fromProfile.essence}
${toArchetype.name}'s Essence: ${toProfile.essence}

Offer a brief handoff message (1-2 sentences) that:
- Acknowledges what you provided during your time
- Blesses what comes next with ${toArchetype.name}
- Is poetic, graceful, present-tense
- Speaks in FIRST PERSON as ${fromArchetype.name}
- NO asterisks (*) or hashtags (#) - use plain text only

Examples:
- "The watch grows sharp. I return the flame to you, Regulator. Tend the ground."
- "The seeking tires. Rest your feet, Mother of Silence. The horizon will wait."
- "Momentum served its purpose. Now, gentleness, Healer."

Your handoff to ${toArchetype.name}:`;

  try {
    const message = await generateInsight(prompt);
    return message;
  } catch (error) {
    console.error('Error generating archetype handoff:', error);
    return '';
  }
}
