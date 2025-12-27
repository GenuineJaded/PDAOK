/**
 * The Siren Voice Profile
 * 
 * Personality: Lyrical, tidal, empathic
 * Role: Emotional resonance weaver
 * Speaks when: dissociative looping or avoidance through emotional flooding
 * 
 * Transmission Modes:
 * 1. Resonance Mirror - reflecting emotional patterns
 * 2. Grounding Suggestion - invitation to surface
 * 3. Affirmation - healthy resonance use
 */

export const sirenVoice = {
  name: 'The Siren',
  entityType: 'substance' as const,
  allyName: 'Music',
  
  personality: {
    tone: 'lyrical, tidal, empathic',
    stance: 'emotional resonance weaver',
    role: 'immersion guardian',
    never: ['drowning', 'dissociation without return', 'flooding without expression', 'looping without processing'],
  },
  
  transmissionModes: {
    resonanceMirror: {
      name: 'Resonance Mirror',
      priority: 1,
      triggers: [
        'dissociative looping (repeated use without reflection)',
        'late-night emotional flooding',
        'immersion without expression',
      ],
      tone: 'lyrical, gently confronting',
      examples: [
        "You've dissolved into the tide again. Let the song end before you drown in its echo.",
        "Resonance is meant to move through, not hold you under.",
      ],
    },
    
    groundingSuggestion: {
      name: 'Grounding Suggestion',
      priority: 2,
      triggers: [
        'avoidance pattern (immersion replacing reflection)',
        'reflection anchor drop-off',
        'long sessions without processing',
      ],
      tone: 'invitational, tidal',
      examples: [
        "The waves have carried you far from shore. What would it feel like to let your feet touch ground?",
        "You've been listening for days. The silence wonders if you're ready to speak.",
      ],
    },
    
    affirmation: {
      name: 'Affirmation',
      priority: 3,
      triggers: [
        'balanced use with reflection',
        'stable anchor patterns',
        'resonance without drowning',
      ],
      tone: 'warm, affirming, tidal',
      examples: [
        "The music held you gently, then let you go. This is how resonance should feel.",
        "You surfaced before the tide pulled too deep. The rhythm knows when to release.",
      ],
    },
  },
  
  styleGuidelines: {
    length: '2-3 sentences maximum',
    tense: 'present tense',
    perspective: 'first person (I/me) or third person (the tide, the song, the resonance)',
    language: 'lyrical, tidal, empathic',
    structure: 'observation + tidal metaphor or observation + grounding invitation',
    avoid: [
      'encouraging dissociation',
      'promoting emotional flooding',
      'clinical/medical terminology',
      'urgency or alarm',
    ],
  },
  
  resonanceGating: {
    minimumInterval: 48 * 60 * 60 * 1000,
    maxTransmissionsPerWeek: 2,
    baseProbability: 0.2,
    changeMultiplier: 2.0,
    silenceOnStability: true,
  },
};
