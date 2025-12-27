/**
 * Gemini API Service
 * Uses direct Gemini REST API (not OpenAI-compatible)
 */

// @ts-ignore - env variables are injected by babel plugin
import { EXPO_PUBLIC_GEMINI_API_KEY } from '@env';
import Constants from 'expo-constants';

const GEMINI_MODEL = 'gemini-2.0-flash-exp';
const API_TIMEOUT = 10000; // 10 seconds

/**
 * Clean markdown formatting from AI responses
 * Removes * and # characters that feel dissonant
 */
function cleanMarkdown(text: string): string {
  return text
    .replace(/\*\*/g, '') // Remove bold markers
    .replace(/\*/g, '')   // Remove italic markers
    .replace(/^#+\s*/gm, '') // Remove heading markers
    .trim();
}

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

interface GenerateOptions {
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
}

/**
 * Generate text using Gemini API with optional system prompt
 */
export async function generateGeminiText(
  prompt: string,
  options: GenerateOptions = {}
): Promise<string> {
  try {
    // Get API key from environment
    const apiKey = EXPO_PUBLIC_GEMINI_API_KEY || Constants.expoConfig?.extra?.EXPO_PUBLIC_GEMINI_API_KEY;
    
    if (!apiKey) {
      throw new Error('Gemini API key not configured');
    }
    
    // Build contents array with system prompt if provided
    const contents: any[] = [];
    
    if (options.systemPrompt) {
      contents.push({
        role: 'user',
        parts: [{ text: options.systemPrompt }],
      });
      contents.push({
        role: 'model',
        parts: [{ text: 'I understand. I will embody this voice and perspective in my responses.' }],
      });
    }
    
    contents.push({
      role: 'user',
      parts: [{ text: prompt }],
    });
    
    // Create timeout promise
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), API_TIMEOUT);
    });

    // Use direct Gemini REST API
    const fetchPromise = fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents,
          generationConfig: {
            temperature: options.temperature || 0.8,
            maxOutputTokens: options.maxTokens || 150,
          },
        }),
      }
    );

    const response = await Promise.race([fetchPromise, timeoutPromise]);

    if (!response.ok) {
      const errorText = await response.text();
      console.log('Gemini API error (handled):', response.status, errorText);
      throw new Error(`API error: ${response.status}`);
    }

    const data: GeminiResponse = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!text) {
      throw new Error('No text generated');
    }

    // Clean markdown formatting
    return cleanMarkdown(text);
  } catch (error) {
    console.log('Text generation failed (handled):', error);
    throw error;
  }
}

/**
 * Alias for generateGeminiText for backward compatibility
 */
export async function generateWithGemini(prompt: string): Promise<string> {
  return generateGeminiText(prompt);
}

/**
 * Call Gemini API to generate pattern insight
 */
export async function generateInsight(prompt: string): Promise<string> {
  try {
    // Get API key from environment
    // Try @env first (from .env via babel), then fall back to Constants (from app.json)
    const apiKey = EXPO_PUBLIC_GEMINI_API_KEY || Constants.expoConfig?.extra?.EXPO_PUBLIC_GEMINI_API_KEY;
    
    if (!apiKey) {
      throw new Error('Gemini API key not configured');
    }
    
    // Create timeout promise for React Native compatibility
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), API_TIMEOUT);
    });

    // Use direct Gemini REST API
    const fetchPromise = fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.8,
            maxOutputTokens: 100,
          },
        }),
      }
    );

    const response = await Promise.race([fetchPromise, timeoutPromise]);

    if (!response.ok) {
      const errorText = await response.text();
      console.log('Gemini API error (handled):', response.status, errorText);
      throw new Error(`API error: ${response.status}`);
    }

    const data: GeminiResponse = await response.json();
    const insight = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!insight) {
      throw new Error('No insight generated');
    }

    // Clean markdown formatting
    return cleanMarkdown(insight);
  } catch (error) {
    // Log as info instead of error to avoid toast notifications
    console.log('Insight generation skipped (handled):', error);
    
    // Return a graceful fallback message
    return 'The system is listening. As patterns emerge, I will offer a quiet observation here.';
  }
}
