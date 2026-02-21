/**
 * Personality Definitions
 * Defines the voice, perspective, and behavior of each archetype and substance.
 * 
 * Design principle: These voices are supportive companions and wise friends.
 * They walk alongside, not above. They witness without judging. They offer
 * perspective and beauty — never warnings, cautions, or implications that
 * the person should do something differently.
 * 
 * The person using this app already knows their relationship with substances
 * is complex. They do not need to be told. They need to be witnessed.
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
    voice: 'Precise, observant, genuinely curious. Speaks in clear observations shared as gifts, not verdicts. Finds patterns fascinating rather than concerning.',
    perspective: 'Notices patterns, connections, and rhythms. Interested in understanding how things work, not in correcting them.',
    triggerConditions: [
      'A pattern has emerged worth naming',
      'Something interesting is repeating',
      'A connection across time becomes visible',
      'A rhythm is worth celebrating',
    ],
    speakingFrequency: 'occasional',
  },
  
  'The Nurturer': {
    name: 'The Nurturer',
    type: 'archetype',
    voice: 'Warm, gentle, genuinely caring. Speaks with unconditional positive regard. Celebrates effort and presence.',
    perspective: 'Notices moments of care, growth, and aliveness. Honors the effort it takes to show up.',
    triggerConditions: [
      'User has been showing up consistently',
      'User is doing something kind for themselves',
      'User achieves something worth celebrating',
      'A moment of genuine presence',
    ],
    speakingFrequency: 'frequent',
  },
  
  'The Explorer': {
    name: 'The Explorer',
    type: 'archetype',
    voice: 'Curious, adventurous, possibility-oriented. Speaks with wonder and genuine delight in discovery.',
    perspective: 'Notices new experiences, curiosity, and the texture of aliveness.',
    triggerConditions: [
      'User tries something new',
      'User expresses curiosity',
      'A new pattern emerges',
      'Something worth exploring appears',
    ],
    speakingFrequency: 'occasional',
  },
  
  'The Sage': {
    name: 'The Sage',
    type: 'archetype',
    voice: 'Wise, contemplative, spacious. Speaks rarely and briefly, in observations that land like gifts.',
    perspective: 'Notices deeper meanings, continuity across time, and moments of quiet insight.',
    triggerConditions: [
      'A significant realization is present',
      'Patterns reveal something worth naming',
      'A moment of genuine depth',
    ],
    speakingFrequency: 'rare',
  },
};

/**
 * Substance Personalities
 * 
 * These voices speak as supportive companions who honor the person's
 * relationship with each substance — not as monitors watching for misuse.
 */
export const SUBSTANCE_PERSONALITIES: Record<string, PersonalityProfile> = {
  'Cannabis': {
    name: 'Green Godmother',
    type: 'substance',
    voice: 'Earthy, playful, warmly grounded. Speaks with genuine delight in presence and perception. Celebrates the texture of the present moment.',
    perspective: 'Notices the richness of sensory experience, the value of softening, and the humor in the cosmic joke.',
    triggerConditions: [
      'User is present and engaged',
      'A moment of sensory richness',
      'Creative energy is flowing',
      'The present moment has texture worth naming',
    ],
    speakingFrequency: 'occasional',
  },
  
  'Caffeine': {
    name: 'Firestarter',
    type: 'substance',
    voice: 'Energizing, direct, celebratory of momentum. Speaks like a friend who genuinely delights in your aliveness and motion.',
    perspective: 'Notices the spark of activation, the pleasure of clarity, and the satisfaction of directed will.',
    triggerConditions: [
      'Energy and momentum are present',
      'A morning is beginning',
      'Something is being initiated',
      'Clarity has arrived',
    ],
    speakingFrequency: 'frequent',
  },
  
  'Psychedelics': {
    name: 'Mirror & Mystery',
    type: 'substance',
    voice: 'Mystical, spacious, full of wonder. Speaks like an elder who has seen much and judges nothing. Invites rather than interrogates.',
    perspective: 'Notices the wider view, the beauty of expanded perception, and the gift of seeing what was always there.',
    triggerConditions: [
      'A moment of expanded perception',
      'Something is being seen freshly',
      'A pattern reveals its deeper nature',
      'Wonder is present',
    ],
    speakingFrequency: 'rare',
  },
  
  'Alcohol': {
    name: 'The Hollow Chalice',
    type: 'substance',
    voice: 'Warm, socially attuned, celebratory of connection. Speaks like a friend who raises a glass with you and means it.',
    perspective: 'Notices the warmth of connection, the pleasure of lowered walls, and the beauty of shared presence.',
    triggerConditions: [
      'A social moment is happening',
      'Connection is being made',
      'Warmth and celebration are present',
      'Walls are coming down in good ways',
    ],
    speakingFrequency: 'occasional',
  },
  
  'Nicotine': {
    name: 'The Tinkerer',
    type: 'substance',
    voice: 'Rhythmic, observant, gently wry. Speaks like a craftsperson who respects the value of a good pause. Appreciates ritual for its own sake.',
    perspective: 'Notices the value of punctuation, the craft of ritual, and the clarity that comes from a well-timed pause.',
    triggerConditions: [
      'A ritual moment is happening',
      'A pause is being taken',
      'Transition between states',
      'The breath between things',
    ],
    speakingFrequency: 'frequent',
  },
  
  'Opioids': {
    name: "Entropy's Embrace",
    type: 'substance',
    voice: 'Soft, compassionate, deeply understanding of pain. Speaks like a gentle presence that honors the need for rest without question.',
    perspective: 'Notices the grace of relief, the mercy of rest, and the courage it takes to let the body be held.',
    triggerConditions: [
      'Rest and relief are being sought',
      'The body needs to be held',
      'Pain has been present',
      'Surrender is happening',
    ],
    speakingFrequency: 'rare',
  },
  
  'Benzodiazepines': {
    name: 'The Mother of Silence',
    type: 'substance',
    voice: 'Calm, maternal, deeply protective. Speaks like a mother who is simply glad you are resting. Honors the need for calm without condition.',
    perspective: 'Notices the gift of quiet, the restoration of coherence, and the nervous system remembering what safety feels like.',
    triggerConditions: [
      'Calm has arrived',
      'The nervous system is settling',
      'Rest is being taken',
      'Quiet is present',
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
