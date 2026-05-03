jest.mock('openai', () =>
  jest.fn().mockImplementation(() => ({
    chat: { completions: { create: mockCreate } },
  })),
);

// Declare before the factory function so the closure captures the reference
const mockCreate = jest.fn();

import { OpenAIProvider } from '../src/providers/openai.provider';

function makeProvider() {
  return new OpenAIProvider('sk-test', 'gpt-4o-mini');
}

beforeEach(() => mockCreate.mockReset());

// ── complete() ────────────────────────────────────────────────────────────────

describe('OpenAIProvider.complete', () => {
  it('returns text content from the API response', async () => {
    mockCreate.mockResolvedValue({
      choices: [{ message: { content: 'generated tests' } }],
    });
    const result = await makeProvider().complete('prompt');
    expect(result).toBe('generated tests');
  });

  it('sends the prompt as a user message', async () => {
    mockCreate.mockResolvedValue({ choices: [{ message: { content: 'ok' } }] });
    await makeProvider().complete('my prompt');
    const call = mockCreate.mock.calls[0][0];
    expect(call.messages[0]).toEqual({ role: 'user', content: 'my prompt' });
  });

  it('uses DEFAULT_TEMPERATURE (0.2)', async () => {
    mockCreate.mockResolvedValue({ choices: [{ message: { content: 'ok' } }] });
    await makeProvider().complete('prompt');
    expect(mockCreate.mock.calls[0][0].temperature).toBe(0.2);
  });

  it('throws when API returns null content', async () => {
    mockCreate.mockResolvedValue({ choices: [{ message: { content: null } }] });
    await expect(makeProvider().complete('prompt')).rejects.toThrow('LLM returned an empty response');
  });

  it('throws when choices array is empty', async () => {
    mockCreate.mockResolvedValue({ choices: [] });
    await expect(makeProvider().complete('prompt')).rejects.toThrow('LLM returned an empty response');
  });
});

// ── stream() ──────────────────────────────────────────────────────────────────

describe('OpenAIProvider.stream', () => {
  function makeAsyncIterable(chunks: Array<{ choices: Array<{ delta: { content?: string } }> }>) {
    return {
      [Symbol.asyncIterator]: async function* () {
        for (const chunk of chunks) yield chunk;
      },
    };
  }

  it('concatenates tokens and returns full text', async () => {
    mockCreate.mockResolvedValue(makeAsyncIterable([
      { choices: [{ delta: { content: 'Hello' } }] },
      { choices: [{ delta: { content: ' world' } }] },
    ]));
    const result = await makeProvider().stream('prompt', () => {});
    expect(result).toBe('Hello world');
  });

  it('calls onToken for each non-empty chunk', async () => {
    mockCreate.mockResolvedValue(makeAsyncIterable([
      { choices: [{ delta: { content: 'A' } }] },
      { choices: [{ delta: {} }] },         // empty delta — should be skipped
      { choices: [{ delta: { content: 'B' } }] },
    ]));
    const tokens: string[] = [];
    await makeProvider().stream('prompt', (t) => tokens.push(t));
    expect(tokens).toEqual(['A', 'B']);
  });

  it('passes stream: true to the API', async () => {
    mockCreate.mockResolvedValue(makeAsyncIterable([
      { choices: [{ delta: { content: 'x' } }] },
    ]));
    await makeProvider().stream('prompt', () => {});
    expect(mockCreate.mock.calls[0][0].stream).toBe(true);
  });

  it('throws when stream returns no content', async () => {
    mockCreate.mockResolvedValue(makeAsyncIterable([]));
    await expect(makeProvider().stream('prompt', () => {})).rejects.toThrow('LLM returned an empty response');
  });
});
