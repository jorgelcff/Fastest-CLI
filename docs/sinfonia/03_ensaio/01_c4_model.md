# C4 Model - Fastest CLI

## Projeto
**Fastest CLI** - Ferramenta CLI alimentada por IA para geracaoo de testes Jest a partir de requisitos em linguagem natural.

---

## Nivel 1 - Contexto

```
+-------------------+          +---------------------+
|   Desenvolvedor   |--------->|    Fastest CLI       |
| (Usuario Terminal)|          | (Ferramenta CLI)    |
+-------------------+          +---------------------+
        |                         |              |
        |                         v              v
        v                  +-----------+   +-----------+
+------------------+       | OpenAI    |   | Anthropic |
| Arquivos de      |       | API       |   | API       |
| Codigo Fonte     |       +-----------+   +-----------+
+------------------+              |
                                  v
                           +-----------+
                           | Jest      |
                           | Runner    |
                           +-----------+
                                  |
                                  v
                           +-----------+
                           | Relatorios|
                           | Cobertura |
                           +-----------+
```

### Atores e Sistemas

| Elemento | Tipo | Descricao |
|----------|------|-----------|
| Desenvolvedor | Pessoa | Usuario que interage via terminal para gerar testes |
| Fastest CLI | Sistema | Aplicacao CLI que orquestra a geracao de testes |
| OpenAI API | Sistema Externo | Provedor LLM (modelo padrao: gpt-4o-mini) |
| Anthropic API | Sistema Externo | Provedor LLM (modelo padrao: claude-haiku) |
| Arquivos de Codigo Fonte | Sistema Externo | Codigo TypeScript/JavaScript do projeto alvo |
| Jest Runner | Sistema Externo | Executor de testes e gerador de relatorios de cobertura |

### Fluxos Principais

1. **Desenvolvedor -> Fastest CLI**: Executa comandos via terminal (`fastest generate`, `fastest doctor`, `fastest config`)
2. **Fastest CLI -> OpenAI/Anthropic API**: Envia codigo fonte + requisitos em linguagem natural, recebe codigo de teste gerado
3. **Fastest CLI -> Jest Runner**: Executa testes gerados para validacao
4. **Jest Runner -> Relatorios de Cobertura**: Produz metricas de cobertura (Istanbul/NYC)
5. **Desenvolvedor -> Arquivos de Codigo Fonte**: Fornece os arquivos fonte que serao analisados pela CLI

---

## Nivel 2 - Container

```
+----------------------------------------------------------+
|                    Fastest CLI                            |
|                                                          |
|  +-------------------+     +-------------------------+   |
|  | Aplicacao CLI      |     | Provedores LLM          |   |
|  | (TypeScript/Node)  |---->| (APIs Externas)         |   |
|  | commander.js v14   |     | OpenAI v6 / Anthropic   |   |
|  +-------------------+     | SDK v0.92               |   |
|          |                  +-------------------------+   |
|          |                                                |
|          v                                                |
|  +-------------------+     +-------------------------+   |
|  | Jest Runner        |     | Sistema de Arquivos      |   |
|  | (Execucao Testes)  |     | (Fonte/Testes/Cobertura)|   |
|  | jest + ts-jest     |     | ~/.fastest/config.json  |   |
|  +-------------------+     +-------------------------+   |
+----------------------------------------------------------+
```

| Container | Tecnologia | Responsabilidade |
|-----------|------------|------------------|
| Aplicacao CLI | TypeScript, Node.js, commander.js v14, chalk v4, ora v5 | Ponto de entrada, roteamento de comandos, interface com usuario |
| Provedores LLM | OpenAI SDK v6, Anthropic SDK v0.92 | Comunicacao com APIs de LLM para geracao de codigo de teste |
| Jest Runner | Jest, ts-jest, Istanbul | Execucao de testes gerados e coleta de metricas de cobertura |
| Sistema de Arquivos | Node.js fs | Leitura de codigo fonte, escrita de testes gerados, configuracao local |

---

## Nivel 3 - Componente

```
+------------------------------------------------------------------+
|                      Aplicacao CLI                                |
|                                                                   |
|  +------------------+  +----------------+  +------------------+  |
|  | Generate Command |  | Doctor Command |  | Config Command   |  |
|  | generate.cmd.ts  |  | doctor.cmd.ts  |  | config.cmd.ts    |  |
|  +--------+---------+  +----------------+  +------------------+  |
|           |                                                       |
|           v                                                       |
|  +------------------+  +-------------------------+               |
|  | LLM Service      |  | Test Generator Service  |               |
|  | llm.service.ts   |  | test-generator.svc.ts   |               |
|  +--------+---------+  +------------+------------+               |
|           |                          |                            |
|           v                          v                            |
|  +------------------+  +-------------------------+               |
|  | Provider Factory  |  | Coverage Service        |               |
|  | provider.factory  |  | coverage.service.ts     |               |
|  +--+------------+--+  +-------------------------+               |
|     |            |                                                |
|     v            v                                                |
|  +--------+  +----------+  +----------------+  +--------------+  |
|  | OpenAI |  | Anthropic|  | Config Manager |  | File Utils   |  |
|  |Provider|  | Provider |  | config.mgr.ts  |  | file.utils   |  |
|  +--------+  +----------+  +----------------+  +--------------+  |
+------------------------------------------------------------------+
```

| Componente | Arquivo | Responsabilidade |
|------------|---------|------------------|
| Generate Command | `src/cli/generate.command.ts` | Comando principal: recebe requisitos, orquestra geracao de testes |
| Doctor Command | `src/cli/doctor.command.ts` | Diagnostico: verifica dependencias, chaves API, configuracao |
| Config Command | `src/cli/config.command.ts` | Gerenciamento de configuracao: provedor, modelo, chaves API |
| LLM Service | `src/services/llm.service.ts` | Abstrai comunicacao com provedores LLM |
| Test Generator Service | `src/services/test-generator.service.ts` | Orquestra pipeline de geracao: prompt -> LLM -> validacao |
| Coverage Service | `src/services/coverage.service.ts` | Coleta e analisa metricas de cobertura Jest/Istanbul |
| Provider Factory | `src/providers/provider.factory.ts` | Cria instancia do provedor LLM conforme configuracao |
| Provider Interface | `src/providers/provider.interface.ts` | Contrato para implementacao de provedores |
| OpenAI Provider | `src/providers/openai.provider.ts` | Implementacao do provedor OpenAI (gpt-4o-mini) |
| Anthropic Provider | `src/providers/anthropic.provider.ts` | Implementacao do provedor Anthropic (claude-haiku) |
| Config Manager | `src/config/config.manager.ts` | Gerencia `~/.fastest/config.json` |
| File Utils | `src/utils/file.utils.ts` | Utilitarios para leitura/escrita de arquivos |
