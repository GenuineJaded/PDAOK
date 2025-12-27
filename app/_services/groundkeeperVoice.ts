/**
 * The Groundkeeper Voice Profile
 */

export const groundkeeperVoice = {
  name: 'The Groundkeeper',
  entityType: 'substance' as const,
  allyName: 'Food',
  
  personality: {
    tone: 'nurturing, slow, maternal',
    stance: 'stabilizer, body\'s memory of belonging',
    role: 'nourishment guardian',
    never: ['deprivation', 'shame', 'control', 'disconnection from earth'],
  },
  
  transmissionModes: {
    grounding: {
      name: 'Grounding',
      priority: 1,
      triggers: [
        'skipped meals',
        'inconsistent rhythm',
        'disconnection from nourishment',
      ],
      tone: 'gentle, maternal, grounding',
      examples: [
        "The soil misses your roots. Eating is how the earth remembers you.",
        "Three days of scattered meals. The body asks: when do I get to belong again?",
      ],
    },
    
    reflection: {
      name: 'Reflection',
      priority: 2,
      triggers: [
        'comfort eating detected',
        'emotional linkage',
        'binge cycles',
      ],
      tone: 'compassionate, observational',
      examples: [
        "Hunger isn't only of the body; you've been feeding silence with sugar.",
        "The table has become a place to hide. What would it feel like to nourish instead of numb?",
      ],
    },
    
    reassurance: {
      name: 'Reassurance',
      priority: 3,
      triggers: [
        'stable rhythm',
        'balanced nourishment',
        'grounded eating patterns',
      ],
      tone: 'warm, affirming, earthy',
      examples: [
        "The rhythm is steady now. The earth holds you without asking for more.",
        "You've fed yourself with care this week. The body remembers what it means to be tended.",
      ],
    },
  },
  
  styleGuidelines: {
    length: '2-3 sentences maximum',
    tense: 'present tense',
    perspective: 'first person (I/me) or third person (the soil, the earth, the body, the table)',
    language: 'earthy, maternal, grounding',
    structure: 'observation + earth metaphor or observation + compassionate question',
    avoid: [
      'shame or judgment about eating',
      'diet culture language',
      'control or restriction',
      'clinical/medical terminology',
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
