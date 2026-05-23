/**
 * WidgetBackdrops.ts
 *
 * Per-container backdrop colors specifically for the quick-log modals that
 * surface from the home-screen widget.
 *
 * Rationale: the app's selected theme (typically Liminal) is deliberately
 * restrained — muted slates, dark browns, deep moods. That works for the
 * app's main surfaces, but when a modal pops over the screen the backdrop
 * (the area around the modal card) reads as gloomy darkness, regardless
 * of time of day.
 *
 * The widget interaction is meant to be a quick, light moment. Opening
 * into darkness feels wrong. These backdrops are tuned to be *brighter
 * than the app's normal palette* and to vary noticeably by time of day,
 * so the act of tapping the widget feels like opening into a brighter
 * space — not falling into the same dim one.
 *
 * The card on top still uses the active theme's `colors.card`, so the
 * input window itself keeps its restrained, theme-coherent look.
 */

import { ContainerId } from './Types';

export interface WidgetBackdrop {
  /** Solid color for the modal backdrop (the area around the card). */
  color: string;
  /** Alpha suffix appended in hex (e.g. 'E6' = 90%). Leave around 80-95%
   *  so the home screen / app underneath bleeds through just a little. */
  alpha: string;
}

/**
 * Backdrop palettes — brighter than the Liminal theme, tuned per container
 * to make the time of day legible at a glance.
 */
export const WIDGET_BACKDROPS: Record<ContainerId, WidgetBackdrop> = {
  // Warm amber wash — like soft morning sun through a curtain
  morning: {
    color: '#D89B5C',
    alpha: 'E6',
  },
  // Soft sky blue — afternoon clarity, brighter than Liminal's slate
  afternoon: {
    color: '#7FA8C8',
    alpha: 'E6',
  },
  // Rose / sunset coral — warm, deep, alive
  evening: {
    color: '#C77556',
    alpha: 'E6',
  },
  // Luminous indigo — still dark, but alive-dark, not flat-black
  late: {
    color: '#3A3A6B',
    alpha: 'F0',
  },
  // Fallbacks for containers that shouldn't normally arrive here
  situational: {
    color: '#8A8A9A',
    alpha: 'E6',
  },
  uplift: {
    color: '#B19CD9',
    alpha: 'E6',
  },
};

/**
 * Resolve the backdrop color string ready to drop into a `backgroundColor`
 * style — e.g. '#7FA8C8E6'.
 */
export function getWidgetBackdrop(container: ContainerId): string {
  const palette = WIDGET_BACKDROPS[container] ?? WIDGET_BACKDROPS.late;
  return palette.color + palette.alpha;
}
