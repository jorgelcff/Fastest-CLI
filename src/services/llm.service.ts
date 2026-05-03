import OpenAI from 'openai';
import { resolveApiKey, readConfig } from '../config/config.manager';
import { SourceLanguage } from '../utils/file.utils';

export interface LLMServiceOptions {
  apiKey?: string;
  model?: string;
}

export class LLMService {
  private client: OpenAI;
  private model: string;

  constructor(options: LLMServiceOptions = {}) {
    const resolved = resolveApiKey(options.apiKey);
    if (!resolved) {
      throw new Error(
        'OpenAI API key is required. Configure com:\n' +
        '  fastest config set-key        (salva globalmente)\n' +
        '  export OPENAI_API_KEY=sk-...  (variável de ambiente)\n' +
        '  echo OPENAI_API_KEY=sk-... >> .env  (arquivo .env local)',
      );
    }
    this.client = new OpenAI({ apiKey: resolved.key });
    this.model = options.model ?? process.env.OPENAI_MODEL ?? readConfig().openaiModel ?? 'gpt-4o-mini';
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
  static buildTestPrompt(card: string, code: string, language: SourceLanguage = 'typescript'): string {
    const langInstructions =
      language === 'typescript'
        ? 'Retorne apenas código TypeScript válido, sem explicações, sem blocos markdown.'
        : 'Retorne apenas código JavaScript válido (CommonJS, use require()), sem explicações, sem blocos markdown.';

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

${langInstructions}`;
  }

  buildTestPrompt(card: string, code: string, language: SourceLanguage = 'typescript'): string {
    return LLMService.buildTestPrompt(card, code, language);
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
