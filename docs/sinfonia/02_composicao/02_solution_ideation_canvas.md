# Solution Ideation Canvas - Fastest CLI

## Problema

### Descricao

Escrever testes automatizados e uma tarefa repetitiva e demorada que consome entre 30-50% do tempo de desenvolvimento. Como consequencia, desenvolvedores frequentemente ignoram ou postergam a escrita de testes, resultando em:

- Cobertura de testes insuficiente em projetos de producao
- Bugs descobertos tardiamente em ciclos de QA ou em producao
- Divida tecnica acumulada em suites de teste desatualizadas
- Onboarding lento: novos membros nao sabem quais cenarios testar

### Contexto Tecnico

- Projetos TypeScript/JavaScript com Jest sao o cenario mais comum no ecossistema Node.js
- Testes unitarios e de integracao possuem padroes repetitivos (describe/it, mocks, assertions) que sao bons candidatos para geracao automatica
- LLMs modernos (GPT-4o-mini, Claude Haiku) conseguem gerar codigo sintaticamente correto com custo baixo por chamada

### Publico-Alvo

Desenvolvedores backend e fullstack que trabalham com TypeScript/JavaScript e utilizam Jest como framework de testes.

---

## Ideias (Brainstorming)

### Ideia A: CLI de geracao de testes a partir de requisitos

**Descricao:** Uma ferramenta de linha de comando que recebe um arquivo-fonte e um "card" (requisito em linguagem natural) e gera automaticamente testes Jest utilizando um LLM.

**Vantagens:**
- Integracao natural no fluxo de trabalho do desenvolvedor (terminal)
- Execucao sob demanda, sem dependencia de IDE
- Facil de integrar em scripts e pipelines de CI/CD
- Baixa barreira de entrada (um unico comando)
- Suporta multiplos providers de LLM

**Desvantagens:**
- Requer API key configurada
- Qualidade depende do modelo escolhido
- Sem feedback visual interativo durante a geracao

---

### Ideia B: Plugin de IDE com sugestoes inline de testes

**Descricao:** Extensao para VS Code / IntelliJ que analisa o codigo aberto no editor e sugere testes em tempo real, similar ao GitHub Copilot mas especializado em testes.

**Vantagens:**
- Feedback visual imediato no contexto do editor
- Sugestoes contextuais baseadas no cursor
- UX familiar para usuarios de Copilot

**Desvantagens:**
- Alto esforco de desenvolvimento (API de extensao por IDE)
- Manutencao de multiplas plataformas (VS Code, IntelliJ, Vim, etc.)
- Latencia perceptivel em sugestoes inline
- Complexidade de gerenciamento de contexto do projeto inteiro

---

### Ideia C: Bot de CI/CD que gera testes para codigo nao coberto

**Descricao:** Um servico que roda como step de CI/CD, analisa o relatorio de cobertura e automaticamente gera PRs com testes para codigo descoberto.

**Vantagens:**
- Totalmente automatizado, sem intervencao do desenvolvedor
- Garante cobertura minima em todo commit
- Integrado ao fluxo de revisao de codigo existente

**Desvantagens:**
- Alto risco de gerar testes superficiais que passam mas nao validam comportamento
- Complexidade de integracao com diferentes provedores de CI
- PRs automaticos podem gerar ruido no fluxo de revisao
- Custo de LLM por execucao de pipeline pode ser alto

---

### Ideia D: Refinamento interativo de testes via chat

**Descricao:** Interface de chat (terminal ou web) onde o desenvolvedor conversa com o LLM para iterar sobre testes gerados, pedindo ajustes, adicionando cenarios e refinando mocks.

**Vantagens:**
- Permite refinamento granular dos testes
- Contexto conversacional melhora a qualidade iterativamente
- Util para cenarios complexos que exigem julgamento humano

**Desvantagens:**
- Maior tempo de interacao por sessao
- Custo de tokens acumulado em conversas longas
- Complexidade de manter contexto de janela de conversa
- Nao escala para geracao em massa

---

## Matriz de Priorizacao

| Criterio             | Peso | Ideia A (CLI) | Ideia B (IDE Plugin) | Ideia C (CI Bot) | Ideia D (Chat) |
|----------------------|------|---------------|----------------------|------------------|----------------|
| Impacto no usuario   | 5    | 4 (20)        | 5 (25)               | 3 (15)           | 4 (20)         |
| Esforco de desenvolvimento | 4 | 5 (20)     | 2 (8)                | 2 (8)            | 3 (12)         |
| Velocidade de entrega | 4   | 5 (20)        | 2 (8)                | 2 (8)            | 3 (12)         |
| Escalabilidade       | 3    | 4 (12)        | 3 (9)                | 5 (15)           | 2 (6)          |
| Risco tecnico        | 3    | 5 (15)        | 3 (9)                | 2 (6)            | 4 (12)         |
| **Total ponderado**  |      | **87**        | **59**               | **52**           | **62**         |

*Escala: 1 (baixo/ruim) a 5 (alto/bom). Para esforco e risco, 5 = baixo esforco/risco (melhor).*

---

## Solucao Priorizada

### Escolha: Ideia A - CLI de geracao de testes a partir de requisitos

**Justificativa:**

A CLI obteve a maior pontuacao ponderada (87 pontos) por combinar alto impacto com baixo esforco e risco tecnico. Os fatores decisivos foram:

1. **Velocidade de entrega:** TypeScript + commander.js permite prototipacao rapida. Um MVP funcional pode ser entregue em semanas, nao meses.

2. **Baixo risco tecnico:** A arquitetura e simples - ler arquivo, montar prompt, chamar API, salvar resultado. Sem dependencia de APIs de IDE ou infraestrutura de CI.

3. **Flexibilidade de providers:** Suportar OpenAI e Anthropic desde o inicio reduz vendor lock-in e permite que o usuario escolha por custo ou qualidade.

4. **Pipeline de qualidade integrado:** A CLI pode incluir validacao TypeScript, execucao Jest e analise de cobertura no mesmo fluxo, entregando testes que realmente funcionam.

5. **Base para evolucao:** A CLI serve como motor que pode ser reutilizado pelas outras ideias (plugin de IDE chama a CLI, bot de CI chama a CLI, chat usa o mesmo servico de geracao).

### Implementacao Realizada

A solucao foi implementada como o projeto **Fastest CLI** com os seguintes componentes:

- **Comando `generate`:** Recebe `--card` (requisito) e `--file` (arquivo-fonte), gera testes Jest
- **Comando `doctor`:** Gera testes, executa Jest e analisa cobertura em um unico fluxo
- **Multi-provider:** OpenAI (`gpt-4o-mini`) e Anthropic (`claude-haiku`) via deteccao automatica de modelo
- **Contexto inteligente:** Flag `--context` para incluir arquivos auxiliares com guard rails (max 20 arquivos, 4000 chars/arquivo, 30000 chars total)
- **Pos-processamento:** Strip de code fences, correcao de imports, validacao de sintaxe
- **Streaming:** Feedback em tempo real durante geracao via `ora` spinner
