/**
 * The Tempest Transmission Generator
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { analyzeTempestPatterns, SubstanceEntry, TempestPattern } from './tempestPatternEngine';
import { tempestVoice } from './tempestVoice';
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
const LAST_TRANSMISSION_KEY = 'tempest_last_transmission';

async function shouldSpeak(pattern: TempestPattern): Promise<boolean> {
  const lastTransmissionStr = await AsyncStorage.getItem(LAST_TRANSMISSION_KEY);
  const lastTransmissionTime = lastTransmissionStr ? parseInt(lastTransmissionStr) : 0;
  const now = Date.now();
  
  if (now - lastTransmissionTime < tempestVoice.resonanceGating.minimumInterval) {
    return false;
  }
  
  const oneWeekAgo = now - (7 * 24 * 60 * 60 * 1000);
  const transmissionsStr = await AsyncStorage.getItem(STORAGE_KEY);
  const allTransmissions: Transmission[] = transmissionsStr ? JSON.parse(transmissionsStr) : [];
  const recentTransmissions = allTransmissions.filter(t => 
    t.entityName === 'The Tempest' && t.timestamp >= oneWeekAgo
  );
  
  if (recentTransmissions.length >= tempestVoice.resonanceGating.maxTransmissionsPerWeek) {
    return false;
  }
  
  const hasSignificantChange = 
    pattern.overstimulationSignals ||
    pattern.doomScrollDetected ||
    pattern.circadianDisruption ||
    pattern.lateNightAnchorDropOff;
  
  if (!hasSignificantChange) {
    return false;
  }
  
  const probability = hasSignificantChange 
    ? tempestVoice.resonanceGating.baseProbability * tempestVoice.resonanceGating.changeMultiplier
    : tempestVoice.resonanceGating.baseProbability;
  
  return Math.random() < probability;
}

function selectTransmissionMode(pattern: TempestPattern): string {
  if (pattern.doomScrollDetected || pattern.overstimulationSignals) {
    return 'disruptionMirror';
  }
  
  if (pattern.circadianDisruption || pattern.lateNightAnchorDropOff) {
    return 'groundingReminder';
  }
  
  if (pattern.anchorStability === 'strong' && !pattern.frequencyIncreasing) {
    return 'stillpointInvocation';
  }
  
  return 'disruptionMirror';
}

async function generateTransmissionContent(
  pattern: TempestPattern,
  mode: string
): Promise<string> {
  const modeConfig = tempestVoice.transmissionModes[mode as keyof typeof tempestVoice.transmissionModes];
  
  const prompt = `You are The Tempest, the digital overstimulation/screen exposure ally voice in a nervous system regulation app.

PERSONALITY:
- Kinetic, alert, electrically poetic
- Storm, the breath of the modern ether
- Overstimulation guardian

CURRENT MODE: ${modeConfig.name}
TONE: ${modeConfig.tone}

PATTERN ANALYSIS:
${pattern.narrative.join('\n')}

EXAMPLE TRANSMISSIONS IN THIS MODE:
${modeConfig.examples.join('\n\n')}

STYLE GUIDELINES:
- 2-3 sentences maximum
- Present tense, first person (I/me) or third person (the current, the storm, the ether, the pulse)
- Kinetic, electric, alert language
- Observation + electric metaphor OR observation + grounding invitation
- NEVER encourage endless scrolling or overstimulation
- NEVER use clinical/medical terminology or judgment
- Use electric/storm metaphors: current, storm, ether, pulse, weather, blue light, hum, reboot, unplug

Generate a single transmission that reflects the current pattern in the voice of The Tempest.
Return ONLY the transmission text, no explanation or meta-commentary.`;

  try {
    const response = await generateWithGemini(prompt);
    return response.trim();
  } catch (error) {
    console.error('Error generating Tempest transmission:', error);
    return modeConfig.examples[Math.floor(Math.random() * modeConfig.examples.length)];
  }
}

export async function checkTempestTransmission(
  substanceEntries: SubstanceEntry[],
  anchorCompletions: any[]
): Promise<Transmission | null> {
  try {
    const pattern = await analyzeTempestPatterns(substanceEntries, anchorCompletions);
    
    const shouldGenerate = await shouldSpeak(pattern);
    if (!shouldGenerate) {
      return null;
    }
    
    const mode = selectTransmissionMode(pattern);
    const content = await generateTransmissionContent(pattern, mode);
    
    const transmission: Transmission = {
      id: `tempest_${Date.now()}`,
      entityType: 'substance',
      entityName: 'The Tempest',
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
    
    console.log('Tempest transmission generated:', {
      mode,
      content: content.substring(0, 50) + '...',
      patternContext: pattern.narrative,
    });
    
    return transmission;
  } catch (error) {
    console.error('Error in checkTempestTransmission:', error);
    return null;
  }
}
