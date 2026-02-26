/**
 * Council Types - The Foundation of the Resonance Architecture
 * 
 * This file defines the core types for the petition-based voice system.
 * Voices propose, the Arbiter decides, the Field observes.
 */

// ============================================================================
// VOICE IDENTITY
// ============================================================================

/**
 * The Council of Voices - each has a domain and perspective
 */
export type VoiceId = 
  // Substance Voices (from the Codex)
  | 'firestarter'           // Stimulants - The Pulse of Becoming
  | 'mirror_mystery'        // Entheogens - The Cosmic Lens
  | 'the_architecture'      // Nootropics/Supplements - The Living Blueprint
  | 'the_tinkerer'          // Nicotine - The Breath Between Details
  | 'entropys_embrace'      // Opioids - The Velvet Abyss
  | 'green_godmother'       // Cannabis - The Bridge Between Worlds
  | 'mother_of_silence'     // Benzodiazepines - The Restorer of Coherence
  | 'hollow_chalice'        // Alcohol - The Social Heart
  // Inner Architecture Voices
  | 'the_creator'           // Synth - Architect of Wonder
  | 'the_executor'          // Momentum Mode - Embodied Will
  | 'the_analyst'           // Patternseer - Clarity Incarnate
  | 'the_regulator'         // Groundkeeper - Guardian of Breath
  // Meta Voices
  | 'the_witness'           // The Field's primary observer
  | 'pattern_weaver';       // Memory's Loom - synthesizes patterns

/**
 * Voice aspect - light or shadow manifestation
 */
export type VoiceAspect = 'light' | 'shadow' | 'neutral';

/**
 * Full identity of a voice - who they are, how they speak
 */
export interface VoiceIdentity {
  id: VoiceId;
  name: string;                    // Display name (e.g., "Green Godmother")
  domain: string;                  // What they observe (e.g., "Cannabis patterns")
  lightAspect: string;             // Their constructive nature
  shadowAspect: string;            // Their distorted nature
  whisper: string;                 // Their signature phrase
  voiceTone: string;               // How they speak (poetic, analytical, etc.)
  allies: VoiceId[];               // Voices they resonate with
  tensions: VoiceId[];             // Voices they may conflict with
  ritualContact: string;           // Grounding gesture
}

// ============================================================================
// PETITION SYSTEM
// ============================================================================

/**
 * Themes a petition can carry
 */
export type PetitionTheme = 
  | 'pattern_shift'         // Something changed in the rhythm
  | 'threshold_crossed'     // A significant boundary was crossed
  | 'return'                // User returned to a pattern
  | 'absence'               // Notable absence of something
  | 'convergence'           // Multiple signals align
  | 'celebration'           // Something worth acknowledging
  | 'integration'           // Time to synthesize
  | 'silence'               // Nothing to say (explicit)
  | 'ritual'                // Ritual-related observation
  | 'embodiment'            // Body/physical observation
  | 'temporal'              // Time-based observation
  | 'recognition'           // Acknowledging something seen
  | 'continuity';           // Thread of ongoing pattern

/**
 * A petition from a voice to the Arbiter
 * The voice proposes; the Arbiter decides
 */
export interface Petition {
  id: string;                      // Unique identifier
  voiceId: VoiceId;                // Who is petitioning
  aspect: VoiceAspect;             // Light/shadow/neutral manifestation
  timestamp: Date;                 // When the petition was created
  
  // Content
  themes: PetitionTheme[];         // What themes this addresses
  draftText: string;               // The proposed message
  alternateTexts?: string[];       // Alternative phrasings
  
  // Metadata for Arbiter scoring
  intensity: number;               // 0-1: How strongly the voice wants to speak
  novelty: number;                 // 0-1: How new/different this observation is
  confidence: number;              // 0-1: How certain the voice is
  urgency: number;                 // 0-1: Time-sensitivity
  
  // Supporting evidence
  supportingSignals: Signal[];     // What data triggered this
  
  // Voice's self-assessment
  resonanceScore: number;          // 0-1: Voice's own sense of whether this should surface
  silencePreference: boolean;      // True if voice would prefer to stay silent
  
  // Context
  recentContext: string;           // Brief summary of what the voice observed
  privateNote?: string;            // For the scratchpad (never surfaces)
}

/**
 * A signal that supports a petition
 */
export interface Signal {
  type: 'substance_log' | 'anchor_completion' | 'pattern_detected' | 
        'time_elapsed' | 'mood_shift' | 'nourishment' | 'movement' | 
        'absence' | 'frequency_change' | 'ritual_break';
  description: string;
  timestamp: Date;
  weight: number;                  // 0-1: How significant this signal is
  data?: Record<string, any>;      // Raw data if needed
}

// ============================================================================
// ARBITER SYSTEM
// ============================================================================

/**
 * The three keys that must turn for a petition to pass
 */
export interface ThreeKeys {
  change: boolean;                 // Did something shift?
  convergence: boolean;            // Do multiple signals/voices agree?
  cost: boolean;                   // Is it worth spending the silence?
}

/**
 * Arbiter's visibility mode
 */
export type ArbiterVisibility = 
  | 'hidden'                       // Arbiter stays invisible
  | 'seal'                         // Tiny glyph appears
  | 'whisper'                      // One-line toast from Arbiter
  | 'presence';                    // Fuller appearance (rare)

/**
 * Arbiter's decision on a petition
 */
export interface ArbiterDecision {
  petitionId: string;
  allowed: boolean;
  surface: 'toast' | 'transmission' | 'daily_synthesis' | 'none';
  reason: string;                  // Why this decision was made
  arbiterVisibility: ArbiterVisibility;
  arbiterText?: string;            // If visibility is whisper/presence
  modifiedText?: string;           // If Arbiter softened/adjusted the message
  keysState: ThreeKeys;            // Which keys turned
  score: number;                   // Final score (for debugging)
}

/**
 * Arbiter state - tracks what has been allowed
 */
export interface ArbiterState {
  lastSpeakAt: number;                           // Global last speak timestamp
  lastSpeakByVoice: Record<VoiceId, number>;     // Per-voice timestamps
  todayCount: {
    toast: number;
    transmission: number;
    dailySynthesis: number;
    arbiterAppearances: number;
  };
  recentVoices: VoiceId[];                       // Last 3 voices that spoke
  recentThemes: PetitionTheme[];                 // Last 5 themes surfaced
  heat: number;                                  // 0-1: Field saturation
  silenceDebt: number;                           // Hours since last speech
}

// ============================================================================
// FIELD STATE
// ============================================================================

/**
 * The breathing cycle of the system
 */
export type BreathPhase = 
  | 'inhale'                       // User is active, voices observe
  | 'hold'                         // Brief pause, petitions form
  | 'exhale'                       // Arbiter decides, transmissions surface
  | 'stillness';                   // Nothing speaks, even if eligible

/**
 * Overall field state
 */
export interface FieldState {
  breathPhase: BreathPhase;
  lastActivityAt: number;          // When user last did something
  lastTransmissionAt: number;      // When last transmission surfaced
  activeVoices: VoiceId[];         // Voices with pending petitions
  fieldHeat: number;               // 0-1: Overall activity level
  dayPhase: 'morning' | 'afternoon' | 'evening' | 'late';
}

// ============================================================================
// SCRATCHPAD
// ============================================================================

/**
 * A voice's private thought (never surfaces directly)
 */
export interface ScratchpadEntry {
  voiceId: VoiceId;
  timestamp: Date;
  thought: string;
  themes: PetitionTheme[];
  wouldHaveSaid?: string;          // What they would have said if allowed
  reason?: string;                 // Why they didn't petition
}

/**
 * Voice scratchpad - private journal of observations
 */
export interface VoiceScratchpad {
  voiceId: VoiceId;
  entries: ScratchpadEntry[];
  lastUpdated: Date;
}
