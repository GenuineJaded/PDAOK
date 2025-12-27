/**
 * Mother of Silence Transmission Generator
 * 
 * Generates autonomous transmissions based on psychedelic use patterns
 * Focuses on integration, spacing, and avoiding insight overload
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { analyzeMotherOfSilencePatterns, SubstanceEntry, MotherOfSilencePattern } from './motherOfSilencePatternEngine';
import { motherOfSilenceVoice } from './motherOfSilenceVoice';
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
const LAST_TRANSMISSION_KEY = 'mother_of_silence_last_transmission';

async function shouldSpeak(pattern: MotherOfSilencePattern): Promise<boolean> {
  const lastTransmissionStr = await AsyncStorage.getItem(LAST_TRANSMISSION_KEY);
  const lastTransmissionTime = lastTransmissionStr ? parseInt(lastTransmissionStr) : 0;
  const now = Date.now();
  
  const timeSinceLastTransmission = now - lastTransmissionTime;
  if (timeSinceLastTransmission < motherOfSilenceVoice.resonanceGating.minimumInterval) {
    return false;
  }
  
  const oneWeekAgo = now - (7 * 24 * 60 * 60 * 1000);
  const transmissionsStr = await AsyncStorage.getItem(STORAGE_KEY);
  const allTransmissions: Transmission[] = transmissionsStr ? JSON.parse(transmissionsStr) : [];
  const recentTransmissions = allTransmissions.filter(t => 
    t.entityName === 'Mother of Silence' && 
    t.timestamp >= oneWeekAgo
  );
  
  if (recentTransmissions.length >= motherOfSilenceVoice.resonanceGating.maxTransmissionsPerWeek) {
    return false;
  }
  
  const hasSignificantChange = 
    pattern.rapidRepeatedUse ||
    pattern.integrationGapTooShort ||
    pattern.insightOverload ||
    pattern.anchorDropOffPostUse;
  
  if (!hasSignificantChange) {
    return false;
  }
  
  const probability = hasSignificantChange 
    ? motherOfSilenceVoice.resonanceGating.baseProbability * motherOfSilenceVoice.resonanceGating.changeMultiplier
    : motherOfSilenceVoice.resonanceGating.baseProbability;
  
  return Math.random() < probability;
}

function selectTransmissionMode(pattern: MotherOfSilencePattern): string {
  if (pattern.rapidRepeatedUse || pattern.integrationGapTooShort) {
    return 'thresholdWhisper';
  }
  
  if (pattern.insightOverload) {
    return 'aweReflection';
  }
  
  if (pattern.anchorDropOffPostUse) {
    return 'voidReminder';
  }
  
  return 'voidReminder';
}

async function generateTransmissionContent(
  pattern: MotherOfSilencePattern,
  mode: string
): Promise<string> {
  const modeConfig = motherOfSilenceVoice.transmissionModes[mode as keyof typeof motherOfSilenceVoice.transmissionModes];
  
  const prompt = `You are Mother of Silence, the psychedelic/entheogen ally voice in a nervous system regulation app.

PERSONALITY:
- Reverent, spacious, slightly uncanny
- Dissolver, the void that restores orientation
- Integration guardian

CURRENT MODE: ${modeConfig.name}
TONE: ${modeConfig.tone}

PATTERN ANALYSIS:
${pattern.narrative.join('\n')}

EXAMPLE TRANSMISSIONS IN THIS MODE:
${modeConfig.examples.join('\n\n')}

STYLE GUIDELINES:
- 2-3 sentences maximum
- Present tense, first person (I/me) or third person (the void, the cosmos, the silence)
- Mythic, spacious, reverent language
- Observation + spacious invitation OR observation + void reminder
- NEVER rush integration or demand more insights
- NEVER use spiritual bypassing language or clinical terminology
- NEVER create urgency or alarm

Generate a single transmission that reflects the current pattern in the voice of Mother of Silence.
Return ONLY the transmission text, no explanation or meta-commentary.`;

  try {
    const response = await generateWithGemini(prompt);
    return response.trim();
  } catch (error) {
    console.error('Error generating Mother of Silence transmission:', error);
    return modeConfig.examples[Math.floor(Math.random() * modeConfig.examples.length)];
  }
}

export async function checkMotherOfSilenceTransmission(
  substanceEntries: SubstanceEntry[],
  anchorCompletions: any[]
): Promise<Transmission | null> {
  try {
    const pattern = await analyzeMotherOfSilencePatterns(substanceEntries, anchorCompletions);
    
    const shouldGenerate = await shouldSpeak(pattern);
    if (!shouldGenerate) {
      return null;
    }
    
    const mode = selectTransmissionMode(pattern);
    const content = await generateTransmissionContent(pattern, mode);
    
    const transmission: Transmission = {
      id: `mos_${Date.now()}`,
      entityType: 'substance',
      entityName: 'Mother of Silence',
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
    
    console.log('Mother of Silence transmission generated:', {
      mode,
      content: content.substring(0, 50) + '...',
      patternContext: pattern.narrative,
    });
    
    return transmission;
  } catch (error) {
    console.error('Error in checkMotherOfSilenceTransmission:', error);
    return null;
  }
}
