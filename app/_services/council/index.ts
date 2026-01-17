/**
 * Council System - The Resonance Architecture
 * 
 * A petition-based voice system where:
 * - Voices observe and propose (with agency to choose silence)
 * - The Arbiter decides what surfaces (three-key gating)
 * - The Field breathes (inhale/hold/exhale/stillness)
 * 
 * This replaces the mechanical trigger system with resonance.
 */

// Types
export * from './types';

// Voice Identities
export { 
  VOICE_IDENTITIES,
  getVoiceIdentity,
  getAllVoiceIdentities,
  getSubstanceVoices,
  getInnerArchitectureVoices,
  getMetaVoices,
} from './voiceIdentities';

// Signal Collection
export {
  collectAllSignals,
  getNewSignals,
  getSignalsInWindow,
} from './signalCollector';

// Voice Engine
export {
  generatePetition,
  generatePetitionsFromVoices,
  getRelevantVoices,
} from './voiceEngine';

// Arbiter
export {
  evaluatePetition,
  evaluatePetitions,
  loadArbiterState,
  saveArbiterState,
  decayHeat,
  resetArbiterState,
} from './arbiter';

// Orchestrator
export {
  runOrchestrationCycle,
  recordUserActivity,
  getFieldState,
  forceBreathPhase,
  loadTransmissionHistory,
  markTransmissionRead,
  getUnreadTransmissionCount,
  type CouncilTransmission,
  type OrchestrationResult,
} from './orchestrator';

// Breathing Scheduler
export {
  startBreathingScheduler,
  stopBreathingScheduler,
  recordSchedulerActivity,
  getSchedulerState,
  forceOrchestration,
  onTransmission,
  onPhaseChange,
} from './breathingScheduler';
