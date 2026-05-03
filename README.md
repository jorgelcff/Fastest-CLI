# Fastest CLI

Pipeline Inteligente de Geração de Testes a partir de Cards

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

- Node.js
- Jest
- Istanbul (coverage)
- API de LLM (OpenAI ou Claude)

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

- Node.js ≥ 18
- Uma chave de API da OpenAI

### Configuração

```bash
# Clone o repositório
git clone https://github.com/jorgelcff/Fastest-CLI.git
cd Fastest-CLI

# Instale as dependências
npm install

# Configure a chave da API
cp .env.example .env
# Edite .env e adicione OPENAI_API_KEY=<sua_chave>
```

### Scripts npm

| Script | Descrição |
|---|---|
| `npm run build` | Compila o TypeScript para `dist/` |
| `npm start` | Executa a CLI em modo desenvolvimento (ts-node) |
| `npm test` | Roda os testes com cobertura |
| `npm run test:watch` | Roda os testes em modo watch |
| `npm run lint` | Verifica erros de tipos TypeScript |

### Uso do comando `generate`

```bash
# Formato básico
npx ts-node src/index.ts generate --card="<descrição>" --file="<caminho>"

# Após build
node dist/index.js generate --card="<descrição>" --file="<caminho>"

# Exemplo com o arquivo demo incluído
npm run build
node dist/index.js generate \
  --card="Utilitários matemáticos: add, subtract, multiply, divide, isPrime" \
  --file="example/math.utils.ts"

# Dry-run (simula pipeline sem chamar OpenAI, sem gerar arquivo e sem rodar Jest)
node dist/index.js generate \
  --card="Utilitários matemáticos: add, subtract, multiply, divide, isPrime" \
  --file="example/math.utils.ts" \
  --dry-run

# Com sugestão de testes adicionais baseada em cobertura
node dist/index.js generate \
  --card="Utilitários matemáticos" \
  --file="example/math.utils.ts" \
  --suggest

# Especificando modelo e diretório de saída
node dist/index.js generate \
  --card="Utilitários matemáticos" \
  --file="example/math.utils.ts" \
  --output="tests" \
  --model="gpt-4o"
```

### Opções do comando `generate`

| Opção | Obrigatória | Padrão | Descrição |
|---|---|---|---|
| `--card <text>` | ✅ | — | Descrição funcional do card |
| `--file <path>` | ✅ | — | Caminho para o arquivo fonte |
| `--output <dir>` | ❌ | `tests` | Diretório de saída dos testes |
| `--model <model>` | ❌ | `gpt-4o-mini` | Modelo OpenAI a utilizar |
| `--dry-run` | ❌ | `false` | Simula o pipeline sem chamadas externas e sem escrita em disco (inclui prévia do prompt) |
| `--suggest` | ❌ | `false` | Sugere testes adicionais com base na cobertura |

### Cenário de dry-run recomendado

Use este fluxo para validar parâmetros e observar a pipeline antes de executar de fato:

1. Compile o projeto:

```bash
npm run build
```

2. Rode o dry-run com um card real:

```bash
node dist/index.js generate \
  --card="Como QA, quero validar operações matemáticas básicas e edge cases" \
  --file="example/math.utils.ts" \
  --output="tests" \
  --model="gpt-4o-mini" \
  --dry-run
```

3. Verifique no output:

- Arquivo de entrada validado
- Caminho planejado do arquivo de teste de saída
- Modelo selecionado
- Lista de etapas que seriam executadas
- Prévia do prompt enviado ao LLM

### Testar a CLI em outro projeto

Você pode deixar o Fastest CLI disponível globalmente para testar em qualquer repositório local.

1. Neste repositório (Fastest-CLI), compile e faça o link global:

```bash
npm run build
npm link
```

2. No outro projeto onde você quer testar, rode:

```bash
fastest generate \
  --card="Como QA, quero validar regras de negócio críticas" \
  --file="src/seu-arquivo.ts" \
  --output="tests" \
  --dry-run
```

No Windows com política restritiva do PowerShell, use `fastest.cmd` no lugar de `fastest`.

3. Quando estiver pronto para execução real, remova `--dry-run` e configure `OPENAI_API_KEY` no ambiente.

### Comando `doctor`

Use `doctor` para validar rapidamente o projeto alvo antes de executar uma geração real:

```bash
# valida o diretório atual
fastest doctor

# valida um diretório específico
fastest doctor --cwd ../outro-projeto
```

No Windows, caso o PowerShell bloqueie, use `fastest.cmd doctor`.

### Estrutura do projeto

```
/fastest-cli
  /src
    /cli
      generate.command.ts   # Definição do comando CLI
    /services
      llm.service.ts        # Integração com a OpenAI API
      test-generator.service.ts  # Orquestração da geração de testes
      coverage.service.ts   # Execução do Jest e leitura de cobertura
    /utils
      file.utils.ts         # Leitura/escrita de arquivos
    index.ts                # Entry point da CLI
  /tests                    # Testes gerados e testes do próprio projeto
  /example
    math.utils.ts           # Arquivo de exemplo para demonstração
  jest.config.js
  tsconfig.json
  tsconfig.test.json
  .env.example
```
