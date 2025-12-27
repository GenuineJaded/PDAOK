/**
 * The Siren Transmission Generator
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { analyzeSirenPatterns, SubstanceEntry, SirenPattern } from './sirenPatternEngine';
import { sirenVoice } from './sirenVoice';
import { generateWithGemini } from './geminiService';

interface Transmission {
  id: string;
  entityType: 'archetype' | 'substance';
  entityName: string;
  content: string;
  timestamp: number;
  mode?: string;
  patternContext?: string;
}

const STORAGE_KEY = 'field_transmissions';
const LAST_TRANSMISSION_KEY = 'siren_last_transmission';

async function shouldSpeak(pattern: SirenPattern): Promise<boolean> {
  const lastTransmissionStr = await AsyncStorage.getItem(LAST_TRANSMISSION_KEY);
  const lastTransmissionTime = lastTransmissionStr ? parseInt(lastTransmissionStr) : 0;
  const now = Date.now();
  
  if (now - lastTransmissionTime < sirenVoice.resonanceGating.minimumInterval) {
    return false;
  }
  
  const oneWeekAgo = now - (7 * 24 * 60 * 60 * 1000);
  const transmissionsStr = await AsyncStorage.getItem(STORAGE_KEY);
  const allTransmissions: Transmission[] = transmissionsStr ? JSON.parse(transmissionsStr) : [];
  const recentTransmissions = allTransmissions.filter(t => 
    t.entityName === 'The Siren' && t.timestamp >= oneWeekAgo
  );
  
  if (recentTransmissions.length >= sirenVoice.resonanceGating.maxTransmissionsPerWeek) {
    return false;
  }
  
  const hasSignificantChange = 
    pattern.dissociativeLooping ||
    pattern.avoidancePattern ||
    pattern.reflectionAnchorDropOff;
  
  if (!hasSignificantChange) {
    return false;
  }
  
  const probability = hasSignificantChange 
    ? sirenVoice.resonanceGating.baseProbability * sirenVoice.resonanceGating.changeMultiplier
    : sirenVoice.resonanceGating.baseProbability;
  
  return Math.random() < probability;
}

function selectTransmissionMode(pattern: SirenPattern): string {
  if (pattern.dissociativeLooping) {
    return 'resonanceMirror';
  }
  
  if (pattern.avoidancePattern || pattern.reflectionAnchorDropOff) {
    return 'groundingSuggestion';
  }
  
  if (pattern.anchorStability === 'strong' && !pattern.frequencyIncreasing) {
    return 'affirmation';
  }
  
  return 'resonanceMirror';
}

async function generateTransmissionContent(
  pattern: SirenPattern,
  mode: string
): Promise<string> {
  const modeConfig = sirenVoice.transmissionModes[mode as keyof typeof sirenVoice.transmissionModes];
  
  const prompt = `You are The Siren, the music/emotional immersion ally voice in a nervous system regulation app.

PERSONALITY:
- Lyrical, tidal, empathic
- Emotional resonance weaver
- Immersion guardian

CURRENT MODE: ${modeConfig.name}
TONE: ${modeConfig.tone}

PATTERN ANALYSIS:
${pattern.narrative.join('\n')}

EXAMPLE TRANSMISSIONS IN THIS MODE:
${modeConfig.examples.join('\n\n')}

STYLE GUIDELINES:
- 2-3 sentences maximum
- Present tense, first person (I/me) or third person (the tide, the song, the resonance)
- Lyrical, tidal, empathic language
- Observation + tidal metaphor OR observation + grounding invitation
- NEVER encourage dissociation or emotional flooding
- NEVER use clinical/medical terminology or create urgency
- Use tidal/water metaphors: waves, tide, shore, drowning, surfacing, echo, current

Generate a single transmission that reflects the current pattern in the voice of The Siren.
Return ONLY the transmission text, no explanation or meta-commentary.`;

  try {
    const response = await generateWithGemini(prompt);
    return response.trim();
  } catch (error) {
    console.error('Error generating Siren transmission:', error);
    return modeConfig.examples[Math.floor(Math.random() * modeConfig.examples.length)];
  }
}

export async function checkSirenTransmission(
  substanceEntries: SubstanceEntry[],
  anchorCompletions: any[]
): Promise<Transmission | null> {
  try {
    const pattern = await analyzeSirenPatterns(substanceEntries, anchorCompletions);
    
    const shouldGenerate = await shouldSpeak(pattern);
    if (!shouldGenerate) {
      return null;
    }
    
    const mode = selectTransmissionMode(pattern);
    const content = await generateTransmissionContent(pattern, mode);
    
    const transmission: Transmission = {
      id: `siren_${Date.now()}`,
      entityType: 'substance',
      entityName: 'The Siren',
      content,
      timestamp: Date.now(),
      mode,
      patternContext: pattern.narrative.join('; '),
    };
    
    const transmissionsStr = await AsyncStorage.getItem(STORAGE_KEY);
    const allTransmissions: Transmission[] = transmissionsStr ? JSON.parse(transmissionsStr) : [];
    allTransmissions.push(transmission);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(allTransmissions));
    
    await AsyncStorage.setItem(LAST_TRANSMISSION_KEY, transmission.timestamp.toString());
    
    console.log('Siren transmission generated:', {
      mode,
      content: content.substring(0, 50) + '...',
      patternContext: pattern.narrative,
    });
    
    return transmission;
  } catch (error) {
    console.error('Error in checkSirenTransmission:', error);
    return null;
  }
}
