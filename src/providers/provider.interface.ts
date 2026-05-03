export type Provider = 'openai' | 'anthropic';

export interface LLMProvider {
  complete(prompt: string): Promise<string>;
  stream(prompt: string, onToken: (token: string) => void): Promise<string>;
}
