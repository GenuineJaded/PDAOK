/**
 * Breathing Scheduler - The Rhythm of the Council
 * 
 * Replaces the mechanical 2-hour timer with a breathing cycle:
 * - Inhale: User is active, voices observe
 * - Hold: Brief pause, petitions form
 * - Exhale: Arbiter decides, transmissions surface
 * - Stillness: Nothing speaks, even if eligible
 * 
 * The system breathes with the user, not against them.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { BreathPhase, FieldState } from './types';
import { runOrchestrationCycle, recordUserActivity, getFieldState } from './orchestrator';

// ============================================================================
// CONSTANTS
// ============================================================================

const SCHEDULER_STATE_KEY = '@pda_breathing_scheduler';

// Breathing cycle configuration
const BREATH_CONFIG = {
  // How long after activity before we consider user "inactive"
  inactivityThreshold: 30 * 60 * 1000, // 30 minutes
  
  // Minimum time between orchestration attempts
  minOrchestrationInterval: 20 * 60 * 1000, // 20 minutes
  
  // Maximum time between orchestration attempts
  maxOrchestrationInterval: 4 * 60 * 60 * 1000, // 4 hours
  
  // Time of day modifiers
  timeModifiers: {
    morning: 1.0,    // Normal rhythm
    afternoon: 1.2,  // Slightly slower
    evening: 0.8,    // More active
    late: 1.5,       // Much slower
  },
  
  // Day phase boundaries (hours)
  dayPhases: {
    morning: { start: 4, end: 12 },
    afternoon: { start: 12, end: 17 },
    evening: { start: 17, end: 22 },
    late: { start: 22, end: 4 },
  },
};

// ============================================================================
// SCHEDULER STATE
// ============================================================================

interface SchedulerState {
  lastOrchestrationAt: number;
  lastActivityAt: number;
  currentPhase: BreathPhase;
  phaseStartedAt: number;
  consecutiveSilences: number;
  isRunning: boolean;
}

function getDefaultSchedulerState(): SchedulerState {
  return {
    lastOrchestrationAt: 0,
    lastActivityAt: Date.now(),
    currentPhase: 'inhale',
    phaseStartedAt: Date.now(),
    consecutiveSilences: 0,
    isRunning: false,
  };
}

async function loadSchedulerState(): Promise<SchedulerState> {
  try {
    const json = await AsyncStorage.getItem(SCHEDULER_STATE_KEY);
    if (!json) return getDefaultSchedulerState();
    return JSON.parse(json);
  } catch (error) {
    console.error('[BreathingScheduler] Error loading state:', error);
    return getDefaultSchedulerState();
  }
}

async function saveSchedulerState(state: SchedulerState): Promise<void> {
  try {
    await AsyncStorage.setItem(SCHEDULER_STATE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('[BreathingScheduler] Error saving state:', error);
  }
}

// ============================================================================
// PHASE DETERMINATION
// ============================================================================

/**
 * Get current day phase
 */
function getCurrentDayPhase(): 'morning' | 'afternoon' | 'evening' | 'late' {
  const hour = new Date().getHours();
  
  if (hour >= 4 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 22) return 'evening';
  return 'late';
}

/**
 * Calculate the appropriate interval based on time of day and activity
 */
function calculateInterval(state: SchedulerState): number {
  const dayPhase = getCurrentDayPhase();
  const modifier = BREATH_CONFIG.timeModifiers[dayPhase];
  
  // Base interval
  let interval = BREATH_CONFIG.minOrchestrationInterval;
  
  // Increase interval if we've had consecutive silences
  if (state.consecutiveSilences > 0) {
    interval *= Math.pow(1.5, Math.min(state.consecutiveSilences, 4));
  }
  
  // Apply time-of-day modifier
  interval *= modifier;
  
  // Clamp to min/max
  return Math.max(
    BREATH_CONFIG.minOrchestrationInterval,
    Math.min(interval, BREATH_CONFIG.maxOrchestrationInterval)
  );
}

/**
 * Determine the current breath phase based on activity
 */
function determineBreathPhase(state: SchedulerState): BreathPhase {
  const now = Date.now();
  const timeSinceActivity = now - state.lastActivityAt;
  const timeSinceOrchestration = now - state.lastOrchestrationAt;
  
  // If user was recently active, we're inhaling
  if (timeSinceActivity < BREATH_CONFIG.inactivityThreshold) {
    return 'inhale';
  }
  
  // If we just finished inhaling, brief hold
  if (timeSinceActivity < BREATH_CONFIG.inactivityThreshold * 1.2) {
    return 'hold';
  }
  
  // If it's been a while since orchestration, exhale
  const interval = calculateInterval(state);
  if (timeSinceOrchestration >= interval) {
    return 'exhale';
  }
  
  // Otherwise, stillness
  return 'stillness';
}

// ============================================================================
// SCHEDULER CALLBACKS
// ============================================================================

type TransmissionCallback = (result: any) => void;
type PhaseChangeCallback = (phase: BreathPhase) => void;

let transmissionCallbacks: TransmissionCallback[] = [];
let phaseChangeCallbacks: PhaseChangeCallback[] = [];

/**
 * Register a callback for when a transmission surfaces
 */
export function onTransmission(callback: TransmissionCallback): () => void {
  transmissionCallbacks.push(callback);
  return () => {
    transmissionCallbacks = transmissionCallbacks.filter(cb => cb !== callback);
  };
}

/**
 * Register a callback for phase changes
 */
export function onPhaseChange(callback: PhaseChangeCallback): () => void {
  phaseChangeCallbacks.push(callback);
  return () => {
    phaseChangeCallbacks = phaseChangeCallbacks.filter(cb => cb !== callback);
  };
}

// ============================================================================
// SCHEDULER LOOP
// ============================================================================

let schedulerInterval: ReturnType<typeof setInterval> | null = null;
let isSchedulerInitialized = false; // Module-level flag to prevent multiple initializations

/**
 * The main scheduler tick
 */
async function schedulerTick(): Promise<void> {
  const state = await loadSchedulerState();
  
  if (!state.isRunning) {
    return;
  }
  
  // Determine current phase
  const newPhase = determineBreathPhase(state);
  
  // Notify if phase changed
  if (newPhase !== state.currentPhase) {
    state.currentPhase = newPhase;
    state.phaseStartedAt = Date.now();
    await saveSchedulerState(state);
    
    phaseChangeCallbacks.forEach(cb => cb(newPhase));
    console.log(`[BreathingScheduler] Phase changed to: ${newPhase}`);
  }
  
  // Only orchestrate during exhale
  if (newPhase !== 'exhale') {
    return;
  }
  
  // Check if enough time has passed
  const interval = calculateInterval(state);
  const timeSinceOrchestration = Date.now() - state.lastOrchestrationAt;
  
  if (timeSinceOrchestration < interval) {
    return;
  }
  
  console.log('[BreathingScheduler] Running orchestration...');
  
  try {
    const result = await runOrchestrationCycle('exhale');
    
    // Update state
    state.lastOrchestrationAt = Date.now();
    
    if (result.transmission) {
      state.consecutiveSilences = 0;
      transmissionCallbacks.forEach(cb => cb(result));
    } else {
      state.consecutiveSilences++;
    }
    
    await saveSchedulerState(state);
    
    console.log(`[BreathingScheduler] Orchestration complete: ${result.reason}`);
  } catch (error) {
    console.error('[BreathingScheduler] Orchestration error:', error);
  }
}

/**
 * Start the breathing scheduler
 */
export async function startBreathingScheduler(): Promise<void> {
  // Check module-level flag first (synchronous, prevents race conditions)
  if (isSchedulerInitialized) {
    console.log('[BreathingScheduler] Already initialized (module flag)');
    return;
  }
  
  // Check if interval is already running
  if (schedulerInterval !== null) {
    console.log('[BreathingScheduler] Interval already exists');
    return;
  }
  
  // Set flag immediately to prevent concurrent calls
  isSchedulerInitialized = true;
  
  const state = await loadSchedulerState();
  
  if (state.isRunning) {
    console.log('[BreathingScheduler] Already running (persisted state)');
    // Still set up the interval since we may have restarted the app
  }
  
  state.isRunning = true;
  state.lastActivityAt = Date.now();
  await saveSchedulerState(state);
  
  // Run tick every minute
  schedulerInterval = setInterval(schedulerTick, 60 * 1000);
  
  // Run initial tick after 5 seconds
  setTimeout(schedulerTick, 5000);
  
  console.log('[BreathingScheduler] Started');
}

/**
 * Stop the breathing scheduler
 */
export async function stopBreathingScheduler(): Promise<void> {
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
    schedulerInterval = null;
  }
  
  // Reset module-level flag
  isSchedulerInitialized = false;
  
  const state = await loadSchedulerState();
  state.isRunning = false;
  await saveSchedulerState(state);
  
  console.log('[BreathingScheduler] Stopped');
}

/**
 * Record user activity (resets to inhale phase)
 */
export async function recordSchedulerActivity(): Promise<void> {
  const state = await loadSchedulerState();
  state.lastActivityAt = Date.now();
  
  if (state.currentPhase !== 'inhale') {
    state.currentPhase = 'inhale';
    state.phaseStartedAt = Date.now();
    phaseChangeCallbacks.forEach(cb => cb('inhale'));
  }
  
  await saveSchedulerState(state);
  
  // Also record in orchestrator
  await recordUserActivity();
}

/**
 * Get current scheduler state (for debugging/UI)
 */
export async function getSchedulerState(): Promise<{
  phase: BreathPhase;
  nextOrchestrationIn: number;
  consecutiveSilences: number;
  isRunning: boolean;
}> {
  const state = await loadSchedulerState();
  const interval = calculateInterval(state);
  const timeSinceOrchestration = Date.now() - state.lastOrchestrationAt;
  
  return {
    phase: state.currentPhase,
    nextOrchestrationIn: Math.max(0, interval - timeSinceOrchestration),
    consecutiveSilences: state.consecutiveSilences,
    isRunning: state.isRunning,
  };
}

/**
 * Force an immediate orchestration (for testing/manual trigger)
 */
export async function forceOrchestration(): Promise<any> {
  console.log('[BreathingScheduler] Forcing orchestration...');
  
  const result = await runOrchestrationCycle('exhale');
  
  const state = await loadSchedulerState();
  state.lastOrchestrationAt = Date.now();
  
  if (result.transmission) {
    state.consecutiveSilences = 0;
    transmissionCallbacks.forEach(cb => cb(result));
  } else {
    state.consecutiveSilences++;
  }
  
  await saveSchedulerState(state);
  
  return result;
}
