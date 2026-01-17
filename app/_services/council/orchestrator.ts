/**
 * Council Orchestrator - The Breathing System
 * 
 * Coordinates the full cycle:
 * 1. Collect signals
 * 2. Determine relevant voices
 * 3. Generate petitions
 * 4. Arbiter decides
 * 5. Surface or silence
 * 
 * The system breathes: Inhale → Hold → Exhale → Stillness
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Petition,
  ArbiterDecision,
  BreathPhase,
  FieldState,
  VoiceId,
  Signal,
} from './types';
import { collectAllSignals, getSignalsInWindow } from './signalCollector';
import { generatePetitionsFromVoices, getRelevantVoices } from './voiceEngine';
import { evaluatePetitions, decayHeat } from './arbiter';
import { getVoiceIdentity } from './voiceIdentities';

// ============================================================================
// CONSTANTS
// ============================================================================

const FIELD_STATE_KEY = '@pda_field_state';
const TRANSMISSION_HISTORY_KEY = '@pda_council_transmissions';

// Breathing cycle durations (in milliseconds)
const BREATH_DURATIONS = {
  inhale: 30 * 60 * 1000,      // 30 minutes - user is active
  hold: 5 * 60 * 1000,         // 5 minutes - petitions form
  exhale: 10 * 60 * 1000,      // 10 minutes - transmissions surface
  stillness: 15 * 60 * 1000,   // 15 minutes - nothing speaks
};

// Minimum time between orchestration cycles
const MIN_CYCLE_INTERVAL = 30 * 60 * 1000; // 30 minutes

// ============================================================================
// FIELD STATE MANAGEMENT
// ============================================================================

/**
 * Get default field state
 */
function getDefaultFieldState(): FieldState {
  return {
    breathPhase: 'inhale',
    lastActivityAt: Date.now(),
    lastTransmissionAt: 0,
    activeVoices: [],
    fieldHeat: 0,
    dayPhase: getDayPhase(),
  };
}

/**
 * Get current day phase
 */
function getDayPhase(): 'morning' | 'afternoon' | 'evening' | 'late' {
  const hour = new Date().getHours();
  if (hour >= 4 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 22) return 'evening';
  return 'late';
}

/**
 * Load field state
 */
async function loadFieldState(): Promise<FieldState> {
  try {
    const json = await AsyncStorage.getItem(FIELD_STATE_KEY);
    if (!json) return getDefaultFieldState();
    
    const state = JSON.parse(json);
    state.dayPhase = getDayPhase();
    
    return state;
  } catch (error) {
    console.error('[Orchestrator] Error loading field state:', error);
    return getDefaultFieldState();
  }
}

/**
 * Save field state
 */
async function saveFieldState(state: FieldState): Promise<void> {
  try {
    await AsyncStorage.setItem(FIELD_STATE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('[Orchestrator] Error saving field state:', error);
  }
}

/**
 * Determine current breath phase based on activity
 */
function determineBreathPhase(state: FieldState): BreathPhase {
  const now = Date.now();
  const timeSinceActivity = now - state.lastActivityAt;
  const timeSinceTransmission = now - state.lastTransmissionAt;
  
  // If user was recently active, we're inhaling
  if (timeSinceActivity < BREATH_DURATIONS.inhale) {
    return 'inhale';
  }
  
  // If we just finished inhaling, hold briefly
  if (timeSinceActivity < BREATH_DURATIONS.inhale + BREATH_DURATIONS.hold) {
    return 'hold';
  }
  
  // If we haven't transmitted recently, exhale
  if (timeSinceTransmission > BREATH_DURATIONS.exhale + BREATH_DURATIONS.stillness) {
    return 'exhale';
  }
  
  // Otherwise, stillness
  return 'stillness';
}

// ============================================================================
// TRANSMISSION STORAGE
// ============================================================================

export interface CouncilTransmission {
  id: string;
  voiceId: VoiceId;
  voiceName: string;
  aspect: 'light' | 'shadow' | 'neutral';
  text: string;
  timestamp: Date;
  surface: 'toast' | 'transmission' | 'daily_synthesis';
  arbiterText?: string;
  themes: string[];
  read: boolean;
}

/**
 * Load transmission history
 */
export async function loadTransmissionHistory(): Promise<CouncilTransmission[]> {
  try {
    const json = await AsyncStorage.getItem(TRANSMISSION_HISTORY_KEY);
    if (!json) return [];
    
    const transmissions = JSON.parse(json);
    return transmissions.map((t: any) => ({
      ...t,
      timestamp: new Date(t.timestamp),
    }));
  } catch (error) {
    console.error('[Orchestrator] Error loading transmission history:', error);
    return [];
  }
}

/**
 * Save a new transmission
 */
async function saveTransmission(transmission: CouncilTransmission): Promise<void> {
  try {
    const history = await loadTransmissionHistory();
    history.unshift(transmission);
    
    // Keep last 100 transmissions
    if (history.length > 100) {
      history.splice(100);
    }
    
    await AsyncStorage.setItem(TRANSMISSION_HISTORY_KEY, JSON.stringify(history));
  } catch (error) {
    console.error('[Orchestrator] Error saving transmission:', error);
  }
}

/**
 * Mark transmission as read
 */
export async function markTransmissionRead(id: string): Promise<void> {
  try {
    const history = await loadTransmissionHistory();
    const transmission = history.find(t => t.id === id);
    if (transmission) {
      transmission.read = true;
      await AsyncStorage.setItem(TRANSMISSION_HISTORY_KEY, JSON.stringify(history));
    }
  } catch (error) {
    console.error('[Orchestrator] Error marking transmission read:', error);
  }
}

/**
 * Get unread count
 */
export async function getUnreadTransmissionCount(): Promise<number> {
  const history = await loadTransmissionHistory();
  return history.filter(t => !t.read).length;
}

// ============================================================================
// ORCHESTRATION RESULT
// ============================================================================

export interface OrchestrationResult {
  success: boolean;
  breathPhase: BreathPhase;
  signalsCollected: number;
  voicesConsulted: VoiceId[];
  petitionsGenerated: number;
  transmission?: CouncilTransmission;
  arbiterDecision?: ArbiterDecision;
  reason: string;
}

// ============================================================================
// MAIN ORCHESTRATION
// ============================================================================

/**
 * Run a full orchestration cycle
 */
export async function runOrchestrationCycle(
  forcePhase?: BreathPhase
): Promise<OrchestrationResult> {
  console.log('[Orchestrator] Starting cycle...');
  
  // Load field state
  const fieldState = await loadFieldState();
  
  // Determine breath phase
  const breathPhase = forcePhase || determineBreathPhase(fieldState);
  fieldState.breathPhase = breathPhase;
  
  console.log(`[Orchestrator] Breath phase: ${breathPhase}`);
  
  // During inhale or stillness, just observe
  if (breathPhase === 'inhale' || breathPhase === 'stillness') {
    await saveFieldState(fieldState);
    return {
      success: true,
      breathPhase,
      signalsCollected: 0,
      voicesConsulted: [],
      petitionsGenerated: 0,
      reason: breathPhase === 'inhale' 
        ? 'Field is inhaling. Voices observe.' 
        : 'Field is in stillness. Silence holds.',
    };
  }
  
  // Collect signals
  const signals = await getSignalsInWindow(24);
  console.log(`[Orchestrator] Collected ${signals.length} signals`);
  
  if (signals.length === 0) {
    await saveFieldState(fieldState);
    return {
      success: true,
      breathPhase,
      signalsCollected: 0,
      voicesConsulted: [],
      petitionsGenerated: 0,
      reason: 'No signals to observe.',
    };
  }
  
  // Determine relevant voices
  const relevantVoices = getRelevantVoices(signals);
  console.log(`[Orchestrator] Relevant voices: ${relevantVoices.join(', ')}`);
  
  if (relevantVoices.length === 0) {
    await saveFieldState(fieldState);
    return {
      success: true,
      breathPhase,
      signalsCollected: signals.length,
      voicesConsulted: [],
      petitionsGenerated: 0,
      reason: 'No voices called by these signals.',
    };
  }
  
  // During hold, generate petitions but don't evaluate
  if (breathPhase === 'hold') {
    const petitions = await generatePetitionsFromVoices(relevantVoices, signals);
    fieldState.activeVoices = petitions.map(p => p.voiceId);
    await saveFieldState(fieldState);
    
    return {
      success: true,
      breathPhase,
      signalsCollected: signals.length,
      voicesConsulted: relevantVoices,
      petitionsGenerated: petitions.length,
      reason: 'Petitions forming. Awaiting exhale.',
    };
  }
  
  // During exhale, generate and evaluate petitions
  const petitions = await generatePetitionsFromVoices(relevantVoices, signals);
  console.log(`[Orchestrator] Generated ${petitions.length} petitions`);
  
  if (petitions.length === 0) {
    await saveFieldState(fieldState);
    return {
      success: true,
      breathPhase,
      signalsCollected: signals.length,
      voicesConsulted: relevantVoices,
      petitionsGenerated: 0,
      reason: 'All voices chose silence.',
    };
  }
  
  // Evaluate petitions through Arbiter
  const result = await evaluatePetitions(petitions, breathPhase);
  
  if (!result || !result.decision.allowed) {
    await saveFieldState(fieldState);
    return {
      success: true,
      breathPhase,
      signalsCollected: signals.length,
      voicesConsulted: relevantVoices,
      petitionsGenerated: petitions.length,
      arbiterDecision: result?.decision,
      reason: result?.decision.reason || 'Arbiter denied all petitions.',
    };
  }
  
  // Create transmission from approved petition
  const approvedPetition = result.petition;
  const voiceIdentity = getVoiceIdentity(approvedPetition.voiceId);
  
  const transmission: CouncilTransmission = {
    id: `transmission_${Date.now()}`,
    voiceId: approvedPetition.voiceId,
    voiceName: voiceIdentity?.name || approvedPetition.voiceId,
    aspect: approvedPetition.aspect,
    text: result.decision.modifiedText || approvedPetition.draftText,
    timestamp: new Date(),
    surface: result.decision.surface as 'toast' | 'transmission' | 'daily_synthesis',
    arbiterText: result.decision.arbiterText,
    themes: approvedPetition.themes,
    read: false,
  };
  
  // Save transmission
  await saveTransmission(transmission);
  
  // Update field state
  fieldState.lastTransmissionAt = Date.now();
  fieldState.activeVoices = [];
  await saveFieldState(fieldState);
  
  // Decay heat
  await decayHeat();
  
  console.log(`[Orchestrator] Transmission surfaced: "${transmission.text.substring(0, 50)}..."`);
  
  return {
    success: true,
    breathPhase,
    signalsCollected: signals.length,
    voicesConsulted: relevantVoices,
    petitionsGenerated: petitions.length,
    transmission,
    arbiterDecision: result.decision,
    reason: 'Transmission surfaced.',
  };
}

/**
 * Record user activity (resets breath to inhale)
 */
export async function recordUserActivity(): Promise<void> {
  const fieldState = await loadFieldState();
  fieldState.lastActivityAt = Date.now();
  fieldState.breathPhase = 'inhale';
  await saveFieldState(fieldState);
}

/**
 * Get current field state (for UI)
 */
export async function getFieldState(): Promise<FieldState> {
  return loadFieldState();
}

/**
 * Force a specific breath phase (for testing)
 */
export async function forceBreathPhase(phase: BreathPhase): Promise<void> {
  const fieldState = await loadFieldState();
  fieldState.breathPhase = phase;
  await saveFieldState(fieldState);
}
