const mockCreate = jest.fn();
const mockAbort  = jest.fn();
const mockStream = jest.fn();

jest.mock('@anthropic-ai/sdk', () =>
  jest.fn().mockImplementation(() => ({
    messages: { create: mockCreate, stream: mockStream },
  })),
);

import { AnthropicProvider } from '../src/providers/anthropic.provider';

function makeProvider() {
  return new AnthropicProvider('sk-ant-test', 'claude-haiku-4-5-20251001');
}

function makeStreamIterable(
  events: Array<{ type: string; delta?: { type: string; text: string } }>,
) {
  return {
    abort: mockAbort,
    [Symbol.asyncIterator]: async function* () {
      for (const event of events) yield event;
    },
  };
}

beforeEach(() => { mockCreate.mockReset(); mockStream.mockReset(); mockAbort.mockReset(); });

// ── complete() ────────────────────────────────────────────────────────────────

describe('AnthropicProvider.complete', () => {
  it('returns the text block from the API response', async () => {
    mockCreate.mockResolvedValue({ content: [{ type: 'text', text: 'generated tests' }] });
    const result = await makeProvider().complete('prompt');
    expect(result).toBe('generated tests');
  });

  it('sends the prompt as a user message', async () => {
    mockCreate.mockResolvedValue({ content: [{ type: 'text', text: 'ok' }] });
    await makeProvider().complete('my prompt');
    const call = mockCreate.mock.calls[0][0];
    expect(call.messages[0]).toEqual({ role: 'user', content: 'my prompt' });
  });

  it('uses DEFAULT_TEMPERATURE (0.2)', async () => {
    mockCreate.mockResolvedValue({ content: [{ type: 'text', text: 'ok' }] });
    await makeProvider().complete('prompt');
    expect(mockCreate.mock.calls[0][0].temperature).toBe(0.2);
  });

  it('sets max_tokens to 4096', async () => {
    mockCreate.mockResolvedValue({ content: [{ type: 'text', text: 'ok' }] });
    await makeProvider().complete('prompt');
    expect(mockCreate.mock.calls[0][0].max_tokens).toBe(4096);
  });

  it('throws when content array is empty', async () => {
    mockCreate.mockResolvedValue({ content: [] });
    await expect(makeProvider().complete('prompt')).rejects.toThrow('LLM returned an empty response');
  });

  it('throws when content block is not text type', async () => {
    mockCreate.mockResolvedValue({ content: [{ type: 'tool_use', id: 'x' }] });
    await expect(makeProvider().complete('prompt')).rejects.toThrow('LLM returned an empty response');
  });
});

// ── stream() ──────────────────────────────────────────────────────────────────

describe('AnthropicProvider.stream', () => {
  it('concatenates text delta tokens', async () => {
    mockStream.mockReturnValue(makeStreamIterable([
      { type: 'content_block_delta', delta: { type: 'text_delta', text: 'Hello' } },
      { type: 'content_block_delta', delta: { type: 'text_delta', text: ' world' } },
    ]));
    const result = await makeProvider().stream('prompt', () => {});
    expect(result).toBe('Hello world');
  });

  it('calls onToken for each text_delta event', async () => {
    mockStream.mockReturnValue(makeStreamIterable([
      { type: 'content_block_delta', delta: { type: 'text_delta', text: 'A' } },
      { type: 'message_start' },                                                  // non-delta — ignored
      { type: 'content_block_delta', delta: { type: 'text_delta', text: 'B' } },
    ]));
    const tokens: string[] = [];
    await makeProvider().stream('prompt', (t) => tokens.push(t));
    expect(tokens).toEqual(['A', 'B']);
  });

  it('calls abort() after streaming completes (finally block)', async () => {
    mockStream.mockReturnValue(makeStreamIterable([
      { type: 'content_block_delta', delta: { type: 'text_delta', text: 'ok' } },
    ]));
    await makeProvider().stream('prompt', () => {});
    expect(mockAbort).toHaveBeenCalledTimes(1);
  });

  it('calls abort() even when stream throws', async () => {
    const errorStream = {
      abort: mockAbort,
      [Symbol.asyncIterator]: async function* () { throw new Error('network error'); },
    };
    mockStream.mockReturnValue(errorStream);
    await expect(makeProvider().stream('prompt', () => {})).rejects.toThrow('network error');
    expect(mockAbort).toHaveBeenCalledTimes(1);
  });

  it('throws when stream produces no text', async () => {
    mockStream.mockReturnValue(makeStreamIterable([]));
    await expect(makeProvider().stream('prompt', () => {})).rejects.toThrow('LLM returned an empty response');
  });
});
