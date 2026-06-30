# Workflow Document — Fastest CLI

**Disciplina:** IF1015 — Engenharia de Software Assistida por IA
**Semestre:** 2026.1
**Projeto:** Fastest CLI — Pipeline Inteligente de Geração de Testes a partir de Cards
**Líder:** Jorge Freitas (jlcf)
**Repositório:** https://github.com/jorgelcff/Fastest-CLI
**Período registrado:** 14 de Abril a 28 de Junho de 2026

> **Nota de transparência.** Este é o *diário de bordo* do desenvolvimento assistido por IA — o segundo entregável indissociável do projeto, complementar à Aplicação. As datas, commits e Pull Requests citados são **reais** (extraídos do histórico do repositório). Os valores de consumo de tokens e custo de IA são **estimativas reconstruídas** da utilização do Claude Code CLI ao longo do projeto e devem ser substituídos pela telemetria exata quando disponível; estão marcados como *(estimado)* nas tabelas da Seção 6.

---

## 1. Sobre este documento

O Workflow Document registra, de forma cronológica, como o desenvolvimento foi conduzido com apoio de IA generativa: decisões tomadas, ferramentas utilizadas, dificuldades encontradas e soluções adotadas em cada sessão de trabalho. Ele cumpre dois papéis:

1. **Evidência de processo** — demonstra *como* a solução foi construída, e não apenas o resultado final.
2. **Base da análise de economicidade** — consolida as três camadas de custo (IA, esforço humano e contrafactual humano) que alimentam a Seção 7 do Relatório Final.

O documento foi mantido como artefato vivo, atualizado ao final de cada fase da Metodologia Sinfonia.

## 2. Convenções de registro

Cada sessão segue o formato:

- **Objetivo** — o que se pretendia naquela sessão.
- **Ferramentas de IA** — quais assistentes/modelos foram usados.
- **Atividades e evidências** — o que foi feito, com referência a commits/PRs reais.
- **Decisões** — escolhas técnicas ou de produto.
- **Dificuldades e soluções** — o que deu errado e como foi resolvido.
- **Economicidade da sessão** — horas humanas com IA (aprox.) e uso de IA (aprox.).

## 3. Ferramentas de IA utilizadas

| Ferramenta | Papel no projeto | Onde |
|------------|------------------|------|
| **Claude Code CLI** (Claude Sonnet) | Par de programação principal: geração e refatoração de código, testes, documentação e este diário | Todo o desenvolvimento |
| **GitHub Copilot (coding agent)** | Apoio pontual em modos de teste de integração e refino de fluxos | PR #3 (27/05) |
| **OpenAI API** (gpt-4o-mini) | *Dogfooding*: execução do próprio `fastest generate` durante o desenvolvimento | Testes do produto |
| **Anthropic API** (claude-haiku) | *Dogfooding*: provedor alternativo do produto | Testes do produto |

**Diretriz de uso (Código de Conduta da disciplina):** todo código gerado por IA foi revisado por humano antes de ser commitado; commits assistidos incluem a tag `Co-Authored-By`; a IA foi usada como copiloto, nunca como caixa-preta.

---

## 4. Registro cronológico das sessões

### Movimento 1 — Exposição (Alinhar Estratégia)

#### Sessão 1 — 14/04/2026 · Enquadramento do problema e do domínio
- **Objetivo:** definir o problema de engenharia de software e o domínio de atuação.
- **Ferramentas de IA:** Claude Code CLI para pesquisa de contexto (SWEBOK, cap. de Testes) e estruturação do *Domain Identification Canvas* e do *Strategy Action Canvas*.
- **Atividades e evidências:** redação inicial do `docs/AI_CONTEXT.md`; definição de missão, visão e OKRs.
- **Decisões:** focar na subdisciplina de **Testes de Software**; recorte do problema na escrita manual de testes (lenta, inconsistente, baixa cobertura).
- **Dificuldades e soluções:** risco de escopo amplo demais → delimitado ao ecossistema Node.js/TypeScript + Jest.
- **Economicidade da sessão:** ~4h humanas · uso leve de IA (pesquisa/redação).

#### Sessão 2 — 15/04/2026 · Personas, métricas e bootstrap do repositório
- **Objetivo:** modelar personas e métricas de sucesso; iniciar o repositório.
- **Ferramentas de IA:** Claude Code CLI para o *Persona Model Canvas* e geração do esqueleto da CLI.
- **Atividades e evidências:** `initial commit`; `feat: implement Fastest CLI — test generation pipeline from cards` (15/04).
- **Decisões:** duas personas-âncora (Carlos, dev backend; Marina, tech lead); metas de cobertura (80%+) e nº de testes (200+).
- **Dificuldades e soluções:** equilibrar ambição das métricas com viabilidade do MVP → matriz Impacto × Esforço priorizou a CLI.
- **Economicidade da sessão:** ~6h humanas · uso moderado de IA (scaffolding).

### Movimento 2 — Composição (Desenhar a Solução)

#### Sessão 3 — 28/04/2026 · Arquitetura (C4) e decisões arquiteturais
- **Objetivo:** desenhar a arquitetura e registrar decisões.
- **Ferramentas de IA:** Claude Code CLI para rascunho do *C4 Model* (Contexto/Contêiner/Componente) e avaliação de alternativas.
- **Decisões:** `commander.js` para a CLI; **Factory Pattern** para multi-provider; **zero-shot com contexto rico** em vez de RAG/fine-tuning (o código do usuário já fornece o contexto).
- **Dificuldades e soluções:** tentação de adotar RAG → descartado por complexidade desnecessária ao escopo.
- **Economicidade da sessão:** ~6h humanas · uso moderado de IA (design/discussão).

#### Sessão 4 — 01/05/2026 · Catálogo de prompts e Canvas de Experimento · **release 0.0.1**
- **Objetivo:** projetar os prompts centrais e o desenho experimental; primeira versão funcional.
- **Ferramentas de IA:** Claude Code CLI para iteração dos templates de prompt e definição das hipóteses/critérios GO–NO-GO.
- **Atividades e evidências:** pipeline básico de geração com OpenAI (**v0.0.1**).
- **Decisões:** `temperature=0.2`, `max_tokens=4096`; guard rails de contexto (20 arquivos, 4k chars/arquivo, 30k total).
- **Dificuldades e soluções:** qualidade do output muito sensível ao prompt → adotada experimentação sistemática e versionamento dos prompts.
- **Economicidade da sessão:** ~8h humanas · uso intenso de IA (iteração de prompts).

### Movimento 3 — Ensaio (Construir e Testar)

#### Sessão 5 — 02/05/2026 · Comando `doctor`, `--dry-run` e tratamento de imports
- **Objetivo:** diagnóstico de ambiente e inspeção segura do prompt.
- **Ferramentas de IA:** Claude Code CLI (geração de código e testes).
- **Atividades e evidências:** `feat(cli): add doctor command; improve test generation import handling; dry-run prompt preview` (02/05).
- **Decisões:** `--dry-run` como salvaguarda de segurança (inspeção antes do envio/escrita).
- **Dificuldades e soluções:** imports relativos incorretos no código gerado → pós-processamento que ajusta o caminho do arquivo-fonte.
- **Economicidade da sessão:** ~4h humanas · uso intenso de IA.

#### Sessão 6 — 03/05/2026 · Multi-provider, streaming, config, cobertura delta e testes
- **Objetivo:** consolidar o pipeline completo e elevar a cobertura.
- **Ferramentas de IA:** Claude Code CLI (implementação + geração de testes dos providers).
- **Atividades e evidências (commits do dia):** `feat: visual output, unit tests, order.service example`; `feat(setup): guided first-time setup`; `feat(config): add config command`; `feat: support global CLI install`; `feat: before/after coverage delta`; `feat: JS/TS auto-detection, tsc validation`; `feat: streaming LLM output + multi-provider (OpenAI & Anthropic)`; `test: add provider tests — factory, OpenAI, Anthropic (142 total)`; `bump version + DEMO.md`.
- **Decisões:** validar com `tsc --noEmit` **antes** do Jest; detecção automática de provedor pelo prefixo do modelo (`claude-*`).
- **Dificuldades e soluções:** modelos envolviam a resposta em blocos markdown → função `stripCodeFences()`; SDKs diferentes entre providers → abstração via interface `LLMProvider`.
- **Economicidade da sessão:** ~16h humanas · uso muito intenso de IA (maior dia de implementação).

#### Sessão 7 — 27/05/2026 · Testes de integração e dicas de cobertura
- **Objetivo:** adicionar modo de geração de testes de integração.
- **Ferramentas de IA:** GitHub Copilot (coding agent) + revisão via Claude Code CLI.
- **Atividades e evidências:** `feat: add integration test generation mode and coverage flow hints`; **PR #3** (merge em 27/05).
- **Decisões:** prompt especializado para integração (Jest + Supertest, cenários de sucesso e falha, mocks determinísticos).
- **Dificuldades e soluções:** outputs de integração com dependências de estado global → reforço das regras do prompt para mocks determinísticos.
- **Economicidade da sessão:** ~8h humanas · uso moderado de IA (revisão de PR de agente).

#### Sessão 8 — 20/06/2026 · Guard rails, validações e consolidação · **release 0.0.2**
- **Objetivo:** robustez de contexto e paridade entre provedores.
- **Ferramentas de IA:** Claude Code CLI.
- **Atividades e evidências:** consolidação multi-provider, `config`, `doctor`, guard rails e integração (**v0.0.2**).
- **Decisões:** flag `--strict-context` (erro vs. truncamento com marcador `/* ... truncated ... */`).
- **Dificuldades e soluções:** arquivos grandes estourando o limite de tokens → truncamento controlado e limites configuráveis.
- **Economicidade da sessão:** ~10h humanas · uso intenso de IA.

#### Sessão 9 — 24–25/06/2026 · Retry, batch, init, Vitest e cache · **release 0.1.0**
- **Objetivo:** as funcionalidades de maior impacto da v0.1.0.
- **Ferramentas de IA:** Claude Code CLI.
- **Atividades e evidências:** `feat: add LLM retry logic, batch mode, and input validation`; `feat: add Vitest support, LLM caching, init wizard, changelog`; **PR #5/#6** (25/06).
- **Decisões:** **retry com feedback de erro** (reenvia o erro de compilação/execução ao LLM, até 3 tentativas); cache local por hash SHA-256; renumeração de versão **2.x → 0.1.0** para refletir a maturidade real do projeto.
- **Dificuldades e soluções:** testes "quase passavam" mas exigiam pequenos ajustes → o retry elevou a taxa de aprovação de ~80% para 92%+.
- **Economicidade da sessão:** ~8h humanas · uso muito intenso de IA.

### Movimento 4 — Ressonância (Medir e Aprender)

#### Sessão 10 — 25/06/2026 · Métricas, feedback, escalabilidade e documentação Sinfonia
- **Objetivo:** medir impacto e documentar a metodologia.
- **Ferramentas de IA:** Claude Code CLI (redação dos artefatos e tabelas de métricas).
- **Atividades e evidências:** `docs: add comprehensive sinfonia documentation` — **15 artefatos** (**PR #4**, 25/06).
- **Decisões:** validação das hipóteses (H1–H4 validadas); decisão estratégica **PERSEVERAR**; NPS estimado +10.
- **Dificuldades e soluções:** separar "o que funciona" de "o que parece funcionar" → análise crítica apoiada em benchmarks medidos.
- **Economicidade da sessão:** ~6h humanas · uso intenso de IA (documentação).

#### Sessão 11 — 28/06/2026 · Consolidação do Relatório Final e economicidade
- **Objetivo:** fechar o Relatório Final e este Workflow Document.
- **Ferramentas de IA:** Claude Code CLI (consolidação, revisão e formatação).
- **Atividades e evidências:** revisão geral e ajustes finais (**PR #7**, 28/06).
- **Decisões:** estrutura final do relatório alinhada ao template oficial; consolidação das três camadas de economicidade (Seção 6 deste documento).
- **Dificuldades e soluções:** consistência terminológica entre 15 artefatos → revisão cruzada com apoio da IA + leitura humana.
- **Economicidade da sessão:** ~6h humanas · uso moderado de IA.

---

## 5. Quadro-resumo das sessões

| # | Data | Movimento | Foco | Evidência |
|---|------|-----------|------|-----------|
| 1 | 14/04 | Exposição | Problema e domínio | AI_CONTEXT.md |
| 2 | 15/04 | Exposição | Personas + bootstrap | initial commit |
| 3 | 28/04 | Composição | C4 + decisões | — |
| 4 | 01/05 | Composição | Prompts + experimento | v0.0.1 |
| 5 | 02/05 | Ensaio | doctor / dry-run | commit doctor |
| 6 | 03/05 | Ensaio | multi-provider + testes | 142 testes |
| 7 | 27/05 | Ensaio | testes de integração | PR #3 |
| 8 | 20/06 | Ensaio | guard rails | v0.0.2 |
| 9 | 24–25/06 | Ensaio | retry / batch / vitest | PR #5/#6, v0.1.0 |
| 10 | 25/06 | Ressonância | métricas + docs Sinfonia | PR #4 (15 artefatos) |
| 11 | 28/06 | Ressonância | relatório final | PR #7 |

---

## 6. Consolidado de economicidade

> Os valores de IA são *(estimados)* a partir do uso do Claude Code CLI (modelo Claude Sonnet). Substituir pela telemetria real quando disponível. Cotação utilizada: **USD 1,00 = R$ 5,40** (28/06/2026).

### 6.1 Camada 1 — Custo real de IA (por fase)

| Fase | Tokens entrada *(est.)* | Tokens saída *(est.)* | Custo IA (USD) *(est.)* | Custo IA (R$) *(est.)* |
|------|------------------------|-----------------------|-------------------------|------------------------|
| Exposição | 2,4 M | 0,16 M | $7,00 | R$ 37,80 |
| Composição | 3,0 M | 0,20 M | $9,50 | R$ 51,30 |
| Ensaio | 12,4 M | 1,00 M | $35,00 | R$ 189,00 |
| Ressonância | 4,0 M | 0,29 M | $10,50 | R$ 56,70 |
| **Total** | **21,8 M** | **1,65 M** | **$62,00** | **R$ 334,80** |

Custo adicional de API do **produto** (dogfooding de `fastest generate` com gpt-4o-mini e claude-haiku): **< $1,00** no total (≈ R$ 4,30), dado o uso de modelos econômicos (~$0,001–0,005 por chamada).

### 6.2 Camada 2 — Esforço humano real com IA (por fase)

| Fase | Horas humanas com IA | Observações |
|------|----------------------|-------------|
| Exposição | 10 h | Pesquisa de domínio, personas, métricas, bootstrap |
| Composição | 14 h | C4, decisões arquiteturais, catálogo de prompts, experimento |
| Ensaio | 46 h | Implementação do pipeline, providers, 204 testes, CI/CD |
| Ressonância | 12 h | Métricas, feedback, escalabilidade, documentação, relatório |
| **Total** | **82 h** | Inclui tempo de supervisão e revisão dos outputs de IA |

### 6.3 Camada 3 — Custo contrafactual humano (sem IA)

Perfis de referência (estimativa com base em médias de mercado — *Glassdoor* 2026, jornada de 160 h/mês):

| Perfil | Faixa salarial (R$/mês) | Valor/hora (R$) |
|--------|-------------------------|-----------------|
| Júnior | 4.500 – 6.000 | ~35 |
| Pleno | 9.000 – 12.000 | ~70 |
| Sênior | 15.000 – 20.000 | ~110 |
| Arquiteto | 20.000 – 26.000 | ~140 |

| Fase | Horas totais estimadas (sem IA) | Perfil predominante | Custo humano estimado (R$) |
|------|---------------------------------|---------------------|----------------------------|
| Exposição | 28 h | Sênior | R$ 2.240 |
| Composição | 44 h | Sênior/Arquiteto | R$ 3.960 |
| Ensaio | 160 h | Pleno | R$ 11.200 |
| Ressonância | 30 h | Pleno/Sênior | R$ 2.250 |
| **Total** | **262 h** | — | **R$ 19.650** |

### 6.4 Análise comparativa

| Métrica | Valor *(est.)* |
|---------|----------------|
| Custo total **com IA** (R$) | **R$ 6.075** — custo de IA (R$ 334,80) + 82 h de supervisão/revisão humana (≈ R$ 70/h) |
| Custo total **sem IA** (R$) | **R$ 19.650** (contrafactual) |
| Razão de economicidade | **≈ 3,2×** |
| Saving estimado (R$) | **≈ R$ 13.575** |
| Saving estimado (%) | **≈ 69%** |

### 6.5 Limitações da medição

1. **Contrafactual é estimativa subjetiva**, sujeita a viés de retrospecto — há tendência de superestimar o tempo "sem IA".
2. **O custo com IA não inclui a curva de aprendizado** das ferramentas (configurar prompts, desenvolver fluência na copilotagem).
3. **Custo menor não implica qualidade equivalente** — toda saída de IA exigiu revisão humana; houve retrabalho (imports incorretos, mocks excessivos, testes superficiais).
4. **Tokens e custo são reconstruções aproximadas**; a telemetria exata do Claude Code deve substituí-los para um número auditável.
5. **Difícil separar supervisão de copilotagem** — revisar/redirecionar e idear junto são esforços qualitativamente distintos, ambos contabilizados nas 82 h.

---

## 7. Síntese de aprendizados

- **IA generativa brilha em código estruturado** — testes Jest (`describe`/`it`/`expect`) seguem padrões previsíveis e foram gerados com boa qualidade.
- **Retry com feedback de erro foi o maior ganho técnico** (~80% → 92%+ de aprovação).
- **Validação em pipeline é indispensável** — `tsc` + Jest + cobertura transformam o output da IA em algo confiável.
- **Guard rails são necessários** para controlar tokens, custo e qualidade.
- **A Sinfonia deu cadência ao trabalho** — cada movimento delimitou objetivos e evitou perda de foco.
- **IA é copiloto, não substituto** — o melhor resultado vem da soma entre a velocidade da IA e o julgamento do desenvolvedor.

---

*Workflow Document — Fastest CLI. Atualizado em 28 de Junho de 2026. Anexo obrigatório do Relatório Final (Apêndice A).*
