import { resolveApiKeyForProvider, readConfig } from '../config/config.manager';
import { createProvider, detectProvider, defaultModelForProvider } from '../providers/provider.factory';
import { LLMProvider } from '../providers/provider.interface';
import { SourceLanguage, TestFramework } from '../utils/file.utils';
import { CacheService } from './cache.service';

export type TestType = 'unit' | 'integration';

export interface LLMServiceOptions {
  apiKey?: string;
  model?: string;
  cache?: boolean;
}

export class LLMService {
  private provider: LLMProvider;
  private cacheService?: CacheService;
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

    if (options.cache || process.env.FASTEST_CACHE === '1') {
      this.cacheService = new CacheService();
    }
  }

  async complete(prompt: string): Promise<string> {
    if (this.cacheService) {
      const cached = this.cacheService.get(prompt, this.model);
      if (cached) return cached;
    }
    const response = await this.provider.complete(prompt);
    if (this.cacheService) {
      this.cacheService.set(prompt, this.model, response);
    }
    return response;
  }

  async stream(prompt: string, onToken: (token: string) => void): Promise<string> {
    if (this.cacheService) {
      const cached = this.cacheService.get(prompt, this.model);
      if (cached) {
        onToken(cached);
        return cached;
      }
    }
    const response = await this.provider.stream(prompt, onToken);
    if (this.cacheService) {
      this.cacheService.set(prompt, this.model, response);
    }
    return response;
  }

  static buildTestPrompt(
    card: string,
    code: string,
    language: SourceLanguage = 'typescript',
    testType: TestType = 'unit',
    framework: TestFramework = 'jest',
  ): string {
    const langInstructions =
      language === 'typescript'
        ? 'Retorne apenas código TypeScript válido, sem explicações, sem blocos markdown.'
        : 'Retorne apenas código JavaScript válido (CommonJS, use require()), sem explicações, sem blocos markdown.';

    const frameworkInstructions = framework === 'vitest'
      ? 'Use Vitest como framework de teste. Importe { describe, it, expect, vi } de "vitest". Use vi.mock() para mocks.'
      : 'Use Jest como framework de teste. Use jest.mock() para mocks.';

    if (testType === 'integration') {
      const mockRef = framework === 'vitest' ? 'vi.mock/vi.spyOn' : 'jest.mock/jest.spyOn';
      const frameworkLabel = framework === 'vitest' ? 'Vitest' : 'Jest + Supertest';
      return `Você é um especialista em testes de integração de APIs e fluxos de negócio.
Gere testes de integração em ${frameworkLabel} para o código abaixo.

${frameworkInstructions}

CARD (fluxo funcional):
${card}

CÓDIGO:
${code}

Regras obrigatórias:
- Cubra o fluxo ponta a ponta do caso de uso descrito no card
- Inclua cenários de sucesso e de falha de comunicação/API
- Use mocks determinísticos para dependências externas (ex.: banco, fila, API externa) com ${mockRef}
- Evite dependências de estado global e infraestrutura real
- Organize os testes por cenários de negócio (não apenas por função isolada)${framework === 'jest' ? '\n- Se necessário, faça bootstrap da aplicação para requisições HTTP via Supertest' : ''}

${langInstructions}`;
    }

    const frameworkLabel = framework === 'vitest' ? 'Vitest' : 'Jest';
    return `Você é um especialista em testes.
Gere testes unitários usando ${frameworkLabel} para o seguinte código:

${frameworkInstructions}

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

  buildTestPrompt(
    card: string,
    code: string,
    language: SourceLanguage = 'typescript',
    testType: TestType = 'unit',
    framework: TestFramework = 'jest',
  ): string {
    return LLMService.buildTestPrompt(card, code, language, testType, framework);
  }

  static buildCoverageSuggestionPrompt(
    card: string,
    code: string,
    coverageSummary: string,
    testType: TestType = 'unit',
  ): string {
    const flowRequirement =
      testType === 'integration'
        ? '\nDestaque também fluxos críticos do caso de uso ainda não cobertos ponta a ponta.'
        : '';

    return `Você é um especialista em qualidade de software.

Com base no seguinte relatório de cobertura de testes, sugira novos casos de teste para melhorar a cobertura.

CARD:
${card}

CÓDIGO:
${code}

RELATÓRIO DE COBERTURA:
${coverageSummary}

Liste apenas os cenários de teste que ainda não estão cobertos. Seja conciso e objetivo.${flowRequirement}`;
  }

  buildCoverageSuggestionPrompt(
    card: string,
    code: string,
    coverageSummary: string,
    testType: TestType = 'unit',
  ): string {
    return LLMService.buildCoverageSuggestionPrompt(card, code, coverageSummary, testType);
  }

  static buildRetryPrompt(
    originalCode: string,
    generatedTests: string,
    errors: string,
    language: SourceLanguage = 'typescript',
    framework: TestFramework = 'jest',
  ): string {
    const langInstructions =
      language === 'typescript'
        ? 'Retorne apenas código TypeScript válido, sem explicações, sem blocos markdown.'
        : 'Retorne apenas código JavaScript válido (CommonJS, use require()), sem explicações, sem blocos markdown.';

    const frameworkInstructions = framework === 'vitest'
      ? 'Use Vitest como framework de teste. Importe { describe, it, expect, vi } de "vitest". Use vi.mock() para mocks.'
      : 'Use Jest como framework de teste. Use jest.mock() para mocks.';

    return `Você é um especialista em testes.
Os testes gerados abaixo falharam. Corrija-os com base nos erros reportados.

${frameworkInstructions}

CÓDIGO ORIGINAL:
${originalCode}

TESTES GERADOS (com falha):
${generatedTests}

ERROS:
${errors}

Corrija os testes para que compilem e passem. Mantenha a mesma estrutura e cobertura.

${langInstructions}`;
  }

  buildRetryPrompt(
    originalCode: string,
    generatedTests: string,
    errors: string,
    language: SourceLanguage = 'typescript',
    framework: TestFramework = 'jest',
  ): string {
    return LLMService.buildRetryPrompt(originalCode, generatedTests, errors, language, framework);
  }
}
