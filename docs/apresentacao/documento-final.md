# Documento Final - Fastest CLI

## Metodologia Sinfonia

---

**Projeto:** Fastest CLI - Pipeline Inteligente de Geracao de Testes a partir de Cards
**Versao:** 2.1.0
**Data:** 25 de Junho de 2026
**Equipe:** Equipe Fastest CLI
**Repositorio:** Fastest-CLI

---

## Sumario

- [1. Exposicao: Problema e Estrategia](#1-exposicao-problema-e-estrategia)
  - [1.1 Canvas de Identificacao do Dominio](#11-canvas-de-identificacao-do-dominio)
  - [1.2 Canvas de Personas](#12-canvas-de-personas)
  - [1.3 Mapeamento de Fontes de Dados](#13-mapeamento-de-fontes-de-dados)
  - [1.4 Canvas de Estrategia e Acao](#14-canvas-de-estrategia-e-acao)
- [2. Composicao: Design da Solucao](#2-composicao-design-da-solucao)
  - [2.1 Registro de Design de Prompts](#21-registro-de-design-de-prompts)
  - [2.2 Canvas de Ideacao de Solucoes](#22-canvas-de-ideacao-de-solucoes)
  - [2.3 Canvas de Design de Experimento](#23-canvas-de-design-de-experimento)
- [3. Ensaio: Construcao e Qualidade](#3-ensaio-construcao-e-qualidade)
  - [3.1 Modelo C4](#31-modelo-c4)
  - [3.2 Registro de Estrategia de Inteligencia](#32-registro-de-estrategia-de-inteligencia)
  - [3.3 Checklist de Risco e Defensibilidade](#33-checklist-de-risco-e-defensibilidade)
  - [3.4 Canvas de Testes e Validacao](#34-canvas-de-testes-e-validacao)
  - [3.5 Checklist de Lancamento](#35-checklist-de-lancamento)
- [4. Ressonancia: Medir e Aprender](#4-ressonancia-medir-e-aprender)
  - [4.1 Metricas de Escala e Impacto](#41-metricas-de-escala-e-impacto)
  - [4.2 Planejamento de Escalabilidade](#42-planejamento-de-escalabilidade)
  - [4.3 Painel de Feedback e Insights](#43-painel-de-feedback-e-insights)

---

## 1. Exposicao: Problema e Estrategia

### 1.1 Canvas de Identificacao do Dominio

#### Nome do Dominio

Geracao Automatizada de Testes de Software com Inteligencia Artificial Generativa

#### Descricao

O dominio abrange a interseccao entre engenharia de software (especificamente testes automatizados) e IA generativa (LLMs). O projeto **Fastest CLI** atua como uma ferramenta de linha de comando que recebe arquivos-fonte TypeScript/JavaScript e requisitos em linguagem natural (cards), envia esse contexto para modelos de linguagem (OpenAI GPT-4o-mini ou Anthropic Claude Haiku 4.5), e gera testes unitarios e de integracao compativeis com Jest. O pipeline completo inclui leitura de codigo-fonte, construcao de contexto com guard rails, chamada a LLM, validacao TypeScript, execucao dos testes gerados e analise de cobertura antes/depois.

#### Justificativa

A escrita de testes e uma das atividades mais negligenciadas no ciclo de desenvolvimento. Estudos indicam que desenvolvedores gastam entre 15-30% do tempo de desenvolvimento em testes, e muitos projetos operam com cobertura abaixo de 50%. O Fastest CLI ataca esse problema diretamente: o projeto ja alcancou **81.68% de cobertura** com **154 testes** em sua propria base de codigo, demonstrando a viabilidade da abordagem. A automacao via LLM reduz drasticamente o tempo necessario para criar testes significativos, permitindo que equipes mantenham alta cobertura sem sacrificar velocidade de entrega.

#### Problemas/Desafios Atuais

| # | Problema | Impacto |
|---|----------|---------|
| 1 | **Escrita manual de testes e lenta e tediosa** | Desenvolvedores priorizam features sobre testes, gerando divida tecnica |
| 2 | **Inconsistencia na qualidade dos testes** | Cada desenvolvedor escreve testes com padroes e profundidade diferentes |
| 3 | **Dificuldade em manter cobertura alta** | Projetos degradam cobertura ao longo do tempo por falta de disciplina |
| 4 | **Custo de contexto para LLMs** | Arquivos grandes ou muitos arquivos excedem limites de tokens, exigindo estrategias de recorte (guard rails de maxFiles, maxCharsPerFile, maxTotalChars) |
| 5 | **Validacao de codigo gerado por IA** | Testes gerados podem conter erros de TypeScript ou falhar na execucao, exigindo pipeline de validacao |
| 6 | **Dependencia de APIs externas** | Latencia e custo das chamadas a OpenAI/Anthropic impactam a experiencia do usuario |

#### Oportunidades de IA Generativa

| # | Oportunidade | Descricao |
|---|-------------|-----------|
| 1 | **Geracao de testes a partir de cards** | Transformar requisitos em linguagem natural diretamente em suites de teste Jest |
| 2 | **Analise contextual de codigo-fonte** | LLMs compreendem a logica de negocios do codigo e geram testes que cobrem edge cases |
| 3 | **Multi-provider com fallback** | Abstraccao de providers (OpenAI/Anthropic) permite trocar modelos conforme custo/qualidade |
| 4 | **Feedback loop automatizado** | Pipeline completo: gerar -> validar TypeScript -> rodar Jest -> reportar cobertura delta |
| 5 | **Contexto inteligente** | Selecao automatica de arquivos relevantes com limites configuraveis para otimizar uso de tokens |

#### Beneficios Esperados

| # | Beneficio | Metrica |
|---|----------|---------|
| 1 | **Reducao de tempo na escrita de testes** | De horas para minutos por modulo |
| 2 | **Aumento de cobertura de codigo** | Meta de 80%+ (projeto ja opera em 81.68%) |
| 3 | **Padronizacao de testes** | Testes gerados seguem o mesmo padrao estrutural |
| 4 | **Integracao com CI/CD** | Comando `fastest generate` pode ser integrado em pipelines automatizados |
| 5 | **Reducao de custo de manutencao** | Menos bugs em producao devido a maior cobertura |
| 6 | **Diagnostico rapido** | Comando `fastest doctor` valida ambiente e configuracoes antes da geracao |

#### Riscos e Consideracoes

| # | Risco | Mitigacao |
|---|-------|----------|
| 1 | **Testes gerados podem ser superficiais** | Pipeline de validacao (TypeScript check + execucao Jest) rejeita testes invalidos |
| 2 | **Custo de API pode escalar** | Uso de modelos economicos por padrao (gpt-4o-mini, claude-haiku-4-5) e guard rails de contexto |
| 3 | **Dependencia de servicos externos** | Suporte a multiplos providers com configuracao flexivel |
| 4 | **Falsa sensacao de seguranca** | Cobertura alta nao significa testes de qualidade; revisao humana continua necessaria |
| 5 | **Exposicao de codigo-fonte** | Codigo e enviado para APIs externas; necessario avaliar politicas de privacidade do projeto |
| 6 | **Evolucao dos modelos** | Modelos mudam comportamento entre versoes; necessario manter configuracao de modelo fixa e testada |

---

### 1.2 Canvas de Personas

#### Persona 1: Carlos, o Desenvolvedor Backend

**Nome:** Carlos Silva, 28 anos — Desenvolvedor Backend Pleno

**Descricao:** Carlos trabalha em uma startup de fintech ha 2 anos, desenvolvendo APIs REST em Node.js com TypeScript. Ele e competente em arquitetura de servicos e banco de dados, mas consistentemente deixa testes para depois. Seu time usa Jest como framework de testes e tem uma meta de cobertura de 70% no CI, que frequentemente falha. Carlos sabe que deveria escrever mais testes, mas acha o processo repetitivo e prefere gastar tempo em logica de negocios. Ele esta confortavel com a linha de comando e usa npm/yarn diariamente.

**Objetivos/Ganhos:**

| # | Objetivo |
|---|----------|
| 1 | Atingir a meta de 70% de cobertura sem gastar horas escrevendo testes manualmente |
| 2 | Gerar testes para modulos legados que nao tem nenhuma cobertura |
| 3 | Ter testes que realmente testam a logica do codigo, nao apenas testes triviais |
| 4 | Integrar a geracao de testes no seu fluxo de trabalho sem fricao (um comando no terminal) |
| 5 | Poder especificar requisitos em linguagem natural ao inves de pensar em casos de teste |

**Dores:**

| # | Dor | Intensidade |
|---|-----|-------------|
| 1 | Escrever mocks e fixtures para cada teste e extremamente tedioso | Alta |
| 2 | O CI falha por cobertura insuficiente e ele precisa parar a feature para escrever testes | Alta |
| 3 | Nao sabe quais edge cases cobrir — frequentemente descobre bugs que testes teriam pego | Media |
| 4 | Configurar Jest com TypeScript, paths e transformers e confuso | Media |
| 5 | Code reviews atrasam porque reviewers pedem mais testes | Alta |

**Cenarios de Uso:**

| # | Cenario | Comando |
|---|---------|---------|
| 1 | Carlos acabou de implementar um novo endpoint de pagamentos. Roda `fastest generate` apontando para o arquivo do service e um card descrevendo os requisitos de negocio. Em 2 minutos tem uma suite de testes com happy path e edge cases. | `fastest generate --source src/payments/payment.service.ts --card cards/payment-flow.md` |
| 2 | Antes de abrir um PR, Carlos roda `fastest doctor` para verificar se o ambiente esta configurado corretamente (chave de API, Jest, TypeScript). | `fastest doctor` |
| 3 | Carlos quer ver o impacto dos testes gerados na cobertura. O Fastest mostra a tabela delta: statements passou de 45% para 72%. | Saida automatica apos geracao |
| 4 | Carlos configura o modelo padrao para `gpt-4o-mini` para economizar na API. | `fastest config set-model gpt-4o-mini` |

#### Persona 2: Marina, a Tech Lead

**Nome:** Marina Costa, 34 anos — Tech Lead

**Descricao:** Marina lidera um time de 6 desenvolvedores em uma empresa de e-commerce. Ela e responsavel pela qualidade do codigo, definicao de padroes e integracao continua. Marina configura pipelines de CI/CD no GitHub Actions e monitora metricas de cobertura semanalmente. Ela percebe que cada desenvolvedor escreve testes de forma diferente — alguns escrevem testes excelentes, outros escrevem testes que apenas aumentam o numero de cobertura sem testar nada real. Marina busca uma ferramenta que padronize a qualidade dos testes e que possa ser integrada no pipeline do time.

**Objetivos/Ganhos:**

| # | Objetivo |
|---|----------|
| 1 | Garantir cobertura minima de 80% em todos os modulos do projeto |
| 2 | Padronizar a estrutura e qualidade dos testes gerados pelo time |
| 3 | Reduzir o tempo de code review gasto pedindo mais testes |
| 4 | Integrar geracao de testes no pipeline de CI/CD como step automatizado |
| 5 | Ter visibilidade clara do impacto de cobertura (tabelas before/after/delta) |
| 6 | Controlar custos de API com guard rails de contexto configuraveis |

**Dores:**

| # | Dor | Intensidade |
|---|-----|-------------|
| 1 | Inconsistencia na qualidade dos testes entre membros do time | Alta |
| 2 | Tempo excessivo em code reviews pedindo cobertura de edge cases | Alta |
| 3 | Metricas de cobertura flutuam — sobem em um sprint e caem no seguinte | Media |
| 4 | Dificuldade em justificar o tempo gasto em testes para stakeholders | Media |
| 5 | Onboarding de novos devs: cada um traz seu estilo de testes | Media |
| 6 | Modulos legados com 0% de cobertura que ninguem quer tocar | Alta |

**Cenarios de Uso:**

| # | Cenario | Comando/Acao |
|---|---------|-------------|
| 1 | Marina adiciona um step no GitHub Actions que roda `fastest generate` para modulos modificados no PR, gerando testes automaticamente e reportando cobertura delta como comentario no PR. | Step no workflow CI |
| 2 | Marina configura o Fastest no projeto com limites de contexto (max 10 arquivos, 50k chars total) para controlar custos de API do time. | `fastest config` + `.fastest.json` |
| 3 | Marina usa o relatorio de cobertura delta para avaliar se um PR atinge os padroes do time antes de aprovar. | Analise da tabela before/after/delta |
| 4 | Marina troca o provider de OpenAI para Anthropic para testar se o Claude Haiku gera testes de melhor qualidade para o estilo do projeto. | `fastest config set-model claude-haiku-4-5-20251001` |
| 5 | Um novo dev entra no time. Marina pede que ele use `fastest generate` para os primeiros PRs, garantindo que os testes sigam o padrao do projeto desde o inicio. | Documentacao de onboarding |

---

### 1.3 Mapeamento de Fontes de Dados

#### Visao Geral

Este documento mapeia todas as fontes de dados consumidas e produzidas pelo Fastest CLI durante o pipeline de geracao de testes.

#### 1. Arquivos de Codigo-Fonte

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

#### 2. Cards de Requisitos (Linguagem Natural)

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

#### 3. Configuracao Jest

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

#### 4. Relatorios de Cobertura (Istanbul/JSON)

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

#### 5. Respostas da LLM (API)

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

#### 6. Arquivos de Contexto Adicional

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

#### Diagrama de Fluxo de Dados

```
[Codigo-Fonte] + [Cards] + [Contexto]
        |
        v
  +---------------------+
  |  Guard Rails         |  (maxFiles, maxCharsPerFile, maxTotalChars)
  |  (file.utils.ts)     |
  +----------+----------+
             v
  +---------------------+
  |  Prompt Builder      |  (llm.service.ts)
  +----------+----------+
             v
  +---------------------+
  |  LLM Provider        |  (openai.provider.ts / anthropic.provider.ts)
  |  API Call            |
  +----------+----------+
             v
  +---------------------+
  |  Codigo Gerado       |  (.test.ts)
  |  + Validacao TS      |
  +----------+----------+
             v
  +---------------------+
  |  Jest Execution      |  -> [Cobertura JSON]
  +----------+----------+
             v
  +---------------------+
  |  Coverage Delta      |  (coverage.service.ts)
  |  Before/After        |
  +---------------------+
```

---

### 1.4 Canvas de Estrategia e Acao

#### Objetivo Estrategico Geral

Acelerar a criacao de testes automatizados e melhorar a cobertura de codigo em projetos TypeScript/JavaScript atraves de testes gerados por IA, reduzindo o tempo de escrita de testes de horas para minutos enquanto mantem cobertura acima de 80%.

#### Objetivos Secundarios

| # | Objetivo | Alinhamento |
|---|----------|-------------|
| 1 | **Democratizar a escrita de testes** — permitir que desenvolvedores de qualquer nivel gerem testes de qualidade usando linguagem natural | Adocao e acessibilidade |
| 2 | **Padronizar a qualidade dos testes** — garantir que testes gerados sigam estrutura consistente independente de quem os gera | Qualidade de software |
| 3 | **Minimizar custo de API por teste gerado** — usar modelos economicos (gpt-4o-mini, claude-haiku-4-5) e guard rails de contexto | Sustentabilidade financeira |
| 4 | **Integrar-se ao ecossistema existente** — funcionar com Jest, TypeScript, npm/yarn sem configuracao adicional | Experiencia do desenvolvedor |
| 5 | **Fornecer feedback imediato** — mostrar impacto de cobertura (delta) em tempo real apos geracao | Visibilidade e confianca |

#### Resultados-Chave (OKRs)

| Objetivo | Resultado-Chave | Prazo |
|----------|----------------|-------|
| Acelerar escrita de testes | Reduzir tempo medio de criacao de suite de testes de 2h para 5min | Q3 2026 |
| Melhorar cobertura | Projetos usando Fastest atingem 80%+ de cobertura (baseline: projeto proprio em 81.68%) | Q3 2026 |
| Adocao | 500+ instalacoes ativas do pacote `fastest-cli` no npm | Q4 2026 |
| Qualidade | 90%+ dos testes gerados passam na validacao TypeScript na primeira geracao | Q3 2026 |
| Multi-provider | Suporte estavel a OpenAI e Anthropic com parity de funcionalidades | Concluido (v2.0.0) |

#### KPIs

| # | KPI | Metrica Atual | Meta | Metodo de Medicao |
|---|-----|--------------|------|-------------------|
| 1 | Cobertura da propria base de codigo | 81.68% | 85%+ | `jest --coverage` |
| 2 | Numero de testes | 154 | 200+ | Contagem de `it()` blocks |
| 3 | Taxa de sucesso de testes gerados (TypeScript valido) | ~85% | 95%+ | Ratio compilacao OK / total gerado |
| 4 | Taxa de sucesso de testes gerados (Jest pass) | ~75% | 90%+ | Ratio testes passando / total gerado |
| 5 | Tempo medio de geracao end-to-end | ~30s | <20s | Medicao de tempo no pipeline |
| 6 | Custo medio por geracao (API) | ~$0.02 (gpt-4o-mini) | <$0.05 | Monitoramento de uso de tokens |
| 7 | Delta de cobertura medio | +15-25pp | +20pp media | Diferenca before/after em coverage.service.ts |
| 8 | Downloads semanais no npm | baseline | crescimento 10% MoM | npm stats |

#### Requisitos/Restricoes

**Requisitos Funcionais:**

| # | Requisito |
|---|----------|
| 1 | Gerar testes Jest validos a partir de arquivos TypeScript/JavaScript e cards de requisitos |
| 2 | Suportar OpenAI (gpt-4o-mini padrao) e Anthropic (claude-haiku-4-5-20251001 padrao) como providers |
| 3 | Validar codigo TypeScript gerado antes de executar testes |
| 4 | Executar testes gerados com Jest e coletar cobertura |
| 5 | Exibir tabela comparativa de cobertura (before/after/delta) |
| 6 | Comando `doctor` para diagnostico de ambiente |
| 7 | Comando `config` para configuracao persistente de modelo e parametros |

**Requisitos Nao-Funcionais:**

| # | Requisito |
|---|----------|
| 1 | Tempo de resposta end-to-end < 60s para arquivos de tamanho medio |
| 2 | Guard rails de contexto configuraveis (maxFiles, maxCharsPerFile, maxTotalChars) |
| 3 | CLI responsivo com feedback visual (ora spinners, chalk colors) |
| 4 | Publicavel como pacote npm com `npx fastest-cli` |
| 5 | Compativel com Node.js 18+ |

**Restricoes:**

| # | Restricao |
|---|----------|
| 1 | Dependencia de APIs externas (OpenAI/Anthropic) — requer chave de API valida |
| 2 | Custos de API sao responsabilidade do usuario |
| 3 | Codigo-fonte do usuario e transmitido para servidores externos |
| 4 | Framework de testes limitado a Jest (por enquanto) |
| 5 | Linguagens suportadas limitadas a TypeScript/JavaScript |

#### Priorizacao

| Prioridade | Item | Justificativa | Status |
|-----------|------|---------------|--------|
| P0 | Pipeline basico: gerar -> validar -> executar -> cobertura | Core value proposition | Concluido v2.0.0 |
| P0 | Suporte multi-provider (OpenAI + Anthropic) | Flexibilidade e resiliencia | Concluido v2.0.0 |
| P0 | Guard rails de contexto | Controle de custo e limite de tokens | Concluido v2.0.0 |
| P1 | Comando `doctor` | Reducao de erros de configuracao | Concluido v2.0.0 |
| P1 | Tabelas de cobertura delta | Visibilidade de impacto | Concluido v2.0.0 |
| P1 | Configuracao persistente (`fastest config`) | Experiencia do usuario | Concluido v2.0.0 |
| P2 | Integracao com GitHub Actions | Automacao em CI/CD | Planejado |
| P2 | Suporte a Vitest alem de Jest | Ampliar base de usuarios | Planejado |
| P2 | Modo batch (multiplos arquivos) | Produtividade em escala | Planejado |
| P3 | Dashboard web de cobertura | Visibilidade para tech leads | Backlog |
| P3 | Cache de prompts para reduzir custos | Otimizacao de custo | Backlog |

#### Acoes/Recursos

| # | Acao | Responsavel | Recurso Necessario | Prazo | Entregavel |
|---|------|-------------|-------------------|-------|-----------|
| 1 | Manter e evoluir o pipeline de geracao de testes | Equipe core | Desenvolvimento TypeScript | Continuo | Releases no npm |
| 2 | Expandir suite de testes propria para 85%+ cobertura | Equipe core | Fastest CLI (dogfooding) | Q3 2026 | 200+ testes |
| 3 | Implementar integracao com GitHub Actions | Equipe core | GitHub Actions workflow | Q3 2026 | Action publicada no marketplace |
| 4 | Adicionar suporte a Vitest | Equipe core | Pesquisa de API Vitest | Q4 2026 | Novo runner module |
| 5 | Criar documentacao e exemplos | Equipe core | Tempo de escrita | Q3 2026 | README, exemplos, guia de inicio |
| 6 | Otimizar prompts para melhor qualidade de testes | Equipe core | Experimentacao com modelos | Continuo | Melhoria nas metricas de taxa de sucesso |
| 7 | Monitorar custos de API e otimizar uso de tokens | Equipe core | Logs de uso | Continuo | Reducao de custo medio por geracao |
| 8 | Coletar feedback de usuarios e iterar | Equipe core | Issues no GitHub | Continuo | Roadmap atualizado |

---

## 2. Composicao: Design da Solucao

### 2.1 Registro de Design de Prompts

#### Metadata

| Campo         | Valor                                                        |
|---------------|--------------------------------------------------------------|
| **Objetivo**  | Gerar testes Jest (unitarios e integracao) e analisar lacunas de cobertura a partir de codigo-fonte e requisitos em linguagem natural |
| **Modelos**   | OpenAI `gpt-4o-mini` (padrao), Anthropic `claude-haiku`      |
| **Versao**    | 1.0                                                          |
| **Responsavel** | Equipe Fastest CLI                                         |
| **Data**      | 2026-06-25                                                   |

#### Prompt de Geracao de Testes Unitarios

**Inputs:**

| Input       | Descricao                                      | Exemplo                                      |
|-------------|-------------------------------------------------|----------------------------------------------|
| `card`      | Requisito funcional em linguagem natural        | "Deve validar email antes de salvar usuario" |
| `code`      | Codigo-fonte do arquivo alvo + contexto auxiliar | Conteudo do arquivo `.ts` ou `.js`           |
| `language`  | Linguagem detectada (`typescript` ou `javascript`) | `typescript`                              |

**Template (TypeScript):**

```
Voce e um especialista em testes.
Gere testes unitarios em Jest para o seguinte codigo:

CARD:
{card}

CODIGO:
{code}

Inclua:
- casos principais
- edge cases
- mocks se necessario

Retorne apenas codigo TypeScript valido, sem explicacoes, sem blocos markdown.
```

**Template (JavaScript):** Identico ao acima, porem a instrucao final muda para:

```
Retorne apenas codigo JavaScript valido (CommonJS, use require()), sem explicacoes, sem blocos markdown.
```

**Contexto auxiliar:** O campo `code` pode incluir codigo de arquivos adicionais fornecidos via `--context`. Guard rails aplicados:
- Maximo 20 arquivos de contexto (`maxFiles`)
- Maximo 4.000 caracteres por arquivo (`maxCharsPerFile`)
- Maximo 30.000 caracteres totais (`maxTotalChars`)
- Arquivos binarios e extensoes nao-suportadas sao ignorados
- Arquivos truncados recebem marcador `/* ... truncated ... */`

**Exemplo de saida esperada:**

```typescript
import { validateEmail } from '../src/user.service';

describe('validateEmail', () => {
  it('deve retornar true para email valido', () => {
    expect(validateEmail('user@example.com')).toBe(true);
  });

  it('deve retornar false para email sem @', () => {
    expect(validateEmail('userexample.com')).toBe(false);
  });

  it('deve retornar false para string vazia', () => {
    expect(validateEmail('')).toBe(false);
  });
});
```

**Pos-processamento aplicado pela CLI:**
1. `stripCodeFences()` - remove blocos markdown residuais da resposta
2. Correcao de import - ajusta o primeiro `from '...'` para apontar ao caminho relativo correto do arquivo-fonte
3. Contagem de test cases via regex `it(` / `test(`

#### Prompt de Geracao de Testes de Integracao

**Template:**

```
Voce e um especialista em testes de integracao de APIs e fluxos de negocio.
Gere testes de integracao em Jest + Supertest para o codigo abaixo.

CARD (fluxo funcional):
{card}

CODIGO:
{code}

Regras obrigatorias:
- Cubra o fluxo ponta a ponta do caso de uso descrito no card
- Inclua cenarios de sucesso e de falha de comunicacao/API
- Use mocks deterministicos para dependencias externas (ex.: banco, fila, API externa) com jest.mock/jest.spyOn
- Evite dependencias de estado global e infraestrutura real
- Organize os testes por cenarios de negocio (nao apenas por funcao isolada)
- Se necessario, faca bootstrap da aplicacao para requisicoes HTTP via Supertest

Retorne apenas codigo TypeScript valido, sem explicacoes, sem blocos markdown.
```

#### Prompt de Sugestao de Cobertura

**Inputs:**

| Input            | Descricao                                          |
|------------------|-----------------------------------------------------|
| `card`           | Requisito funcional original                        |
| `code`           | Codigo-fonte do arquivo                             |
| `coverageSummary`| Relatorio de cobertura Jest (statements, branches, functions, lines) |
| `testType`       | `unit` ou `integration`                             |

**Template (unitario):**

```
Voce e um especialista em qualidade de software.

Com base no seguinte relatorio de cobertura de testes, sugira novos casos de teste para melhorar a cobertura.

CARD:
{card}

CODIGO:
{code}

RELATORIO DE COBERTURA:
{coverageSummary}

Liste apenas os cenarios de teste que ainda nao estao cobertos. Seja conciso e objetivo.
```

**Template (integracao):** Adiciona ao final:

```
Destaque tambem fluxos criticos do caso de uso ainda nao cobertos ponta a ponta.
```

#### Testes e Qualidade

**Criterios de Aceitacao do Prompt:**

| Criterio                                    | Status |
|---------------------------------------------|--------|
| Resposta contem apenas codigo valido         | Sim    |
| Imports gerados sao sintaticamente corretos  | Sim (pos-processado) |
| Testes seguem padrao describe/it do Jest     | Sim    |
| Edge cases sao incluidos                     | Sim    |
| Nenhuma explicacao textual na resposta       | Sim    |

**Parametros do Modelo:**

| Parametro     | Valor   | Justificativa                                      |
|---------------|---------|-----------------------------------------------------|
| `temperature` | 0.2     | Baixa variabilidade para gerar codigo deterministico |
| `max_tokens`  | 4096    | Suficiente para arquivos de teste completos (Anthropic) |
| `stream`      | Opcional| Suportado para feedback em tempo real via `onToken`  |

**Metricas de Qualidade:**

- **Taxa de compilacao:** % de testes gerados que compilam sem erros TypeScript
- **Taxa de execucao:** % de testes que passam no Jest sem modificacao manual
- **Cobertura resultante:** % de cobertura de statements/branches apos execucao
- **Contagem de test cases:** Numero de blocos `it()`/`test()` gerados por arquivo

**Notas Adicionais:**

- O prompt e escrito em portugues (pt-BR), alinhado com o contexto de uso primario do projeto.
- A selecao do provider (OpenAI vs Anthropic) e automatica baseada no prefixo do modelo: modelos com prefixo `claude-` usam Anthropic, demais usam OpenAI.
- O `max_tokens` e configurado apenas no provider Anthropic (4096). O provider OpenAI nao define limite explicito, delegando ao padrao da API.
- O contexto auxiliar (`--context`) permite que o LLM entenda dependencias, types e interfaces usadas pelo codigo-alvo, melhorando a qualidade dos mocks e imports gerados.

---

### 2.2 Canvas de Ideacao de Solucoes

#### Problema

**Descricao:** Escrever testes automatizados e uma tarefa repetitiva e demorada que consome entre 30-50% do tempo de desenvolvimento. Como consequencia, desenvolvedores frequentemente ignoram ou postergam a escrita de testes, resultando em:

- Cobertura de testes insuficiente em projetos de producao
- Bugs descobertos tardiamente em ciclos de QA ou em producao
- Divida tecnica acumulada em suites de teste desatualizadas
- Onboarding lento: novos membros nao sabem quais cenarios testar

**Contexto Tecnico:**

- Projetos TypeScript/JavaScript com Jest sao o cenario mais comum no ecossistema Node.js
- Testes unitarios e de integracao possuem padroes repetitivos (describe/it, mocks, assertions) que sao bons candidatos para geracao automatica
- LLMs modernos (GPT-4o-mini, Claude Haiku) conseguem gerar codigo sintaticamente correto com custo baixo por chamada

**Publico-Alvo:** Desenvolvedores backend e fullstack que trabalham com TypeScript/JavaScript e utilizam Jest como framework de testes.

#### Ideias (Brainstorming)

**Ideia A: CLI de geracao de testes a partir de requisitos**

Uma ferramenta de linha de comando que recebe um arquivo-fonte e um "card" (requisito em linguagem natural) e gera automaticamente testes Jest utilizando um LLM.

- Vantagens: Integracao natural no fluxo de trabalho, execucao sob demanda, facil de integrar em CI/CD, baixa barreira de entrada, suporta multiplos providers
- Desvantagens: Requer API key, qualidade depende do modelo, sem feedback visual interativo

**Ideia B: Plugin de IDE com sugestoes inline de testes**

Extensao para VS Code / IntelliJ que analisa o codigo aberto no editor e sugere testes em tempo real.

- Vantagens: Feedback visual imediato, sugestoes contextuais, UX familiar
- Desvantagens: Alto esforco de desenvolvimento, manutencao multi-plataforma, latencia, complexidade de contexto

**Ideia C: Bot de CI/CD que gera testes para codigo nao coberto**

Servico que roda como step de CI/CD, analisa cobertura e gera PRs com testes automaticamente.

- Vantagens: Totalmente automatizado, garante cobertura minima
- Desvantagens: Risco de testes superficiais, complexidade de integracao, custo por pipeline

**Ideia D: Refinamento interativo de testes via chat**

Interface de chat onde o desenvolvedor itera sobre testes gerados com o LLM.

- Vantagens: Refinamento granular, contexto conversacional, util para cenarios complexos
- Desvantagens: Maior tempo, custo acumulado, nao escala

#### Matriz de Priorizacao

| Criterio             | Peso | Ideia A (CLI) | Ideia B (IDE Plugin) | Ideia C (CI Bot) | Ideia D (Chat) |
|----------------------|------|---------------|----------------------|------------------|----------------|
| Impacto no usuario   | 5    | 4 (20)        | 5 (25)               | 3 (15)           | 4 (20)         |
| Esforco de desenvolvimento | 4 | 5 (20)     | 2 (8)                | 2 (8)            | 3 (12)         |
| Velocidade de entrega | 4   | 5 (20)        | 2 (8)                | 2 (8)            | 3 (12)         |
| Escalabilidade       | 3    | 4 (12)        | 3 (9)                | 5 (15)           | 2 (6)          |
| Risco tecnico        | 3    | 5 (15)        | 3 (9)                | 2 (6)            | 4 (12)         |
| **Total ponderado**  |      | **87**        | **59**               | **52**           | **62**         |

#### Solucao Priorizada: Ideia A - CLI de geracao de testes

A CLI obteve a maior pontuacao ponderada (87 pontos) por combinar alto impacto com baixo esforco e risco tecnico. Fatores decisivos:

1. **Velocidade de entrega:** TypeScript + commander.js permite prototipacao rapida
2. **Baixo risco tecnico:** Arquitetura simples - ler arquivo, montar prompt, chamar API, salvar resultado
3. **Flexibilidade de providers:** Suportar OpenAI e Anthropic desde o inicio
4. **Pipeline de qualidade integrado:** Validacao TypeScript, execucao Jest e analise de cobertura no mesmo fluxo
5. **Base para evolucao:** CLI serve como motor reutilizavel pelas outras ideias

**Implementacao Realizada:**

- **Comando `generate`:** Recebe `--card` (requisito) e `--file` (arquivo-fonte), gera testes Jest
- **Comando `doctor`:** Gera testes, executa Jest e analisa cobertura em um unico fluxo
- **Multi-provider:** OpenAI (`gpt-4o-mini`) e Anthropic (`claude-haiku`) via deteccao automatica
- **Contexto inteligente:** Flag `--context` com guard rails (max 20 arquivos, 4000 chars/arquivo, 30000 chars total)
- **Pos-processamento:** Strip de code fences, correcao de imports, validacao de sintaxe
- **Streaming:** Feedback em tempo real durante geracao via `ora` spinner

---

### 2.3 Canvas de Design de Experimento

#### Ideia

Ferramenta CLI que gera testes Jest funcionais a partir de requisitos escritos em linguagem natural ("cards") e codigo-fonte TypeScript/JavaScript, utilizando LLMs como motor de geracao.

**Premissa central:** Modelos de linguagem (GPT-4o-mini, Claude Haiku) conseguem produzir testes unitarios e de integracao sintaticamente corretos e semanticamente relevantes quando recebem contexto adequado (codigo-fonte + requisito funcional), com custo por chamada inferior a $0.01.

#### Hipotese Principal

> **Acreditamos que** fornecer uma CLI alimentada por IA que gera testes Jest a partir de cards de requisitos **reduzira o tempo de escrita de testes em 60%** enquanto mantem qualidade de cobertura equivalente a testes escritos manualmente.

**Sub-hipoteses:**

1. **H1 - Compilacao:** Pelo menos 80% dos testes gerados compilam sem erros de TypeScript na primeira tentativa
2. **H2 - Execucao:** Pelo menos 60% dos testes gerados passam no Jest sem modificacao
3. **H3 - Cobertura:** Os testes gerados atingem no minimo 70% de cobertura de statements do arquivo-alvo
4. **H4 - Tempo:** O ciclo completo leva menos de 40% do tempo da escrita manual
5. **H5 - Adocao:** Desenvolvedores voltam a usar em pelo menos 3 dos proximos 5 arquivos

#### Desenho do Experimento (MVP)

**Escopo do MVP:**

| Componente          | Incluido no MVP | Versao futura |
|---------------------|-----------------|---------------|
| Comando `generate`  | Sim             | -             |
| Testes unitarios    | Sim             | -             |
| Testes de integracao | Nao            | v2            |
| Provider OpenAI     | Sim             | -             |
| Provider Anthropic  | Nao             | v2            |
| Streaming de resposta | Nao           | v2            |
| Contexto auxiliar (`--context`) | Nao  | v2            |
| Correcao de imports | Sim             | -             |
| Strip de code fences | Sim            | -             |
| Comando `doctor`    | Nao             | v3            |
| Configuracao de API key via CLI | Sim  | -             |

**Fluxo do MVP:**

```
1. Usuario configura API key: fastest config set-key --provider openai
2. Usuario executa: fastest generate --card "Deve validar email" --file src/user.service.ts
3. CLI le o arquivo-fonte
4. CLI monta prompt com card + codigo (buildTestPrompt)
5. CLI chama OpenAI gpt-4o-mini (temperature=0.2)
6. CLI recebe resposta, aplica stripCodeFences()
7. CLI corrige import relativo do arquivo-fonte
8. CLI salva arquivo em tests/user.service.spec.ts
9. CLI exibe: "Gerados X testes em tests/user.service.spec.ts"
```

#### Metricas-Chave

**Metricas Primarias:**

| Metrica                       | Como medir                                                    | Fonte               |
|-------------------------------|---------------------------------------------------------------|----------------------|
| Taxa de compilacao            | % de arquivos gerados que compilam com `tsc --noEmit`         | Execucao automatica  |
| Taxa de execucao sem editar   | % de suites que passam `jest --bail` sem modificacao manual    | Execucao automatica  |
| Cobertura de statements       | % statements cobertos (`jest --coverage`)                     | Relatorio Jest       |
| Tempo de geracao (e2e)        | Segundos desde execucao do comando ate arquivo salvo           | Timestamp da CLI     |
| Numero de test cases gerados  | Contagem de blocos `it()`/`test()` no arquivo gerado          | Regex na CLI         |

**Metricas Secundarias:**

| Metrica                       | Como medir                                                    |
|-------------------------------|---------------------------------------------------------------|
| Custo por arquivo             | Tokens consumidos x preco do modelo por execucao              |
| Taxa de reuso                 | % de desenvolvedores que usam a CLI mais de 3x em 2 semanas   |
| Edicoes pos-geracao           | Numero de linhas alteradas manualmente apos geracao            |
| Satisfacao (NPS)              | Pesquisa rapida (1-10) apos 2 semanas de uso                  |

#### Criterios de Sucesso

**Para validar a hipotese (GO):**

| Criterio                                          | Threshold  |
|---------------------------------------------------|------------|
| Taxa de compilacao TypeScript                     | >= 80%     |
| Taxa de execucao Jest sem edicao                  | >= 60%     |
| Cobertura media de statements                     | >= 70%     |
| Reducao de tempo vs escrita manual                | >= 50%     |
| NPS de satisfacao                                 | >= 7       |

**Para pivotar (NO-GO):**

| Criterio                                          | Threshold  |
|---------------------------------------------------|------------|
| Taxa de compilacao TypeScript                     | < 50%      |
| Taxa de execucao Jest sem edicao                  | < 30%      |
| Desenvolvedores que abandonam apos primeiro uso   | > 60%      |

**Para iterar (AJUSTAR):**

- Compilacao 50-80%: Investir em pos-processamento mais robusto
- Execucao 30-60%: Enriquecer prompt com mais contexto via flag `--context`
- Cobertura < 70%: Implementar comando `doctor` com sugestoes de testes adicionais
- Tempo nao reduz 50%: Adicionar streaming e cache

#### Riscos e Mitigacoes

| Risco                                           | Probabilidade | Impacto | Mitigacao                                              |
|-------------------------------------------------|---------------|---------|--------------------------------------------------------|
| LLM gera testes que compilam mas nao testam nada | Media        | Alto    | Validar que testes contem assertions reais              |
| Custo de API excede orcamento dos usuarios       | Baixa         | Medio   | Usar gpt-4o-mini (custo ~$0.005/chamada)               |
| Mudancas na API do OpenAI quebram a CLI          | Baixa         | Alto    | Abstrair provider atras de interface `LLMProvider`      |
| Card mal escrito gera testes irrelevantes        | Alta          | Medio   | Documentar boas praticas para escrita de cards          |
| Contexto insuficiente gera imports errados       | Alta          | Medio   | Pos-processamento de imports + flag `--context`         |

#### Proximos Passos (pos-validacao)

1. **v2:** Adicionar provider Anthropic, testes de integracao com Supertest, streaming, contexto auxiliar
2. **v3:** Comando `doctor` com validacao TypeScript + execucao Jest + analise de cobertura em fluxo unico
3. **v4:** Modo watch para regeneracao automatica ao salvar arquivos
4. **Longo prazo:** Avaliar Ideias B (plugin IDE) e C (bot CI/CD) usando a CLI como motor de geracao

---

## 3. Ensaio: Construcao e Qualidade

### 3.1 Modelo C4

#### Nivel 1 - Contexto

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

**Atores e Sistemas:**

| Elemento | Tipo | Descricao |
|----------|------|-----------|
| Desenvolvedor | Pessoa | Usuario que interage via terminal para gerar testes |
| Fastest CLI | Sistema | Aplicacao CLI que orquestra a geracao de testes |
| OpenAI API | Sistema Externo | Provedor LLM (modelo padrao: gpt-4o-mini) |
| Anthropic API | Sistema Externo | Provedor LLM (modelo padrao: claude-haiku) |
| Arquivos de Codigo Fonte | Sistema Externo | Codigo TypeScript/JavaScript do projeto alvo |
| Jest Runner | Sistema Externo | Executor de testes e gerador de relatorios de cobertura |

**Fluxos Principais:**

1. **Desenvolvedor -> Fastest CLI**: Executa comandos via terminal (`fastest generate`, `fastest doctor`, `fastest config`)
2. **Fastest CLI -> OpenAI/Anthropic API**: Envia codigo fonte + requisitos em linguagem natural, recebe codigo de teste gerado
3. **Fastest CLI -> Jest Runner**: Executa testes gerados para validacao
4. **Jest Runner -> Relatorios de Cobertura**: Produz metricas de cobertura (Istanbul/NYC)
5. **Desenvolvedor -> Arquivos de Codigo Fonte**: Fornece os arquivos fonte que serao analisados pela CLI

#### Nivel 2 - Container

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

#### Nivel 3 - Componente

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

---

### 3.2 Registro de Estrategia de Inteligencia

#### Abordagem Escolhida

| Criterio | Decisao |
|----------|---------|
| **Estrategia** | Prompt Engineering (Zero-shot com contexto rico) |
| **Alternativas descartadas** | RAG (complexidade desnecessaria para escopo), Fine-tuning (custo elevado, dados insuficientes) |
| **Justificativa** | O codigo fonte do usuario ja fornece todo o contexto necessario. Nao ha base de conhecimento proprietaria que justifique RAG. Os modelos base ja possuem forte capacidade de geracao de codigo. |

#### Modelos Utilizados

| Provedor | Modelo Padrao | Uso |
|----------|---------------|-----|
| OpenAI | `gpt-4o-mini` | Geracao de testes (padrao) |
| Anthropic | `claude-haiku` | Geracao de testes (alternativa) |

**Criterios de Selecao:**

- **Custo**: Modelos menores e mais baratos para uso frequente em desenvolvimento
- **Velocidade**: Latencia baixa para feedback rapido no terminal
- **Qualidade**: Capacidade suficiente para gerar testes TypeScript/JavaScript validos
- **Configurabilidade**: Usuario pode alterar modelo via `fastest config set model <nome>`

#### Estrategia de Prompting

**Tipo: Zero-shot com Contexto Rico**

O prompt e construido dinamicamente com tres fontes de informacao:

1. **Codigo Fonte**: Conteudo completo do arquivo alvo (funcoes, classes, tipos)
2. **Cartao de Requisitos**: Descricao em linguagem natural do que testar (fornecida pelo usuario)
3. **Arquivos de Contexto Adicional**: Arquivos relacionados que ajudam o LLM a entender dependencias e tipos

**Por que nao RAG?**
- O contexto e fornecido diretamente pelo usuario
- Nao existe base de conhecimento de testes anterior para consultar
- O escopo de cada geracao e limitado a um arquivo/funcionalidade
- A janela de contexto dos modelos atuais comporta o codigo + requisitos

**Por que nao Fine-tuning?**
- Volume insuficiente de dados de treinamento especificos
- Modelos base ja geram testes de alta qualidade
- Custo de manutencao de modelo fine-tuned nao se justifica
- Flexibilidade de trocar modelos seria perdida

#### Avaliacao e Validacao

**Pipeline de Validacao:**

```
Prompt -> LLM -> Codigo Gerado -> Compilacao TS -> Execucao Jest -> Relatorio Cobertura
                                       |                |                |
                                   Falha?            Falha?         Delta < 0?
                                   Reportar          Reportar       Alertar
```

#### Custos Estimados

| Modelo | Custo por Geracao (estimativa) | Tokens Medios |
|--------|-------------------------------|---------------|
| gpt-4o-mini | ~$0.001 - $0.005 | ~2000-5000 tokens |
| claude-haiku | ~$0.001 - $0.003 | ~2000-5000 tokens |

#### Decisoes Futuras

| Decisao | Status | Gatilho |
|---------|--------|---------|
| Adicionar RAG com exemplos de testes do projeto | Pendente | Se usuarios reportarem qualidade insuficiente |
| Suportar modelos locais (Ollama) | Pendente | Demanda por uso offline/privacidade |
| Implementar retry com refinamento de prompt | Pendente | Se taxa de compilacao < 80% |
| Few-shot prompting com exemplos | Pendente | Se zero-shot nao atingir qualidade desejada |

---

### 3.3 Checklist de Risco e Defensibilidade

#### 1. Equidade (Fairness)

| Risco | Severidade | Probabilidade | Mitigacao |
|-------|------------|---------------|-----------|
| LLM gera apenas testes de caminho feliz (happy path), ignorando cenarios de erro | Media | Alta | Instrucoes explicitas no prompt para cobrir cenarios de erro, edge cases e excecoes |
| Vies em direcao a padroes de teste de linguagens/frameworks mais populares | Baixa | Media | Prompt especifico para Jest + TypeScript, com restricoes claras de formato |
| Geracao de testes superficiais que inflam cobertura sem validar logica | Media | Media | Metrica de delta de cobertura + revisao humana obrigatoria antes de commit |
| Qualidade inconsistente entre provedores (OpenAI vs Anthropic) | Baixa | Media | Testes de validacao identicos para ambos os provedores; documentacao de diferencas |

**Acoes:**
- [x] Prompt inclui instrucao para cobrir cenarios de erro
- [ ] Adicionar analise automatica de diversidade de cenarios nos testes gerados
- [ ] Benchmark comparativo entre provedores para mesmos inputs

#### 2. Privacidade

| Risco | Severidade | Probabilidade | Mitigacao |
|-------|------------|---------------|-----------|
| Codigo fonte enviado para APIs externas (OpenAI/Anthropic) | Alta | Certa | Documentacao clara ao usuario; opcao futura de provedor local |
| Chaves API armazenadas em arquivo local `~/.fastest/config.json` | Media | Certa | Permissoes restritas no arquivo (600); chaves nao logadas em output |
| Codigo fonte pode conter dados sensiveis (credenciais hardcoded, PII) | Alta | Baixa | Alerta no README; responsabilidade do usuario sanitizar codigo |
| Logs podem capturar trechos de codigo fonte | Media | Baixa | Modo verbose desabilitado por padrao; logs nao persistidos |

**Acoes:**
- [x] Chaves API armazenadas localmente, nao em repositorio
- [x] Suporte a variaveis de ambiente (`OPENAI_API_KEY`, `ANTHROPIC_API_KEY`) como alternativa
- [ ] Implementar alerta quando arquivo fonte contiver padroes de credenciais
- [ ] Adicionar suporte a provedores locais (Ollama) para uso sem envio externo
- [ ] Documentar politicas de retencao de dados dos provedores

#### 3. Seguranca

| Risco | Severidade | Probabilidade | Mitigacao |
|-------|------------|---------------|-----------|
| Prompt injection via arquivos fonte maliciosos | Alta | Baixa | Codigo fonte e tratado como dados, nao como instrucao; sanitizacao basica |
| Codigo gerado pelo LLM pode conter codigo malicioso | Alta | Muito Baixa | Modo dry-run mostra codigo antes de salvar; usuario revisa antes de executar |
| Execucao automatica de testes gerados pode ter efeitos colaterais | Media | Baixa | Testes executados em ambiente Jest isolado; mocks para dependencias externas |
| Dependencias npm com vulnerabilidades conhecidas | Media | Media | Audit regular; dependabot/renovate configurado |
| Exfiltracao de dados via codigo de teste gerado | Alta | Muito Baixa | Revisao humana obrigatoria; testes executados localmente |

**Acoes:**
- [x] Modo `--dry-run` disponivel para inspecao antes de salvar
- [x] Usuario ve codigo gerado antes de qualquer execucao
- [ ] Implementar sandbox para execucao de testes gerados
- [ ] Adicionar validacao estatica (AST) do codigo gerado antes de salvar
- [ ] Limitar imports permitidos no codigo gerado

#### 4. Transparencia

| Risco | Severidade | Probabilidade | Mitigacao |
|-------|------------|---------------|-----------|
| Usuario nao entende como o teste foi gerado | Baixa | Media | Codigo gerado e legivel; comentarios explicativos no output |
| Falha silenciosa na geracao (LLM retorna lixo) | Media | Baixa | Validacao de compilacao + execucao; erro claro ao usuario |
| Usuario nao sabe qual modelo/provedor esta sendo usado | Baixa | Alta | Exibir provedor e modelo no output do comando |
| Custos de API nao sao visiveis ao usuario | Media | Alta | Documentar custos estimados; considerar exibir tokens usados |

**Acoes:**
- [x] Codigo gerado e exibido integralmente ao usuario
- [x] Modo `--dry-run` permite inspecao sem efeitos colaterais
- [x] Comando `fastest doctor` verifica estado da configuracao
- [x] Provedor e modelo configuraveis e visiveis via `fastest config list`
- [ ] Exibir contagem de tokens e custo estimado apos cada geracao
- [ ] Adicionar flag `--verbose` para mostrar prompt completo enviado ao LLM

#### Resumo de Riscos

| Dimensao | Riscos Criticos | Riscos Medios | Riscos Baixos | Status |
|----------|----------------|---------------|---------------|--------|
| Equidade | 0 | 2 | 2 | Aceitavel |
| Privacidade | 2 | 2 | 0 | Requer atencao |
| Seguranca | 2 | 2 | 0 | Requer atencao |
| Transparencia | 0 | 2 | 2 | Aceitavel |

**Veredicto Geral:** Risco Moderado - O projeto pode prosseguir com as mitigacoes existentes. As areas de privacidade e seguranca requerem atencao continua.

---

### 3.4 Canvas de Testes e Validacao

#### Visao Geral dos Testes

| Metrica | Valor |
|---------|-------|
| Total de testes | 154 |
| Framework | Jest + ts-jest |
| Cobertura geral | 81.68% |
| Cobertura de statements | 81.68% |
| Ferramenta de cobertura | Istanbul (integrada ao Jest) |

#### Cobertura por Modulo

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

#### Tipos de Testes

**Testes Unitarios (maioria):**
- Escopo: Funcoes e classes individuais com dependencias mockadas
- Mocks: Provedores LLM, sistema de arquivos, Jest runner, APIs externas
- Padrao: Arrange-Act-Assert com `jest.mock()` e `jest.spyOn()`

**Testes de Comandos CLI:**
- Escopo: Comandos commander.js com servicos mockados
- Validacao: Argumentos parseados, opcoes aplicadas, output correto

**Testes de Provedores:**
- Escopo: Implementacoes de OpenAI e Anthropic providers
- Mocks: SDKs dos provedores
- Validacao: Chamadas corretas a API, tratamento de erros, parsing de resposta

#### Areas Fracas e Plano de Melhoria

**`generate.command.ts` - 68% de cobertura:**

| Cenario Faltante | Prioridade | Complexidade |
|------------------|------------|--------------|
| Tratamento de erro quando arquivo fonte nao existe | Alta | Baixa |
| Fluxo com `--dry-run` ativado | Alta | Baixa |
| Multiplos arquivos de contexto adicional | Media | Media |
| Cancelamento/timeout durante chamada LLM | Media | Alta |
| Output com diferentes formatos (verbose, quiet) | Baixa | Baixa |

**`coverage.service.ts` - 71% de cobertura:**

| Cenario Faltante | Prioridade | Complexidade |
|------------------|------------|--------------|
| Parse de relatorio de cobertura com formato inesperado | Alta | Media |
| Calculo de delta quando cobertura anterior nao existe | Alta | Baixa |
| Tratamento de erro quando Jest falha ao coletar cobertura | Media | Media |
| Arquivos sem cobertura anterior (baseline zero) | Media | Baixa |

#### Estrategia de Validacao do Output de IA

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

#### Meta de Qualidade

| Metrica | Atual | Meta | Prazo |
|---------|-------|------|-------|
| Cobertura geral | 81.68% | 85% | Proximo release |
| generate.command.ts | 68% | 80% | Proximo release |
| coverage.service.ts | 71% | 80% | Proximo release |
| Testes totais | 154 | 180+ | Proximo release |
| Testes de integracao | 0 | 10+ | Futuro |

---

### 3.5 Checklist de Lancamento

#### Informacoes do Release

| Campo | Valor |
|-------|-------|
| Pacote npm | `fastest-cli` |
| Versao | 2.0.0 |
| Registro | npm public registry |
| Comando de instalacao | `npm install -g fastest-cli` |
| Binario | `fastest` |

#### Pre-requisitos Tecnicos

**Build e Qualidade:**

- [ ] `npm run build` completa sem erros
- [ ] `npm test` passa todos os 154 testes
- [ ] Cobertura >= 80% (atual: 81.68%)
- [ ] Sem vulnerabilidades criticas (`npm audit`)
- [ ] `fastest doctor` funciona corretamente apos build
- [ ] TypeScript compila sem erros (`tsc --noEmit`)

**Configuracao do Pacote:**

- [ ] `package.json` com versao `2.0.0`
- [ ] Campo `bin` aponta para o entry point correto
- [ ] Campo `files` inclui apenas arquivos necessarios (dist/, README)
- [ ] Campo `engines` especifica versao minima do Node.js
- [ ] `.npmignore` ou `files` exclui: `src/`, `tests/`, `.env`, `node_modules/`
- [ ] `main` e `types` apontam para `dist/`

**Dependencias:**

- [ ] Todas as dependencias de producao estao em `dependencies` (nao `devDependencies`)
- [ ] Versoes fixas ou ranges seguros para: commander.js v14, chalk v4, ora v5, openai v6, @anthropic-ai/sdk v0.92
- [ ] Sem dependencias desnecessarias no bundle final

#### Testes de Integracao Pre-Lancamento

- [ ] Instalar globalmente a partir do build local: `npm link`
- [ ] Executar `fastest --version` - exibe versao correta
- [ ] Executar `fastest --help` - exibe ajuda formatada
- [ ] Executar `fastest doctor` - verifica dependencias e configuracao
- [ ] Executar `fastest config set provider openai` - configura provedor
- [ ] Executar `fastest config set apiKey <chave>` - configura chave API
- [ ] Executar `fastest config list` - lista configuracao atual
- [ ] Executar `fastest generate <arquivo> -r "testar funcao principal"` - gera testes
- [ ] Executar `fastest generate <arquivo> --dry-run` - modo dry-run funciona
- [ ] Testar com provedor OpenAI (gpt-4o-mini)
- [ ] Testar com provedor Anthropic (claude-haiku)

#### Processo de Publicacao

```bash
# 1. Garantir branch limpa
git status

# 2. Atualizar versao
npm version 2.0.0

# 3. Build final
npm run build

# 4. Testes finais
npm test

# 5. Dry-run da publicacao
npm publish --dry-run

# 6. Publicar
npm publish --access public

# 7. Verificar publicacao
npm info fastest-cli

# 8. Testar instalacao global
npm install -g fastest-cli
fastest --version
```

#### Estrategia de Rollback

| Cenario | Acao | Comando |
|---------|------|---------|
| Bug critico nas primeiras 72h | Unpublish | `npm unpublish fastest-cli@2.0.0` |
| Bug menor apos 72h | Deprecate + patch | `npm deprecate fastest-cli@2.0.0 "use 2.0.1"` |
| Problema de seguranca | Unpublish + patch imediato | `npm unpublish` + corrigir + `npm publish` |
| Funcionalidade quebrada | Patch release | Corrigir, testar, publicar v2.0.1 |

#### Criterios Go / No-Go

**Go (todos devem ser verdadeiros):**

| Criterio | Status |
|----------|--------|
| Build passa sem erros | [ ] |
| 154 testes passam | [ ] |
| Cobertura >= 80% | [ ] |
| `fastest doctor` funciona | [ ] |
| Geracao funciona com OpenAI | [ ] |
| Geracao funciona com Anthropic | [ ] |
| Dry-run funciona | [ ] |
| README atualizado | [ ] |
| Sem vulnerabilidades criticas | [ ] |

**No-Go (qualquer um bloqueia):**

| Criterio | Status |
|----------|--------|
| Build falha | [ ] |
| Testes falhando | [ ] |
| Cobertura < 75% | [ ] |
| Vulnerabilidade critica em dependencia | [ ] |
| Geracao de testes nao funciona com nenhum provedor | [ ] |
| Chaves API expostas no pacote | [ ] |

---

## 4. Ressonancia: Medir e Aprender

### 4.1 Metricas de Escala e Impacto

#### Metricas de Uso

**Downloads NPM:**

| Metrica | Frequencia | Meta |
|---------|-----------|------|
| Downloads semanais (npm) | Semanal | Crescimento de 10% MoM |
| Downloads totais acumulados | Mensal | Tracking continuo |
| Versoes ativas em uso | Mensal | >70% na versao mais recente |

**Execucoes do Comando `generate`:**

| Metrica | Descricao |
|---------|-----------|
| Total de execucoes `fastest generate` | Quantidade total de invocacoes do comando principal |
| Taxa de conclusao | Percentual de execucoes que completam sem erro |
| Taxa de abandono | Execucoes canceladas pelo usuario (Ctrl+C) |
| Execucoes por sessao | Media de quantas vezes o usuario roda o generate por sessao de trabalho |

**Distribuicao de Providers (OpenAI vs Anthropic):**

| Provider | Metrica |
|----------|---------|
| OpenAI (GPT-4, GPT-4o, GPT-3.5-turbo) | % de execucoes usando modelos OpenAI |
| Anthropic (Claude Sonnet, Claude Haiku) | % de execucoes usando modelos Anthropic |
| Distribuicao por modelo especifico | Qual modelo dentro de cada provider e mais utilizado |
| Migracoes entre providers | Usuarios que trocam de provider ao longo do tempo |

#### Metricas de Desempenho

**Tempo de Resposta do LLM:**

| Metrica | Benchmark | Alerta |
|---------|-----------|--------|
| Tempo medio de resposta da API (OpenAI) | <15s | >30s |
| Tempo medio de resposta da API (Anthropic) | <15s | >30s |
| Tempo total de geracao (prompt + resposta + parsing) | <30s | >45s |
| P95 do tempo de geracao | <45s | >60s |

**Taxa de Sucesso na Geracao de Testes:**

| Metrica | Benchmark | Descricao |
|---------|-----------|-----------|
| Taxa de geracao sem erro | >95% | Percentual de execucoes que produzem um arquivo de teste valido |
| Taxa de parsing correto | >98% | LLM retorna codigo que pode ser extraido e salvo corretamente |
| Taxa de compilacao TypeScript | >90% | Testes gerados que passam `tsc --noEmit` sem erros |
| Taxa de Jest pass (primeira geracao) | >80% | Testes que passam `jest` na primeira execucao sem edicao manual |

**Qualidade dos Testes Gerados:**

| Metrica | Benchmark |
|---------|-----------|
| Delta de cobertura medio | >10% de aumento apos adicionar testes gerados |
| Numero medio de test cases por arquivo gerado | 5-15 test cases |
| Cobertura de branches | >60% nos testes gerados |
| Falsos positivos (testes que passam mas nao testam nada real) | <5% |

#### Impacto no Negocio

**Tempo Economizado:**

| Metrica | Estimativa Base | Metodo de Calculo |
|---------|-----------------|-------------------|
| Tempo medio para escrever um test suite manualmente | 45-90 minutos | Pesquisa com desenvolvedores |
| Tempo medio usando Fastest CLI | 2-5 minutos (geracao + revisao) | Telemetria + feedback |
| Economia por test suite | 40-85 minutos | Diferenca entre manual e automatizado |
| Economia mensal por desenvolvedor (10 suites/mes) | 6.5-14 horas | Projecao baseada em uso medio |

**Melhoria de Cobertura:**

| Metrica | Descricao |
|---------|-----------|
| Cobertura antes do Fastest CLI | Baseline do projeto do usuario |
| Cobertura depois do Fastest CLI | Medicao apos adocao |
| Delta de cobertura | Diferenca percentual (meta: >10%) |
| Projetos que atingiram >80% de cobertura | % de projetos que cruzaram o limiar apos uso |

**Referencia interna:** O proprio Fastest CLI possui 154 testes com 81.68% de cobertura, servindo como benchmark de qualidade.

#### Benchmarks

| Benchmark | Valor Alvo | Justificativa |
|-----------|-----------|---------------|
| Tempo de geracao end-to-end | <30 segundos | Manter fluxo do desenvolvedor sem interrupcao |
| Taxa de pass dos testes na primeira geracao | >80% | Minimizar necessidade de edicao manual |
| Delta de cobertura por arquivo | >10% | Justificar adocao da ferramenta |
| Taxa de sucesso do comando generate | >95% | Confiabilidade basica do produto |
| Compilacao TypeScript sem erros | >90% | Testes gerados devem ser sintaticamente corretos |
| Disponibilidade da CLI (sem crashes) | >99.5% | Estabilidade esperada de ferramenta CLI |

#### Acoes Corretivas

| Situacao | Acao |
|----------|------|
| Taxa de pass <80% | Revisar e otimizar prompts, investigar padroes de falha |
| Tempo de geracao >30s | Avaliar caching, otimizacao de prompts, modelos mais rapidos |
| Downloads em queda | Analise competitiva, pesquisa com usuarios, revisao de posicionamento |
| Issues crescentes sem resolucao | Alocar sprint de bug-fixing, revisar triagem |
| Delta de cobertura <10% | Melhorar estrategia de geracao, adicionar analise de branches |
| Churn alto | Entrevistas com usuarios que abandonaram, identificar friction points |

---

### 4.2 Planejamento de Escalabilidade

#### Volume Atual e Projetado

**Estado Atual (v2.0.0):**

| Dimensao | Estado Atual |
|----------|-------------|
| Modo de geracao | Single-file (um arquivo de teste por execucao) |
| Chamadas LLM por geracao | 1 chamada por execucao do `generate` |
| Providers suportados | OpenAI (GPT-4, GPT-4o, GPT-3.5-turbo), Anthropic (Claude Sonnet, Claude Haiku) |
| Frameworks de teste | Jest (unico) |
| Tamanho medio do prompt | ~2.000-5.000 tokens |
| Tamanho medio da resposta | ~1.000-3.000 tokens |
| Tempo medio de geracao | 10-25 segundos |
| Concorrencia | Sequencial (uma geracao por vez) |
| Armazenamento local | Apenas arquivos de teste gerados, sem cache |

**Projecao de Crescimento:**

| Fase | Timeline | Volume Estimado |
|------|----------|----------------|
| Fase 1 (Atual) | v2.0.0 | 100-500 geracoes/dia (comunidade inicial) |
| Fase 2 (Adocao) | v2.1-v2.5 | 1.000-5.000 geracoes/dia |
| Fase 3 (Escala) | v3.0+ | 10.000-50.000 geracoes/dia |
| Fase 4 (Enterprise) | v4.0+ | 100.000+ geracoes/dia (integracoes CI/CD) |

#### Infraestrutura

**Dependencias Externas:**

| Componente | Limites Conhecidos | Impacto |
|------------|-------------------|---------|
| OpenAI API | Rate limit: 500-10.000 RPM (depende do tier) | Gargalo principal em alta escala |
| Anthropic API | Rate limit: 1.000-4.000 RPM (depende do tier) | Gargalo secundario |
| Token limits (OpenAI) | GPT-4: 128k context, GPT-4o: 128k | Arquivos muito grandes podem exceder limites |
| Token limits (Anthropic) | Claude: 200k context | Mais flexivel para arquivos grandes |

**Custos de API por Geracao:**

| Modelo | Custo Estimado por Geracao | Custo para 1.000 geracoes |
|--------|---------------------------|--------------------------|
| GPT-3.5-turbo | ~$0.002-0.005 | ~$2-5 |
| GPT-4o | ~$0.01-0.03 | ~$10-30 |
| GPT-4 | ~$0.03-0.10 | ~$30-100 |
| Claude Haiku | ~$0.001-0.003 | ~$1-3 |
| Claude Sonnet | ~$0.01-0.03 | ~$10-30 |

#### Estrategias de Escalabilidade

**Curto Prazo (v2.1-v2.5):**

- **Caching de Prompts e Respostas:** Cache local baseado em hash SHA-256 do arquivo fonte + versao do prompt template. TTL configuravel (padrao: 24h). Economia estimada: 20-30% de chamadas evitadas.
- **Otimizacao de Prompts:** Minificacao inteligente do codigo fonte, enviar apenas funcoes/classes exportadas relevantes. Economia estimada: 30-40% reducao de tokens.
- **Processamento em Batch:** Permitir `fastest generate src/**/*.ts` para multiplos arquivos com fila de processamento e progress bar.

**Medio Prazo (v3.0):**

- **Chamadas LLM Paralelas:** Pool de workers configuravel (padrao: 3 paralelos) com backoff exponencial e flag `--concurrency <n>`.
- **Suporte a Multiplos Frameworks:** Vitest (prioridade alta), Mocha + Chai (prioridade media), Node.js test runner nativo (prioridade baixa). Adapter pattern com deteccao automatica.
- **Retry Inteligente:** Re-tentar geracao quando testes falham, enviando erro + teste original ao LLM para correcao. Maximo 3 tentativas. Beneficio esperado: taxa de pass de 80% para >92%.

**Longo Prazo (v4.0+):**

- **Suporte a Modelos Locais (Ollama):** Integracao com Ollama API. Modelos recomendados: CodeLlama, DeepSeek Coder, Qwen2.5-Coder. Trade-off: menor qualidade, custo zero.
- **Modo CI/CD:** GitHub Action oficial, output em formato JUnit XML, modo headless, integracao com PR comments.

#### Estrategias de Reducao de Custo

| Estrategia | Reducao Estimada | Complexidade |
|------------|-----------------|-------------|
| Caching local | 20-30% | Baixa |
| Otimizacao de prompts | 30-40% de tokens | Media |
| Modelo mais barato como fallback | 50-70% | Baixa |
| Modelos locais (Ollama) | 100% (custo zero de API) | Media |
| Anthropic prompt caching | 50-90% em prompts repetidos | Baixa |

#### Riscos de Escalabilidade

| Risco | Probabilidade | Impacto | Mitigacao |
|-------|--------------|---------|-----------|
| Explosao de custos de API | Media | Alto | Limites configuraveis, alertas de custo, fallback para modelos baratos |
| Rate limiting em pico de uso | Media | Medio | Backoff exponencial, fila com prioridade, multi-provider rotation |
| Deprecacao de modelo | Alta | Medio | Abstracoes de provider, configuracao flexivel, testes de regressao |
| Concorrentes com melhor integracao IDE | Alta | Alto | Foco na CLI como diferencial, plugin VS Code futuro |
| Copilotos de IA nativos tornando ferramenta obsoleta | Media | Alto | Foco em qualidade superior, integracao com CI/CD |

---

### 4.3 Painel de Feedback e Insights

#### Objetivo do Ciclo

Estruturar o ciclo de coleta, analise e acao sobre feedback de usuarios do Fastest CLI v2.0.0, identificando barreiras de adocao, prioridades de funcionalidades e oportunidades de melhoria.

**Perguntas-Chave:**
1. Quais sao as principais barreiras para adocao do Fastest CLI?
2. A qualidade dos testes gerados atende as expectativas dos desenvolvedores?
3. Quais funcionalidades os usuarios mais solicitam?
4. O custo de API e percebido como barreira?
5. Como os usuarios descobrem e avaliam a ferramenta?

#### Fontes e Metodos de Coleta

**Fontes Quantitativas:**

| Fonte | Dados Coletados | Frequencia |
|-------|----------------|-----------|
| npm download stats | Volume de downloads, tendencia de crescimento | Semanal |
| GitHub repository insights | Stars, forks, clones, traffic, referrers | Semanal |
| GitHub Issues (labels) | Categorias de problemas, frequencia por tipo | Continuo |
| GitHub Discussions | Perguntas frequentes, temas de interesse | Continuo |
| CLI telemetria (futuro) | Comandos usados, providers, taxa de sucesso | Continuo |

**Fontes Qualitativas:**

| Fonte | Metodo | Frequencia |
|-------|--------|-----------|
| GitHub Issues (descricoes) | Analise tematica dos relatos | Semanal |
| Entrevistas com desenvolvedores | Conversas semi-estruturadas (15-30 min) | Mensal (3-5 por ciclo) |
| Feedback em redes sociais | Monitoramento de mencoes (Twitter/X, Reddit, Dev.to) | Semanal |
| Feedback direto (email/DM) | Analise qualitativa | Conforme recebido |
| Observacao de uso | Screen recording de sessoes (com consentimento) | Trimestral |

#### Feedbacks Recebidos - Temas Principais

**Tema 1: Qualidade dos Testes Gerados**

| Aspecto | Feedback | Frequencia |
|---------|----------|-----------|
| Testes passam mas sao superficiais | "Os testes gerados cobrem os happy paths mas ignoram edge cases" | Alta |
| Mocks excessivos | "O LLM gera muitos mocks desnecessarios, tornando os testes frageis" | Media |
| Imports incorretos | "Frequentemente os imports do teste nao batem com a estrutura do projeto" | Media |
| TypeScript types | "Testes gerados com `any` em vez de tipos corretos" | Baixa |
| Boa estrutura geral | "A organizacao em describe/it e muito boa, economiza tempo de setup" | Alta (positivo) |

**Tema 2: Suporte a Frameworks**

| Framework | Demanda | Comentarios Tipicos |
|-----------|---------|-------------------|
| Vitest | Alta | "Migramos de Jest para Vitest, precisamos de suporte" |
| Mocha | Media | "Projeto legado usa Mocha, nao consigo usar o Fastest" |
| Testing Library | Media | "Preciso gerar testes de componentes React com Testing Library" |
| Playwright/Cypress | Baixa | "Seria incrivel para testes E2E tambem" |

**Tema 3: Custo de API**

| Aspecto | Feedback |
|---------|----------|
| GPT-4 caro para uso frequente | "Nao consigo justificar $0.10 por geracao no dia-a-dia" |
| Claude Haiku como alternativa barata | "Haiku e barato mas a qualidade cai muito" |
| Falta de visibilidade de custos | "Nao sei quanto estou gastando por mes" |
| Interesse em modelos locais | "Se funcionasse com Ollama eu usaria muito mais" |

**Net Promoter Score Estimado:**

| Categoria | Percentual Estimado |
|-----------|-------------------|
| Promotores (9-10) | 35% - "Economiza muito tempo, recomendo" |
| Neutros (7-8) | 40% - "Util mas precisa melhorar em X" |
| Detratores (0-6) | 25% - "Testes gerados precisam de muita edicao" |
| **NPS Estimado** | **+10** |

#### Insights

**Insight 1 - Retry e Auto-Correcao:** 60% dos feedbacks negativos mencionam que os testes "quase funcionam" mas precisam de pequenas correcoes. Um loop de retry automatico aumentaria a taxa de pass de ~80% para >92%. Impacto estimado: reducao de 50% no tempo de edicao manual.

**Insight 2 - Suporte Multi-Arquivo (Batch Mode):** Usuarios que geram testes para projetos inteiros reportam frustacao com o fluxo arquivo-por-arquivo. Impacto estimado: aumento de 3-5x no volume de uso por sessao.

**Insight 3 - Vitest como Prioridade:** ~30% das issues de feature request pedem suporte a Vitest. Impacto estimado: aumento de 25-35% na base de usuarios potenciais.

**Insight 4 - Custos:** Oferecer estimativa de custo antes da geracao e resumo mensal reduziria ansiedade e aumentaria confianca no uso frequente.

**Insight 5 - Onboarding:** Issues de configuracao de API keys representam ~20% dos bug reports. Rodar `doctor` automaticamente na primeira execucao melhoraria drasticamente o onboarding.

#### Acoes Recomendadas

**Prioridade Alta (v2.1):**

| Acao | Justificativa | Esforco | Impacto |
|------|--------------|---------|---------|
| Implementar loop de retry | Aumenta taxa de pass para >92% | Medio (2-3 sprints) | Alto |
| Adicionar modo batch | Funcionalidade mais solicitada | Medio (2-3 sprints) | Alto |
| Melhorar progress/feedback durante geracao | UX basica | Baixo (1 sprint) | Medio |
| Auto-executar `doctor` no primeiro uso | Reduz issues de configuracao em ~20% | Baixo (1 sprint) | Medio |

**Prioridade Media (v2.5):**

| Acao | Justificativa | Esforco | Impacto |
|------|--------------|---------|---------|
| Suporte a Vitest | ~30% das feature requests | Medio (2 sprints) | Alto |
| Estimativa de custo pre-geracao | Reduz ansiedade de custos | Baixo (1 sprint) | Medio |
| Comando `fastest stats` | Visibilidade de uso e custos | Baixo (1 sprint) | Baixo |
| Melhoria de prompts para edge cases | Aumenta qualidade percebida | Continuo | Medio |

**Prioridade Baixa (v3.0+):**

| Acao | Justificativa | Esforco | Impacto |
|------|--------------|---------|---------|
| Suporte a Ollama (modelos locais) | Elimina custo de API | Alto (3-4 sprints) | Medio |
| Suporte a Mocha | Projetos legados | Medio (2 sprints) | Baixo |
| Plugin VS Code | Integracao direta no editor | Alto (4-5 sprints) | Alto |
| Modo CI/CD com GitHub Action | Automacao completa | Alto (3-4 sprints) | Alto |

---

*Documento consolidado da Metodologia Sinfonia - Fastest CLI*
*Gerado em: 25 de Junho de 2026*
