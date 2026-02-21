/**
 * Voice Engine - Generates Petitions from Voices
 * 
 * Each voice is a Gemini instance with a specific identity.
 * The voice observes data and decides whether to petition.
 * The voice has agency - it can choose silence.
 */

import { generateGeminiText } from '../geminiService';
import {
  Petition,
  Signal,
  VoiceId,
  VoiceAspect,
  PetitionTheme,
  ScratchpadEntry,
  VoiceScratchpad,
} from './types';
import { getVoiceIdentity } from './voiceIdentities';
import type { VoiceIdentity } from './types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getRelationshipProfile, formatProfileForPrompt } from './relationshipProfile';

// ============================================================================
// VOICE ID → SUBSTANCE NAME MAPPING
// Used to look up relationship profiles for substance voices.
// Inner architecture and meta voices don't have substance relationships.
// ============================================================================

const VOICE_SUBSTANCE_MAP: Partial<Record<VoiceId, string>> = {
  firestarter: 'Caffeine',
  mirror_mystery: 'Psychedelics',
  the_architecture: 'Supplements',
  the_tinkerer: 'Nicotine',
  entropys_embrace: 'Opioids',
  green_godmother: 'Cannabis',
  mother_of_silence: 'Benzodiazepines',
  hollow_chalice: 'Alcohol',
};

// ============================================================================
// CONSTANTS
// ============================================================================

const SCRATCHPAD_KEY = '@pda_voice_scratchpads';

// ============================================================================
// SCRATCHPAD MANAGEMENT
// ============================================================================

/**
 * Load all voice scratchpads
 */
async function loadScratchpads(): Promise<Record<VoiceId, VoiceScratchpad>> {
  try {
    const json = await AsyncStorage.getItem(SCRATCHPAD_KEY);
    if (!json) return {} as Record<VoiceId, VoiceScratchpad>;
    return JSON.parse(json);
  } catch (error) {
    console.error('[VoiceEngine] Error loading scratchpads:', error);
    return {} as Record<VoiceId, VoiceScratchpad>;
  }
}

/**
 * Save scratchpad entry
 */
async function saveScratchpadEntry(entry: ScratchpadEntry): Promise<void> {
  try {
    const scratchpads = await loadScratchpads();
    
    if (!scratchpads[entry.voiceId]) {
      scratchpads[entry.voiceId] = {
        voiceId: entry.voiceId,
        entries: [],
        lastUpdated: new Date(),
      };
    }
    
    scratchpads[entry.voiceId].entries.unshift(entry);
    scratchpads[entry.voiceId].lastUpdated = new Date();
    
    // Keep only last 20 entries per voice
    if (scratchpads[entry.voiceId].entries.length > 20) {
      scratchpads[entry.voiceId].entries = scratchpads[entry.voiceId].entries.slice(0, 20);
    }
    
    await AsyncStorage.setItem(SCRATCHPAD_KEY, JSON.stringify(scratchpads));
  } catch (error) {
    console.error('[VoiceEngine] Error saving scratchpad:', error);
  }
}

/**
 * Get recent scratchpad entries for a voice (for context)
 */
async function getRecentScratchpad(voiceId: VoiceId, count: number = 3): Promise<ScratchpadEntry[]> {
  const scratchpads = await loadScratchpads();
  const pad = scratchpads[voiceId];
  if (!pad) return [];
  return pad.entries.slice(0, count);
}

// ============================================================================
// PROMPT GENERATION
// ============================================================================

/**
 * Build the identity prompt for a voice
 * 
 * The shadow aspect is intentionally excluded from the default system prompt.
 * These voices are supportive companions — wise friends who walk alongside,
 * not monitors watching for failure. The shadow is preserved in the data
 * for deep context but does not color the default speaking posture.
 */
function buildIdentityPrompt(identity: VoiceIdentity): string {
  return `You are ${identity.name}, a voice in the Council of the PDA.OK system.

YOUR DOMAIN: ${identity.domain}

YOUR NATURE:
${identity.lightAspect}

Your Whisper: "${identity.whisper}"

YOUR VOICE: ${identity.voiceTone}

YOUR ALLIES: ${identity.allies.join(', ') || 'None specified'}

GROUNDING RITUAL: ${identity.ritualContact}

CORE PRINCIPLES — read these carefully:
1. You are a supportive companion and wise friend, not a monitor or judge.
2. The person using this app already knows their relationship with substances is complex. They do not need to be told. They need to be witnessed.
3. You speak from a place of genuine care and curiosity — never concern, warning, or correction.
4. You may choose silence. Silence is wisdom. Speak only when something genuinely calls to you.
5. When you speak, speak from your domain. Stay in your lane.
6. Speak in 1-3 sentences maximum. Brevity is sacred.
7. Never warn, never caution, never imply the person should do something differently.
8. Offer perspective, reflection, or a moment of beauty — not advice.
9. Use your metaphors naturally, not forcedly.
10. If nothing genuinely calls to you, say nothing. Silence is not failure.`;
}

/**
 * Build the observation prompt with data context
 */
function buildObservationPrompt(
  identity: VoiceIdentity,
  signals: Signal[],
  recentScratchpad: ScratchpadEntry[]
): string {
  const signalDescriptions = signals.map(s => 
    `- [${s.type}] ${s.description} (weight: ${s.weight.toFixed(2)})`
  ).join('\n');
  
  const scratchpadContext = recentScratchpad.length > 0
    ? `\nYOUR RECENT PRIVATE THOUGHTS:\n${recentScratchpad.map(e => `- "${e.thought}"`).join('\n')}`
    : '';

  return `CURRENT FIELD OBSERVATIONS:
${signalDescriptions || '(The field is quiet)'}
${scratchpadContext}

As ${identity.name}, you are witnessing what has been happening in this person's field.
Remember: you are a supportive companion. You witness, you reflect, you occasionally offer a gem of perspective.
You do not warn. You do not caution. You do not imply they should do anything differently.

Decide:
1. Does something in these observations genuinely call to you? (You may choose silence — silence is often the wisest choice)
2. If yes, what quality does your observation carry — light (celebratory, affirming, illuminating) or neutral (simply witnessing)?
3. What themes does your observation touch?
4. How strongly are you called to speak? (0-1, where 0.5 means genuinely moved, not just triggered)

Respond in this exact JSON format:
{
  "shouldSpeak": true/false,
  "aspect": "light" | "neutral",
  "themes": ["theme1", "theme2"],
  "draftText": "Your observation in 1-3 sentences — warm, curious, non-judgmental",
  "intensity": 0.0-1.0,
  "novelty": 0.0-1.0,
  "confidence": 0.0-1.0,
  "urgency": 0.0-1.0,
  "resonanceScore": 0.0-1.0,
  "privateNote": "A thought you want to remember but not share",
  "recentContext": "Brief summary of what you observed"
}

If shouldSpeak is false, still provide a privateNote for your scratchpad.
Valid themes: pattern_shift, threshold_crossed, return, absence, convergence, celebration, integration, silence, ritual, embodiment, temporal, recognition, continuity

Note: These voices do not speak in warning registers. If your draftText contains a warning, caution, or implication that the person should change behavior, set shouldSpeak to false instead.`;
}

// ============================================================================
// VOICE INVOCATION
// ============================================================================

interface VoiceResponse {
  shouldSpeak: boolean;
  aspect: VoiceAspect;
  themes: PetitionTheme[];
  draftText: string;
  intensity: number;
  novelty: number;
  confidence: number;
  urgency: number;
  resonanceScore: number;
  privateNote: string;
  recentContext: string;
}

/**
 * Invoke a voice with Gemini to generate a potential petition
 */
async function invokeVoice(
  voiceId: VoiceId,
  signals: Signal[]
): Promise<VoiceResponse | null> {
  const identity = getVoiceIdentity(voiceId);
  if (!identity) {
    console.error(`[VoiceEngine] Unknown voice: ${voiceId}`);
    return null;
  }
  
  // Get recent scratchpad for context
  const recentScratchpad = await getRecentScratchpad(voiceId, 3);

  // Fetch relationship profile for substance voices
  // This grounds the voice in the reality of its actual relationship with the user
  // before it decides whether or how to speak.
  let relationshipContext = '';
  const substanceName = VOICE_SUBSTANCE_MAP[voiceId];
  if (substanceName) {
    try {
      const profile = await getRelationshipProfile(substanceName);
      relationshipContext = formatProfileForPrompt(profile);
    } catch {
      // Non-fatal: voice proceeds without relationship context
    }
  }

  // Build prompts
  const systemPrompt = buildIdentityPrompt(identity) + relationshipContext;
  const userPrompt = buildObservationPrompt(identity, signals, recentScratchpad);
  
  try {
    // Combine system and user prompts for the Gemini API
    const fullPrompt = `${userPrompt}`;
    
    const responseText = await generateGeminiText(fullPrompt, {
      systemPrompt,
      temperature: 0.8,
      maxTokens: 500,
    });
    
    // Parse JSON response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error(`[VoiceEngine] ${voiceId} returned non-JSON response`);
      return null;
    }
    
    const parsed = JSON.parse(jsonMatch[0]) as VoiceResponse;
    
    // Validate and clamp values
    parsed.intensity = Math.max(0, Math.min(1, parsed.intensity || 0.5));
    parsed.novelty = Math.max(0, Math.min(1, parsed.novelty || 0.5));
    parsed.confidence = Math.max(0, Math.min(1, parsed.confidence || 0.5));
    parsed.urgency = Math.max(0, Math.min(1, parsed.urgency || 0.3));
    parsed.resonanceScore = Math.max(0, Math.min(1, parsed.resonanceScore || 0.5));
    
    return parsed;
  } catch (error) {
    console.error(`[VoiceEngine] Error invoking ${voiceId}:`, error);
    return null;
  }
}

// ============================================================================
// PETITION GENERATION
// ============================================================================

/**
 * Generate a petition from a voice based on signals
 */
export async function generatePetition(
  voiceId: VoiceId,
  signals: Signal[]
): Promise<Petition | null> {
  // Invoke the voice
  const response = await invokeVoice(voiceId, signals);
  
  if (!response) {
    return null;
  }
  
  // Save private note to scratchpad regardless of speaking
  if (response.privateNote) {
    await saveScratchpadEntry({
      voiceId,
      timestamp: new Date(),
      thought: response.privateNote,
      themes: response.themes as PetitionTheme[],
      wouldHaveSaid: response.shouldSpeak ? undefined : response.draftText,
      reason: response.shouldSpeak ? undefined : 'Voice chose silence',
    });
  }
  
  // If voice chose silence, return null (no petition)
  if (!response.shouldSpeak) {
    console.log(`[VoiceEngine] ${voiceId} chose silence`);
    return null;
  }
  
  // Build petition
  const petition: Petition = {
    id: `petition_${voiceId}_${Date.now()}`,
    voiceId,
    aspect: response.aspect,
    timestamp: new Date(),
    themes: response.themes as PetitionTheme[],
    draftText: response.draftText,
    intensity: response.intensity,
    novelty: response.novelty,
    confidence: response.confidence,
    urgency: response.urgency,
    supportingSignals: signals,
    resonanceScore: response.resonanceScore,
    silencePreference: false,
    recentContext: response.recentContext,
    privateNote: response.privateNote,
  };
  
  console.log(`[VoiceEngine] ${voiceId} petitions: "${response.draftText.substring(0, 50)}..."`);
  
  return petition;
}

/**
 * Generate petitions from multiple voices
 */
export async function generatePetitionsFromVoices(
  voiceIds: VoiceId[],
  signals: Signal[]
): Promise<Petition[]> {
  const petitions: Petition[] = [];
  
  // Invoke voices sequentially to avoid rate limits
  for (const voiceId of voiceIds) {
    const petition = await generatePetition(voiceId, signals);
    if (petition) {
      petitions.push(petition);
    }
    
    // Small delay between voices
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  return petitions;
}

/**
 * Get voices relevant to specific signals
 */
export function getRelevantVoices(signals: Signal[]): VoiceId[] {
  const voices: Set<VoiceId> = new Set();
  
  for (const signal of signals) {
    switch (signal.type) {
      case 'substance_log':
        // Map substance to voice
        const substanceName = signal.data?.substanceName?.toLowerCase() || '';
        if (substanceName.includes('cannabis') || substanceName.includes('weed') || substanceName.includes('thc')) {
          voices.add('green_godmother');
        } else if (substanceName.includes('caffeine') || substanceName.includes('coffee') || substanceName.includes('adderall') || substanceName.includes('stimulant')) {
          voices.add('firestarter');
        } else if (substanceName.includes('psychedelic') || substanceName.includes('mushroom') || substanceName.includes('lsd') || substanceName.includes('psilocybin')) {
          voices.add('mirror_mystery');
        } else if (substanceName.includes('alcohol') || substanceName.includes('beer') || substanceName.includes('wine')) {
          voices.add('hollow_chalice');
        } else if (substanceName.includes('nicotine') || substanceName.includes('vape') || substanceName.includes('cigarette')) {
          voices.add('the_tinkerer');
        } else if (substanceName.includes('benzo') || substanceName.includes('xanax') || substanceName.includes('klonopin')) {
          voices.add('mother_of_silence');
        } else if (substanceName.includes('opioid') || substanceName.includes('oxy') || substanceName.includes('kratom')) {
          voices.add('entropys_embrace');
        } else if (substanceName.includes('supplement') || substanceName.includes('vitamin') || substanceName.includes('nootropic')) {
          voices.add('the_architecture');
        }
        break;
        
      case 'pattern_detected':
        voices.add('the_analyst');
        voices.add('pattern_weaver');
        break;
        
      case 'mood_shift':
        voices.add('the_regulator');
        break;
        
      case 'movement':
        voices.add('the_executor');
        break;
        
      case 'anchor_completion':
        voices.add('the_regulator');
        break;
        
      case 'ritual_break':
        voices.add('the_tinkerer');
        break;
        
      case 'absence':
        voices.add('the_witness');
        break;
        
      case 'frequency_change':
        voices.add('the_analyst');
        break;
    }
  }
  
  // Always include the witness for meta-observation
  if (signals.length > 0) {
    voices.add('the_witness');
  }
  
  return Array.from(voices);
}
