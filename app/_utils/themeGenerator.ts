/**
 * Harmonic Theme Generator
 * Generates random but coherent/harmonic color schemes for custom archetypes
 * Uses color theory principles to ensure visual harmony
 */

interface HarmonicTheme {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  emoji: string;
}

// Base color palettes organized by mood/energy
const colorPalettes = {
  warm: [
    { h: 0, s: 70, l: 60 },    // Red
    { h: 20, s: 75, l: 55 },   // Orange
    { h: 40, s: 80, l: 50 },   // Gold
    { h: 350, s: 65, l: 58 },  // Rose
  ],
  cool: [
    { h: 200, s: 60, l: 55 },  // Blue
    { h: 180, s: 55, l: 50 },  // Cyan
    { h: 240, s: 50, l: 60 },  // Purple
    { h: 280, s: 55, l: 58 },  // Violet
  ],
  earth: [
    { h: 30, s: 50, l: 45 },   // Brown
    { h: 90, s: 40, l: 50 },   // Olive
    { h: 120, s: 35, l: 45 },  // Forest
    { h: 150, s: 30, l: 50 },  // Sage
  ],
  vibrant: [
    { h: 300, s: 80, l: 60 },  // Magenta
    { h: 60, s: 85, l: 55 },   // Yellow
    { h: 140, s: 70, l: 50 },  // Green
    { h: 320, s: 75, l: 58 },  // Pink
  ],
};

// Archetype emoji options organized by energy
const emojiSets = {
  celestial: ['🌙', '⭐', '✨', '🌟', '💫', '🌠'],
  nature: ['🌿', '🍃', '🌱', '🌾', '🌳', '🌲'],
  elemental: ['🔥', '💧', '🌊', '🌬️', '⚡', '🌪️'],
  mystical: ['🔮', '🎭', '👁️', '🗝️', '🕯️', '📿'],
  cosmic: ['🌌', '🪐', '☄️', '🌑', '🌕', '🌗'],
  symbolic: ['♾️', '☯️', '🎯', '🧭', '⚖️', '🎪'],
};

/**
 * Convert HSL to hex color
 */
function hslToHex(h: number, s: number, l: number): string {
  l /= 100;
  const a = s * Math.min(l, 1 - l) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

/**
 * Generate a harmonic color scheme using color theory
 */
function generateHarmonicColors(baseColor: { h: number; s: number; l: number }): {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
} {
  const { h, s, l } = baseColor;
  
  // Choose a random harmony type
  const harmonyTypes = ['complementary', 'analogous', 'triadic', 'split-complementary'];
  const harmonyType = harmonyTypes[Math.floor(Math.random() * harmonyTypes.length)];
  
  let secondaryH: number;
  let accentH: number;
  
  switch (harmonyType) {
    case 'complementary':
      // Opposite on color wheel
      secondaryH = (h + 180) % 360;
      accentH = (h + 30) % 360;
      break;
    case 'analogous':
      // Adjacent colors
      secondaryH = (h + 30) % 360;
      accentH = (h - 30 + 360) % 360;
      break;
    case 'triadic':
      // Evenly spaced (120 degrees apart)
      secondaryH = (h + 120) % 360;
      accentH = (h + 240) % 360;
      break;
    case 'split-complementary':
      // Base + two adjacent to complement
      secondaryH = (h + 150) % 360;
      accentH = (h + 210) % 360;
      break;
    default:
      secondaryH = (h + 30) % 360;
      accentH = (h + 60) % 360;
  }
  
  // Generate colors with slight variations in saturation and lightness
  const primary = hslToHex(h, s, l);
  const secondary = hslToHex(secondaryH, s - 10, l + 5);
  const accent = hslToHex(accentH, s + 5, l - 5);
  const background = hslToHex(h, s - 30, l + 20);
  
  return { primary, secondary, accent, background };
}

/**
 * Generate a complete harmonic theme for a custom archetype
 */
export function generateHarmonicTheme(): HarmonicTheme {
  // Randomly select a palette category
  const paletteKeys = Object.keys(colorPalettes) as Array<keyof typeof colorPalettes>;
  const selectedPalette = paletteKeys[Math.floor(Math.random() * paletteKeys.length)];
  const palette = colorPalettes[selectedPalette];
  
  // Randomly select a base color from the palette
  const baseColor = palette[Math.floor(Math.random() * palette.length)];
  
  // Generate harmonic colors
  const colors = generateHarmonicColors(baseColor);
  
  // Randomly select an emoji set
  const emojiKeys = Object.keys(emojiSets) as Array<keyof typeof emojiSets>;
  const selectedEmojiSet = emojiKeys[Math.floor(Math.random() * emojiKeys.length)];
  const emojiSet = emojiSets[selectedEmojiSet];
  
  // Randomly select an emoji
  const emoji = emojiSet[Math.floor(Math.random() * emojiSet.length)];
  
  return {
    ...colors,
    emoji,
  };
}

/**
 * Regenerate just the colors while keeping the emoji
 */
export function regenerateColors(currentEmoji: string): HarmonicTheme {
  const theme = generateHarmonicTheme();
  return {
    ...theme,
    emoji: currentEmoji, // Keep the current emoji
  };
}

/**
 * Regenerate just the emoji while keeping the colors
 */
export function regenerateEmoji(currentTheme: Omit<HarmonicTheme, 'emoji'>): HarmonicTheme {
  const emojiKeys = Object.keys(emojiSets) as Array<keyof typeof emojiSets>;
  const selectedEmojiSet = emojiKeys[Math.floor(Math.random() * emojiKeys.length)];
  const emojiSet = emojiSets[selectedEmojiSet];
  const emoji = emojiSet[Math.floor(Math.random() * emojiSet.length)];
  
  return {
    ...currentTheme,
    emoji,
  };
}
