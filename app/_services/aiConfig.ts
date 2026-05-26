/**
 * AI provider configuration (bring-your-own-key).
 *
 * The key is stored only on this device (AsyncStorage) and is sent solely to
 * the chosen provider's API — never to any server of ours.
 *
 * v1 supports OpenAI-compatible providers (OpenRouter + OpenAI). OpenRouter is
 * the default: one key reaches Claude, GPT, Gemini, Llama and more.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const AI_CONFIG_KEY = '@pda_ai_config';

export type AIProvider = 'openrouter' | 'openai';

export interface AIConfig {
  provider: AIProvider;
  apiKey: string;
  model: string;
}

export interface ProviderInfo {
  id: AIProvider;
  label: string;
  baseUrl: string;
  defaultModel: string;
  keysUrl: string;
  modelsUrl: string;
  modelPlaceholder: string;
}

export const PROVIDERS: Record<AIProvider, ProviderInfo> = {
  openrouter: {
    id: 'openrouter',
    label: 'OpenRouter',
    baseUrl: 'https://openrouter.ai/api/v1',
    defaultModel: 'openai/gpt-4o-mini',
    keysUrl: 'https://openrouter.ai/keys',
    modelsUrl: 'https://openrouter.ai/models',
    modelPlaceholder: 'e.g. openai/gpt-4o-mini',
  },
  openai: {
    id: 'openai',
    label: 'OpenAI',
    baseUrl: 'https://api.openai.com/v1',
    defaultModel: 'gpt-4o-mini',
    keysUrl: 'https://platform.openai.com/api-keys',
    modelsUrl: 'https://platform.openai.com/docs/models',
    modelPlaceholder: 'e.g. gpt-4o-mini',
  },
};

export const DEFAULT_AI_CONFIG: AIConfig = {
  provider: 'openrouter',
  apiKey: '',
  model: PROVIDERS.openrouter.defaultModel,
};

function normalizeProvider(value: unknown): AIProvider {
  return value === 'openai' ? 'openai' : 'openrouter';
}

export async function getAIConfig(): Promise<AIConfig> {
  try {
    const raw = await AsyncStorage.getItem(AI_CONFIG_KEY);
    if (!raw) return DEFAULT_AI_CONFIG;

    const parsed = JSON.parse(raw);
    const provider = normalizeProvider(parsed.provider);
    return {
      provider,
      apiKey: typeof parsed.apiKey === 'string' ? parsed.apiKey : '',
      model:
        typeof parsed.model === 'string' && parsed.model.trim()
          ? parsed.model.trim()
          : PROVIDERS[provider].defaultModel,
    };
  } catch {
    return DEFAULT_AI_CONFIG;
  }
}

export async function saveAIConfig(config: AIConfig): Promise<void> {
  const provider = normalizeProvider(config.provider);
  const clean: AIConfig = {
    provider,
    apiKey: config.apiKey.trim(),
    model: config.model.trim() || PROVIDERS[provider].defaultModel,
  };
  await AsyncStorage.setItem(AI_CONFIG_KEY, JSON.stringify(clean));
}

export async function clearAIConfig(): Promise<void> {
  await AsyncStorage.removeItem(AI_CONFIG_KEY);
}

export async function hasAIKey(): Promise<boolean> {
  const config = await getAIConfig();
  return config.apiKey.trim().length > 0;
}
