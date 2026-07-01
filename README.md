# Fastest CLI

> Pipeline Inteligente de Geração de Testes a partir de Cards

---
## Demo Youtube
[Clique aqui para assitir](https://youtu.be/6NkT2c_biRY)



## Pré-requisitos

Antes de instalar, confirme o ambiente abaixo — isso evita a maioria dos problemas de instalação:

| Requisito | Versão | Como verificar | Onde obter |
|---|---|---|---|
| **Node.js** | >= 18 | `node --version` | [nodejs.org](https://nodejs.org) |
| **npm** | >= 9 (vem com o Node) | `npm --version` | — |
| **Git** | qualquer versão recente | `git --version` | [git-scm.com](https://git-scm.com) |
| **Chave de API LLM** | OpenAI **ou** Anthropic, com créditos | — | [OpenAI](https://platform.openai.com/api-keys) · [Anthropic](https://console.anthropic.com/settings/keys) |

> **Por que Git?** A instalação global é feita a partir do GitHub (`npm install -g github:...`) e o npm usa o Git para clonar o repositório. **Sem Git instalado, a instalação falha.**

> **Windows:** se o PowerShell bloquear scripts, use `fastest.cmd` no lugar de `fastest` (ou ajuste a *Execution Policy*).

**No projeto onde você vai gerar testes**, o `fastest doctor` espera encontrar: `package.json`, **Jest** ou **Vitest** configurado e, para TypeScript, um `tsconfig.json`.

---

## Instalação rápida

```bash
# 1. Instalar globalmente (requer Node.js >= 18 e Git)
npm install -g github:jorgelcff/Fastest-CLI

# 2. Configurar provedor e chave (uma vez por máquina) — salva em ~/.fastest/config.json
fastest init                                   # wizard interativo (recomendado)
# ou, direto:
fastest config set-key --provider openai       # OpenAI (padrão)
fastest config set-key --provider anthropic    # Anthropic (Claude), opcional

# 3. Validar e usar em qualquer projeto
fastest doctor
fastest generate --card="Descreva o que testar" --file="src/meu-arquivo.ts"
```

A chave fica salva globalmente em `~/.fastest/config.json` e vale para **todos** os projetos — não é preciso `.env` em cada um. Suporta **TypeScript** e **JavaScript** automaticamente (detecção pela extensão).

→ [Instruções completas de instalação e configuração](#13-instalação-e-uso)

---

## 1. Título do Projeto

Fastest CLI — Pipeline Inteligente de Geração de Testes a partir de Cards

## 2. Domínio e Fase do SDLC

- Domínio: D2 — Testes de Software
- Fase: Validação e Qualidade no SDLC

## 3. Problema

A criação de testes é essencial para a qualidade do software, mas ainda é frequentemente negligenciada ou realizada de forma inconsistente. Em muitos times, desenvolvedores recebem cards com descrições funcionais e precisam traduzir esse contexto em testes de qualidade sob pressão de prazo.

Sem apoio automatizado, isso costuma gerar:

- Baixa cobertura de testes
- Ausência ou fragilidade de testes de integração
- Maior incidência de bugs em produção

## 4. Trabalhos Relacionados

- GitHub Copilot
- CodiumAI
- Diffblue Cover

### Gap Identificado

As soluções existentes auxiliam na geração de código e testes, mas não são centradas no card como entrada primária e estruturada para conduzir uma pipeline completa de validação.

## 5. Solução Proposta

Desenvolver uma pipeline com IA que execute, de forma orquestrada:

1. Recebimento do card (descrição funcional)
2. Geração automática de testes unitários
3. Execução dos testes e medição de cobertura
4. Identificação de lacunas e sugestão de novos testes
5. Geração de testes de integração
6. Geração de código de testes E2E (Cypress)

A IA atua como núcleo da geração, análise e iteração dos testes.
O fluxo atual suporta geração unitária e de integração orientada a casos de uso.

## 6. Arquitetura Preliminar

- CLI em Node.js
- API opcional em NestJS
- Serviço de LLM
- Executor de testes com Jest
- Analisador de cobertura com Istanbul
- Gerador de testes E2E

## 7. Escopo do MVP

### Inclui

- Geração de testes unitários
- Execução automática dos testes
- Análise de cobertura
- Sugestão de novos testes

### Exclui

- Execução real de Cypress
- Integração com ferramentas externas

## 8. Dependências Técnicas

- Node.js >= 18
- Jest (ou Vitest) + Istanbul (coverage)
- API de LLM (OpenAI e/ou Anthropic)
- chalk + ora (output visual)

## 9. Hipótese Principal

Testes gerados automaticamente a partir de cards são suficientes para melhorar cobertura e qualidade do software, reduzindo esforço manual sem comprometer consistência.

## 10. Critérios de Sucesso

- Aumento mensurável da cobertura de testes
- Execução bem-sucedida dos testes gerados
- Redução de esforço manual no processo de criação de testes

## 11. Fluxo do MVP

1. Entrada do card em linguagem natural
2. Normalização do contexto funcional
3. Geração inicial de testes unitários
4. Execução com relatório de cobertura
5. Análise de gaps (classes, funções e cenários)
6. Sugestão de testes complementares

## 12. Entregáveis Esperados

- CLI funcional para pipeline de geração de testes
- Relatório de execução e cobertura por rodada
- Mecanismo de sugestão incremental de cenários não cobertos
- Documentação de uso para replicação do experimento

---

## 13. Instalação e Uso

### Pré-requisitos

Veja a seção [Pré-requisitos](#pré-requisitos) no topo do README. Em resumo: **Node.js >= 18**, **Git** (para instalar via GitHub) e uma **chave de API** da OpenAI e/ou da Anthropic.

---

### Instalação global (uso em qualquer projeto)

Instale diretamente do GitHub — o build é feito automaticamente:

```bash
npm install -g github:jorgelcff/Fastest-CLI
```

Ou, se publicado no npm:

```bash
npm install -g fastest-cli
```

Após instalar, o comando `fastest` fica disponível globalmente.

### Configuração (uma vez por máquina)

A forma recomendada é salvar a chave no **config global** (`~/.fastest/config.json`), que vale para todos os projetos — não depende de `.env` em cada projeto:

```bash
# Wizard interativo: escolhe o provedor, pede a chave e detecta o framework de teste
fastest init

# Ou configurar manualmente:
fastest config set-key --provider openai       # cola a chave OpenAI (sk-...)
fastest config set-key --provider anthropic    # cola a chave Anthropic (opcional)
fastest config set-model gpt-4o-mini           # modelo padrão (claude-* roteia p/ Anthropic)
fastest config show                            # mostra provedores, modelo e chave ativa
fastest config clear                           # remove toda a configuração salva
```

> A chave é gravada em `~/.fastest/config.json` com permissão `600`.

#### Onde a chave da API é lida

Para cada provedor, o Fastest CLI resolve a chave **nesta ordem de prioridade**:

| Prioridade | Fonte | Como configurar |
|---|---|---|
| 1º | Variável de ambiente | `OPENAI_API_KEY` / `ANTHROPIC_API_KEY` no shell ou em um `.env` no projeto atual |
| 2º | Config global | `fastest config set-key --provider <openai\|anthropic>` → `~/.fastest/config.json` |

#### Multi-provider (OpenAI + Anthropic)

O provedor é determinado pelo **nome do modelo**: modelos que começam com `claude` usam a **Anthropic**; qualquer outro usa a **OpenAI**.

| Modelo (`--model` ou `config set-model`) | Provedor | Chave necessária |
|---|---|---|
| `gpt-4o-mini` (padrão), `gpt-4o`, `gpt-4`, … | OpenAI | `OPENAI_API_KEY` |
| `claude-haiku-4-5-20251001`, `claude-*` | Anthropic | `ANTHROPIC_API_KEY` |

```bash
# Usar Claude em uma geração específica
fastest generate --card="..." --file="src/foo.ts" --model="claude-haiku-4-5-20251001"

# Ou tornar o Claude o padrão da máquina
fastest config set-model claude-haiku-4-5-20251001
fastest config set-key --provider anthropic
```

#### Verificando a instalação

```bash
fastest --version    # exibe a versão atual (0.1.0)
fastest --help       # lista todos os comandos
fastest doctor       # valida o ambiente do projeto atual
```

---

### Quick Start (contribuindo ou rodando localmente)

```bash
# 1. Clone e instale
git clone https://github.com/jorgelcff/Fastest-CLI.git
cd Fastest-CLI
npm install

# 2. Setup guiado — cria o .env, compila e valida o ambiente
npm run setup

# 3. Gere testes para o exemplo incluído
node dist/index.js generate \
  --card="Como QA, quero validar as regras de negócio do OrderService" \
  --file="example/order.service.ts"
```

O `npm run setup` faz tudo automaticamente:
- Cria o arquivo `.env` a partir do `.env.example`
- Informa onde obter a chave da OpenAI
- Compila o TypeScript (`npm run build`)
- Roda `fastest doctor` para validar o ambiente

---

### Obtendo a chave da OpenAI

1. Acesse [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Clique em **"Create new secret key"**
3. Copie o valor e cole no arquivo `.env`:

```env
OPENAI_API_KEY=sk-proj-...sua_chave_aqui...
OPENAI_MODEL=gpt-4o-mini
```

> **Observação sobre custos:** O modelo padrão `gpt-4o-mini` é o mais barato da OpenAI. Uma geração típica consome menos de $0,01. Use `--dry-run` para inspecionar o prompt antes de gastar créditos.

---

### Erros comuns e como resolver

| Erro | Causa | Solução |
|---|---|---|
| `✖ OpenAI API key is required` | Sem `.env` ou chave vazia | Execute `npm run setup` e preencha `OPENAI_API_KEY` |
| `✖ File not found: ...` | Caminho do arquivo fonte errado | Verifique o `--file` passado |
| `command not found: fastest` | Build não executado ou `npm link` não feito | Execute `npm install && npm link` |
| `Cannot find module 'dist/index.js'` | Build não executado | Execute `npm run build` primeiro |
| Testes gerados não compilam | LLM gerou import incorreto | O serviço corrige o import automaticamente — reporte se persistir |

---

### Validando o ambiente manualmente

```bash
node dist/index.js doctor
```

Saída esperada (ambiente ok):

```
⚡ Fastest CLI — Doctor

Verificando: /seu/projeto

  ✔ package.json presente
  ✔ Jest configurado (script ou arquivo de config)
  ✔ tsconfig.json presente
  ✔ Node.js >=18 (detectado v20.x.x)
  ✔ .env presente
  ✔ OPENAI_API_KEY configurada

✔ Ambiente pronto para o Fastest CLI.
```

Saída quando `.env` não foi configurado:

```
  ✖ .env presente
    → Execute `npm run setup` ou copie .env.example para .env e preencha OPENAI_API_KEY
  ✖ OPENAI_API_KEY configurada
    → Substitua "your_openai_api_key_here" por sua chave real em .env
```

---

### Scripts npm

| Script | Descrição |
|---|---|
| `npm run setup` | **Setup inicial**: cria `.env`, compila e valida o ambiente |
| `npm run build` | Compila o TypeScript para `dist/` |
| `npm start` | Executa a CLI em modo desenvolvimento (ts-node) |
| `npm test` | Roda os testes com cobertura |
| `npm run test:watch` | Roda os testes em modo watch |
| `npm run lint` | Verifica erros de tipos TypeScript |

---

## 14. Demo Rápida

Gere testes para o serviço de pedidos incluído como exemplo:

```bash
node dist/index.js generate \
  --card="Como QA, quero validar as regras de negócio do OrderService: criação de pedido com validação de estoque e desconto, confirmação, cancelamento e cálculo de subtotal" \
  --file="example/order.service.ts" \
  --output="tests" \
  --model="gpt-4o-mini"
```

Saída esperada:

```
⚡ Fastest CLI — Pipeline Inteligente de Geração de Testes

- Capturando cobertura atual (baseline)…
✔ Baseline: 0% stmts · 0% branches · 0% funcs · 0% lines

✔ Testes gerados com sucesso!
  Arquivo    tests/order.service.spec.ts
  Linguagem  TypeScript
  Testes     18 caso(s) encontrado(s)

✔ TypeScript válido — nenhum erro de tipo.

✔ Testes executados com sucesso!

┌────────────────┬────────────┬──────────────┬───────────────┬───────────┐
│ Cobertura      │ Statements │ Branches     │ Functions     │ Lines     │
├────────────────┼────────────┼──────────────┼───────────────┼───────────┤
│ Antes          │ 0%         │ 0%           │ 0%            │ 0%        │
│ Depois         │ 91%        │ 84%          │ 100%          │ 90%       │
├────────────────┼────────────┼──────────────┼───────────────┼───────────┤
│ Delta          │ +91%       │ +84%         │ +100%         │ +90%      │
└────────────────┴────────────┴──────────────┴───────────────┴───────────┘

⚡ Pipeline concluído.
```

**Suporte automático a TypeScript e JavaScript:**

| Arquivo fonte | Teste gerado | Prompt |
|---|---|---|
| `src/service.ts` | `tests/service.spec.ts` | TypeScript com tipos |
| `src/utils.js` | `tests/utils.spec.js` | JavaScript com CommonJS |
| `src/helper.tsx` | `tests/helper.spec.ts` | TypeScript com tipos |

Use `--dry-run` para inspecionar o prompt antes de consumir créditos da API:

```bash
node dist/index.js generate \
  --card="Como QA, quero validar as regras de negócio do OrderService" \
  --file="example/order.service.ts" \
  --dry-run
```

Use `--suggest` para receber sugestões de novos testes baseadas nos gaps de cobertura:

```bash
node dist/index.js generate \
  --card="Como QA, quero validar as regras de negócio do OrderService" \
  --file="example/order.service.ts" \
  --suggest
```

---

## 15. Uso do comando `generate`

### Formato básico

```bash
# Após build
node dist/index.js generate --card="<descrição>" --file="<caminho>"

# Com ts-node (desenvolvimento)
npx ts-node src/index.ts generate --card="<descrição>" --file="<caminho>"
```

### Exemplos

```bash
# Exemplo básico — arquivo de utilidades matemáticas
node dist/index.js generate \
  --card="Utilitários matemáticos: add, subtract, multiply, divide, isPrime" \
  --file="example/math.utils.ts"

# Exemplo avançado — serviço com lógica de negócio
node dist/index.js generate \
  --card="Como QA, quero validar as regras de negócio do OrderService: criação de pedido com validação de estoque e desconto, confirmação, cancelamento" \
  --file="example/order.service.ts" \
  --suggest

# Dry-run — inspeciona sem chamar a API
node dist/index.js generate \
  --card="Utilitários matemáticos" \
  --file="example/math.utils.ts" \
  --dry-run

# Especificando modelo e diretório de saída
node dist/index.js generate \
  --card="Utilitários matemáticos" \
  --file="example/math.utils.ts" \
  --output="tests" \
  --model="gpt-4o"

# Incluindo contexto adicional (arquivos e pastas do sistema)
node dist/index.js generate \
  --card="Validar regras com contexto de domínio" \
  --file="src/services/order.service.ts" \
  --context "src/types" "src/config/app.config.ts" \
  --output="tests" \
  --dry-run

# Guard rails de contexto (limites e modo estrito)
node dist/index.js generate \
  --card="Validar regras com contexto controlado" \
  --file="src/services/order.service.ts" \
  --context "src" \
  --max-context-files 15 \
  --max-context-chars 3000 \
  --max-context-total-chars 20000 \
  --strict-context \
  --dry-run
```

### Opções do comando `generate`

| Opção | Obrigatória | Padrão | Descrição |
|---|---|---|---|
| `--card <text>` | ✅ | — | Descrição funcional do card |
| `--file <path>` | ✅ | — | Caminho para o arquivo fonte |
| `--context <paths...>` | ❌ | — | Arquivos/pastas extras para enviar como contexto |
| `--max-context-files <n>` | ❌ | `20` | Limite máximo de arquivos de contexto |
| `--max-context-chars <n>` | ❌ | `4000` | Limite de caracteres por arquivo de contexto |
| `--max-context-total-chars <n>` | ❌ | `30000` | Limite total de caracteres somando todos os contextos |
| `--strict-context` | ❌ | `false` | Falha se houver truncamento/arquivos ignorados |
| `--output <dir>` | ❌ | `tests` | Diretório de saída dos testes |
| `--model <model>` | ❌ | `gpt-4o-mini` | Modelo do LLM (modelos `claude-*` roteiam para a Anthropic) |
| `--test-type <unit\|integration\|use-case>` | ❌ | `unit` | Tipo de teste: unitário, integração (Jest + Supertest) ou caso de uso |
| `--framework <jest\|vitest\|auto>` | ❌ | `auto` | Framework de teste alvo (detecção automática por padrão) |
| `--retries <n>` | ❌ | `0` | Re-tenta a geração reenviando erros de compilação/execução ao LLM |
| `--cache` | ❌ | `false` | Reaproveita respostas do LLM em cache (evita chamadas redundantes) |
| `--dry-run` | ❌ | `false` | Simula o pipeline sem chamadas externas (inclui prévia do prompt) |
| `--suggest` | ❌ | `false` | Sugere testes adicionais com base na cobertura |

### Modo integração (casos de uso ponta a ponta)

Use `--test-type integration` quando quiser priorizar fluxos completos de negócio.

```bash
node dist/index.js generate \
  --card="Como QA, quero validar o fluxo de criação e cancelamento de pedido via API" \
  --file="example/order.service.ts" \
  --test-type integration \
  --suggest
```

No modo integração, o prompt orienta a IA a:
- gerar cenários ponta a ponta;
- incluir falhas de comunicação/API;
- produzir mocks determinísticos de dependências externas (`jest.mock`/`jest.spyOn`);
- estruturar testes para execução com Jest + Supertest.

### Geração em lote — comando `batch`

Gera testes para vários arquivos de uma vez (caminhos ou pastas inteiras):

```bash
fastest batch \
  --card="Testar as funções principais de cada serviço" \
  --files src/services src/utils \
  --test-type unit \
  --framework auto \
  --retries 1 \
  --concurrency 3
```

| Opção | Padrão | Descrição |
|---|---|---|
| `--card <text>` | — | Card compartilhado por todos os arquivos |
| `--files <patterns...>` | — | Arquivos ou pastas-fonte (aceita múltiplos) |
| `--test-type <unit\|integration\|use-case>` | `unit` | Tipo de teste |
| `--output <dir>` | `tests` | Diretório de saída |
| `--model <model>` | `gpt-4o-mini` | Modelo do LLM (`claude-*` → Anthropic) |
| `--framework <jest\|vitest\|auto>` | `auto` | Framework de teste |
| `--retries <n>` | `0` | Re-tentativas por arquivo em caso de falha |
| `--concurrency <n>` | `0` (sequencial) | Nº de arquivos processados em paralelo |
| `--cache` | `false` | Usa cache de respostas do LLM |
| `--dry-run` | `false` | Lista os arquivos correspondentes sem gerar testes |

---

## 16. Comando `doctor`

Use `doctor` para validar rapidamente o projeto antes de executar uma geração real:

```bash
# Valida o diretório atual
fastest doctor

# Valida um diretório específico
fastest doctor --cwd ../outro-projeto

# Valida também os caminhos de contexto com os mesmos guard rails do generate
fastest doctor \
  --cwd ../outro-projeto \
  --context "src" "docs/arquitetura.md" \
  --max-context-files 15 \
  --max-context-chars 3000 \
  --max-context-total-chars 20000 \
  --strict-context
```

### Verificações realizadas

| Check | O que valida |
|---|---|
| `package.json` presente | Diretório é um projeto Node |
| Jest configurado | `jest.config.js` ou script `test` no package.json |
| `tsconfig.json` presente | Projeto TypeScript detectado |
| Node.js >= 18 | Versão mínima exigida |
| Chave de API disponível | `OPENAI_API_KEY`/`ANTHROPIC_API_KEY` no ambiente **ou** em `~/.fastest/config.json` (conforme o provedor do modelo) |

---

## 17. Testar a CLI em outro projeto

1. Neste repositório, compile e faça o link global:

```bash
npm run build
npm link
```

2. No projeto onde quer testar:

```bash
fastest generate \
  --card="Como QA, quero validar regras de negócio críticas" \
  --file="src/seu-arquivo.ts" \
  --output="tests" \
  --dry-run
```

No Windows com política restritiva do PowerShell, use `fastest.cmd` no lugar de `fastest`.

3. Remova `--dry-run` e configure `OPENAI_API_KEY` para execução real.

---

## 18. Guard rails de contexto

Por padrão, os seguintes guard rails protegem o prompt enviado ao LLM:

- Apenas arquivos texto conhecidos (`.ts`, `.js`, `.json`, `.md`, `.yml`, `.env`, etc.) são incluídos
- Arquivos binários são ignorados automaticamente (detecção via byte nulo)
- Diretórios `node_modules`, `.git`, `dist`, `coverage` são sempre ignorados
- Limites de volume por arquivo e no total evitam prompts excessivos

---

## 19. Estrutura do projeto

```
fastest-cli/
  src/
    cli/
      generate.command.ts        # Comando generate (pipeline completo)
      batch.command.ts           # Geração em lote de múltiplos arquivos
      doctor.command.ts          # Diagnóstico do ambiente
      config.command.ts          # config set-key/show/set-model/clear/cache
      init.command.ts            # Wizard de configuração interativo
    providers/
      provider.factory.ts        # Seleciona OpenAI/Anthropic pelo modelo
      provider.interface.ts      # Interface LLMProvider
      openai.provider.ts         # Provedor OpenAI
      anthropic.provider.ts      # Provedor Anthropic
    services/
      llm.service.ts             # Orquestra a chamada ao provedor LLM
      test-generator.service.ts  # Orquestração da geração de testes
      coverage.service.ts        # Execução do Jest e leitura de cobertura
      cache.service.ts           # Cache local de respostas do LLM
    config/
      config.manager.ts          # Lê/grava ~/.fastest/config.json
    utils/
      file.utils.ts              # I/O de arquivos e guard rails de contexto
      test-validation.utils.ts   # Validação dos testes gerados (tsc/Jest)
    index.ts                     # Entry point da CLI
  example/
    math.utils.ts                # Exemplo simples (funções matemáticas)
    order.service.ts             # Exemplo avançado (OrderService)
  scripts/
    setup.js                     # Setup guiado (npm run setup)
  docs/                          # Documentação (Sinfonia, relatório, workflow)
  jest.config.js
  tsconfig.json
  .env.example
```

### Cobertura de testes do próprio projeto

```
All files        | % Stmts | % Branch | % Funcs | % Lines
-----------------|---------|----------|---------|--------
src/services     |   94%   |   72%    |  100%   |  96%
src/utils        |   91%   |   81%    |  100%   |  92%
example          |  100%   |  100%    |  100%   | 100%
```
