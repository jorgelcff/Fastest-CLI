# Fastest CLI

> Pipeline Inteligente de Geração de Testes a partir de Cards

---

## Instalação rápida

```bash
# Instalar globalmente (Node.js >= 18 necessário)
npm install -g github:jorgelcff/Fastest-CLI

# Configurar a chave OpenAI (uma vez)
fastest config set-key

# Usar em qualquer projeto
fastest generate --card="Descreva o que testar" --file="src/meu-arquivo.ts"
```

Suporta **TypeScript** e **JavaScript** automaticamente — a linguagem é detectada pela extensão do arquivo.

→ [Instruções completas de instalação](#13-instalação-e-uso)

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
- Jest + Istanbul (coverage)
- API de LLM (OpenAI)
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

- Node.js >= 18 ([download](https://nodejs.org))
- Uma conta na OpenAI com créditos de API ([criar conta](https://platform.openai.com))

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

Após instalar, o comando `fastest` fica disponível globalmente. Para usar em outro projeto:

```bash
cd ~/meu-outro-projeto

# Defina a chave da OpenAI (escolha uma das formas abaixo)
# Opção A — variável de ambiente global (persiste entre projetos)
export OPENAI_API_KEY=sk-proj-...          # Linux/macOS
$env:OPENAI_API_KEY="sk-proj-..."          # Windows PowerShell

# Opção B — arquivo .env local no projeto (recomendado)
echo "OPENAI_API_KEY=sk-proj-..." >> .env

# Valide o ambiente
fastest doctor

# Gere testes
fastest generate \
  --card="Como QA, quero validar as regras de negócio do serviço de pedidos" \
  --file="src/orders/order.service.ts" \
  --output="tests"
```

> **Windows com PowerShell restritivo:** use `fastest.cmd` no lugar de `fastest`.

#### Onde a chave da API é lida

O Fastest CLI procura `OPENAI_API_KEY` nesta ordem de prioridade:

| Fonte | Como configurar |
|---|---|
| Variável de ambiente do shell | `export OPENAI_API_KEY=sk-...` no perfil do terminal |
| Arquivo `.env` no diretório atual | Crie `.env` com `OPENAI_API_KEY=sk-...` no projeto alvo |
| Opção `--model` não afeta a chave | A chave é sempre lida do ambiente |

#### Verificando a instalação

```bash
fastest --version    # deve exibir 1.0.0
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
| `command not found: fastest` | Build não executado ou `npm link` não feito | Execute `npm run build` |
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
| `--model <model>` | ❌ | `gpt-4o-mini` | Modelo OpenAI a utilizar |
| `--dry-run` | ❌ | `false` | Simula o pipeline sem chamadas externas (inclui prévia do prompt) |
| `--suggest` | ❌ | `false` | Sugere testes adicionais com base na cobertura |

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
| `OPENAI_API_KEY` no ambiente | Chave da API disponível |

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
      generate.command.ts   # Comando generate com spinner e tabela de cobertura
      doctor.command.ts     # Comando doctor com verificações coloridas
    services/
      llm.service.ts        # Integração com OpenAI API
      test-generator.service.ts  # Orquestração da geração de testes
      coverage.service.ts   # Execução do Jest e leitura de cobertura
    utils/
      file.utils.ts         # I/O de arquivos e guard rails de contexto
    index.ts                # Entry point da CLI
  tests/
    math.utils.spec.ts            # Testes do exemplo (gerados pela pipeline)
    file.utils.spec.ts            # Testes unitários de file.utils
    llm.service.spec.ts           # Testes unitários de llm.service
    test-generator.service.spec.ts # Testes unitários de test-generator.service
    coverage.service.spec.ts      # Testes unitários de coverage.service
  example/
    math.utils.ts           # Exemplo simples (funções matemáticas)
    order.service.ts        # Exemplo avançado (lógica de negócio com OrderService)
  docs/
    AI_CONTEXT.md           # Contexto estruturado para assistentes de IA
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
