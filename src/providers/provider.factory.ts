import { LLMProvider, Provider } from './provider.interface';
import { OpenAIProvider } from './openai.provider';
import { AnthropicProvider } from './anthropic.provider';

export const DEFAULT_OPENAI_MODEL     = 'gpt-4o-mini';
export const DEFAULT_ANTHROPIC_MODEL  = 'claude-haiku-4-5-20251001';
export const DEFAULT_TEMPERATURE      = 0.2;

/**
 * Detects the provider from a model name.
 * claude-* → Anthropic, everything else → OpenAI.
 */
export function detectProvider(model: string): Provider {
  return model.startsWith('claude') ? 'anthropic' : 'openai';
}

/**
 * Returns a sensible default model for each provider.
 */
export function defaultModelForProvider(provider: Provider): string {
  return provider === 'anthropic' ? DEFAULT_ANTHROPIC_MODEL : DEFAULT_OPENAI_MODEL;
}

export function createProvider(model: string, apiKey: string): LLMProvider {
  const provider = detectProvider(model);
  return provider === 'anthropic'
    ? new AnthropicProvider(apiKey, model)
    : new OpenAIProvider(apiKey, model);
}
