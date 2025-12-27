export type ContainerId = 'morning' | 'afternoon' | 'evening' | 'late' | 'situational' | 'uplift';

export interface ColorScheme {
  bg: string;
  accent: string;
  text: string;
  dim: string;
  signal: string;
  card: string;
}

export interface ContainerItem {
  id: string;
  title: string;
  container: ContainerId;
  category: 'time' | 'situational' | 'uplift' | 'crafted';
  body_cue: string;
  micro: string;
  ultra_micro?: string;
  desire: string;
  createdAt?: string; // ISO timestamp when task was created
  createdTimestamp?: number; // Unix timestamp for easier sorting/filtering
}

export interface Ally {
  id: string;
  name: string; // Chemical/category name (e.g., "Cannabis", "Stimulants")
  mythicName?: string; // Mythologized name (e.g., "Green Godmother", "Firestarter")
  face: string;
  invocation: string;
  function: string;
  shadow: string;
  ritual: string;
  log: Moment[];
  createdAt?: string; // ISO timestamp when ally was added
  createdTimestamp?: number; // Unix timestamp for easier sorting/filtering
}

export interface Moment {
  id: string;
  date: string; // YYYY-MM-DDTHH:mm:ss.sssZ
  timestamp: number;
  allyId?: string;
  anchorId?: string;
  allyName?: string;
  anchorTitle?: string;
  container: ContainerId;
  
  // Journalistic Synthesis Fields
  // Journalistic Synthesis Fields (The 3-part check-in)
  tone: string; // e.g., "Lighter", "Same", "Spikier"
  frequency: string; // e.g., "Water", "Light", "Movement"
  presence: string; // e.g., "The Setting of the Altar", "The Invocation", "The Field Report"

  // Guided Reflection Prompts
  context: string; // "The Setting of the Altar"
  action_reflection: string; // "The Invocation"
  result_shift: string; // "The Field Report"
  conclusion_offering: string; // "The Offering"
  
  // Old JournalEntry fields, now part of Moment
  text: string;
}

export interface Completion {
  itemId: string;
  date: string; // YYYY-MM-DD
  timestamp: number;
}

export interface Pattern {
  id: string;
  date: string; // YYYY-MM-DDTHH:mm:ss.sssZ
  timestamp: number;
  text: string; // The pattern observation
  category?: string; // Optional: 'anchor', 'substance', 'time', 'general'
}

export interface Conversation {
  id: string;
  date: string; // YYYY-MM-DDTHH:mm:ss.sssZ
  timestamp: number;
  substanceName: string; // e.g., "Cannabis"
  substanceMythicName?: string; // e.g., "Green Godmother"
  archetypeName?: string; // e.g., "Analyst" (if archetype was active)
  messages: Array<{
    speaker: string; // "Green Godmother", "Analyst", "The Field"
    text: string;
    speakerType: 'substance' | 'archetype' | 'field';
  }>;
}

export interface FieldWhisper {
  id: string;
  date: string; // YYYY-MM-DDTHH:mm:ss.sssZ
  timestamp: number;
  whispers: string[]; // Array of poetic observations from the Field
}

export interface FoodEntry {
  id: string;
  date: string; // YYYY-MM-DDTHH:mm:ss.sssZ
  timestamp: number;
  name: string; // What was eaten
  feeling?: string; // Optional: how you feel
  notes?: string; // Optional: observations about the meal
  energy_level?: string; // Optional: 'low', 'medium', 'high'
}

export interface MovementEntry {
  id: string;
  date: string; // YYYY-MM-DDTHH:mm:ss.sssZ
  timestamp: number;
  act: string; // What physical action was taken
  resistance: string; // Minimal, Noticeable, Overwhelming, Paralyzing
  gainingInertia: string; // What momentum was gathered
  goalposts: string; // Markers and reflections on the path
}

export interface Dreamseed {
  id: string;
  date: string; // YYYY-MM-DDTHH:mm:ss.sssZ
  timestamp: number;
  word: string; // The seed word/phrase to carry into sleep
}

export interface Archetype {
  id: string;
  name: string; // "Analyst"
  subtitle: string; // "Patternseer"
  icon: string; // 🧠
  bio: string;
  activation_phrase: string;
  body_cue: string;
  invocation_visualization: string;
  deactivation_phrase: string;
  color_theme: {
    accent: string;
    overlay: string; // Color overlay when archetype is active
  };
  theme?: { // Optional harmonic theme for custom archetypes
    primary: string;
    secondary: string;
    accent: string;
    background: string;
  };
  isDefault?: boolean; // Mark default archetypes to protect from deletion
  createdAt?: string; // ISO timestamp when archetype was created
  createdTimestamp?: number; // Unix timestamp for easier sorting/filtering
}

export interface AppState {
  items: ContainerItem[];
  allies: Ally[];
  journalEntries: Moment[];
  substanceJournalEntries: Moment[]; // Separate journal for Substances section
  completions: Completion[];
  patterns: Pattern[];
  foodEntries: FoodEntry[];
  movementEntries: MovementEntry[]; // Movement & embodiment tracking
  dreamseeds: Dreamseed[]; // Words/phrases carried into sleep
  archetypes: Archetype[]; // User's archetypes (includes defaults + custom)
  conversations: Conversation[]; // Substance-archetype dialogues
  fieldWhispers: FieldWhisper[]; // Field pattern observations
  activeContainer: ContainerId;

}
