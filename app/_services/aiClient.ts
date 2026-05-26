/**
 * Provider-agnostic AI client.
 *
 * Speaks the OpenAI-compatible chat/completions format, which covers
 * OpenRouter and OpenAI (and, by changing the base URL, most others). Reads
 * the user's stored BYOK config at call time, so changing the key/model takes
 * effect immediately with no rebuild.
 */

import { getAIConfig, PROVIDERS } from './aiConfig';

const API_TIMEOUT = 30000; // 30 seconds

export interface GenerateOptions {
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
}

/** Thrown when no API key is configured, so callers can stay quiet gracefully. */
export class MissingAPIKeyError extends Error {
  constructor() {
    super('No API key configured');
    this.name = 'MissingAPIKeyError';
  }
}

/** Strip markdown emphasis/headings that feel dissonant in the app's voice. */
function cleanMarkdown(text: string): string {
  return text
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .replace(/^#+\s*/gm, '')
    .trim();
}

interface ChatCompletionResponse {
  choices?: { message?: { content?: string } }[];
  error?: { message?: string };
}

export async function generateText(
  prompt: string,
  options: GenerateOptions = {}
): Promise<string> {
  const config = await getAIConfig();
  if (!config.apiKey.trim()) {
    throw new MissingAPIKeyError();
  }

  const provider = PROVIDERS[config.provider];

  const messages: { role: string; content: string }[] = [];
  if (options.systemPrompt) {
    messages.push({ role: 'system', content: options.systemPrompt });
  }
  messages.push({ role: 'user', content: prompt });

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${config.apiKey.trim()}`,
  };
  // OpenRouter uses these optional headers for attribution/ranking.
  if (config.provider === 'openrouter') {
    headers['HTTP-Referer'] = 'https://pdaok.app';
    headers['X-Title'] = 'PDAOK';
  }

  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error('Request timeout')), API_TIMEOUT);
  });

  const fetchPromise = fetch(`${provider.baseUrl}/chat/completions`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model: config.model,
      messages,
      temperature: options.temperature ?? 0.8,
      max_tokens: options.maxTokens ?? 2000,
    }),
  });

  const response = await Promise.race([fetchPromise, timeoutPromise]);

  if (!response.ok) {
    const errorText = await response.text();
    console.log('AI API error (handled):', response.status, errorText);
    throw new Error(`API error: ${response.status}`);
  }

  const data: ChatCompletionResponse = await response.json();
  const text = data.choices?.[0]?.message?.content?.trim();

  if (!text) {
    throw new Error('No text generated');
  }

  return cleanMarkdown(text);
}

/**
 * Lightweight connection check for the settings screen. Uses the currently
 * stored config, so save before testing.
 */
export async function testConnection(): Promise<{ ok: boolean; error?: string }> {
  try {
    await generateText('Reply with the single word: connected', {
      maxTokens: 20,
      temperature: 0,
    });
    return { ok: true };
  } catch (error: any) {
    if (error instanceof MissingAPIKeyError) {
      return { ok: false, error: 'No API key set.' };
    }
    return { ok: false, error: error?.message ?? 'Connection failed.' };
  }
}
