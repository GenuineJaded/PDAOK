/**
 * Field Arbiter - The Coordination Layer
 * 
 * Lightweight traffic controller that decides when and where AI voices speak.
 * Prevents overlap, maintains rhythm, creates coherent system behavior.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Core app events that the Field observes
 */
export type FieldEvent =
  | 'MOMENT_CREATED'
  | 'ALIGN_COMPLETED'
  | 'SUBSTANCE_LOGGED'
  | 'PATTERN_RECORDED'
  | 'DAY_PHASE_CHANGED'
  | 'TRANSMISSION_REQUESTED'
  | 'ANCHOR_COMPLETED'
  | 'MOVEMENT_LOGGED'
  | 'NOURISHMENT_LOGGED';

/**
 * AI voices that can speak
 */
export type VoiceName =
  | 'Witness'           // The Field itself
  | 'GreenGodmother'    // Cannabis
  | 'Firestarter'       // Stimulants
  | 'TheTinkerer'       // Nicotine
  | 'TheArchitecture'   // Nootropics/Supplements
  | 'MotherOfSilence'   // Benzos
  | 'PatternWeaver';    // Pattern analysis

/**
 * Where the voice should surface
 */
export type Surface = 
  | 'toast'           // Bottom banner
  | 'transmission'    // Saved conversation entry
  | 'daily_whisper'   // End-of-day synthesis
  | 'none';           // Gated/blocked

/**
 * Priority level
 */
export type Priority = 'low' | 'med' | 'high';

/**
 * Decision from the arbiter
 */
export interface ArbiterDecision {
  surface: Surface;
  voice: VoiceName | null;
  priority: Priority;
  reason: string;
  allowed: boolean;
}

/**
 * Event context passed to arbiter
 */
export interface EventContext {
  event: FieldEvent;
  voice?: VoiceName;        // Suggested voice (can be overridden)
  manual?: boolean;         // User explicitly requested (bypasses some gates)
  metadata?: Record<string, any>;
}

// ============================================================================
// STATE
// ============================================================================

/**
 * Minimal rolling state for timing decisions
 */
interface FieldState {
  last_speak_at: number;                    // Global last speak timestamp
  last_speak_at_by_voice: Record<VoiceName, number>;
  today_counts_by_event: Record<FieldEvent, number>;
  last_day_phase: string;
  heat: number;                             // 0-1 intensity score
}

let fieldState: FieldState = {
  last_speak_at: 0,
  last_speak_at_by_voice: {
    Witness: 0,
    GreenGodmother: 0,
    Firestarter: 0,
    TheTinkerer: 0,
    TheArchitecture: 0,
    MotherOfSilence: 0,
    PatternWeaver: 0,
  },
  today_counts_by_event: {
    MOMENT_CREATED: 0,
    ALIGN_COMPLETED: 0,
    SUBSTANCE_LOGGED: 0,
    PATTERN_RECORDED: 0,
    DAY_PHASE_CHANGED: 0,
    TRANSMISSION_REQUESTED: 0,
    ANCHOR_COMPLETED: 0,
    MOVEMENT_LOGGED: 0,
    NOURISHMENT_LOGGED: 0,
  },
  last_day_phase: 'morning',
  heat: 0,
};

// ============================================================================
// CONFIGURATION
// ============================================================================

/**
 * Timing constraints (in seconds)
 */
const TIMING = {
  MIN_GLOBAL_INTERVAL: 30,        // No voice speaks within 30s of any other
  MIN_VOICE_INTERVAL: 3600,       // Same voice waits 1 hour
  MIN_TOAST_INTERVAL: 20,         // Toasts wait 20s between
  MIN_TRANSMISSION_INTERVAL: 1800, // Transmissions wait 30min
};

/**
 * Event limits per day
 */
const DAILY_LIMITS: Partial<Record<FieldEvent, number>> = {
  SUBSTANCE_LOGGED: 10,    // Max 10 substance transmissions per day
  ALIGN_COMPLETED: 20,     // Max 20 align toasts per day
  PATTERN_RECORDED: 5,     // Max 5 pattern whispers per day
};

// ============================================================================
// PERSISTENCE
// ============================================================================

const STATE_KEY = '@field_arbiter_state';

/**
 * Load state from storage
 */
export async function loadFieldState(): Promise<void> {
  try {
    const stored = await AsyncStorage.getItem(STATE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Check if it's from today
      const lastDate = new Date(parsed.last_speak_at).toDateString();
      const today = new Date().toDateString();
      
      if (lastDate === today) {
        fieldState = parsed;
      } else {
        // New day - reset counts
        fieldState.today_counts_by_event = {
          MOMENT_CREATED: 0,
          ALIGN_COMPLETED: 0,
          SUBSTANCE_LOGGED: 0,
          PATTERN_RECORDED: 0,
          DAY_PHASE_CHANGED: 0,
          TRANSMISSION_REQUESTED: 0,
          ANCHOR_COMPLETED: 0,
          MOVEMENT_LOGGED: 0,
          NOURISHMENT_LOGGED: 0,
        };
        await saveFieldState();
      }
    }
  } catch (error) {
    console.log('Field arbiter: Could not load state', error);
  }
}

/**
 * Save state to storage
 */
async function saveFieldState(): Promise<void> {
  try {
    await AsyncStorage.setItem(STATE_KEY, JSON.stringify(fieldState));
  } catch (error) {
    console.log('Field arbiter: Could not save state', error);
  }
}

// ============================================================================
// GATING RULES
// ============================================================================

/**
 * Check if event has exceeded daily limit
 */
function checkDailyLimit(event: FieldEvent): boolean {
  const limit = DAILY_LIMITS[event];
  if (!limit) return true; // No limit set
  
  const count = fieldState.today_counts_by_event[event] || 0;
  return count < limit;
}

/**
 * Check if enough time has passed globally
 */
function checkGlobalTiming(): boolean {
  const now = Date.now();
  const elapsed = (now - fieldState.last_speak_at) / 1000;
  return elapsed >= TIMING.MIN_GLOBAL_INTERVAL;
}

/**
 * Check if enough time has passed for specific voice
 */
function checkVoiceTiming(voice: VoiceName): boolean {
  const now = Date.now();
  const lastSpeak = fieldState.last_speak_at_by_voice[voice] || 0;
  const elapsed = (now - lastSpeak) / 1000;
  return elapsed >= TIMING.MIN_VOICE_INTERVAL;
}

/**
 * Check if toast is allowed (stricter timing)
 */
function checkToastTiming(): boolean {
  const now = Date.now();
  const elapsed = (now - fieldState.last_speak_at) / 1000;
  return elapsed >= TIMING.MIN_TOAST_INTERVAL;
}

/**
 * Check if transmission is allowed
 */
function checkTransmissionTiming(): boolean {
  const now = Date.now();
  const elapsed = (now - fieldState.last_speak_at) / 1000;
  return elapsed >= TIMING.MIN_TRANSMISSION_INTERVAL;
}

// ============================================================================
// ROUTING LOGIC
// ============================================================================

/**
 * Determine which voice should speak for an event
 */
function selectVoice(context: EventContext): VoiceName | null {
  // If voice is explicitly provided, use it
  if (context.voice) return context.voice;
  
  // Otherwise, map event to default voice
  switch (context.event) {
    case 'SUBSTANCE_LOGGED':
      // Determine substance voice from metadata
      const substance = context.metadata?.substanceName?.toLowerCase() || '';
      if (substance.includes('cannabis') || substance.includes('weed') || substance.includes('thc')) {
        return 'GreenGodmother';
      }
      if (substance.includes('caffeine') || substance.includes('adderall') || substance.includes('stimulant')) {
        return 'Firestarter';
      }
      if (substance.includes('nicotine') || substance.includes('vape') || substance.includes('cigarette')) {
        return 'TheTinkerer';
      }
      if (substance.includes('supplement') || substance.includes('nootropic') || substance.includes('vitamin')) {
        return 'TheArchitecture';
      }
      if (substance.includes('benzo') || substance.includes('xanax') || substance.includes('klonopin')) {
        return 'MotherOfSilence';
      }
      return null; // Unknown substance
      
    case 'PATTERN_RECORDED':
    case 'DAY_PHASE_CHANGED':
      return 'Witness';
      
    case 'TRANSMISSION_REQUESTED':
      return context.voice || 'Witness';
      
    default:
      return null;
  }
}

/**
 * Determine surface based on event and timing
 */
function selectSurface(event: FieldEvent, manual: boolean): Surface {
  // Manual requests go to transmission
  if (manual) return 'transmission';
  
  // Event-based routing
  switch (event) {
    case 'ALIGN_COMPLETED':
    case 'ANCHOR_COMPLETED':
      return 'toast';
      
    case 'SUBSTANCE_LOGGED':
      return 'transmission';
      
    case 'PATTERN_RECORDED':
      return 'daily_whisper';
      
    case 'DAY_PHASE_CHANGED':
      return 'daily_whisper';
      
    case 'TRANSMISSION_REQUESTED':
      return 'transmission';
      
    default:
      return 'none';
  }
}

// ============================================================================
// MAIN ARBITER
// ============================================================================

/**
 * Process an event and return decision
 */
export async function processEvent(context: EventContext): Promise<ArbiterDecision> {
  const { event, manual = false } = context;
  
  // Select voice and surface
  const voice = selectVoice(context);
  const surface = selectSurface(event, manual);
  
  // If no voice or surface, block
  if (!voice || surface === 'none') {
    return {
      surface: 'none',
      voice: null,
      priority: 'low',
      reason: 'No voice or surface selected',
      allowed: false,
    };
  }
  
  // Manual requests bypass most gates
  if (manual) {
    // Still check global timing to prevent double-fire
    if (!checkGlobalTiming()) {
      return {
        surface: 'none',
        voice,
        priority: 'high',
        reason: 'Manual request blocked: too soon after last speak',
        allowed: false,
      };
    }
    
    // Update state
    updateState(event, voice);
    
    return {
      surface,
      voice,
      priority: 'high',
      reason: 'Manual request approved',
      allowed: true,
    };
  }
  
  // Check daily limit
  if (!checkDailyLimit(event)) {
    return {
      surface: 'none',
      voice,
      priority: 'low',
      reason: `Daily limit exceeded for ${event}`,
      allowed: false,
    };
  }
  
  // Check timing based on surface
  if (surface === 'toast' && !checkToastTiming()) {
    return {
      surface: 'none',
      voice,
      priority: 'low',
      reason: 'Toast blocked: too soon after last toast',
      allowed: false,
    };
  }
  
  if (surface === 'transmission' && !checkTransmissionTiming()) {
    return {
      surface: 'none',
      voice,
      priority: 'med',
      reason: 'Transmission blocked: too soon after last transmission',
      allowed: false,
    };
  }
  
  // Check voice-specific timing
  if (!checkVoiceTiming(voice)) {
    return {
      surface: 'none',
      voice,
      priority: 'low',
      reason: `Voice ${voice} blocked: spoke too recently`,
      allowed: false,
    };
  }
  
  // Check global timing
  if (!checkGlobalTiming()) {
    return {
      surface: 'none',
      voice,
      priority: 'low',
      reason: 'Global timing: too soon after any voice',
      allowed: false,
    };
  }
  
  // All gates passed - allow
  updateState(event, voice);
  
  return {
    surface,
    voice,
    priority: 'med',
    reason: 'All gates passed',
    allowed: true,
  };
}

/**
 * Update state after successful speak
 */
function updateState(event: FieldEvent, voice: VoiceName): void {
  const now = Date.now();
  
  fieldState.last_speak_at = now;
  fieldState.last_speak_at_by_voice[voice] = now;
  fieldState.today_counts_by_event[event] = (fieldState.today_counts_by_event[event] || 0) + 1;
  
  // Update heat (simple increment, decays over time)
  fieldState.heat = Math.min(1, fieldState.heat + 0.1);
  
  saveFieldState();
}

/**
 * Reset daily counts (call at midnight or day phase change)
 */
export function resetDailyCounts(): void {
  fieldState.today_counts_by_event = {
    MOMENT_CREATED: 0,
    ALIGN_COMPLETED: 0,
    SUBSTANCE_LOGGED: 0,
    PATTERN_RECORDED: 0,
    DAY_PHASE_CHANGED: 0,
    TRANSMISSION_REQUESTED: 0,
    ANCHOR_COMPLETED: 0,
    MOVEMENT_LOGGED: 0,
    NOURISHMENT_LOGGED: 0,
  };
  fieldState.heat = 0;
  saveFieldState();
}

/**
 * Get current state (for debug overlay)
 */
export function getFieldState(): FieldState {
  return { ...fieldState };
}

// ============================================================================
// DEBUG LOGGING
// ============================================================================

/**
 * Log decision for debugging
 */
export function logDecision(context: EventContext, decision: ArbiterDecision): void {
  if (__DEV__) {
    console.log('[Field Arbiter]', {
      event: context.event,
      decision: {
        allowed: decision.allowed,
        surface: decision.surface,
        voice: decision.voice,
        reason: decision.reason,
      },
      state: {
        last_speak_seconds_ago: (Date.now() - fieldState.last_speak_at) / 1000,
        today_counts: fieldState.today_counts_by_event,
        heat: fieldState.heat,
      },
    });
  }
}
