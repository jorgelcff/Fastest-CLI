# 04. Ressonancia - Painel de Feedback e Insights

## Projeto: Fastest CLI v0.0.2

---

## 1. Objetivo do Ciclo

Estruturar o ciclo de coleta, analise e acao sobre feedback de usuarios do Fastest CLI v0.0.2, identificando barreiras de adocao, prioridades de funcionalidades e oportunidades de melhoria para orientar o roadmap das proximas versoes.

### Perguntas-Chave deste Ciclo

1. Quais sao as principais barreiras para adocao do Fastest CLI?
2. A qualidade dos testes gerados atende as expectativas dos desenvolvedores?
3. Quais funcionalidades os usuarios mais solicitam?
4. O custo de API e percebido como barreira?
5. Como os usuarios descobrem e avaliam a ferramenta?

---

## 2. Fontes e Metodos de Coleta

### 2.1 Fontes Quantitativas

| Fonte | Dados Coletados | Frequencia |
|-------|----------------|-----------|
| npm download stats | Volume de downloads, tendencia de crescimento | Semanal |
| GitHub repository insights | Stars, forks, clones, traffic, referrers | Semanal |
| GitHub Issues (labels) | Categorias de problemas, frequencia por tipo | Continuo |
| GitHub Discussions | Perguntas frequentes, temas de interesse | Continuo |
| CLI telemetria (futuro) | Comandos usados, providers, taxa de sucesso | Continuo |

### 2.2 Fontes Qualitativas

| Fonte | Metodo | Frequencia |
|-------|--------|-----------|
| GitHub Issues (descricoes) | Analise tematica dos relatos | Semanal |
| Entrevistas com desenvolvedores | Conversas semi-estruturadas (15-30 min) | Mensal (3-5 por ciclo) |
| Feedback em redes sociais | Monitoramento de mencoes (Twitter/X, Reddit, Dev.to) | Semanal |
| Feedback direto (email/DM) | Analise qualitativa | Conforme recebido |
| Observacao de uso | Screen recording de sessoes de uso (com consentimento) | Trimestral |

### 2.3 Metodos de Coleta

#### Template de Entrevista com Desenvolvedor

```
1. Como voce descobriu o Fastest CLI?
2. Qual problema voce esperava resolver?
3. Descreva sua primeira experiencia usando o `fastest generate`.
4. Os testes gerados atenderam suas expectativas? Por que?
5. Voce editou os testes gerados? O que mudou?
6. Qual provider voce usa (OpenAI/Anthropic)? Por que escolheu?
7. O custo de API e uma preocupacao?
8. O que faria voce usar a ferramenta com mais frequencia?
9. Que funcionalidade voce mais sente falta?
10. Voce recomendaria para colegas? Por que?
```

#### Categorias de Issues no GitHub

| Label | Descricao |
|-------|-----------|
| `bug:generation` | Problemas na geracao de testes (codigo invalido, erros de sintaxe) |
| `bug:cli` | Problemas na interface de linha de comando |
| `bug:provider` | Erros relacionados a OpenAI ou Anthropic |
| `feature:framework` | Solicitacoes de suporte a novos frameworks (Vitest, Mocha) |
| `feature:workflow` | Solicitacoes de melhorias no fluxo (batch, retry, CI) |
| `quality` | Feedback sobre qualidade dos testes gerados |
| `docs` | Melhorias na documentacao |
| `cost` | Preocupacoes sobre custos de API |

---

## 3. Feedbacks Recebidos

### 3.1 Temas Principais Identificados

#### Tema 1: Qualidade dos Testes Gerados

| Aspecto | Feedback | Frequencia |
|---------|----------|-----------|
| Testes passam mas sao superficiais | "Os testes gerados cobrem os happy paths mas ignoram edge cases" | Alta |
| Mocks excessivos | "O LLM gera muitos mocks desnecessarios, tornando os testes frageis" | Media |
| Imports incorretos | "Frequentemente os imports do teste nao batem com a estrutura do projeto" | Media |
| TypeScript types | "Testes gerados com `any` em vez de tipos corretos" | Baixa |
| Boa estrutura geral | "A organizacao em describe/it e muito boa, economiza tempo de setup" | Alta (positivo) |

#### Tema 2: Suporte a Frameworks

| Framework | Demanda | Comentarios Tipicos |
|-----------|---------|-------------------|
| Vitest | Alta | "Migramos de Jest para Vitest, precisamos de suporte" |
| Mocha | Media | "Projeto legado usa Mocha, nao consigo usar o Fastest" |
| Testing Library | Media | "Preciso gerar testes de componentes React com Testing Library" |
| Playwright/Cypress | Baixa | "Seria incrivel para testes E2E tambem" |

#### Tema 3: Velocidade e Performance

| Aspecto | Feedback |
|---------|----------|
| Tempo de geracao aceitavel | "10-20 segundos e ok para mim" (maioria) |
| Lento com GPT-4 | "GPT-4 demora muito, prefiro GPT-4o" |
| Sem feedback durante geracao | "Preciso de um spinner ou progress bar mais informativo" |
| Multiplos arquivos e tedioso | "Rodar um por um para 20 arquivos e inviavel" |

#### Tema 4: Custo de API

| Aspecto | Feedback |
|---------|----------|
| GPT-4 caro para uso frequente | "Nao consigo justificar $0.10 por geracao no dia-a-dia" |
| Claude Haiku como alternativa barata | "Haiku e barato mas a qualidade cai muito" |
| Falta de visibilidade de custos | "Nao sei quanto estou gastando por mes" |
| Interesse em modelos locais | "Se funcionasse com Ollama eu usaria muito mais" |

### 3.2 Net Promoter Score Estimado (Baseado em Feedback Qualitativo)

| Categoria | Percentual Estimado |
|-----------|-------------------|
| Promotores (9-10) | 35% - "Economiza muito tempo, recomendo" |
| Neutros (7-8) | 40% - "Util mas precisa melhorar em X" |
| Detratores (0-6) | 25% - "Testes gerados precisam de muita edicao" |
| **NPS Estimado** | **+10** |

---

## 4. Insights

### 4.1 Insight Principal: Retry e Auto-Correcao

**Evidencia:** 60% dos feedbacks negativos sobre qualidade mencionam que os testes "quase funcionam" mas precisam de pequenas correcoes.

**Insight:** Desenvolvedores querem um loop de retry automatico onde o Fastest CLI executa o teste gerado, detecta falhas e re-submete ao LLM com o erro para correcao. Isso transformaria a taxa de pass de ~80% para >92% sem esforco manual.

**Impacto estimado:** Reducao de 50% no tempo de edicao manual pos-geracao.

### 4.2 Insight Secundario: Suporte Multi-Arquivo (Batch Mode)

**Evidencia:** Usuarios que geram testes para projetos inteiros reportam frustacao com o fluxo arquivo-por-arquivo.

**Insight:** Um modo batch (`fastest generate src/**/*.ts`) com processamento paralelo e relatorio consolidado e a funcionalidade mais solicitada. Usuarios esperam poder rodar antes de um PR e ter todos os testes gerados de uma vez.

**Impacto estimado:** Aumento de 3-5x no volume de uso por sessao.

### 4.3 Insight Terciario: Vitest como Prioridade

**Evidencia:** ~30% das issues de "feature request" pedem suporte a Vitest. O ecossistema Vite cresce rapidamente e muitos projetos novos adotam Vitest em vez de Jest.

**Insight:** Sem suporte a Vitest, o Fastest CLI perde uma parcela significativa do mercado de projetos modernos. A API do Vitest e compativel com Jest em grande parte, reduzindo o esforco de implementacao.

**Impacto estimado:** Aumento de 25-35% na base de usuarios potenciais.

### 4.4 Insight sobre Custos

**Evidencia:** Usuarios com uso intenso reportam preocupacao com custos de API, especialmente com GPT-4.

**Insight:** Oferecer estimativa de custo antes da geracao (`Estimated cost: ~$0.02. Proceed? [Y/n]`) e um resumo mensal (`fastest stats`) reduziria a ansiedade sobre custos e aumentaria confianca no uso frequente.

### 4.5 Insight sobre Onboarding

**Evidencia:** Issues relacionadas a configuracao de API keys representam ~20% dos bug reports.

**Insight:** O comando `fastest doctor` resolve muitos problemas, mas usuarios novos nao sabem que ele existe. Rodar o doctor automaticamente na primeira execucao e sugerir `fastest doctor` em mensagens de erro melhoraria drasticamente o onboarding.

---

## 5. Acoes Recomendadas

### 5.1 Prioridade Alta (v0.1)

| Acao | Justificativa | Esforco | Impacto |
|------|--------------|---------|---------|
| Implementar loop de retry | Feedback #1, aumenta taxa de pass para >92% | Medio (2-3 sprints) | Alto |
| Adicionar modo batch | Funcionalidade mais solicitada, multiplica uso | Medio (2-3 sprints) | Alto |
| Melhorar progress/feedback durante geracao | UX basica, reduz percepcao de lentidao | Baixo (1 sprint) | Medio |
| Auto-executar `doctor` no primeiro uso | Reduz issues de configuracao em ~20% | Baixo (1 sprint) | Medio |

### 5.2 Prioridade Media (v0.5)

| Acao | Justificativa | Esforco | Impacto |
|------|--------------|---------|---------|
| Suporte a Vitest | ~30% das feature requests, mercado crescente | Medio (2 sprints) | Alto |
| Estimativa de custo pre-geracao | Reduz ansiedade de custos | Baixo (1 sprint) | Medio |
| Comando `fastest stats` | Visibilidade de uso e custos | Baixo (1 sprint) | Baixo |
| Melhoria de prompts para edge cases | Aumenta qualidade percebida | Continuo | Medio |

### 5.3 Prioridade Baixa (v3.0+)

| Acao | Justificativa | Esforco | Impacto |
|------|--------------|---------|---------|
| Suporte a Ollama (modelos locais) | Elimina custo de API, atende usuarios preocupados com privacidade | Alto (3-4 sprints) | Medio |
| Suporte a Mocha | Demanda media, projetos legados | Medio (2 sprints) | Baixo |
| Plugin VS Code | Integracao direta no editor | Alto (4-5 sprints) | Alto |
| Modo CI/CD com GitHub Action | Automacao completa no pipeline | Alto (3-4 sprints) | Alto |

### 5.4 Metricas de Sucesso das Acoes

| Acao | Metrica de Sucesso | Meta |
|------|-------------------|------|
| Loop de retry | Taxa de pass na primeira execucao (com retry) | >92% |
| Modo batch | Geracoes por sessao | >5 arquivos/sessao |
| Suporte Vitest | % de novos usuarios usando Vitest | >20% |
| Estimativa de custo | Reducao de issues sobre custos | -50% |
| Auto-doctor | Reducao de issues de configuracao | -40% |

### 5.5 Proximos Passos

1. **Semana 1-2:** Implementar loop de retry como feature flag (`--retry`)
2. **Semana 3-4:** Desenvolver modo batch com processamento sequencial
3. **Semana 5-6:** Adicionar processamento paralelo ao batch mode
4. **Semana 7-8:** Iniciar adapter para Vitest
5. **Continuo:** Coletar feedback sobre novas funcionalidades e iterar

---

## Historico de Ciclos de Feedback

| Ciclo | Data | Foco | Resultado Principal |
|-------|------|------|-------------------|
| Ciclo 1 (atual) | Junho 2026 | Lancamento v0.0.2 - barreiras de adocao | Retry loop + batch mode como prioridades |

---

*Documento parte da metodologia Sinfonia - Movimento 04: Ressonancia*
*Projeto: Fastest CLI v0.0.2*
*Ultima atualizacao: Junho 2026*
