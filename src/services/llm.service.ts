import OpenAI from 'openai';

export interface LLMServiceOptions {
  apiKey?: string;
  model?: string;
}

export class LLMService {
  private client: OpenAI;
  private model: string;

  constructor(options: LLMServiceOptions = {}) {
    const apiKey = options.apiKey ?? process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error(
        'OpenAI API key is required. Set OPENAI_API_KEY in your environment or pass it as an option.',
      );
    }
    this.client = new OpenAI({ apiKey });
    this.model = options.model ?? process.env.OPENAI_MODEL ?? 'gpt-4o-mini';
  }

  /**
   * Sends a prompt to the LLM and returns the text response.
   */
  async complete(prompt: string): Promise<string> {
    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('LLM returned an empty response.');
    }
    return content;
  }

  /**
   * Builds the standard test-generation prompt from a card description and source code.
   */
  static buildTestPrompt(card: string, code: string): string {
    return `Você é um especialista em testes.
Gere testes unitários em Jest para o seguinte código:

CARD:
${card}

CÓDIGO:
${code}

Inclua:
- casos principais
- edge cases
- mocks se necessário

Retorne apenas código TypeScript válido, sem explicações, sem blocos markdown.`;
  }

  buildTestPrompt(card: string, code: string): string {
    return LLMService.buildTestPrompt(card, code);
  }

  /**
   * Builds a prompt that asks the LLM to suggest additional tests based on a coverage report.
   */
  static buildCoverageSuggestionPrompt(card: string, code: string, coverageSummary: string): string {
    return `Você é um especialista em qualidade de software.

Com base no seguinte relatório de cobertura de testes, sugira novos casos de teste para melhorar a cobertura.

CARD:
${card}

CÓDIGO:
${code}

RELATÓRIO DE COBERTURA:
${coverageSummary}

Liste apenas os cenários de teste que ainda não estão cobertos. Seja conciso e objetivo.`;
  }

  buildCoverageSuggestionPrompt(card: string, code: string, coverageSummary: string): string {
    return LLMService.buildCoverageSuggestionPrompt(card, code, coverageSummary);
  }
}
