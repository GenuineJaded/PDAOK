/**
 * The Arbiter - Gatekeeper of the Council
 * 
 * The Arbiter decides which petitions surface and which remain in silence.
 * It uses the Three Keys: Change, Convergence, and Cost.
 * 
 * The Arbiter is not a voice. It is the threshold.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Petition,
  ArbiterDecision,
  ArbiterState,
  ArbiterVisibility,
  ThreeKeys,
  VoiceId,
  PetitionTheme,
  BreathPhase,
} from './types';

// ============================================================================
// CONSTANTS
// ============================================================================

const ARBITER_STATE_KEY = '@pda_arbiter_state';

// Daily limits
const DAILY_LIMITS = {
  toast: 8,                    // Max toasts per day
  transmission: 4,             // Max transmissions per day
  dailySynthesis: 1,           // Max daily synthesis
  arbiterAppearances: 2,       // Max times Arbiter itself appears
};

// Cooldowns (in milliseconds)
const COOLDOWNS = {
  globalMinimum: 30 * 60 * 1000,           // 30 min between any speech
  sameVoice: 4 * 60 * 60 * 1000,           // 4 hours before same voice speaks again
  sameTheme: 2 * 60 * 60 * 1000,           // 2 hours before same theme surfaces
  arbiterAppearance: 8 * 60 * 60 * 1000,   // 8 hours between Arbiter appearances
};

// Thresholds
const THRESHOLDS = {
  minimumScore: 0.4,           // Minimum score to even consider
  toastThreshold: 0.5,         // Score needed for toast
  transmissionThreshold: 0.7,  // Score needed for transmission
  synthesisThreshold: 0.85,    // Score needed for daily synthesis
  heatCeiling: 0.8,            // Max field heat before forced silence
  silenceDebtBonus: 0.1,       // Bonus per hour of silence
};

// Arbiter's own phrases (when it appears)
const ARBITER_SEALS = [
  '◈',
  '⟁',
  '⧫',
  '◇',
];

const ARBITER_WHISPERS = [
  'The threshold opens.',
  'Something crosses.',
  'The field shifts.',
  'A voice rises.',
];

// ============================================================================
// STATE MANAGEMENT
// ============================================================================

/**
 * Get default Arbiter state
 */
function getDefaultArbiterState(): ArbiterState {
  return {
    lastSpeakAt: 0,
    lastSpeakByVoice: {} as Record<VoiceId, number>,
    todayCount: {
      toast: 0,
      transmission: 0,
      dailySynthesis: 0,
      arbiterAppearances: 0,
    },
    recentVoices: [],
    recentThemes: [],
    heat: 0,
    silenceDebt: 0,
  };
}

/**
 * Load Arbiter state from storage
 */
export async function loadArbiterState(): Promise<ArbiterState> {
  try {
    const json = await AsyncStorage.getItem(ARBITER_STATE_KEY);
    if (!json) return getDefaultArbiterState();
    
    const state = JSON.parse(json);
    
    // Check if we need to reset daily counts (new day)
    const lastDate = new Date(state.lastSpeakAt).toDateString();
    const today = new Date().toDateString();
    
    if (lastDate !== today) {
      // Reset daily counts
      state.todayCount = {
        toast: 0,
        transmission: 0,
        dailySynthesis: 0,
        arbiterAppearances: 0,
      };
      state.heat = Math.max(0, state.heat - 0.3); // Decay heat overnight
    }
    
    // Calculate silence debt
    const hoursSinceLastSpeak = (Date.now() - state.lastSpeakAt) / (60 * 60 * 1000);
    state.silenceDebt = Math.min(hoursSinceLastSpeak, 24); // Cap at 24 hours
    
    return state;
  } catch (error) {
    console.error('[Arbiter] Error loading state:', error);
    return getDefaultArbiterState();
  }
}

/**
 * Save Arbiter state to storage
 */
export async function saveArbiterState(state: ArbiterState): Promise<void> {
  try {
    await AsyncStorage.setItem(ARBITER_STATE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('[Arbiter] Error saving state:', error);
  }
}

// ============================================================================
// THREE KEYS EVALUATION
// ============================================================================

/**
 * Evaluate the Change key
 * Did something actually shift? Is this new information?
 */
function evaluateChangeKey(petition: Petition, state: ArbiterState): boolean {
  // Check novelty
  if (petition.novelty < 0.3) return false;
  
  // Check if this theme was recently surfaced
  const recentThemes = state.recentThemes.slice(0, 3);
  const primaryTheme = petition.themes[0];
  if (recentThemes.includes(primaryTheme)) {
    // Same theme recently - need higher novelty
    if (petition.novelty < 0.6) return false;
  }
  
  // Check if signals indicate actual change
  const hasSignificantSignal = petition.supportingSignals.some(s => s.weight > 0.5);
  
  return hasSignificantSignal || petition.novelty > 0.5;
}

/**
 * Evaluate the Convergence key
 * Do multiple signals or voices agree? Is there coherence?
 */
function evaluateConvergenceKey(petition: Petition, state: ArbiterState): boolean {
  // Multiple signals pointing same direction
  const significantSignals = petition.supportingSignals.filter(s => s.weight > 0.3);
  if (significantSignals.length >= 2) return true;
  
  // High confidence from the voice
  if (petition.confidence > 0.7) return true;
  
  // Multiple themes converging
  if (petition.themes.length >= 2) return true;
  
  // Voice's own resonance score is high
  if (petition.resonanceScore > 0.7) return true;
  
  return false;
}

/**
 * Evaluate the Cost key
 * Is it worth spending the silence? Is the field ready?
 */
function evaluateCostKey(petition: Petition, state: ArbiterState): boolean {
  // Check field heat
  if (state.heat > THRESHOLDS.heatCeiling) return false;
  
  // Check daily limits
  if (state.todayCount.toast >= DAILY_LIMITS.toast) return false;
  
  // Check global cooldown
  const timeSinceLastSpeak = Date.now() - state.lastSpeakAt;
  if (timeSinceLastSpeak < COOLDOWNS.globalMinimum) {
    // Only override if urgency is very high
    if (petition.urgency < 0.9) return false;
  }
  
  // Check voice cooldown
  const lastVoiceSpeak = state.lastSpeakByVoice[petition.voiceId] || 0;
  const timeSinceVoiceSpeak = Date.now() - lastVoiceSpeak;
  if (timeSinceVoiceSpeak < COOLDOWNS.sameVoice) {
    // Same voice too recently
    if (petition.urgency < 0.8) return false;
  }
  
  // Check if voice prefers silence
  if (petition.silencePreference && petition.intensity < 0.7) {
    return false;
  }
  
  return true;
}

/**
 * Evaluate all three keys
 */
function evaluateThreeKeys(petition: Petition, state: ArbiterState): ThreeKeys {
  return {
    change: evaluateChangeKey(petition, state),
    convergence: evaluateConvergenceKey(petition, state),
    cost: evaluateCostKey(petition, state),
  };
}

// ============================================================================
// SCORING
// ============================================================================

/**
 * Calculate the final score for a petition
 */
function calculateScore(petition: Petition, state: ArbiterState, keys: ThreeKeys): number {
  // Base score from petition metadata
  let score = (
    petition.intensity * 0.25 +
    petition.novelty * 0.25 +
    petition.confidence * 0.2 +
    petition.resonanceScore * 0.2 +
    petition.urgency * 0.1
  );
  
  // Key bonuses
  if (keys.change) score += 0.1;
  if (keys.convergence) score += 0.1;
  if (keys.cost) score += 0.05;
  
  // Silence debt bonus (reward for waiting)
  const silenceBonus = Math.min(state.silenceDebt * THRESHOLDS.silenceDebtBonus, 0.3);
  score += silenceBonus;
  
  // Heat penalty
  score -= state.heat * 0.2;
  
  // Recency penalty for same voice
  if (state.recentVoices.includes(petition.voiceId)) {
    score -= 0.15;
  }
  
  // Shadow aspect: no penalty applied.
  // The voice engine now only generates 'light' or 'neutral' aspects by default.
  // If a shadow aspect somehow surfaces, it passed the voice's own judgment and should not be penalized here.
  
  return Math.max(0, Math.min(1, score));
}

// ============================================================================
// DECISION MAKING
// ============================================================================

/**
 * Determine surface type based on score
 */
function determineSurfaceType(
  score: number,
  petition: Petition,
  state: ArbiterState
): 'toast' | 'transmission' | 'daily_synthesis' | 'none' {
  // Check daily limits first
  if (score >= THRESHOLDS.synthesisThreshold && 
      state.todayCount.dailySynthesis < DAILY_LIMITS.dailySynthesis) {
    return 'daily_synthesis';
  }
  
  if (score >= THRESHOLDS.transmissionThreshold &&
      state.todayCount.transmission < DAILY_LIMITS.transmission) {
    return 'transmission';
  }
  
  if (score >= THRESHOLDS.toastThreshold &&
      state.todayCount.toast < DAILY_LIMITS.toast) {
    return 'toast';
  }
  
  return 'none';
}

/**
 * Determine Arbiter visibility
 */
function determineArbiterVisibility(
  score: number,
  petition: Petition,
  state: ArbiterState
): ArbiterVisibility {
  // Arbiter stays hidden most of the time
  if (score < THRESHOLDS.transmissionThreshold) {
    return 'hidden';
  }
  
  // Check if Arbiter can appear
  if (state.todayCount.arbiterAppearances >= DAILY_LIMITS.arbiterAppearances) {
    return 'hidden';
  }
  
  // High-significance moments get a seal
  if (score >= THRESHOLDS.synthesisThreshold) {
    // Rare: Arbiter whispers
    if (Math.random() < 0.2) {
      return 'whisper';
    }
    return 'seal';
  }
  
  // Threshold crossings get a seal
  if (petition.themes.includes('threshold_crossed')) {
    return 'seal';
  }
  
  return 'hidden';
}

/**
 * Get Arbiter's text if visible
 */
function getArbiterText(visibility: ArbiterVisibility): string | undefined {
  if (visibility === 'seal') {
    return ARBITER_SEALS[Math.floor(Math.random() * ARBITER_SEALS.length)];
  }
  
  if (visibility === 'whisper') {
    return ARBITER_WHISPERS[Math.floor(Math.random() * ARBITER_WHISPERS.length)];
  }
  
  return undefined;
}

/**
 * Generate reason string for decision
 */
function generateReason(keys: ThreeKeys, score: number, surface: string): string {
  const keyStrings: string[] = [];
  if (keys.change) keyStrings.push('change detected');
  if (keys.convergence) keyStrings.push('signals converge');
  if (keys.cost) keyStrings.push('cost acceptable');
  
  if (surface === 'none') {
    const missing = [];
    if (!keys.change) missing.push('no significant change');
    if (!keys.convergence) missing.push('signals scattered');
    if (!keys.cost) missing.push('cost too high');
    return `Denied: ${missing.join(', ')}. Score: ${score.toFixed(2)}`;
  }
  
  return `Allowed: ${keyStrings.join(', ')}. Score: ${score.toFixed(2)}`;
}

// ============================================================================
// MAIN ARBITER FUNCTION
// ============================================================================

/**
 * Evaluate a petition and return a decision
 */
export async function evaluatePetition(
  petition: Petition,
  breathPhase: BreathPhase = 'exhale'
): Promise<ArbiterDecision> {
  // Load current state
  const state = await loadArbiterState();
  
  // During stillness, nothing passes
  if (breathPhase === 'stillness') {
    return {
      petitionId: petition.id,
      allowed: false,
      surface: 'none',
      reason: 'Field is in stillness. Silence holds.',
      arbiterVisibility: 'hidden',
      keysState: { change: false, convergence: false, cost: false },
      score: 0,
    };
  }
  
  // During inhale, voices observe but don't speak
  if (breathPhase === 'inhale') {
    return {
      petitionId: petition.id,
      allowed: false,
      surface: 'none',
      reason: 'Field is inhaling. Voices observe.',
      arbiterVisibility: 'hidden',
      keysState: { change: false, convergence: false, cost: false },
      score: 0,
    };
  }
  
  // Evaluate the three keys
  const keys = evaluateThreeKeys(petition, state);
  
  // All three keys must turn
  const allKeysPass = keys.change && keys.convergence && keys.cost;
  
  // Calculate score
  const score = calculateScore(petition, state, keys);
  
  // Determine surface type
  const surface = allKeysPass ? determineSurfaceType(score, petition, state) : 'none';
  
  // Determine Arbiter visibility
  const arbiterVisibility = determineArbiterVisibility(score, petition, state);
  
  // Generate reason
  const reason = generateReason(keys, score, surface);
  
  // Build decision
  const decision: ArbiterDecision = {
    petitionId: petition.id,
    allowed: surface !== 'none',
    surface,
    reason,
    arbiterVisibility,
    arbiterText: getArbiterText(arbiterVisibility),
    keysState: keys,
    score,
  };
  
  // If allowed, update state
  if (decision.allowed) {
    state.lastSpeakAt = Date.now();
    state.lastSpeakByVoice[petition.voiceId] = Date.now();
    state.recentVoices = [petition.voiceId, ...state.recentVoices.slice(0, 2)];
    state.recentThemes = [...petition.themes, ...state.recentThemes.slice(0, 4)];
    state.heat = Math.min(1, state.heat + 0.15);
    state.silenceDebt = 0;
    
    // Update counts
    if (surface === 'toast') state.todayCount.toast++;
    if (surface === 'transmission') state.todayCount.transmission++;
    if (surface === 'daily_synthesis') state.todayCount.dailySynthesis++;
    if (arbiterVisibility !== 'hidden') state.todayCount.arbiterAppearances++;
    
    await saveArbiterState(state);
  }
  
  return decision;
}

/**
 * Evaluate multiple petitions and return the best one (if any)
 */
export async function evaluatePetitions(
  petitions: Petition[],
  breathPhase: BreathPhase = 'exhale'
): Promise<{ decision: ArbiterDecision; petition: Petition } | null> {
  if (petitions.length === 0) return null;
  
  // Score all petitions
  const state = await loadArbiterState();
  const scored = petitions.map(petition => {
    const keys = evaluateThreeKeys(petition, state);
    const score = calculateScore(petition, state, keys);
    return { petition, keys, score };
  });
  
  // Sort by score descending
  scored.sort((a, b) => b.score - a.score);
  
  // Try to get a decision for the best petition
  for (const { petition } of scored) {
    const decision = await evaluatePetition(petition, breathPhase);
    if (decision.allowed) {
      return { decision, petition };
    }
  }
  
  // No petition passed - return the best denial for logging
  if (scored.length > 0) {
    const decision = await evaluatePetition(scored[0].petition, breathPhase);
    return { decision, petition: scored[0].petition };
  }
  
  return null;
}

/**
 * Decay heat over time (call periodically)
 */
export async function decayHeat(): Promise<void> {
  const state = await loadArbiterState();
  state.heat = Math.max(0, state.heat - 0.05);
  await saveArbiterState(state);
}

/**
 * Force reset Arbiter state (for testing)
 */
export async function resetArbiterState(): Promise<void> {
  await saveArbiterState(getDefaultArbiterState());
}
