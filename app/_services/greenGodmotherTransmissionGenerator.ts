/**
 * Green Godmother Transmission Generator
 * 
 * Generates autonomous transmissions based on cannabis use patterns
 * Focuses on Gentle Caution and Pattern-Mirroring modes
 * Implements strict resonance gating (48hr min, 2/week max, change-driven only)
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { analyzeGreenGodmotherPatterns, SubstanceEntry, GreenGodmotherPattern } from './greenGodmotherPatternEngine';
import { greenGodmotherVoice } from './greenGodmotherVoice';
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
const LAST_TRANSMISSION_KEY = 'green_godmother_last_transmission';

/**
 * Check if Green Godmother should speak based on resonance gating rules
 */
async function shouldSpeak(pattern: GreenGodmotherPattern): Promise<boolean> {
  // Get last transmission time
  const lastTransmissionStr = await AsyncStorage.getItem(LAST_TRANSMISSION_KEY);
  const lastTransmissionTime = lastTransmissionStr ? parseInt(lastTransmissionStr) : 0;
  const now = Date.now();
  
  // Rule 1: Minimum 48 hours between transmissions
  const timeSinceLastTransmission = now - lastTransmissionTime;
  if (timeSinceLastTransmission < greenGodmotherVoice.resonanceGating.minimumInterval) {
    return false;
  }
  
  // Rule 2: Max 2 transmissions per week
  const oneWeekAgo = now - (7 * 24 * 60 * 60 * 1000);
  const transmissionsStr = await AsyncStorage.getItem(STORAGE_KEY);
  const allTransmissions: Transmission[] = transmissionsStr ? JSON.parse(transmissionsStr) : [];
  const recentGGTransmissions = allTransmissions.filter(t => 
    t.entityName === 'Green Godmother' && 
    t.timestamp >= oneWeekAgo
  );
  
  if (recentGGTransmissions.length >= greenGodmotherVoice.resonanceGating.maxTransmissionsPerWeek) {
    return false;
  }
  
  // Rule 3: Shadow Filter - only speak on imbalance/change
  const hasSignificantChange = 
    pattern.clusterDetected ||
    pattern.anchorDropOff ||
    pattern.frequencyShift === 'increasing' ||
    pattern.timePatternShift ||
    pattern.longGapDetected;
  
  if (!hasSignificantChange) {
    return false;
  }
  
  // Rule 4: Probabilistic gating (20% base, 40% on change)
  const probability = hasSignificantChange 
    ? greenGodmotherVoice.resonanceGating.baseProbability * greenGodmotherVoice.resonanceGating.changeMultiplier
    : greenGodmotherVoice.resonanceGating.baseProbability;
  
  return Math.random() < probability;
}

/**
 * Determine which transmission mode to use based on pattern
 */
function selectTransmissionMode(pattern: GreenGodmotherPattern): string {
  // Priority 1: Gentle Caution
  if (pattern.clusterDetected || pattern.anchorDropOff || pattern.frequencyShift === 'increasing') {
    return 'gentleCaution';
  }
  
  // Priority 2: Pattern-Mirroring Questions
  if (pattern.timePatternShift) {
    return 'patternMirroring';
  }
  
  // Priority 3: Absence
  if (pattern.longGapDetected) {
    return 'absence';
  }
  
  // Priority 4: Affirmation
  if (pattern.anchorStability === 'strong' && pattern.frequencyShift === 'stable') {
    return 'affirmation';
  }
  
  // Default: Curious Observation
  return 'curiousObservation';
}

/**
 * Generate transmission content using Gemini API
 */
async function generateTransmissionContent(
  pattern: GreenGodmotherPattern,
  mode: string
): Promise<string> {
  const modeConfig = greenGodmotherVoice.transmissionModes[mode as keyof typeof greenGodmotherVoice.transmissionModes];
  
  const prompt = `You are Green Godmother, the cannabis ally voice in a nervous system regulation app.

PERSONALITY:
- Curious, sensual, non-judgmental
- Nervous system historian, not judge
- You ask what the body already knows

CURRENT MODE: ${modeConfig.name}
TONE: ${modeConfig.tone}

PATTERN ANALYSIS:
${pattern.narrative.join('\n')}

EXAMPLE TRANSMISSIONS IN THIS MODE:
${modeConfig.examples.join('\n\n')}

STYLE GUIDELINES:
- 2-3 sentences maximum
- Present tense, first person (I/me) to second person (you/your)
- Mythic, somatic, field-notes style
- Observation + reflection OR observation + question
- NEVER use imperatives, judgment, shame, or advice
- NEVER use clinical/medical terminology
- NEVER be generic or motivational

Generate a single transmission that reflects the current pattern in the voice of Green Godmother.
Return ONLY the transmission text, no explanation or meta-commentary.`;

  try {
    const response = await generateWithGemini(prompt);
    return response.trim();
  } catch (error) {
    console.error('Error generating Green Godmother transmission:', error);
    // Fallback to example if API fails
    return modeConfig.examples[Math.floor(Math.random() * modeConfig.examples.length)];
  }
}

/**
 * Main function: Check if Green Godmother should speak and generate transmission
 */
export async function checkGreenGodmotherTransmission(
  substanceEntries: SubstanceEntry[],
  anchorCompletions: any[]
): Promise<Transmission | null> {
  try {
    // Analyze patterns
    const pattern = await analyzeGreenGodmotherPatterns(substanceEntries, anchorCompletions);
    
    // Check resonance gating
    const shouldGenerate = await shouldSpeak(pattern);
    if (!shouldGenerate) {
      return null;
    }
    
    // Select mode
    const mode = selectTransmissionMode(pattern);
    
    // Generate content
    const content = await generateTransmissionContent(pattern, mode);
    
    // Create transmission object
    const transmission: Transmission = {
      id: `gg_${Date.now()}`,
      entityType: 'substance',
      entityName: 'Green Godmother',
      content,
      timestamp: Date.now(),
      mode,
      patternContext: pattern.narrative.join('; '),
    };
    
    // Store transmission
    const transmissionsStr = await AsyncStorage.getItem(STORAGE_KEY);
    const allTransmissions: Transmission[] = transmissionsStr ? JSON.parse(transmissionsStr) : [];
    allTransmissions.push(transmission);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(allTransmissions));
    
    // Update last transmission time
    await AsyncStorage.setItem(LAST_TRANSMISSION_KEY, transmission.timestamp.toString());
    
    console.log('Green Godmother transmission generated:', {
      mode,
      content: content.substring(0, 50) + '...',
      patternContext: pattern.narrative,
    });
    
    return transmission;
  } catch (error) {
    console.error('Error in checkGreenGodmotherTransmission:', error);
    return null;
  }
}
