import { ColorScheme } from '../_constants/Types';

/**
 * Blends an archetype color overlay with a base color scheme
 * @param baseColors The base color scheme (circadian or screen-specific)
 * @param archetypeOverlay The archetype's overlay color (e.g., "rgba(107, 140, 174, 0.15)")
 * @param archetypeAccent The archetype's accent color
 * @returns A new color scheme with archetype tint applied
 */
export function blendArchetypeColors(
  baseColors: ColorScheme,
  archetypeOverlay: string,
  archetypeAccent: string
): ColorScheme {
  // Parse the overlay color to get RGB values
  const overlayMatch = archetypeOverlay.match(/rgba?\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/);
  
  if (!overlayMatch) {
    // If parsing fails, return base colors
    return baseColors;
  }

  const overlayR = parseInt(overlayMatch[1]);
  const overlayG = parseInt(overlayMatch[2]);
  const overlayB = parseInt(overlayMatch[3]);
  const overlayA = parseFloat(overlayMatch[4]);

  // Helper function to blend a hex color with the overlay
  const blendColor = (hexColor: string): string => {
    // Remove # if present
    const hex = hexColor.replace('#', '');
    
    // Parse hex to RGB
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    // Blend: newColor = baseColor * (1 - alpha) + overlayColor * alpha
    const blendedR = Math.round(r * (1 - overlayA) + overlayR * overlayA);
    const blendedG = Math.round(g * (1 - overlayA) + overlayG * overlayA);
    const blendedB = Math.round(b * (1 - overlayA) + overlayB * overlayA);

    // Convert back to hex
    const toHex = (n: number) => {
      const hex = n.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };

    return `#${toHex(blendedR)}${toHex(blendedG)}${toHex(blendedB)}`;
  };

  // Return blended color scheme
  return {
    bg: blendColor(baseColors.bg),
    accent: archetypeAccent, // Use archetype's accent color directly
    text: baseColors.text, // Keep text color for readability
    dim: blendColor(baseColors.dim),
    signal: blendColor(baseColors.signal),
    card: blendColor(baseColors.card),
  };
}
