# Strategy Action Canvas

## Objetivo Estrategico Geral

Acelerar a criacao de testes automatizados e melhorar a cobertura de codigo em projetos TypeScript/JavaScript atraves de testes gerados por IA, reduzindo o tempo de escrita de testes de horas para minutos enquanto mantém cobertura acima de 80%.

## Objetivos Secundarios

| # | Objetivo | Alinhamento |
|---|----------|-------------|
| 1 | **Democratizar a escrita de testes** — permitir que desenvolvedores de qualquer nivel gerem testes de qualidade usando linguagem natural | Adocao e acessibilidade |
| 2 | **Padronizar a qualidade dos testes** — garantir que testes gerados sigam estrutura consistente independente de quem os gera | Qualidade de software |
| 3 | **Minimizar custo de API por teste gerado** — usar modelos economicos (gpt-4o-mini, claude-haiku-4-5) e guard rails de contexto | Sustentabilidade financeira |
| 4 | **Integrar-se ao ecossistema existente** — funcionar com Jest, TypeScript, npm/yarn sem configuracao adicional | Experiencia do desenvolvedor |
| 5 | **Fornecer feedback imediato** — mostrar impacto de cobertura (delta) em tempo real apos geracao | Visibilidade e confianca |

## Resultados-Chave (OKRs)

| Objetivo | Resultado-Chave | Prazo |
|----------|----------------|-------|
| Acelerar escrita de testes | Reduzir tempo medio de criacao de suite de testes de 2h para 5min | Q3 2026 |
| Melhorar cobertura | Projetos usando Fastest atingem 80%+ de cobertura (baseline: projeto proprio em 81.68%) | Q3 2026 |
| Adocao | 500+ instalacoes ativas do pacote `fastest-cli` no npm | Q4 2026 |
| Qualidade | 90%+ dos testes gerados passam na validacao TypeScript na primeira geracao | Q3 2026 |
| Multi-provider | Suporte estavel a OpenAI e Anthropic com parity de funcionalidades | Concluido (v2.0.0) |

## KPIs

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

## Requisitos/Restricoes

### Requisitos Funcionais
| # | Requisito |
|---|----------|
| 1 | Gerar testes Jest validos a partir de arquivos TypeScript/JavaScript e cards de requisitos |
| 2 | Suportar OpenAI (gpt-4o-mini padrao) e Anthropic (claude-haiku-4-5-20251001 padrao) como providers |
| 3 | Validar codigo TypeScript gerado antes de executar testes |
| 4 | Executar testes gerados com Jest e coletar cobertura |
| 5 | Exibir tabela comparativa de cobertura (before/after/delta) |
| 6 | Comando `doctor` para diagnostico de ambiente |
| 7 | Comando `config` para configuracao persistente de modelo e parametros |

### Requisitos Nao-Funcionais
| # | Requisito |
|---|----------|
| 1 | Tempo de resposta end-to-end < 60s para arquivos de tamanho medio |
| 2 | Guard rails de contexto configuraveis (maxFiles, maxCharsPerFile, maxTotalChars) |
| 3 | CLI responsivo com feedback visual (ora spinners, chalk colors) |
| 4 | Publicavel como pacote npm com `npx fastest-cli` |
| 5 | Compativel com Node.js 18+ |

### Restricoes
| # | Restricao |
|---|----------|
| 1 | Dependencia de APIs externas (OpenAI/Anthropic) — requer chave de API valida |
| 2 | Custos de API sao responsabilidade do usuario |
| 3 | Codigo-fonte do usuario e transmitido para servidores externos |
| 4 | Framework de testes limitado a Jest (por enquanto) |
| 5 | Linguagens suportadas limitadas a TypeScript/JavaScript |

## Priorizacao

| Prioridade | Item | Justificativa | Status |
|-----------|------|---------------|--------|
| P0 | Pipeline basico: gerar → validar → executar → cobertura | Core value proposition | Concluido v2.0.0 |
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

## Acoes/Recursos

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
