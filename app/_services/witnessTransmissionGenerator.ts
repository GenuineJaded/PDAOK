/**
 * Witness Transmission Generator
 * 
 * Integrates Pattern Engine + Witness Voice into the transmission system
 */

import { analyzePatterns, shouldWitnessSpeak, PatternSummary } from './patternEngine';
import { generateWitnessReflection, validateWitnessVoice, WITNESS_CONFIG } from './witnessVoice';
import { Transmission } from './transmissionGenerator';
import AsyncStorage from '@react-native-async-storage/async-storage';

const WITNESS_LAST_TRANSMISSION_KEY = '@pda_witness_last_transmission';
const WITNESS_PATTERN_METADATA_KEY = '@pda_witness_pattern_metadata';

/**
 * Extended transmission with pattern metadata
 */
export interface WitnessTransmission extends Transmission {
  patternMetadata?: PatternSummary;
}

/**
 * Check if enough time has passed since last Witness transmission
 */
async function canWitnessSpeak(): Promise<boolean> {
  try {
    const lastTransmissionStr = await AsyncStorage.getItem(WITNESS_LAST_TRANSMISSION_KEY);
    if (!lastTransmissionStr) return true;
    
    const lastTransmission = new Date(lastTransmissionStr);
    const now = new Date();
    const hoursSince = (now.getTime() - lastTransmission.getTime()) / (1000 * 60 * 60);
    
    return hoursSince >= WITNESS_CONFIG.minHoursBetweenTransmissions;
  } catch (error) {
    console.error('Error checking Witness last transmission:', error);
    return true;
  }
}

/**
 * Update last Witness transmission time
 */
async function updateWitnessLastTransmission(): Promise<void> {
  try {
    await AsyncStorage.setItem(WITNESS_LAST_TRANSMISSION_KEY, new Date().toISOString());
  } catch (error) {
    console.error('Error updating Witness last transmission:', error);
  }
}

/**
 * Store pattern metadata for debugging/tuning
 */
async function storePatternMetadata(pattern: PatternSummary): Promise<void> {
  try {
    // Keep last 10 pattern summaries
    const existingJson = await AsyncStorage.getItem(WITNESS_PATTERN_METADATA_KEY);
    const existing: PatternSummary[] = existingJson ? JSON.parse(existingJson) : [];
    
    existing.unshift(pattern);
    if (existing.length > 10) {
      existing.splice(10);
    }
    
    await AsyncStorage.setItem(WITNESS_PATTERN_METADATA_KEY, JSON.stringify(existing));
  } catch (error) {
    console.error('Error storing pattern metadata:', error);
  }
}

/**
 * Generate a Witness transmission if conditions are met
 * Returns null if conditions not met or generation fails
 */
export async function generateWitnessTransmission(force: boolean = false): Promise<WitnessTransmission | null> {
  try {
    console.log('[Witness] Checking if conditions are met...');
    
    // Check timing constraint
    if (!force) {
      const canSpeak = await canWitnessSpeak();
      if (!canSpeak) {
        console.log('[Witness] Too soon since last transmission');
        return null;
      }
    }
    
    // Analyze patterns
    console.log('[Witness] Analyzing patterns...');
    const pattern = await analyzePatterns(WITNESS_CONFIG.patternWindowDays);
    
    // Store metadata for debugging
    await storePatternMetadata(pattern);
    
    // Check if Witness should speak based on patterns
    if (!force) {
      const shouldSpeak = shouldWitnessSpeak(pattern, {
        minHoursSinceLastTransmission: WITNESS_CONFIG.minHoursBetweenTransmissions,
        baseChanceToSpeak: WITNESS_CONFIG.baseChanceToSpeak,
      });
      
      if (!shouldSpeak) {
        console.log('[Witness] Conditions not met for speaking');
        return null;
      }
    }
    
    // Generate reflection
    console.log('[Witness] Generating reflection...');
    const message = await generateWitnessReflection(pattern);
    
    // Validate voice
    if (!validateWitnessVoice(message)) {
      console.warn('[Witness] Generated reflection failed voice validation:', message);
      // Continue anyway - validation is just a safety check
    }
    
    // Update last transmission time
    await updateWitnessLastTransmission();
    
    // Create transmission
    const transmission: WitnessTransmission = {
      id: `witness-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: WITNESS_CONFIG.entityType,
      entityName: WITNESS_CONFIG.entityName,
      entityMythicName: WITNESS_CONFIG.entityName, // Witness doesn't have separate mythic name
      message,
      timestamp: new Date(),
      patternMetadata: pattern,
    };
    
    console.log('[Witness] Transmission generated:', message);
    
    return transmission;
  } catch (error) {
    console.error('[Witness] Error generating transmission:', error);
    return null;
  }
}

/**
 * Get recent pattern metadata for debugging
 */
export async function getRecentPatternMetadata(): Promise<PatternSummary[]> {
  try {
    const json = await AsyncStorage.getItem(WITNESS_PATTERN_METADATA_KEY);
    return json ? JSON.parse(json) : [];
  } catch (error) {
    console.error('Error loading pattern metadata:', error);
    return [];
  }
}

/**
 * Clear Witness state (for testing)
 */
export async function clearWitnessState(): Promise<void> {
  await AsyncStorage.removeItem(WITNESS_LAST_TRANSMISSION_KEY);
  await AsyncStorage.removeItem(WITNESS_PATTERN_METADATA_KEY);
  console.log('[Witness] State cleared');
}
