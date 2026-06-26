# Documento Consolidado — Fastest CLI + Metodologia Sinfonia

**Projeto:** Fastest CLI — Pipeline Inteligente de Geração de Testes com IA  
**Versão:** 2.1.0  
**Domínio SWEBOK:** Teste de Software (Capítulo 4)  
**Data:** 25 de Junho de 2026

---

## 1. EXPOSIÇÃO — Identificação do Problema e Contexto

### 1.1 Domain Identification Canvas

**Domínio:** Geração Automatizada de Testes com IA Generativa para Teste de Software

O Fastest CLI opera na interseção entre engenharia de software (especificamente teste automatizado) e IA generativa (LLMs). A ferramenta aceita arquivos TypeScript/JavaScript e requisitos em linguagem natural (cards), envia esse contexto a modelos de linguagem (OpenAI GPT-4o-mini ou Anthropic Claude Haiku), e gera testes unitários e de integração compatíveis com Jest e Vitest.

**Problemas Atuais:**
- Escrita manual de testes é lenta e tediosa (devs priorizam features, criando dívida técnica)
- Qualidade inconsistente (cada desenvolvedor escreve com padrões/profundidade diferentes)
- Dificuldade em manter alta cobertura (degradação ao longo do tempo)
- Custo de contexto para LLMs (arquivos grandes excedem limites de tokens)
- Validação de código gerado por IA (testes podem conter erros TypeScript ou falhas de execução)

**Benefícios Esperados:**
- Reduzir tempo de escrita de testes de horas para minutos
- Aumentar cobertura de código (alvo 80%+; projeto opera com 93%+)
- Padronizar testes com estrutura consistente
- Integração CI/CD como etapa automatizada
- Diagnóstico rápido via `fastest doctor`

### 1.2 Persona Model Canvas

**Persona 1: Carlos (Dev Backend, 28 anos)** — Trabalha com APIs Node.js/TypeScript. Hábil em arquitetura mas adia testes consistentemente. Quer atingir 70% de cobertura sem horas de testes manuais. Confortável com CLI.

**Persona 2: Marina (Tech Lead, 34 anos)** — Responsável por qualidade de código em equipe de 6. Vê padrões inconsistentes entre devs. Busca padronizar qualidade e integrar geração de testes no pipeline CI/CD.

### 1.3 Data Source Mapping

| Fonte | Tipo | Formato | Privacidade |
|-------|------|---------|-------------|
| Código-fonte | Estruturado | .ts/.js UTF-8 | Enviado a APIs externas |
| Cards de requisito | Não-estruturado | .md/.txt | Enviado a APIs externas |
| Config Jest/Vitest | Estruturado | .ts/.js/.json | Local apenas |
| Relatórios de cobertura | Estruturado | JSON Istanbul | Local apenas |
| Respostas LLM | Semi-estruturado | Texto/código | Gerado externamente |
| Arquivos de contexto | Estruturado | .ts/.js/.d.ts | Enviado a APIs externas |

**Fluxo de dados:**
```
[Código] + [Cards] + [Contexto] → [Guard Rails] → [Prompt Builder] → [LLM API] → [Código Gerado] → [Validação TS] → [Execução Jest] → [Delta de Cobertura]
```

### 1.4 Strategy Action Canvas

**Objetivo Estratégico:** Acelerar criação de testes automatizados e melhorar cobertura de código em projetos TypeScript/JavaScript através de testes gerados por IA.

**OKRs:**
- Reduzir tempo médio de criação de suíte de 2h para 5min
- Projetos usando Fastest atingem 80%+ de cobertura
- 90%+ dos testes compilam sem erros na primeira geração
- Suporte estável multi-provedor (OpenAI + Anthropic)

---

## 2. COMPOSIÇÃO — Design da Solução

### 2.1 Prompt Design Record

**Estratégia:** Zero-shot com contexto rico (não RAG, não fine-tuning)

**3 tipos de prompt:**
1. **Geração unitária:** Código + card → testes Jest com casos principais e edge cases
2. **Geração de integração:** Código + card → testes com Supertest, mocks para dependências externas
3. **Sugestão de cobertura:** Código + card + relatório de cobertura → lista de cenários não cobertos

**Parâmetros fixos:** temperature=0.2, max_tokens=4096 (Anthropic), prompt em pt-BR

**Pós-processamento:** stripCodeFences(), correção de imports relativos, contagem de test cases via regex

**Guard rails de contexto:** max 20 arquivos, 4000 chars/arquivo, 30000 chars total, binários ignorados

### 2.2 Solution Ideation Canvas

**4 ideias avaliadas:**

| Ideia | Pontuação | Status |
|-------|-----------|--------|
| A: CLI para geração de testes | **87** | ✅ Escolhida |
| B: Plugin IDE com sugestões inline | 59 | Descartada |
| C: Bot CI/CD gerando PRs com testes | 52 | Descartada |
| D: Refinamento interativo via chat | 62 | Descartada |

**Justificativa da escolha:** Velocidade de entrega, baixo risco técnico, integração natural no workflow do desenvolvedor, serve como motor reutilizável para futuras extensões.

### 2.3 Experiment Design Canvas

**Hipótese central:** LLMs podem produzir testes sintaticamente corretos e semanticamente relevantes quando dado contexto adequado (código + requisito), com custo por chamada inferior a $0.01.

**Sub-hipóteses e critérios GO:**
- H1: Compilação TypeScript ≥80% → ✅ Validado
- H2: Execução Jest sem modificação ≥60% → ✅ Validado
- H3: Cobertura mínima 70% no arquivo-alvo → ✅ Validado
- H4: Tempo total <40% do tempo manual → ✅ Validado

---

## 3. ENSAIO — Arquitetura e Testes

### 3.1 Modelo C4

**Nível 1 — Contexto:** Desenvolvedor → Fastest CLI → OpenAI/Anthropic APIs + Jest Runner + File System

**Nível 2 — Containers:**
- Application CLI (TypeScript, Node.js, commander.js)
- LLM Providers (OpenAI SDK, Anthropic SDK)
- Jest/Vitest Runner (execução e cobertura)
- File System (leitura/escrita, config local)

**Nível 3 — Componentes:**
- Generate/Batch/Doctor/Config/Init Commands
- LLM Service, Test Generator Service, Coverage Service, Cache Service
- Provider Factory + OpenAI/Anthropic Providers
- File Utils, Test Validation Utils

### 3.2 Intelligence Strategy Record

| Critério | Decisão |
|----------|---------|
| Estratégia | Prompt Engineering (Zero-shot com contexto rico) |
| Alternativas descartadas | RAG (complexidade desnecessária), Fine-tuning (custo alto, dados insuficientes) |
| Modelos | gpt-4o-mini (default), claude-haiku (alternativa) |
| Justificativa | Código do usuário fornece contexto necessário; modelos base têm forte capacidade de geração de código |

### 3.3 Risk & Defensibility Checklist

| Dimensão | Riscos Críticos | Status |
|----------|----------------|--------|
| Fairness | 0 | Aceitável |
| Privacidade | 2 (código enviado a APIs, chaves locais) | Requer atenção |
| Segurança | 2 (prompt injection, código malicioso) | Requer atenção |
| Transparência | 0 | Aceitável |

**Mitigações implementadas:** dry-run mode, revisão humana, doctor command, API keys via env vars, guard rails de contexto

### 3.4 Testing & Validation Canvas

| Métrica | Valor |
|---------|-------|
| Total de testes | 201 |
| Framework | Jest + ts-jest |
| Cobertura geral | 93%+ |
| CI | GitHub Actions (Node 18/20/22) |

**Módulos com 100% de cobertura:** providers (openai, anthropic, factory), config manager

**Tipos de teste:** Unitários com mocks completos, testes de comandos CLI, testes de provedores

### 3.5 Launch Checklist

- ✅ `npm run build` sem erros
- ✅ 201 testes passando
- ✅ Cobertura ≥80% (93%+)
- ✅ `fastest doctor` funcional
- ✅ Geração com OpenAI funcional
- ✅ Geração com Anthropic funcional
- ✅ Modo dry-run funcional
- ✅ Modo batch funcional
- ✅ Retry automático funcional
- ✅ CHANGELOG.md atualizado

---

## 4. RESSONÂNCIA — Escala e Feedback

### 4.1 Scale & Impact Metrics

**Métricas de impacto:**
- Tempo economizado: de 45-90 min (manual) para 2-5 min (Fastest)
- Delta de cobertura médio: +15-25 pontos percentuais
- Custo por geração: ~$0.001-0.005 (modelos econômicos)

**Benchmarks:**
| Métrica | Valor-alvo |
|---------|-----------|
| Geração end-to-end | <30 segundos |
| Taxa de sucesso primeira geração | >80% |
| Delta de cobertura por arquivo | >10% |
| Compilação TypeScript | >90% |

### 4.2 Scalability Planning

**Estado atual:** Geração single-file, 1 chamada LLM por execução, processamento sequencial

**Estratégias implementadas (v2.1.0):**
- Cache local com hash SHA-256 (20-30% economia)
- Modo batch para múltiplos arquivos
- Retry automático com feedback de erros ao LLM
- Suporte Vitest além de Jest

**Roadmap futuro:** Modelos locais (Ollama), GitHub Action, plugin VS Code, chamadas LLM paralelas

### 4.3 Feedback & Insights Panel

**Insight principal:** Retry automático (re-enviar erros de compilação ao LLM) aumenta taxa de sucesso de 80% para 92%+

**Top features requisitadas → implementadas:**
1. ✅ Retry automático com feedback
2. ✅ Modo batch (múltiplos arquivos)
3. ✅ Suporte Vitest
4. ✅ Cache de respostas LLM
5. ✅ Wizard de inicialização (`fastest init`)

**Ações futuras priorizadas:**
1. Suporte Ollama para uso offline/privado
2. GitHub Action para CI/CD
3. Estimativa de custo pré-geração
4. Plugin VS Code

---

## 5. Resumo Executivo

O Fastest CLI demonstra que IA generativa pode ser aplicada de forma prática e eficaz na geração automatizada de testes de software. Seguindo a metodologia Sinfonia em 4 movimentos, o projeto:

1. **Identificou** o problema real de negligência em testes e mapeou personas e fontes de dados
2. **Projetou** uma solução baseada em prompt engineering zero-shot com guard rails de contexto
3. **Implementou** um pipeline completo com validação TypeScript, execução de testes e análise de cobertura
4. **Validou** com 201 testes e 93%+ de cobertura no próprio codebase

**Números-chave:**
- 201 testes automatizados
- 93%+ de cobertura de statements
- 2 provedores LLM (OpenAI + Anthropic)
- 2 frameworks de teste (Jest + Vitest)
- 5 comandos CLI (generate, batch, doctor, config, init)
- 15 artefatos Sinfonia documentados
- Pipeline completo: geração → validação → execução → cobertura → retry
