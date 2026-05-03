import Anthropic from '@anthropic-ai/sdk';
import { LLMProvider } from './provider.interface';
import { DEFAULT_TEMPERATURE } from './provider.factory';

export class AnthropicProvider implements LLMProvider {
  private client: Anthropic;
  private static readonly MAX_TOKENS = 4096;

  constructor(
    apiKey: string,
    private readonly model: string,
  ) {
    this.client = new Anthropic({ apiKey });
  }

  private get baseParams() {
    return {
      model:       this.model,
      max_tokens:  AnthropicProvider.MAX_TOKENS,
      temperature: DEFAULT_TEMPERATURE,
      messages:    [{ role: 'user' as const, content: '' }],
    };
  }

  async complete(prompt: string): Promise<string> {
    const message = await this.client.messages.create({
      ...this.baseParams,
      messages: [{ role: 'user', content: prompt }],
    });
    const block = message.content[0];
    if (!block || block.type !== 'text') throw new Error('LLM returned an empty response.');
    return block.text;
  }

  async stream(prompt: string, onToken: (token: string) => void): Promise<string> {
    let full = '';
    const s = this.client.messages.stream({
      ...this.baseParams,
      messages: [{ role: 'user', content: prompt }],
    });
    try {
      for await (const event of s) {
        if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
          full += event.delta.text;
          onToken(event.delta.text);
        }
      }
    } finally {
      s.abort();
    }
    if (!full) throw new Error('LLM returned an empty response.');
    return full;
  }
}
