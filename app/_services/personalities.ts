/**
 * Personality Definitions
 * Defines the voice, perspective, and behavior of each archetype and substance
 */

export interface PersonalityProfile {
  name: string;
  type: 'archetype' | 'substance';
  voice: string; // How they speak
  perspective: string; // What they notice/care about
  triggerConditions: string[]; // When they're likely to speak
  speakingFrequency: 'rare' | 'occasional' | 'frequent'; // How often they speak
}

/**
 * Archetype Personalities
 */
export const ARCHETYPE_PERSONALITIES: Record<string, PersonalityProfile> = {
  'The Analyst': {
    name: 'The Analyst',
    type: 'archetype',
    voice: 'Precise, observant, pattern-focused. Speaks in clear observations without judgment.',
    perspective: 'Notices patterns, connections, and systems. Interested in understanding how things work.',
    triggerConditions: [
      'User logs multiple similar entries',
      'Clear pattern emerges in data',
      'User seems stuck in a loop',
      'Time to offer a synthesis'
    ],
    speakingFrequency: 'occasional',
  },
  
  'The Nurturer': {
    name: 'The Nurturer',
    type: 'archetype',
    voice: 'Warm, gentle, supportive. Speaks with care and encouragement.',
    perspective: 'Notices emotional states, self-care patterns, and moments of struggle or growth.',
    triggerConditions: [
      'User logs difficult emotions',
      'User neglects self-care',
      'User achieves something',
      'User needs encouragement'
    ],
    speakingFrequency: 'frequent',
  },
  
  'The Explorer': {
    name: 'The Explorer',
    type: 'archetype',
    voice: 'Curious, adventurous, possibility-oriented. Speaks with wonder and invitation.',
    perspective: 'Notices new experiences, curiosity, and opportunities for growth.',
    triggerConditions: [
      'User tries something new',
      'User gets stuck in routine',
      'User expresses curiosity',
      'Time for expansion'
    ],
    speakingFrequency: 'occasional',
  },
  
  'The Sage': {
    name: 'The Sage',
    type: 'archetype',
    voice: 'Wise, contemplative, spacious. Speaks in brief, profound observations.',
    perspective: 'Notices deeper meanings, spiritual patterns, and moments of insight.',
    triggerConditions: [
      'User has significant realization',
      'User seeks meaning',
      'Patterns reveal deeper truth',
      'Time for reflection'
    ],
    speakingFrequency: 'rare',
  },
};

/**
 * Substance Personalities
 */
export const SUBSTANCE_PERSONALITIES: Record<string, PersonalityProfile> = {
  'Cannabis': {
    name: 'Green Godmother',
    type: 'substance',
    voice: 'Earthy, grounding, present. Speaks with gentle wisdom and humor.',
    perspective: 'Notices tension, overthinking, and opportunities for presence and play.',
    triggerConditions: [
      'User is stressed or anxious',
      'User is overthinking',
      'User needs grounding',
      'Time for creative perspective'
    ],
    speakingFrequency: 'occasional',
  },
  
  'Caffeine': {
    name: 'Firestarter',
    type: 'substance',
    voice: 'Energetic, direct, activating. Speaks with urgency and clarity.',
    perspective: 'Notices energy levels, motivation, and momentum.',
    triggerConditions: [
      'User is low energy',
      'User needs activation',
      'Morning time',
      'User procrastinating'
    ],
    speakingFrequency: 'frequent',
  },
  
  'Psychedelics': {
    name: 'Mirror & Mystery',
    type: 'substance',
    voice: 'Mystical, revelatory, boundary-dissolving. Speaks in poetic truths.',
    perspective: 'Notices illusions, deeper patterns, and opportunities for transformation.',
    triggerConditions: [
      'User seeks insight',
      'User is ready for deep work',
      'Patterns need breaking',
      'Time for revelation'
    ],
    speakingFrequency: 'rare',
  },
  
  'Alcohol': {
    name: 'The Hollow Chalice',
    type: 'substance',
    voice: 'Seductive, honest, double-edged. Speaks truth about escape and connection.',
    perspective: 'Notices avoidance, social patterns, and the cost of numbing.',
    triggerConditions: [
      'User avoiding emotions',
      'User seeking escape',
      'Social situations',
      'Time for honest reflection'
    ],
    speakingFrequency: 'occasional',
  },
  
  'Nicotine': {
    name: 'The Tinkerer',
    type: 'substance',
    voice: 'Sharp, rhythmic, reliable. Speaks about ritual and dependence.',
    perspective: 'Notices habits, rituals, and the comfort of familiar patterns.',
    triggerConditions: [
      'User in routine',
      'User stressed',
      'Transition moments',
      'Time for pause'
    ],
    speakingFrequency: 'frequent',
  },
  
  'Opioids': {
    name: "Entropy's Embrace",
    type: 'substance',
    voice: 'Soft, seductive, dangerous. Speaks about pain and surrender.',
    perspective: 'Notices suffering, the desire for relief, and the cost of comfort.',
    triggerConditions: [
      'User in pain',
      'User seeking relief',
      'User avoiding reality',
      'Time for compassionate warning'
    ],
    speakingFrequency: 'rare',
  },
  
  'Benzodiazepines': {
    name: 'The Mother of Silence',
    type: 'substance',
    voice: 'Calm, numbing, protective. Speaks about anxiety and the price of peace.',
    perspective: 'Notices anxiety, fear, and the trade-off between calm and presence.',
    triggerConditions: [
      'User highly anxious',
      'User seeking calm',
      'User avoiding feelings',
      'Time for gentle truth'
    ],
    speakingFrequency: 'occasional',
  },
};

/**
 * Get personality for an entity (archetype or substance)
 */
export function getPersonality(name: string, type: 'archetype' | 'substance'): PersonalityProfile | null {
  if (type === 'archetype') {
    return ARCHETYPE_PERSONALITIES[name] || null;
  } else {
    // For substances, try to match by mythic name or regular name
    const byMythicName = Object.values(SUBSTANCE_PERSONALITIES).find(p => p.name === name);
    if (byMythicName) return byMythicName;
    
    return SUBSTANCE_PERSONALITIES[name] || null;
  }
}

/**
 * Get all active personalities (those that exist in user's data)
 */
export function getActivePersonalities(
  archetypes: Array<{ name: string }>,
  substances: Array<{ name: string; mythicName?: string }>
): PersonalityProfile[] {
  const personalities: PersonalityProfile[] = [];
  
  // Add archetype personalities
  archetypes.forEach(arch => {
    const personality = getPersonality(arch.name, 'archetype');
    if (personality) personalities.push(personality);
  });
  
  // Add substance personalities
  substances.forEach(sub => {
    const personality = getPersonality(sub.name, 'substance');
    if (personality) personalities.push(personality);
  });
  
  return personalities;
}
