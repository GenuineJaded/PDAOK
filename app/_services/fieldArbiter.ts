/**
 * Field Arbiter v0.2 - The Coordination Layer
 * 
 * Lightweight traffic controller that decides when and where AI voices speak.
 * Prevents overlap, maintains rhythm, creates coherent system behavior.
 * 
 * Design principle: Silence is success. Default is NO unless explicit rule says YES.
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
  | 'Witness'           // The Field itself (meta-observer)
  | 'GreenGodmother'    // Cannabis
  | 'Firestarter'       // Stimulants
  | 'TheTinkerer'       // Nicotine
  | 'TheArchitecture'   // Nootropics/Supplements
  | 'MotherOfSilence'   // Benzos
  | 'HollowChalice'     // Alcohol
  | 'PatternWeaver';    // Pattern analysis

/**
 * Where the voice should surface
 */
export type Surface = 
  | 'toast'           // Bottom banner (fast, small, immediate)
  | 'transmission'    // Saved conversation entry (reflective, persistent, rare)
  | 'daily_synthesis' // End-of-day aggregate (highest value per token)
  | 'none';           // Gated/blocked

/**
 * Priority tiers
 */
export type Priority = 1 | 2 | 3 | 4;

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
  manual?: boolean;         // User explicitly requested (Tier 1 priority)
  threshold?: boolean;      // Threshold-crossing event (Tier 2 priority)
  metadata?: Record<string, any>;
}

// ============================================================================
// STATE
// ============================================================================

/**
 * Minimal rolling state for timing decisions
 */
interface FieldState {
  last_speak_at: number;                          // Global last speak timestamp
  last_surface: Surface | null;                   // What surface was used last
  last_speak_at_by_voice: Record<VoiceName, number>;
  today_public_count_by_surface: {
    toast: number;
    transmission: number;
    daily_synthesis: number;
  };
  today_public_count_by_voice: Record<VoiceName, number>;
  recent_public_voices: VoiceName[];              // Last 2 voices (spam prevention)
  recent_message_hashes: string[];                // Last 10 message hashes (de-dup)
  heat: number;                                   // 0-1 intensity score
}

let fieldState: FieldState = {
  last_speak_at: 0,
  last_surface: null,
  last_speak_at_by_voice: {
    Witness: 0,
    GreenGodmother: 0,
    Firestarter: 0,
    TheTinkerer: 0,
    TheArchitecture: 0,
    MotherOfSilence: 0,
    HollowChalice: 0,
    PatternWeaver: 0,
  },
  today_public_count_by_surface: {
    toast: 0,
    transmission: 0,
    daily_synthesis: 0,
  },
  today_public_count_by_voice: {
    Witness: 0,
    GreenGodmother: 0,
    Firestarter: 0,
    TheTinkerer: 0,
    TheArchitecture: 0,
    MotherOfSilence: 0,
    HollowChalice: 0,
    PatternWeaver: 0,
  },
  recent_public_voices: [],
  recent_message_hashes: [],
  heat: 0,
};

// ============================================================================
// VOICE POLICIES
// ============================================================================

interface VoicePolicy {
  cooldown: number;           // Seconds between speaks
  maxPerDay: number;          // Max public messages per day
  allowedChannels: Surface[]; // Where this voice can appear
}

const VOICE_POLICIES: Record<VoiceName, VoicePolicy> = {
  Witness: {
    cooldown: 21600,  // 6 hours
    maxPerDay: 2,
    allowedChannels: ['transmission', 'daily_synthesis'],
  },
  GreenGodmother: {
    cooldown: 10800,  // 3 hours
    maxPerDay: 3,
    allowedChannels: ['toast', 'transmission', 'daily_synthesis'],
  },
  Firestarter: {
    cooldown: 10800,  // 3 hours
    maxPerDay: 3,
    allowedChannels: ['toast', 'transmission', 'daily_synthesis'],
  },
  TheTinkerer: {
    cooldown: 14400,  // 4 hours
    maxPerDay: 2,
    allowedChannels: ['transmission', 'daily_synthesis'],
  },
  TheArchitecture: {
    cooldown: 14400,  // 4 hours
    maxPerDay: 2,
    allowedChannels: ['transmission', 'daily_synthesis'],
  },
  MotherOfSilence: {
    cooldown: 14400,  // 4 hours
    maxPerDay: 2,
    allowedChannels: ['transmission', 'daily_synthesis'],
  },
  HollowChalice: {
    cooldown: 1209600,  // 14 days
    maxPerDay: 1,       // Actually 1 per month
    allowedChannels: ['daily_synthesis'],
  },
  PatternWeaver: {
    cooldown: 21600,  // 6 hours
    maxPerDay: 2,
    allowedChannels: ['transmission', 'daily_synthesis'],
  },
};

// ============================================================================
// GLOBAL POLICIES
// ============================================================================

/**
 * Surface-specific global cooldowns (in seconds)
 */
const SURFACE_COOLDOWNS = {
  toast: 45,              // 45s after any toast
  transmission: 180,      // 3min after any transmission
  daily_synthesis: 600,   // 10min after any synthesis
};

/**
 * Daily caps per surface
 */
const SURFACE_DAILY_CAPS = {
  toast: 10,
  transmission: 6,
  daily_synthesis: 1,
};

// ============================================================================
// PERSISTENCE
// ============================================================================

const STATE_KEY = '@field_arbiter_state_v2';

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
        resetDailyCounts();
      }
    }
  } catch (error) {
    console.log('[ARB] Could not load state:', error);
  }
}

/**
 * Save state to storage
 */
async function saveFieldState(): Promise<void> {
  try {
    await AsyncStorage.setItem(STATE_KEY, JSON.stringify(fieldState));
  } catch (error) {
    console.log('[ARB] Could not save state:', error);
  }
}

// ============================================================================
// PRIORITY TIERS
// ============================================================================

/**
 * Determine priority tier for event
 * Tier 1 (highest): user explicitly requests
 * Tier 2: threshold-crossing events
 * Tier 3: ordinary logs
 * Tier 4 (lowest): passive time-based (disabled in v0)
 */
function getPriorityTier(context: EventContext): Priority {
  if (context.manual) return 1;
  if (context.threshold) return 2;
  
  // Tier 3 for ordinary events
  switch (context.event) {
    case 'SUBSTANCE_LOGGED':
    case 'PATTERN_RECORDED':
    case 'ALIGN_COMPLETED':
    case 'ANCHOR_COMPLETED':
      return 3;
    default:
      return 4;
  }
}

// ============================================================================
// VOICE SELECTION
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
      if (substance.includes('caffeine') || substance.includes('adderall') || substance.includes('stimulant') || substance.includes('vyvanse')) {
        return 'Firestarter';
      }
      if (substance.includes('nicotine') || substance.includes('vape') || substance.includes('cigarette') || substance.includes('tobacco')) {
        return 'TheTinkerer';
      }
      if (substance.includes('supplement') || substance.includes('nootropic') || substance.includes('vitamin') || substance.includes('l-theanine')) {
        return 'TheArchitecture';
      }
      if (substance.includes('benzo') || substance.includes('xanax') || substance.includes('klonopin') || substance.includes('clonazepam')) {
        return 'MotherOfSilence';
      }
      if (substance.includes('alcohol') || substance.includes('beer') || substance.includes('wine') || substance.includes('liquor')) {
        return 'HollowChalice';
      }
      return null; // Unknown substance
      
    case 'PATTERN_RECORDED':
      return 'PatternWeaver';
      
    case 'DAY_PHASE_CHANGED':
      return 'Witness';
      
    case 'TRANSMISSION_REQUESTED':
      return context.voice || 'Witness';
      
    default:
      return null;
  }
}

// ============================================================================
// SURFACE SELECTION
// ============================================================================

/**
 * Determine surface based on event, priority, and voice policy
 */
function selectSurface(event: FieldEvent, voice: VoiceName, priority: Priority): Surface {
  const policy = VOICE_POLICIES[voice];
  
  // Tier 1 (manual) goes to transmission
  if (priority === 1) {
    return policy.allowedChannels.includes('transmission') ? 'transmission' : 'none';
  }
  
  // Tier 2 (threshold) can use toast or transmission
  if (priority === 2) {
    if (policy.allowedChannels.includes('toast')) return 'toast';
    if (policy.allowedChannels.includes('transmission')) return 'transmission';
    return 'none';
  }
  
  // Tier 3 (ordinary) - usually journal-only, but can surface if quiet
  // For now, route to transmission if allowed
  if (priority === 3) {
    switch (event) {
      case 'SUBSTANCE_LOGGED':
        return policy.allowedChannels.includes('transmission') ? 'transmission' : 'none';
      case 'PATTERN_RECORDED':
        return 'daily_synthesis';
      case 'ALIGN_COMPLETED':
      case 'ANCHOR_COMPLETED':
        return policy.allowedChannels.includes('toast') ? 'toast' : 'none';
      default:
        return 'none';
    }
  }
  
  // Tier 4 (passive) - disabled in v0
  return 'none';
}

// ============================================================================
// GATING RULES
// ============================================================================

/**
 * Check if surface has exceeded daily cap
 */
function checkSurfaceDailyCap(surface: Surface): { allowed: boolean; reason?: string } {
  if (surface === 'none') return { allowed: true };
  
  const cap = SURFACE_DAILY_CAPS[surface];
  const count = fieldState.today_public_count_by_surface[surface] || 0;
  
  if (count >= cap) {
    return {
      allowed: false,
      reason: `${surface} daily cap reached (${count}/${cap})`,
    };
  }
  
  return { allowed: true };
}

/**
 * Check if voice has exceeded daily cap
 */
function checkVoiceDailyCap(voice: VoiceName): { allowed: boolean; reason?: string } {
  const policy = VOICE_POLICIES[voice];
  const count = fieldState.today_public_count_by_voice[voice] || 0;
  
  if (count >= policy.maxPerDay) {
    return {
      allowed: false,
      reason: `${voice} daily cap reached (${count}/${policy.maxPerDay})`,
    };
  }
  
  return { allowed: true };
}

/**
 * Check if enough time has passed globally (surface-specific)
 */
function checkGlobalCooldown(surface: Surface): { allowed: boolean; reason?: string } {
  if (!fieldState.last_surface) return { allowed: true };
  
  const now = Date.now();
  const elapsed = (now - fieldState.last_speak_at) / 1000;
  const requiredCooldown = SURFACE_COOLDOWNS[fieldState.last_surface];
  
  if (elapsed < requiredCooldown) {
    const remaining = Math.ceil(requiredCooldown - elapsed);
    return {
      allowed: false,
      reason: `global cooldown (${fieldState.last_surface}: ${remaining}s left)`,
    };
  }
  
  return { allowed: true };
}

/**
 * Check if enough time has passed for specific voice
 */
function checkVoiceCooldown(voice: VoiceName): { allowed: boolean; reason?: string } {
  const policy = VOICE_POLICIES[voice];
  const now = Date.now();
  const lastSpeak = fieldState.last_speak_at_by_voice[voice] || 0;
  const elapsed = (now - lastSpeak) / 1000;
  
  if (elapsed < policy.cooldown) {
    const remaining = Math.ceil(policy.cooldown - elapsed);
    return {
      allowed: false,
      reason: `${voice} cooldown (${remaining}s left)`,
    };
  }
  
  return { allowed: true };
}

/**
 * Check if voice is in recent public messages (spam prevention)
 */
function checkVoiceDominance(voice: VoiceName): { allowed: boolean; reason?: string } {
  if (fieldState.recent_public_voices.includes(voice)) {
    return {
      allowed: false,
      reason: `${voice} in last 2 messages (dominance prevention)`,
    };
  }
  
  return { allowed: true };
}

/**
 * Check if voice is allowed on this surface
 */
function checkVoiceChannel(voice: VoiceName, surface: Surface): { allowed: boolean; reason?: string } {
  if (surface === 'none') return { allowed: false, reason: 'no surface selected' };
  
  const policy = VOICE_POLICIES[voice];
  if (!policy.allowedChannels.includes(surface)) {
    return {
      allowed: false,
      reason: `${voice} not allowed on ${surface}`,
    };
  }
  
  return { allowed: true };
}

// ============================================================================
// MAIN ARBITER
// ============================================================================

/**
 * Process an event and return decision
 */
export async function processEvent(context: EventContext): Promise<ArbiterDecision> {
  const { event, manual = false } = context;
  
  // Determine priority tier
  const priority = getPriorityTier(context);
  
  // Select voice and surface
  const voice = selectVoice(context);
  if (!voice) {
    return {
      surface: 'none',
      voice: null,
      priority,
      reason: 'no voice selected for event',
      allowed: false,
    };
  }
  
  const surface = selectSurface(event, voice, priority);
  if (surface === 'none') {
    return {
      surface: 'none',
      voice,
      priority,
      reason: 'no surface selected',
      allowed: false,
    };
  }
  
  // Tier 1 (manual) bypasses most gates
  if (priority === 1) {
    // Still check voice daily cap
    const voiceCapCheck = checkVoiceDailyCap(voice);
    if (!voiceCapCheck.allowed) {
      return {
        surface: 'none',
        voice,
        priority,
        reason: `MANUAL BLOCKED: ${voiceCapCheck.reason}`,
        allowed: false,
      };
    }
    
    // Still check global cooldown to prevent double-fire
    const globalCheck = checkGlobalCooldown(surface);
    if (!globalCheck.allowed) {
      return {
        surface: 'none',
        voice,
        priority,
        reason: `MANUAL BLOCKED: ${globalCheck.reason}`,
        allowed: false,
      };
    }
    
    // Approved
    updateState(voice, surface);
    return {
      surface,
      voice,
      priority,
      reason: 'MANUAL REQUEST approved',
      allowed: true,
    };
  }
  
  // All other tiers: check all gates
  
  // 1. Surface daily cap
  const surfaceCapCheck = checkSurfaceDailyCap(surface);
  if (!surfaceCapCheck.allowed) {
    return {
      surface: 'none',
      voice,
      priority,
      reason: surfaceCapCheck.reason!,
      allowed: false,
    };
  }
  
  // 2. Voice daily cap
  const voiceCapCheck = checkVoiceDailyCap(voice);
  if (!voiceCapCheck.allowed) {
    return {
      surface: 'none',
      voice,
      priority,
      reason: voiceCapCheck.reason!,
      allowed: false,
    };
  }
  
  // 3. Global cooldown
  const globalCheck = checkGlobalCooldown(surface);
  if (!globalCheck.allowed) {
    return {
      surface: 'none',
      voice,
      priority,
      reason: globalCheck.reason!,
      allowed: false,
    };
  }
  
  // 4. Voice cooldown
  const voiceCooldownCheck = checkVoiceCooldown(voice);
  if (!voiceCooldownCheck.allowed) {
    return {
      surface: 'none',
      voice,
      priority,
      reason: voiceCooldownCheck.reason!,
      allowed: false,
    };
  }
  
  // 5. Voice dominance (spam prevention)
  const dominanceCheck = checkVoiceDominance(voice);
  if (!dominanceCheck.allowed) {
    return {
      surface: 'none',
      voice,
      priority,
      reason: dominanceCheck.reason!,
      allowed: false,
    };
  }
  
  // 6. Voice channel policy
  const channelCheck = checkVoiceChannel(voice, surface);
  if (!channelCheck.allowed) {
    return {
      surface: 'none',
      voice,
      priority,
      reason: channelCheck.reason!,
      allowed: false,
    };
  }
  
  // All gates passed - allow
  updateState(voice, surface);
  
  return {
    surface,
    voice,
    priority,
    reason: `tier ${priority} approved`,
    allowed: true,
  };
}

/**
 * Update state after successful speak
 */
function updateState(voice: VoiceName, surface: Surface): void {
  const now = Date.now();
  
  fieldState.last_speak_at = now;
  fieldState.last_surface = surface;
  fieldState.last_speak_at_by_voice[voice] = now;
  
  // Increment counts
  if (surface !== 'none') {
    fieldState.today_public_count_by_surface[surface]++;
  }
  fieldState.today_public_count_by_voice[voice]++;
  
  // Update recent voices (keep last 2)
  fieldState.recent_public_voices = [voice, ...fieldState.recent_public_voices].slice(0, 2);
  
  // Update heat (simple increment, decays over time)
  fieldState.heat = Math.min(1, fieldState.heat + 0.1);
  
  saveFieldState();
}

/**
 * Reset daily counts (call at midnight or day phase change)
 */
export function resetDailyCounts(): void {
  fieldState.today_public_count_by_surface = {
    toast: 0,
    transmission: 0,
    daily_synthesis: 0,
  };
  fieldState.today_public_count_by_voice = {
    Witness: 0,
    GreenGodmother: 0,
    Firestarter: 0,
    TheTinkerer: 0,
    TheArchitecture: 0,
    MotherOfSilence: 0,
    HollowChalice: 0,
    PatternWeaver: 0,
  };
  fieldState.recent_public_voices = [];
  fieldState.recent_message_hashes = [];
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
 * Log decision in production format
 * Format: [ARB] event=X voice=Y decision=Z reason=...
 */
export function logDecision(context: EventContext, decision: ArbiterDecision): void {
  if (__DEV__) {
    const status = decision.allowed ? 'ALLOW' : 'DEFER';
    console.log(
      `[ARB] event=${context.event} voice=${decision.voice || 'none'} ` +
      `decision=${status} surface=${decision.surface} priority=tier${decision.priority} ` +
      `reason=${decision.reason}`
    );
  }
}
