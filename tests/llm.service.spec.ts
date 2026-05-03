import { LLMService } from '../src/services/llm.service';

// Mock the openai module so no real HTTP calls are made.
jest.mock('openai', () => {
  return jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: jest.fn(),
      },
    },
  }));
});

import OpenAI from 'openai';
const MockOpenAI = OpenAI as jest.MockedClass<typeof OpenAI>;

describe('LLMService', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv, OPENAI_API_KEY: 'test-key' };
    MockOpenAI.mockClear();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  // ── Constructor ─────────────────────────────────────────────────────────────

  describe('constructor', () => {
    it('initialises without errors when API key is in env', () => {
      expect(() => new LLMService()).not.toThrow();
    });

    it('throws when API key is absent', () => {
      delete process.env.OPENAI_API_KEY;
      expect(() => new LLMService()).toThrow('API key required for provider');
    });

    it('accepts API key via options', () => {
      delete process.env.OPENAI_API_KEY;
      expect(() => new LLMService({ apiKey: 'explicit-key' })).not.toThrow();
    });

    it('uses gpt-4o-mini as default model', () => {
      const svc = new LLMService({ apiKey: 'k' });
      // Access private field via any cast for test purposes
      expect((svc as unknown as { model: string }).model).toBe('gpt-4o-mini');
    });

    it('uses model from options when provided', () => {
      const svc = new LLMService({ apiKey: 'k', model: 'gpt-4o' });
      expect((svc as unknown as { model: string }).model).toBe('gpt-4o');
    });
  });

  // ── buildTestPrompt ─────────────────────────────────────────────────────────

  describe('buildTestPrompt', () => {
    it('includes card text in prompt', () => {
      const prompt = LLMService.buildTestPrompt('Add feature', 'const x = 1;');
      expect(prompt).toContain('Add feature');
    });

    it('includes source code in prompt', () => {
      const prompt = LLMService.buildTestPrompt('My card', 'export function foo() {}');
      expect(prompt).toContain('export function foo() {}');
    });

    it('asks for edge cases', () => {
      const prompt = LLMService.buildTestPrompt('x', 'y');
      expect(prompt.toLowerCase()).toContain('edge');
    });

    it('instance method delegates to static', () => {
      const svc = new LLMService({ apiKey: 'k' });
      expect(svc.buildTestPrompt('c', 'code')).toBe(LLMService.buildTestPrompt('c', 'code'));
    });
  });

  // ── buildCoverageSuggestionPrompt ───────────────────────────────────────────

  describe('buildCoverageSuggestionPrompt', () => {
    it('includes card, code and coverage report', () => {
      const prompt = LLMService.buildCoverageSuggestionPrompt('card', 'code', 'Lines: 70%');
      expect(prompt).toContain('card');
      expect(prompt).toContain('code');
      expect(prompt).toContain('Lines: 70%');
    });

    it('instance method delegates to static', () => {
      const svc = new LLMService({ apiKey: 'k' });
      expect(svc.buildCoverageSuggestionPrompt('c', 'code', 'cov')).toBe(
        LLMService.buildCoverageSuggestionPrompt('c', 'code', 'cov'),
      );
    });
  });

  // ── complete ────────────────────────────────────────────────────────────────

  describe('complete', () => {
    it('returns content from API response', async () => {
      const mockCreate = jest.fn().mockResolvedValue({
        choices: [{ message: { content: 'generated tests' } }],
      });
      MockOpenAI.mockImplementationOnce(() => ({
        chat: { completions: { create: mockCreate } },
      }) as unknown as OpenAI);

      const svc = new LLMService({ apiKey: 'k' });
      const result = await svc.complete('some prompt');
      expect(result).toBe('generated tests');
    });

    it('throws when API returns empty content', async () => {
      const mockCreate = jest.fn().mockResolvedValue({
        choices: [{ message: { content: null } }],
      });
      MockOpenAI.mockImplementationOnce(() => ({
        chat: { completions: { create: mockCreate } },
      }) as unknown as OpenAI);

      const svc = new LLMService({ apiKey: 'k' });
      await expect(svc.complete('prompt')).rejects.toThrow('LLM returned an empty response');
    });
  });
});
