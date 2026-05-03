import { resolveApiKeyForProvider, readConfig } from '../config/config.manager';
import { createProvider, detectProvider, defaultModelForProvider } from '../providers/provider.factory';
import { LLMProvider } from '../providers/provider.interface';
import { SourceLanguage } from '../utils/file.utils';

export interface LLMServiceOptions {
  apiKey?: string;
  model?: string;
}

export class LLMService {
  private provider: LLMProvider;
  readonly model: string;

  constructor(options: LLMServiceOptions = {}) {
    const configModel   = readConfig().openaiModel;
    const model         = options.model ?? process.env.OPENAI_MODEL ?? configModel ?? 'gpt-4o-mini';
    const provider      = detectProvider(model);
    const resolved      = resolveApiKeyForProvider(provider, options.apiKey);

    if (!resolved) {
      const envVar = provider === 'anthropic' ? 'ANTHROPIC_API_KEY' : 'OPENAI_API_KEY';
      throw new Error(
        `API key required for provider "${provider}". Configure with:\n` +
        `  fastest config set-key --provider ${provider}\n` +
        `  export ${envVar}=your-key\n` +
        `  echo ${envVar}=your-key >> .env`,
      );
    }

    this.model    = model;
    this.provider = createProvider(model, resolved.key);
  }

  async complete(prompt: string): Promise<string> {
    return this.provider.complete(prompt);
  }

  async stream(prompt: string, onToken: (token: string) => void): Promise<string> {
    return this.provider.stream(prompt, onToken);
  }

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
