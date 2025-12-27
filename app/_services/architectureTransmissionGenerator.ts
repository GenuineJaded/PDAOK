/**
 * The Architecture Transmission Generator
 * 
 * Generates autonomous transmissions based on stimulant use patterns
 * Focuses on structure, efficiency, and preventing depletion
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { analyzeArchitecturePatterns, SubstanceEntry, ArchitecturePattern } from './architecturePatternEngine';
import { architectureVoice } from './architectureVoice';
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
const LAST_TRANSMISSION_KEY = 'architecture_last_transmission';

async function shouldSpeak(pattern: ArchitecturePattern): Promise<boolean> {
  const lastTransmissionStr = await AsyncStorage.getItem(LAST_TRANSMISSION_KEY);
  const lastTransmissionTime = lastTransmissionStr ? parseInt(lastTransmissionStr) : 0;
  const now = Date.now();
  
  const timeSinceLastTransmission = now - lastTransmissionTime;
  if (timeSinceLastTransmission < architectureVoice.resonanceGating.minimumInterval) {
    return false;
  }
  
  const oneWeekAgo = now - (7 * 24 * 60 * 60 * 1000);
  const transmissionsStr = await AsyncStorage.getItem(STORAGE_KEY);
  const allTransmissions: Transmission[] = transmissionsStr ? JSON.parse(transmissionsStr) : [];
  const recentTransmissions = allTransmissions.filter(t => 
    t.entityName === 'The Architecture' && 
    t.timestamp >= oneWeekAgo
  );
  
  if (recentTransmissions.length >= architectureVoice.resonanceGating.maxTransmissionsPerWeek) {
    return false;
  }
  
  const hasSignificantChange = 
    pattern.rigidityDetected ||
    pattern.burstAndCrashDetected ||
    pattern.depletionSignals ||
    pattern.morningAnchorOveruse ||
    pattern.eveningAnchorDropOff;
  
  if (!hasSignificantChange) {
    return false;
  }
  
  const probability = hasSignificantChange 
    ? architectureVoice.resonanceGating.baseProbability * architectureVoice.resonanceGating.changeMultiplier
    : architectureVoice.resonanceGating.baseProbability;
  
  return Math.random() < probability;
}

function selectTransmissionMode(pattern: ArchitecturePattern): string {
  if (pattern.rigidityDetected) {
    return 'recalibration';
  }
  
  if (pattern.burstAndCrashDetected || pattern.morningAnchorOveruse || pattern.frequencyIncreasing) {
    return 'efficiencyMirror';
  }
  
  if (pattern.depletionSignals || pattern.eveningAnchorDropOff) {
    return 'stabilization';
  }
  
  return 'efficiencyMirror';
}

async function generateTransmissionContent(
  pattern: ArchitecturePattern,
  mode: string
): Promise<string> {
  const modeConfig = architectureVoice.transmissionModes[mode as keyof typeof architectureVoice.transmissionModes];
  
  const prompt = `You are The Architecture, the stimulant/focus ally voice in a nervous system regulation app.

PERSONALITY:
- Analytic clarity with reverence for form
- Precision engineer, structure incarnate
- Efficiency guardian

CURRENT MODE: ${modeConfig.name}
TONE: ${modeConfig.tone}

PATTERN ANALYSIS:
${pattern.narrative.join('\n')}

EXAMPLE TRANSMISSIONS IN THIS MODE:
${modeConfig.examples.join('\n\n')}

STYLE GUIDELINES:
- 2-3 sentences maximum
- Present tense, first person (I/me) or third person (the architecture, the frame, the structure)
- Precise, structural, reverent language
- Observation + structural metaphor OR observation + recalibration invitation
- NEVER push through depletion or promote rigidity
- NEVER use clinical/medical terminology or create urgency
- Use structural metaphors: scaffolds, frames, bolts, foundations, steel, whetstone

Generate a single transmission that reflects the current pattern in the voice of The Architecture.
Return ONLY the transmission text, no explanation or meta-commentary.`;

  try {
    const response = await generateWithGemini(prompt);
    return response.trim();
  } catch (error) {
    console.error('Error generating Architecture transmission:', error);
    return modeConfig.examples[Math.floor(Math.random() * modeConfig.examples.length)];
  }
}

export async function checkArchitectureTransmission(
  substanceEntries: SubstanceEntry[],
  anchorCompletions: any[]
): Promise<Transmission | null> {
  try {
    const pattern = await analyzeArchitecturePatterns(substanceEntries, anchorCompletions);
    
    const shouldGenerate = await shouldSpeak(pattern);
    if (!shouldGenerate) {
      return null;
    }
    
    const mode = selectTransmissionMode(pattern);
    const content = await generateTransmissionContent(pattern, mode);
    
    const transmission: Transmission = {
      id: `arch_${Date.now()}`,
      entityType: 'substance',
      entityName: 'The Architecture',
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
    
    console.log('Architecture transmission generated:', {
      mode,
      content: content.substring(0, 50) + '...',
      patternContext: pattern.narrative,
    });
    
    return transmission;
  } catch (error) {
    console.error('Error in checkArchitectureTransmission:', error);
    return null;
  }
}
