import { resolveApiKeyForProvider, readConfig } from '../config/config.manager';
import { createProvider, detectProvider, defaultModelForProvider } from '../providers/provider.factory';
import { LLMProvider } from '../providers/provider.interface';
import { SourceLanguage } from '../utils/file.utils';

export type TestType = 'unit' | 'integration';

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

  static buildTestPrompt(
    card: string,
    code: string,
    language: SourceLanguage = 'typescript',
    testType: TestType = 'unit',
  ): string {
    const langInstructions =
      language === 'typescript'
        ? 'Retorne apenas código TypeScript válido, sem explicações, sem blocos markdown.'
        : 'Retorne apenas código JavaScript válido (CommonJS, use require()), sem explicações, sem blocos markdown.';

    if (testType === 'integration') {
      return `Você é um especialista em testes de integração de APIs e fluxos de negócio.
Gere testes de integração em Jest + Supertest para o código abaixo.

CARD (fluxo funcional):
${card}

CÓDIGO:
${code}

Regras obrigatórias:
- Cubra o fluxo ponta a ponta do caso de uso descrito no card
- Inclua cenários de sucesso e de falha de comunicação/API
- Use mocks determinísticos para dependências externas (ex.: banco, fila, API externa) com jest.mock/jest.spyOn
- Evite dependências de estado global e infraestrutura real
- Organize os testes por cenários de negócio (não apenas por função isolada)
- Se necessário, faça bootstrap da aplicação para requisições HTTP via Supertest

${langInstructions}`;
    }

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

  buildTestPrompt(
    card: string,
    code: string,
    language: SourceLanguage = 'typescript',
    testType: TestType = 'unit',
  ): string {
    return LLMService.buildTestPrompt(card, code, language, testType);
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
  ): string {
    const langInstructions =
      language === 'typescript'
        ? 'Retorne apenas código TypeScript válido, sem explicações, sem blocos markdown.'
        : 'Retorne apenas código JavaScript válido (CommonJS, use require()), sem explicações, sem blocos markdown.';

    return `Você é um especialista em testes.
Os testes gerados abaixo falharam. Corrija-os com base nos erros reportados.

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
  ): string {
    return LLMService.buildRetryPrompt(originalCode, generatedTests, errors, language);
  }
}
