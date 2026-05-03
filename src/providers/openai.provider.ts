import OpenAI from 'openai';
import { LLMProvider } from './provider.interface';
import { DEFAULT_TEMPERATURE } from './provider.factory';

export class OpenAIProvider implements LLMProvider {
  private client: OpenAI;

  constructor(
    apiKey: string,
    private readonly model: string,
  ) {
    this.client = new OpenAI({ apiKey });
  }

  private get baseParams() {
    return {
      model:       this.model,
      messages:    [{ role: 'user' as const, content: '' }],
      temperature: DEFAULT_TEMPERATURE,
    };
  }

  async complete(prompt: string): Promise<string> {
    const response = await this.client.chat.completions.create({
      ...this.baseParams,
      messages: [{ role: 'user', content: prompt }],
    });
    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error('LLM returned an empty response.');
    return content;
  }

  async stream(prompt: string, onToken: (token: string) => void): Promise<string> {
    const response = await this.client.chat.completions.create({
      ...this.baseParams,
      messages: [{ role: 'user', content: prompt }],
      stream: true,
    });

    let full = '';
    for await (const chunk of response) {
      const token = chunk.choices[0]?.delta?.content ?? '';
      if (token) { full += token; onToken(token); }
    }
    if (!full) throw new Error('LLM returned an empty response.');
    return full;
  }
}
