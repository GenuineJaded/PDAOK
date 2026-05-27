/**
 * AI text service.
 *
 * Historically Gemini-only; now routes through the user-configured provider
 * (bring-your-own-key) via aiClient. The original function names are kept so
 * the many existing callers don't need to change.
 */

import { generateText, GenerateOptions } from './aiClient';

/**
 * Generate text with an optional system prompt. Throws on error so callers can
 * decide how to handle failures.
 */
export async function generateGeminiText(
  prompt: string,
  options: GenerateOptions = {}
): Promise<string> {
  return generateText(prompt, options);
}

/** Alias kept for backward compatibility. */
export async function generateWithGemini(prompt: string): Promise<string> {
  return generateText(prompt);
}

/**
 * Generate an insight, returning a quiet fallback line instead of throwing —
 * used by surfaces that should stay calm when no key is set or a call fails.
 */
export async function generateInsight(prompt: string): Promise<string> {
  try {
    return await generateText(prompt);
  } catch (error) {
    console.log('Insight generation skipped (handled):', error);
    return 'The system is listening. As patterns emerge, I will offer a quiet observation here.';
  }
}
