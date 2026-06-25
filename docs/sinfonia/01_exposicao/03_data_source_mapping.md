# Data Source Mapping

## Visao Geral

Este documento mapeia todas as fontes de dados consumidas e produzidas pelo Fastest CLI durante o pipeline de geracao de testes.

---

## 1. Arquivos de Codigo-Fonte

| Campo | Valor |
|-------|-------|
| **Nome** | Arquivos de Codigo-Fonte |
| **Descricao** | Arquivos TypeScript/JavaScript do projeto-alvo que serao analisados para geracao de testes. Inclui services, controllers, utils, models e outros modulos. |
| **Origem** | Sistema de arquivos local do usuario |
| **Tipo** | Dados estruturados (codigo-fonte) |
| **Formato** | `.ts`, `.tsx`, `.js`, `.jsx` — texto UTF-8 |
| **Frequencia** | Sob demanda, a cada execucao de `fastest generate` |
| **Qualidade** | Dependente do projeto do usuario; deve compilar em TypeScript para validacao funcionar |
| **Metodos de Coleta** | Leitura direta do sistema de arquivos via `file.utils.ts`, com guard rails: limite maximo de arquivos (`maxFiles`), caracteres por arquivo (`maxCharsPerFile`) e total de caracteres (`maxTotalChars`) |
| **Acesso** | Leitura local — sem autenticacao necessaria |
| **Proprietario** | Usuario/desenvolvedor |
| **Privacidade** | Codigo-fonte e enviado para APIs externas (OpenAI/Anthropic) como parte do prompt; usuario deve estar ciente |
| **Integracao** | Entrada principal do `test-generator.service.ts`; arquivos sao lidos e concatenados no contexto enviado a LLM |

---

## 2. Cards de Requisitos (Linguagem Natural)

| Campo | Valor |
|-------|-------|
| **Nome** | Cards de Requisitos |
| **Descricao** | Documentos em linguagem natural que descrevem o comportamento esperado do codigo. Podem conter criterios de aceitacao, regras de negocio e cenarios de uso. |
| **Origem** | Usuario (arquivos Markdown ou texto) |
| **Tipo** | Dados nao-estruturados (texto livre) |
| **Formato** | `.md`, `.txt` — texto UTF-8 |
| **Frequencia** | Sob demanda, fornecido como parametro `--card` |
| **Qualidade** | Variavel; quanto mais detalhado o card, melhores os testes gerados |
| **Metodos de Coleta** | Leitura do arquivo especificado via flag `--card` no comando `fastest generate` |
| **Acesso** | Leitura local |
| **Proprietario** | Usuario/equipe de produto |
| **Privacidade** | Enviado para API da LLM como parte do prompt |
| **Integracao** | Incorporado no prompt do `llm.service.ts` junto com o codigo-fonte |

---

## 3. Configuracao Jest

| Campo | Valor |
|-------|-------|
| **Nome** | Configuracao Jest |
| **Descricao** | Arquivo de configuracao do Jest do projeto-alvo (`jest.config.ts`, `jest.config.js` ou campo `jest` no `package.json`). Usado para executar os testes gerados e coletar cobertura. |
| **Origem** | Sistema de arquivos do projeto |
| **Tipo** | Dados estruturados (configuracao) |
| **Formato** | `.ts`, `.js`, `.json` |
| **Frequencia** | Lido uma vez por execucao |
| **Qualidade** | Deve ser valido e funcional para que a etapa de execucao de testes funcione |
| **Metodos de Coleta** | Deteccao automatica pelo Jest CLI durante execucao |
| **Acesso** | Leitura local |
| **Proprietario** | Projeto/repositorio |
| **Privacidade** | Nao e enviado para APIs externas |
| **Integracao** | Consumido indiretamente pela etapa de execucao de testes (`jest --coverage`) |

---

## 4. Relatorios de Cobertura (Istanbul/JSON)

| Campo | Valor |
|-------|-------|
| **Nome** | Relatorios de Cobertura |
| **Descricao** | Dados de cobertura gerados pelo Jest/Istanbul em formato JSON. Contem metricas de statements, branches, functions e lines por arquivo. O Fastest coleta cobertura antes e depois da geracao para calcular o delta. |
| **Origem** | Execucao do Jest com flag `--coverage` |
| **Tipo** | Dados estruturados (metricas) |
| **Formato** | JSON (Istanbul coverage format) — `coverage/coverage-summary.json` |
| **Frequencia** | Gerado duas vezes por execucao: before e after |
| **Qualidade** | Alta — gerado automaticamente pelo Istanbul, dados precisos |
| **Metodos de Coleta** | Parsing do JSON de cobertura pelo `coverage.service.ts` |
| **Acesso** | Leitura local do diretorio `coverage/` |
| **Proprietario** | Projeto/repositorio |
| **Privacidade** | Dados locais, nao enviados para APIs externas |
| **Integracao** | `coverage.service.ts` le os JSONs e gera tabelas comparativas (before/after/delta) exibidas no terminal via chalk |

---

## 5. Respostas da LLM (API)

| Campo | Valor |
|-------|-------|
| **Nome** | Respostas da API LLM |
| **Descricao** | Codigo de teste gerado pelos modelos de linguagem (GPT-4o-mini da OpenAI ou Claude Haiku 4.5 da Anthropic) em resposta ao prompt contendo codigo-fonte e requisitos. |
| **Origem** | APIs externas: `api.openai.com` ou `api.anthropic.com` |
| **Tipo** | Dados semi-estruturados (codigo gerado em texto) |
| **Formato** | Texto contendo codigo TypeScript/JavaScript (extraido de blocos de codigo Markdown) |
| **Frequencia** | Uma chamada por execucao de `fastest generate` |
| **Qualidade** | Variavel; depende do modelo, temperatura e qualidade do prompt/contexto |
| **Metodos de Coleta** | Chamada HTTP via SDK oficial (`openai` ou `@anthropic-ai/sdk`) nos providers `openai.provider.ts` e `anthropic.provider.ts` |
| **Acesso** | Requer chave de API (`OPENAI_API_KEY` ou `ANTHROPIC_API_KEY`) configurada via variavel de ambiente |
| **Proprietario** | OpenAI / Anthropic (infraestrutura); usuario (conteudo gerado) |
| **Privacidade** | O prompt contendo codigo-fonte do usuario e processado pelos servidores do provider |
| **Integracao** | Resposta e parseada pelo `llm.service.ts`, salva como arquivo `.test.ts` e validada pelo pipeline |

---

## 6. Arquivos de Contexto Adicional

| Campo | Valor |
|-------|-------|
| **Nome** | Arquivos de Contexto |
| **Descricao** | Arquivos auxiliares que podem ser incluidos no contexto enviado a LLM para melhorar a qualidade dos testes gerados: tipos, interfaces, mocks existentes, arquivos de configuracao do projeto. |
| **Origem** | Sistema de arquivos local, selecionados automaticamente ou via configuracao |
| **Tipo** | Dados estruturados (codigo-fonte, tipos) |
| **Formato** | `.ts`, `.js`, `.d.ts` — texto UTF-8 |
| **Frequencia** | Sob demanda, selecionados a cada execucao |
| **Qualidade** | Controlada pelos guard rails: maximo de arquivos e caracteres para evitar exceder limites de tokens |
| **Metodos de Coleta** | Resolucao de dependencias e imports a partir do arquivo-fonte principal |
| **Acesso** | Leitura local |
| **Proprietario** | Projeto/repositorio |
| **Privacidade** | Enviado para API da LLM como parte do contexto |
| **Integracao** | Agregado pelo `test-generator.service.ts` respeitando limites de `maxContextFiles`, `maxContextCharsPerFile` e `maxTotalContextChars` |

---

## Diagrama de Fluxo de Dados

```
[Codigo-Fonte] + [Cards] + [Contexto] 
        │
        ▼
  ┌─────────────────┐
  │  Guard Rails     │  (maxFiles, maxCharsPerFile, maxTotalChars)
  │  (file.utils.ts) │
  └────────┬────────┘
           ▼
  ┌─────────────────┐
  │  Prompt Builder  │  (llm.service.ts)
  └────────┬────────┘
           ▼
  ┌─────────────────┐
  │  LLM Provider    │  (openai.provider.ts / anthropic.provider.ts)
  │  API Call        │
  └────────┬────────┘
           ▼
  ┌─────────────────┐
  │  Codigo Gerado   │  (.test.ts)
  │  + Validacao TS  │
  └────────┬────────┘
           ▼
  ┌─────────────────┐
  │  Jest Execution  │  → [Cobertura JSON]
  └────────┬────────┘
           ▼
  ┌─────────────────┐
  │  Coverage Delta  │  (coverage.service.ts)
  │  Before/After    │
  └─────────────────┘
```
