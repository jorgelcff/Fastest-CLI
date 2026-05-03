import {
  detectProvider,
  defaultModelForProvider,
  createProvider,
  DEFAULT_OPENAI_MODEL,
  DEFAULT_ANTHROPIC_MODEL,
  DEFAULT_TEMPERATURE,
} from '../src/providers/provider.factory';
import { OpenAIProvider } from '../src/providers/openai.provider';
import { AnthropicProvider } from '../src/providers/anthropic.provider';

jest.mock('openai', () => jest.fn().mockImplementation(() => ({ chat: { completions: { create: jest.fn() } } })));
jest.mock('@anthropic-ai/sdk', () => jest.fn().mockImplementation(() => ({ messages: { create: jest.fn(), stream: jest.fn() } })));

// ── detectProvider ────────────────────────────────────────────────────────────

describe('detectProvider', () => {
  it.each([
    ['claude-haiku-4-5-20251001', 'anthropic'],
    ['claude-opus-4-7',           'anthropic'],
    ['claude-3-5-sonnet',         'anthropic'],
    ['gpt-4o-mini',               'openai'],
    ['gpt-4o',                    'openai'],
    ['gpt-3.5-turbo',             'openai'],
    ['llama3',                    'openai'],
  ])('%s → %s', (model, expected) => {
    expect(detectProvider(model)).toBe(expected);
  });
});

// ── defaultModelForProvider ───────────────────────────────────────────────────

describe('defaultModelForProvider', () => {
  it('returns DEFAULT_OPENAI_MODEL for openai', () => {
    expect(defaultModelForProvider('openai')).toBe(DEFAULT_OPENAI_MODEL);
  });

  it('returns DEFAULT_ANTHROPIC_MODEL for anthropic', () => {
    expect(defaultModelForProvider('anthropic')).toBe(DEFAULT_ANTHROPIC_MODEL);
  });
});

// ── constants ─────────────────────────────────────────────────────────────────

describe('constants', () => {
  it('DEFAULT_TEMPERATURE is 0.2', () => {
    expect(DEFAULT_TEMPERATURE).toBe(0.2);
  });

  it('DEFAULT_OPENAI_MODEL is gpt-4o-mini', () => {
    expect(DEFAULT_OPENAI_MODEL).toBe('gpt-4o-mini');
  });
});

// ── createProvider ────────────────────────────────────────────────────────────

describe('createProvider', () => {
  it('returns OpenAIProvider for gpt models', () => {
    const provider = createProvider('gpt-4o-mini', 'sk-test');
    expect(provider).toBeInstanceOf(OpenAIProvider);
  });

  it('returns AnthropicProvider for claude models', () => {
    const provider = createProvider('claude-haiku-4-5-20251001', 'sk-ant-test');
    expect(provider).toBeInstanceOf(AnthropicProvider);
  });

  it('returned provider has complete() and stream() methods', () => {
    const provider = createProvider('gpt-4o-mini', 'sk-test');
    expect(typeof provider.complete).toBe('function');
    expect(typeof provider.stream).toBe('function');
  });
});
