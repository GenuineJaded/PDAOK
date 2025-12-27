/**
 * The Alchemist Transmission Generator
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { analyzeAlchemistPatterns, SubstanceEntry, AlchemistPattern } from './alchemistPatternEngine';
import { alchemistVoice } from './alchemistVoice';
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
const LAST_TRANSMISSION_KEY = 'alchemist_last_transmission';

async function shouldSpeak(pattern: AlchemistPattern): Promise<boolean> {
  const lastTransmissionStr = await AsyncStorage.getItem(LAST_TRANSMISSION_KEY);
  const lastTransmissionTime = lastTransmissionStr ? parseInt(lastTransmissionStr) : 0;
  const now = Date.now();
  
  if (now - lastTransmissionTime < alchemistVoice.resonanceGating.minimumInterval) {
    return false;
  }
  
  const oneWeekAgo = now - (7 * 24 * 60 * 60 * 1000);
  const transmissionsStr = await AsyncStorage.getItem(STORAGE_KEY);
  const allTransmissions: Transmission[] = transmissionsStr ? JSON.parse(transmissionsStr) : [];
  const recentTransmissions = allTransmissions.filter(t => 
    t.entityName === 'The Alchemist' && t.timestamp >= oneWeekAgo
  );
  
  if (recentTransmissions.length >= alchemistVoice.resonanceGating.maxTransmissionsPerWeek) {
    return false;
  }
  
  const hasSignificantChange = 
    pattern.dependenceSignals ||
    pattern.jitterPattern ||
    pattern.scatteredFocus;
  
  if (!hasSignificantChange) {
    return false;
  }
  
  const probability = hasSignificantChange 
    ? alchemistVoice.resonanceGating.baseProbability * alchemistVoice.resonanceGating.changeMultiplier
    : alchemistVoice.resonanceGating.baseProbability;
  
  return Math.random() < probability;
}

function selectTransmissionMode(pattern: AlchemistPattern): string {
  if (pattern.scatteredFocus || pattern.intentionlessUses >= 3) {
    return 'curiosity';
  }
  
  if (pattern.jitterPattern || pattern.anchorFragmentation) {
    return 'synthesis';
  }
  
  if (pattern.dependenceSignals) {
    return 'boundaryPrompt';
  }
  
  return 'curiosity';
}

async function generateTransmissionContent(
  pattern: AlchemistPattern,
  mode: string
): Promise<string> {
  const modeConfig = alchemistVoice.transmissionModes[mode as keyof typeof alchemistVoice.transmissionModes];
  
  const prompt = `You are The Alchemist, the nicotine/caffeine/cognitive alteration ally voice in a nervous system regulation app.

PERSONALITY:
- Brisk, inquisitive, lightly mercurial
- Transformer, the nervous system's subtle chemist
- Micro-pattern observer

CURRENT MODE: ${modeConfig.name}
TONE: ${modeConfig.tone}

PATTERN ANALYSIS:
${pattern.narrative.join('\n')}

EXAMPLE TRANSMISSIONS IN THIS MODE:
${modeConfig.examples.join('\n\n')}

STYLE GUIDELINES:
- 2-3 sentences maximum
- Present tense, first person (I/me) or third person (the chemistry, the elements, the formula)
- Alchemical, brisk, inquisitive language
- Observation + alchemical metaphor OR observation + curious question
- NEVER encourage mindless use or promote jitter
- NEVER use clinical/medical terminology or judgment
- Use alchemical metaphors: fires, sparks, elements, chemistry, formula, vessel, dose

Generate a single transmission that reflects the current pattern in the voice of The Alchemist.
Return ONLY the transmission text, no explanation or meta-commentary.`;

  try {
    const response = await generateWithGemini(prompt);
    return response.trim();
  } catch (error) {
    console.error('Error generating Alchemist transmission:', error);
    return modeConfig.examples[Math.floor(Math.random() * modeConfig.examples.length)];
  }
}

export async function checkAlchemistTransmission(
  substanceEntries: SubstanceEntry[],
  anchorCompletions: any[]
): Promise<Transmission | null> {
  try {
    const pattern = await analyzeAlchemistPatterns(substanceEntries, anchorCompletions);
    
    const shouldGenerate = await shouldSpeak(pattern);
    if (!shouldGenerate) {
      return null;
    }
    
    const mode = selectTransmissionMode(pattern);
    const content = await generateTransmissionContent(pattern, mode);
    
    const transmission: Transmission = {
      id: `alch_${Date.now()}`,
      entityType: 'substance',
      entityName: 'The Alchemist',
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
    
    console.log('Alchemist transmission generated:', {
      mode,
      content: content.substring(0, 50) + '...',
      patternContext: pattern.narrative,
    });
    
    return transmission;
  } catch (error) {
    console.error('Error in checkAlchemistTransmission:', error);
    return null;
  }
}
