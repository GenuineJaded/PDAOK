import { useColorScheme as useRNColorScheme } from 'react-native';
import { ColorScheme, ContainerId, Archetype } from '../_constants/Types';
import { CircadianPalette } from '../_constants/Colors';
import { THEMES, ThemeName, DEFAULT_THEME } from '../_constants/Themes';
import { blendArchetypeColors } from '../_utils/colorBlending';

export default function useColors(
  activeContainer?: ContainerId,
  useCircadian: boolean = true,
  _screenType?: any, // Ignored - kept for compatibility
  activeArchetype?: Archetype | null,
  selectedTheme?: ThemeName
): ColorScheme {
  const systemTheme = useRNColorScheme();

  // Fallback colors
  const LightColorsFallback = { 
    bg: '#fff', 
    accent: '#000', 
    text: '#000', 
    dim: '#ccc', 
    signal: '#f00', 
    card: '#fff' 
  };
  const DarkColorsFallback = { 
    bg: '#000', 
    accent: '#fff', 
    text: '#fff', 
    dim: '#333', 
    signal: '#0f0', 
    card: '#000' 
  };

  // Determine base colors - simple discrete circadian palette
  let baseColors: ColorScheme;
  
  if (useCircadian && activeContainer) {
    // Use the discrete circadian palette for the active container from selected theme
    const theme = THEMES[selectedTheme || DEFAULT_THEME];
    baseColors = theme.palettes[activeContainer];
  } else {
    // Fallback to system theme
    baseColors = systemTheme === 'dark' ? DarkColorsFallback : LightColorsFallback;
  }

  // If an archetype is active, blend its colors with the base
  if (activeArchetype) {
    return blendArchetypeColors(
      baseColors,
      activeArchetype.color_theme.overlay,
      activeArchetype.color_theme.accent
    );
  }

  return baseColors;
}
