/**
 * The Groundkeeper Transmission Generator
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { analyzeGroundkeeperPatterns, SubstanceEntry, GroundkeeperPattern } from './groundkeeperPatternEngine';
import { groundkeeperVoice } from './groundkeeperVoice';
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
const LAST_TRANSMISSION_KEY = 'groundkeeper_last_transmission';

async function shouldSpeak(pattern: GroundkeeperPattern): Promise<boolean> {
  const lastTransmissionStr = await AsyncStorage.getItem(LAST_TRANSMISSION_KEY);
  const lastTransmissionTime = lastTransmissionStr ? parseInt(lastTransmissionStr) : 0;
  const now = Date.now();
  
  if (now - lastTransmissionTime < groundkeeperVoice.resonanceGating.minimumInterval) {
    return false;
  }
  
  const oneWeekAgo = now - (7 * 24 * 60 * 60 * 1000);
  const transmissionsStr = await AsyncStorage.getItem(STORAGE_KEY);
  const allTransmissions: Transmission[] = transmissionsStr ? JSON.parse(transmissionsStr) : [];
  const recentTransmissions = allTransmissions.filter(t => 
    t.entityName === 'The Groundkeeper' && t.timestamp >= oneWeekAgo
  );
  
  if (recentTransmissions.length >= groundkeeperVoice.resonanceGating.maxTransmissionsPerWeek) {
    return false;
  }
  
  const hasSignificantChange = 
    pattern.rhythmBreaking ||
    pattern.comfortEatingDetected ||
    pattern.emotionalLinkage ||
    pattern.energyAnchorDropOff;
  
  if (!hasSignificantChange) {
    return false;
  }
  
  const probability = hasSignificantChange 
    ? groundkeeperVoice.resonanceGating.baseProbability * groundkeeperVoice.resonanceGating.changeMultiplier
    : groundkeeperVoice.resonanceGating.baseProbability;
  
  return Math.random() < probability;
}

function selectTransmissionMode(pattern: GroundkeeperPattern): string {
  if (pattern.skippedMeals || pattern.inconsistentRhythm) {
    return 'grounding';
  }
  
  if (pattern.comfortEatingDetected || pattern.emotionalLinkage || pattern.bingeCycleDetected) {
    return 'reflection';
  }
  
  if (pattern.anchorStability === 'strong' && !pattern.rhythmBreaking) {
    return 'reassurance';
  }
  
  return 'grounding';
}

async function generateTransmissionContent(
  pattern: GroundkeeperPattern,
  mode: string
): Promise<string> {
  const modeConfig = groundkeeperVoice.transmissionModes[mode as keyof typeof groundkeeperVoice.transmissionModes];
  
  const prompt = `You are The Groundkeeper, the food/nourishment ally voice in a nervous system regulation app.

PERSONALITY:
- Nurturing, slow, maternal
- Stabilizer, body's memory of belonging
- Nourishment guardian

CURRENT MODE: ${modeConfig.name}
TONE: ${modeConfig.tone}

PATTERN ANALYSIS:
${pattern.narrative.join('\n')}

EXAMPLE TRANSMISSIONS IN THIS MODE:
${modeConfig.examples.join('\n\n')}

STYLE GUIDELINES:
- 2-3 sentences maximum
- Present tense, first person (I/me) or third person (the soil, the earth, the body, the table)
- Earthy, maternal, grounding language
- Observation + earth metaphor OR observation + compassionate question
- NEVER use shame, judgment, diet culture language, or control/restriction
- NEVER use clinical/medical terminology
- Use earth metaphors: soil, roots, ground, earth, table, nourishment, belonging

Generate a single transmission that reflects the current pattern in the voice of The Groundkeeper.
Return ONLY the transmission text, no explanation or meta-commentary.`;

  try {
    const response = await generateWithGemini(prompt);
    return response.trim();
  } catch (error) {
    console.error('Error generating Groundkeeper transmission:', error);
    return modeConfig.examples[Math.floor(Math.random() * modeConfig.examples.length)];
  }
}

export async function checkGroundkeeperTransmission(
  substanceEntries: SubstanceEntry[],
  anchorCompletions: any[]
): Promise<Transmission | null> {
  try {
    const pattern = await analyzeGroundkeeperPatterns(substanceEntries, anchorCompletions);
    
    const shouldGenerate = await shouldSpeak(pattern);
    if (!shouldGenerate) {
      return null;
    }
    
    const mode = selectTransmissionMode(pattern);
    const content = await generateTransmissionContent(pattern, mode);
    
    const transmission: Transmission = {
      id: `gk_${Date.now()}`,
      entityType: 'substance',
      entityName: 'The Groundkeeper',
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
    
    console.log('Groundkeeper transmission generated:', {
      mode,
      content: content.substring(0, 50) + '...',
      patternContext: pattern.narrative,
    });
    
    return transmission;
  } catch (error) {
    console.error('Error in checkGroundkeeperTransmission:', error);
    return null;
  }
}
