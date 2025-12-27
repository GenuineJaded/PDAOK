import { ContainerId } from "./Types";

// Hex values are chosen to match the named color and mood, ensuring adequate contrast
// and avoiding bright, "shiny" colors as requested.

export const CircadianPalette = {
  // --- Palette Refinement: Lower Contrast, Softer Glow ---
  morning: {
    // Mood: warm awakening, grounded. Feels like dawn earth and honey light.
    bg: "#4A3F35", // Deep warm brown (like coffee grounds)
    bgGradient: "linear-gradient(180deg, #4A3F35 0%, #5A4D40 100%)", // Warm earth gradient
    accent: "#A2B8A6", // Muted Sage (Accent background)
    text: "#F0E5D8", // Light cream (High contrast)
    dim: "#C4A57B", // Warm sand (Secondary text)
    signal: "#E8B86D", // Honey gold (Signal color)
    card: "#3A342C", // Darker warm card
    cardOverlay: "rgba(212, 165, 116, 0.12)", // Honey glow on cards
  },
  afternoon: {
    // Mood: cool clarity, focused. Feels like deep water and slate stone.
    bg: "#3A4550", // Deep cool slate
    bgGradient: "linear-gradient(180deg, #3A4550 0%, #455560 100%)", // Cool stone gradient
    accent: "#6B8CAE", // Steel blue (Accent background)
    text: "#E8F0F5", // Pale blue-white (High contrast)
    dim: "#8FA8B8", // Cool mist (Secondary text)
    signal: "#7BC4C4", // Soft aqua (Signal color)
    card: "#2C3840", // Darker cool card
    cardOverlay: "rgba(95, 168, 184, 0.12)", // Aqua shimmer on cards
  },
  evening: {
    // Mood: warm descent; the body exhales. Feels like candlelight on clay walls.
    bg: "#4D3A30", // Deep Copper/Brown (Ancient Copper - Core background)
    bgGradient: "linear-gradient(180deg, #4D3A30 0%, #5A4438 100%)", // Plum fade
    accent: "#8C4B3F", // Deeper rust (Accent background)
    text: "#F0E5D8", // Light Cream/Off-white (Text - High contrast for dark background)
    dim: "#B87333", // Copper/umber (Secondary text)
    signal: "#D4AF37", // Muted amber (Signal color)
    card: "#333333", // Darker card
    cardOverlay: "rgba(140, 75, 63, 0.12)", // Warm rust glow on cards
  },
  late: {
    // Mood: cocooned, quiet, protective. Feels like deep forest or night air.
    bg: "#1A1A1A", // Near Black (Core background - Darkest for night)
    bgGradient: "linear-gradient(180deg, #1A1A1A 0%, #242438 100%)", // Indigo wash
    accent: "#5A6E5A", // Dark moss (Accent background)
    text: "#F0F0F0", // Off-white (Text - High contrast for dark background)
    dim: "#A9B8A6", // Muted sage (Secondary text)
    signal: "#4682B4", // Moon-blue (Signal color)
    card: "#333333", // Darker card
    cardOverlay: "rgba(90, 110, 90, 0.08)", // Moss whisper on cards
  },
  // Neutral/Utility Containers
  situational: {
    // Mood: flexible, mid-tone palette that can overlay all others.
    bg: "#D3D3D3", // Neutral gray with whisper of blue (Core background)
    accent: "#A9A9A9", // Light slate (Accent background)
    text: "#36454F", // Charcoal (Text)
    dim: "#C0C0C0", // Mist gray (Secondary text)
    signal: "#B19CD9", // Gentle lavender (Signal color)
    card: "#FFFFFF",
  },
  uplift: {
    // Mood: clear energy, upward flow without glare. Feels like dawn sky after rain.
    bg: "#E6E6FA", // Very light periwinkle (Core background)
    accent: "#B19CD9", // Soft lilac (Accent background)
    text: "#000080", // Dark indigo (Text)
    dim: "#B19CD9", // Muted violet (Secondary text)
    signal: "#00CED1", // Thin line of cyan (Signal color)
    card: "#FFFFFF",
  },
};

export const StateIndicators = {
  mint: "#A2B8A6", // Rest
  grey: "#A9A9A9", // Neutral
  violet: "#B19CD9", // Focus
};

export const ContainerThemes: Record<ContainerId, string> = {
  morning: "Coming Online",
  afternoon: "Recalibration",
  evening: "Integration",
  late: "Descent",
  situational: "Situational Resonance",
  uplift: "Uplift & Expansion",
};

// Screen-specific color palettes (not time-bound)
export const ScreenPalettes = {
  substances: {
    // Earthy greens/browns - pharmacopoeia vibes (softer, more resonant)
    bg: "#3A4A3C", // Deep forest green
    accent: "#A8C69F", // Soft sage
    text: "#E8EFE6", // Pale mint
    dim: "#8FA888", // Muted sage
    signal: "#D4C5A0", // Warm sand
    card: "#4A5A4C", // Slightly lighter forest
  },
  patterns: {
    // Cool blues/grays - analytical, observational
    bg: "#E6EBF0", // Soft blue-gray
    accent: "#6B8CAE", // Steel blue
    text: "#2C3E50", // Dark slate
    dim: "#95A5B8", // Muted blue-gray
    signal: "#5D7A99", // Deep blue
    card: "#F8FAFB", // Almost white
  },
  nourish: {
    // Warm creams/golds - nourishment, sustenance
    bg: "#F5EFE0", // Warm cream
    accent: "#D4A574", // Golden tan
    text: "#4A3F2E", // Warm brown
    dim: "#B8A890", // Muted gold
    signal: "#C89B5A", // Honey gold
    card: "#FFFBF5", // Warm white
  },
  archetypes: {
    // Soft purples/indigos - inner modes, consciousness (softer, more resonant)
    bg: "#3A3550", // Deep indigo
    accent: "#A89FBD", // Soft lavender
    text: "#E8E6F5", // Pale lavender
    dim: "#9B92B5", // Muted purple
    signal: "#C5B8D4", // Light lavender
    card: "#4A4560", // Slightly lighter indigo
  },
};
