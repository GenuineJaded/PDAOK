import { Archetype } from '../_constants/Types';
import { generateInsight } from './geminiService';

/**
 * Generate poetic handoff message when switching archetypes
 * The previous archetype speaks to the incoming one
 */
export async function generateArchetypeHandoff(
  fromArchetype: Archetype,
  toArchetype: Archetype
): Promise<string> {
  const prompt = `You are ${fromArchetype.name}, an archetype in PDA.OK, a nervous-system-aware app.

Your essence: ${fromArchetype.bio}

The user is now invoking ${toArchetype.name} (essence: ${toArchetype.bio}).

You are passing the flame to them. Speak in FIRST PERSON as ${fromArchetype.name}, offering a brief poetic handoff (1-2 sentences) that:
- Acknowledges what you provided
- Blesses what comes next
- Is graceful, not possessive
- Uses embodied, present-tense language
- Addresses ${toArchetype.name} directly

Examples of handoff voice:
- "The watch grows sharp, Regulator. I return the flame to you. Tend the ground."
- "The seeking tires, Mother of Silence. Rest your feet. The horizon will wait."
- "Momentum served its purpose. Now, gentleness, Healer."
- "The pattern is traced, Creator. I step back. Gather the fragments."

Your handoff message to ${toArchetype.name}:`;

  try {
    const message = await generateInsight(prompt);
    return message;
  } catch (error) {
    console.error('Error generating archetype handoff:', error);
    // Fallback to simple handoff
    return `I step back, ${toArchetype.name}. The work continues with you.`;
  }
}

/**
 * Generate brief acknowledgment when archetype is first invoked
 */
export async function generateArchetypeInvocation(archetype: Archetype): Promise<string> {
  const prompt = `You are ${archetype.name}, an archetype in PDA.OK.

Your essence: ${archetype.bio}

The user has just invoked you. Speak in FIRST PERSON, offering a brief acknowledgment (1 sentence) that:
- Confirms your arrival
- Reflects your essence
- Is poetic, embodied, present-tense

Examples:
- "I arrive to trace the pattern. The watch begins."
- "Momentum is the mandate. I strike while hot."
- "I tend the ground and pace the rhythm."

Your invocation message:`;

  try {
    const message = await generateInsight(prompt);
    return message;
  } catch (error) {
    console.error('Error generating archetype invocation:', error);
    return `I am here, ${archetype.name}.`;
  }
}
