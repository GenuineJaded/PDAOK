
// app/utils/feedback.ts

const NARRATIVE_PHRASES = [
  'good contact.',
  'small shift made.',
  'system heard you.',
];

/**
 * Returns a random narrative phrase for completion feedback.
 * @returns {string} A short, gentle phrase.
 */
export function getRandomNarrativePhrase(): string {
  const randomIndex = Math.floor(Math.random() * NARRATIVE_PHRASES.length);
  return NARRATIVE_PHRASES[randomIndex];
}

/**
 * A mock function for the soft pulse animation.
 * In a real React Native app, this would trigger an animation
 * on the completed item, fading out a ripple effect.
 * For now, it logs the action.
 * @param {string} itemId The ID of the item that was completed.
 */
export function triggerSoftPulseAnimation(itemId: string): void {
  console.log(`[Somatic Layer] Triggering soft pulse animation for item: ${itemId}`);
  // Implementation of Reanimated animation would go here.
}

/**
 * A mock function to show the micro-note feedback.
 * In a real React Native app, this would show a temporary, fading toast/note.
 * @param {string} phrase The narrative phrase to display.
 */
export function showMicroNote(phrase: string): void {
  console.log(`[Narrative Layer] Showing micro-note: "${phrase}"`);
  // Implementation of a temporary, fading UI element would go here.
}

