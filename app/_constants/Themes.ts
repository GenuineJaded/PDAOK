import { ContainerId } from './Types';

export type ThemeName = 'liminal' | 'crystalline' | 'organic';

export interface CircadianPaletteSet {
  morning: ColorPalette;
  afternoon: ColorPalette;
  evening: ColorPalette;
  late: ColorPalette;
  situational: ColorPalette;
  uplift: ColorPalette;
}

export interface ColorPalette {
  bg: string;
  bgGradient?: string;
  accent: string;
  text: string;
  dim: string;
  signal: string;
  card: string;
  cardOverlay?: string;
}

export interface Theme {
  name: ThemeName;
  displayName: string;
  description: string;
  icon: string;
  palettes: CircadianPaletteSet;
}

export const THEMES: Record<ThemeName, Theme> = {
  liminal: {
    name: 'liminal',
    displayName: 'Liminal',
    description: 'Dark, mysterious, threshold spaces',
    icon: '🌑',
    palettes: {
      morning: {
        bg: "#4A3F35",
        bgGradient: "linear-gradient(180deg, #4A3F35 0%, #5A4D40 100%)",
        accent: "#A2B8A6",
        text: "#F0E5D8",
        dim: "#C4A57B",
        signal: "#E8B86D",
        card: "#3A342C",
        cardOverlay: "rgba(212, 165, 116, 0.12)",
      },
      afternoon: {
        bg: "#3A4550",
        bgGradient: "linear-gradient(180deg, #3A4550 0%, #455560 100%)",
        accent: "#6B8CAE",
        text: "#E8F0F5",
        dim: "#8FA8B8",
        signal: "#7BC4C4",
        card: "#2C3840",
        cardOverlay: "rgba(95, 168, 184, 0.12)",
      },
      evening: {
        bg: "#4D3A30",
        bgGradient: "linear-gradient(180deg, #4D3A30 0%, #5A4438 100%)",
        accent: "#8C4B3F",
        text: "#F0E5D8",
        dim: "#B87333",
        signal: "#D4AF37",
        card: "#333333",
        cardOverlay: "rgba(140, 75, 63, 0.12)",
      },
      late: {
        bg: "#1A1A1A",
        bgGradient: "linear-gradient(180deg, #1A1A1A 0%, #242438 100%)",
        accent: "#5A6E5A",
        text: "#F0F0F0",
        dim: "#A9B8A6",
        signal: "#4682B4",
        card: "#333333",
        cardOverlay: "rgba(90, 110, 90, 0.08)",
      },
      situational: {
        bg: "#D3D3D3",
        accent: "#A9A9A9",
        text: "#36454F",
        dim: "#C0C0C0",
        signal: "#B19CD9",
        card: "#FFFFFF",
      },
      uplift: {
        bg: "#E6E6FA",
        accent: "#B19CD9",
        text: "#000080",
        dim: "#B19CD9",
        signal: "#00CED1",
        card: "#FFFFFF",
      },
    },
  },

  crystalline: {
    name: 'crystalline',
    displayName: 'Crystalline',
    description: 'Bright, sharp, clear energy',
    icon: '💎',
    palettes: {
      morning: {
        bg: "#E8F4F8",
        bgGradient: "linear-gradient(180deg, #E8F4F8 0%, #D0E8F0 100%)",
        accent: "#4A90A4",
        text: "#1A3A4A",
        dim: "#5A7A8A",
        signal: "#FFB347",
        card: "#F5FAFE",
        cardOverlay: "rgba(74, 144, 164, 0.08)",
      },
      afternoon: {
        bg: "#F0F8FF",
        bgGradient: "linear-gradient(180deg, #F0F8FF 0%, #E0F0FF 100%)",
        accent: "#5B9BD5",
        text: "#0A2A3A",
        dim: "#4A6A7A",
        signal: "#87CEEB",
        card: "#FAFCFF",
        cardOverlay: "rgba(91, 155, 213, 0.08)",
      },
      evening: {
        bg: "#FFF5E6",
        bgGradient: "linear-gradient(180deg, #FFF5E6 0%, #FFE8CC 100%)",
        accent: "#D4A574",
        text: "#3A2A1A",
        dim: "#8A6A4A",
        signal: "#FFD700",
        card: "#FFFAF0",
        cardOverlay: "rgba(212, 165, 116, 0.08)",
      },
      late: {
        bg: "#E6E6FA",
        bgGradient: "linear-gradient(180deg, #E6E6FA 0%, #D0D0E8 100%)",
        accent: "#8A7AC4",
        text: "#2A1A3A",
        dim: "#6A5A8A",
        signal: "#B19CD9",
        card: "#F0F0FA",
        cardOverlay: "rgba(138, 122, 196, 0.08)",
      },
      situational: {
        bg: "#F5F5F5",
        accent: "#9A9A9A",
        text: "#2A2A2A",
        dim: "#6A6A6A",
        signal: "#B19CD9",
        card: "#FFFFFF",
      },
      uplift: {
        bg: "#FFFACD",
        accent: "#FFD700",
        text: "#3A3A00",
        dim: "#8A8A4A",
        signal: "#00CED1",
        card: "#FFFFF0",
      },
    },
  },

  organic: {
    name: 'organic',
    displayName: 'Organic',
    description: 'Earthy, natural, grounded tones',
    icon: '🌿',
    palettes: {
      morning: {
        bg: "#5A4A3A",
        bgGradient: "linear-gradient(180deg, #5A4A3A 0%, #6A5A48 100%)",
        accent: "#8B9A7A",
        text: "#F5EFE6",
        dim: "#C4B5A0",
        signal: "#D4C294",
        card: "#4A3A2A",
        cardOverlay: "rgba(139, 154, 122, 0.12)",
      },
      afternoon: {
        bg: "#4A5A4A",
        bgGradient: "linear-gradient(180deg, #4A5A4A 0%, #5A6A5A 100%)",
        accent: "#7A9A7A",
        text: "#EFF5EF",
        dim: "#A0B8A0",
        signal: "#A8C69F",
        card: "#3A4A3A",
        cardOverlay: "rgba(122, 154, 122, 0.12)",
      },
      evening: {
        bg: "#5A3A2A",
        bgGradient: "linear-gradient(180deg, #5A3A2A 0%, #6A4A38 100%)",
        accent: "#9A6A4A",
        text: "#F5E5D5",
        dim: "#C4A584",
        signal: "#D4A574",
        card: "#4A2A1A",
        cardOverlay: "rgba(154, 106, 74, 0.12)",
      },
      late: {
        bg: "#2A2A2A",
        bgGradient: "linear-gradient(180deg, #2A2A2A 0%, #3A3A48 100%)",
        accent: "#6A7A6A",
        text: "#F0F0F0",
        dim: "#A0B0A0",
        signal: "#8A9A8A",
        card: "#3A3A3A",
        cardOverlay: "rgba(106, 122, 106, 0.08)",
      },
      situational: {
        bg: "#D8D0C8",
        accent: "#A89A8A",
        text: "#3A3A2A",
        dim: "#8A7A6A",
        signal: "#B8A898",
        card: "#F5F0E8",
      },
      uplift: {
        bg: "#E8F0E8",
        accent: "#A8C69F",
        text: "#2A3A2A",
        dim: "#6A8A6A",
        signal: "#7BC4A4",
        card: "#F5FAF5",
      },
    },
  },
};

export const DEFAULT_THEME: ThemeName = 'liminal';
