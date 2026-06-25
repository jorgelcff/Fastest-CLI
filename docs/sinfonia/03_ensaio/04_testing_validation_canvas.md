# Testing & Validation Canvas - Fastest CLI

## Projeto
**Fastest CLI** - Geracao de testes Jest via IA a partir de requisitos em linguagem natural.

---

## 1. Visao Geral dos Testes

| Metrica | Valor |
|---------|-------|
| Total de testes | 154 |
| Framework | Jest + ts-jest |
| Cobertura geral | 81.68% |
| Cobertura de statements | 81.68% |
| Ferramenta de cobertura | Istanbul (integrada ao Jest) |

---

## 2. Cobertura por Modulo

| Modulo | Arquivo | Cobertura | Status |
|--------|---------|-----------|--------|
| Providers | `openai.provider.ts` | 100% | Excelente |
| Providers | `anthropic.provider.ts` | 100% | Excelente |
| Providers | `provider.factory.ts` | 100% | Excelente |
| Config | `config.manager.ts` | 100% | Excelente |
| CLI | `doctor.command.ts` | ~85% | Bom |
| CLI | `config.command.ts` | ~85% | Bom |
| Services | `llm.service.ts` | ~80% | Bom |
| Services | `test-generator.service.ts` | ~80% | Bom |
| Services | `coverage.service.ts` | 71% | Precisa melhorar |
| CLI | `generate.command.ts` | 68% | Precisa melhorar |
| Utils | `file.utils.ts` | ~85% | Bom |

---

## 3. Tipos de Testes

### 3.1 Testes Unitarios (maioria)

- **Escopo**: Funcoes e classes individuais com dependencias mockadas
- **Mocks**: Provedores LLM, sistema de arquivos, Jest runner, APIs externas
- **Padrao**: Arrange-Act-Assert com `jest.mock()` e `jest.spyOn()`

```
Exemplo: llm.service.test.ts
- Mock do Provider Factory
- Mock do provedor retornado
- Verifica que o servico chama o provedor correto com prompt correto
```

### 3.2 Testes de Comandos CLI

- **Escopo**: Comandos commander.js com servicos mockados
- **Mocks**: Todos os servicos (LLM, TestGenerator, Coverage, Config)
- **Validacao**: Argumentos parseados, opcoes aplicadas, output correto

```
Exemplo: generate.command.test.ts
- Mock do TestGeneratorService
- Simula argumentos de CLI
- Verifica que arquivo de teste e gerado no caminho correto
```

### 3.3 Testes de Provedores

- **Escopo**: Implementacoes de OpenAI e Anthropic providers
- **Mocks**: SDKs dos provedores (openai, @anthropic-ai/sdk)
- **Validacao**: Chamadas corretas a API, tratamento de erros, parsing de resposta

---

## 4. Ferramentas e Infraestrutura

| Ferramenta | Versao | Uso |
|------------|--------|-----|
| Jest | (via ts-jest) | Framework de testes e runner |
| ts-jest | - | Transformador TypeScript para Jest |
| Istanbul | (integrado) | Cobertura de codigo (statements, branches, functions, lines) |
| jest.mock() | - | Mocking de modulos e dependencias |

### Configuracao Jest

```json
{
  "preset": "ts-jest",
  "testEnvironment": "node",
  "collectCoverage": true,
  "coverageReporters": ["text", "lcov"]
}
```

---

## 5. Areas Fracas e Plano de Melhoria

### 5.1 `generate.command.ts` - 68% de cobertura

| Cenario Faltante | Prioridade | Complexidade |
|------------------|------------|--------------|
| Tratamento de erro quando arquivo fonte nao existe | Alta | Baixa |
| Fluxo com `--dry-run` ativado | Alta | Baixa |
| Multiplos arquivos de contexto adicional | Media | Media |
| Cancelamento/timeout durante chamada LLM | Media | Alta |
| Output com diferentes formatos (verbose, quiet) | Baixa | Baixa |

### 5.2 `coverage.service.ts` - 71% de cobertura

| Cenario Faltante | Prioridade | Complexidade |
|------------------|------------|--------------|
| Parse de relatorio de cobertura com formato inesperado | Alta | Media |
| Calculo de delta quando cobertura anterior nao existe | Alta | Baixa |
| Tratamento de erro quando Jest falha ao coletar cobertura | Media | Media |
| Arquivos sem cobertura anterior (baseline zero) | Media | Baixa |

---

## 6. Estrategia de Validacao do Output de IA

Os testes gerados pelo Fastest CLI para os usuarios finais passam por validacao em pipeline:

```
Codigo Gerado pelo LLM
        |
        v
[1] Verificacao de sintaxe (TypeScript compila?)
        |
        v
[2] Execucao Jest (testes passam?)
        |
        v
[3] Cobertura (delta positivo?)
        |
        v
[4] Revisao humana (usuario aprova?)
```

---

## 7. Comandos de Teste

```bash
# Executar todos os testes
npm test

# Executar com cobertura
npm run test:coverage

# Executar testes especificos
npx jest --testPathPattern=generate.command

# Executar em modo watch
npx jest --watch
```

---

## 8. Meta de Qualidade

| Metrica | Atual | Meta | Prazo |
|---------|-------|------|-------|
| Cobertura geral | 81.68% | 85% | Proximo release |
| generate.command.ts | 68% | 80% | Proximo release |
| coverage.service.ts | 71% | 80% | Proximo release |
| Testes totais | 154 | 180+ | Proximo release |
| Testes de integracao | 0 | 10+ | Futuro |
